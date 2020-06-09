/*
 * Copyright © 2020 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Command, flags as flagParser } from '@oclif/command';
import * as fs from 'fs-extra';
import { ApplicationConfig } from 'lisk-sdk';
import { getDefaultPath, splitPath, getConfigPath, getDefaultConfigPath, getNetworkConfigFilesPath, getFullPath } from '../utils/path';
import { getApplication } from '../application';

const LOG_OPTIONS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
const DEFAULT_NETWORK = 'mainnet';

export default class StartCommand extends Command {
	static description = 'Start Lisk Core Node with given configs';

	static examples = ['start', 'start --network dev --data-path ./data --log debug'];

	static flags = {
		'data-path': flagParser.string({
			char: 'd',
			description: 'Directory path to specify where node data is stored.',
			env: 'LISK_DATA_PATH',
		}),
		network: flagParser.string({
			char: 'n',
			description: 'Default network config to use.',
			env: 'LISK_NETWORK',
		}),
		config: flagParser.string({
			char: 'c',
			description: 'File path to a custom config.',
			env: 'LISK_CONFIG_FILE',
		}),
		port: flagParser.integer({
			char: 'p',
			description: 'Open port for the peer to peer incoming connections.',
			env: 'LISK_PORT',
		}),
		'enable-ipc': flagParser.boolean({
			description: 'Enable IPC communication.',
			default: false,
		}),
		log: flagParser.string({
			char: 'l',
			description: 'Console log level.',
			env: 'LISK_CONSOLE_LOG_LEVEL',
			options: LOG_OPTIONS,
		}),
		flog: flagParser.string({
			description: 'File log level.',
			env: 'LISK_FILE_LOG_LEVEL',
			options: LOG_OPTIONS,
		}),
		seed: flagParser.string({
			char: 's',
			description: 'Seed peer to initially connect to in format of "ip:port".',
			multiple: true,
		}),
	};

	// eslint-disable-next-line @typescript-eslint/require-await
	async run(): Promise<void> {
		const {
			flags,
		} = this.parse(StartCommand);
		const dataPath = flags['data-path'] ? flags['data-path'] : getDefaultPath();
		this.log(`Starting Lisk Core at ${getFullPath(dataPath)}`);
		const pathConfig = splitPath(dataPath);
		// Make sure data path exists
		await fs.ensureDir(dataPath);
		// Copy all default configs to datapath if not exist
		const configPath = getConfigPath(dataPath);
		if (!fs.existsSync(configPath)) {
			const defaultConfigPath = getDefaultConfigPath()
			this.log(`Copying files from ${defaultConfigPath} to ${configPath}`);
			await fs.ensureDir(configPath);
			await fs.copy(defaultConfigPath, configPath, { recursive: true });
		}
		const configDirs = await fs.readdir(configPath);
		// Choose network (default to main)
		const network = flags.network ?? DEFAULT_NETWORK;
		// If network is specified, check if the config folder exists
		if (!configDirs.includes(network)) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			this.error(new Error(`Network must be one of ${configDirs.join(',')}`));
		}
		// Get genesis block using the network config
		const networkConfigs = getNetworkConfigFilesPath(dataPath, network);
		const genesisBlock = await fs.readJSON(networkConfigs.genesisBlockFilePath);
		// Get config from network config or config specifeid
		const configFilePath = flags.config ?? networkConfigs.configFilePath;
		const config: ApplicationConfig = (await fs.readJSON(configFilePath));
		config.rootPath = pathConfig.rootPath;
		config.label = pathConfig.label;
		config.protocolVersion = this.config.pjson.lisk.version;
		// Inject other properties specified
		if (flags["enable-ipc"]) {
			config.ipc = { enabled: flags["enable-ipc"] };
		}
		if (flags.log) {
			config.logger = config.logger ?? {};
			config.logger.consoleLogLevel = flags.log;
		}
		if (flags.flog) {
			config.logger = config.logger ?? {};
			config.logger.fileLogLevel = flags.flog;
		}
		if (flags.port) {
			config.network = config.network ?? {};
			config.network.wsPort = flags.port;
		}
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (flags.seed) {
			config.network = config.network ?? {};
			config.network.seedPeers = [];
			for (const seed of flags.seed) {
				const [ip, wsPort] = seed.split(':');
				config.network.seedPeers.push({ ip, wsPort: Number(wsPort) });
			}
		}
		// Get application
		// Start
		try {
			const app = getApplication(genesisBlock, config);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			await app.run();
		} catch (errors) {
			this.error(Array.isArray(errors) ? errors.map(err => (err as Error).message).join(',') : errors);
		}
	}
}

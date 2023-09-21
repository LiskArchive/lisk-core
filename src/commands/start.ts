/*
 * Copyright © 2022 Lisk Foundation
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
/* eslint-disable no-param-reassign */
import { Flags as flagParser } from '@oclif/core';
import * as path from 'path';
import * as os from 'os';
import { BaseStartCommand } from 'lisk-commander';
import { Application, ApplicationConfig, PartialApplicationConfig } from 'lisk-sdk';
import { MonitorPlugin } from '@liskhq/lisk-framework-monitor-plugin';
import { ForgerPlugin } from '@liskhq/lisk-framework-forger-plugin';
import { ReportMisbehaviorPlugin } from '@liskhq/lisk-framework-report-misbehavior-plugin';
import { FaucetPlugin } from '@liskhq/lisk-framework-faucet-plugin';
import { ChainConnectorPlugin } from '@liskhq/lisk-framework-chain-connector-plugin';
import { join } from 'path';
import { getApplication } from '../application';
import DownloadCommand from './blockchain/download';

interface Flags {
	[key: string]: string | number | boolean | undefined;
}

const defaultDir = '.lisk';
const getDefaultPath = (name: string) => path.join(os.homedir(), defaultDir, name);

const setPluginConfig = (config: ApplicationConfig, flags: Flags): void => {
	if (flags['monitor-plugin-port'] !== undefined) {
		config.plugins[MonitorPlugin.name] = config.plugins[MonitorPlugin.name] ?? {};
		config.plugins[MonitorPlugin.name].port = flags['monitor-plugin-port'];
	}
	if (
		flags['monitor-plugin-whitelist'] !== undefined &&
		typeof flags['monitor-plugin-whitelist'] === 'string'
	) {
		config.plugins[MonitorPlugin.name] = config.plugins[MonitorPlugin.name] ?? {};
		config.plugins[MonitorPlugin.name].whiteList = flags['monitor-plugin-whitelist']
			.split(',')
			.filter(Boolean);
	}
	if (flags['faucet-plugin-port'] !== undefined) {
		config.plugins[FaucetPlugin.name] = config.plugins[FaucetPlugin.name] ?? {};
		config.plugins[FaucetPlugin.name].port = flags['faucet-plugin-port'];
	}
};

export class StartCommand extends BaseStartCommand {
	static flags = {
		...BaseStartCommand.flags,
		'enable-forger-plugin': flagParser.boolean({
			description:
				'Enable Forger Plugin. Environment variable "LISK_ENABLE_FORGER_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_FORGER_PLUGIN',
			default: false,
		}),
		'enable-monitor-plugin': flagParser.boolean({
			description:
				'Enable Monitor Plugin. Environment variable "LISK_ENABLE_MONITOR_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_MONITOR_PLUGIN',
			default: false,
		}),
		'monitor-plugin-port': flagParser.integer({
			description:
				'Port to be used for Monitor Plugin. Environment variable "LISK_MONITOR_PLUGIN_PORT" can also be used.',
			env: 'LISK_MONITOR_PLUGIN_PORT',
			dependsOn: ['enable-monitor-plugin'],
		}),
		'monitor-plugin-whitelist': flagParser.string({
			description:
				'List of IPs in comma separated value to allow the connection. Environment variable "LISK_MONITOR_PLUGIN_WHITELIST" can also be used.',
			env: 'LISK_MONITOR_PLUGIN_WHITELIST',
			dependsOn: ['enable-monitor-plugin'],
		}),
		'enable-report-misbehavior-plugin': flagParser.boolean({
			description:
				'Enable ReportMisbehavior Plugin. Environment variable "LISK_ENABLE_REPORT_MISBEHAVIOR_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_MONITOR_PLUGIN',
			default: false,
		}),
		'enable-faucet-plugin': flagParser.boolean({
			description:
				'Enable Faucet Plugin. Environment variable "LISK_ENABLE_FAUCET_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_FAUCET_PLUGIN',
			default: false,
		}),
		'faucet-plugin-port': flagParser.integer({
			description:
				'Port to be used for Faucet Plugin. Environment variable "LISK_FAUCET_PLUGIN_PORT" can also be used.',
			env: 'LISK_FAUCET_PLUGIN_PORT',
			dependsOn: ['enable-faucet-plugin'],
		}),
		'enable-dashboard-plugin': flagParser.boolean({
			description:
				'Enable Dashboard Plugin. Environment variable "LISK_ENABLE_DASHBOARD_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_DASHBOARD_PLUGIN',
			default: false,
		}),
		'dashboard-plugin-port': flagParser.integer({
			description:
				'Port to be used for Dashboard Plugin. Environment variable "LISK_DASHBOARD_PLUGIN_PORT" can also be used.',
			env: 'LISK_DASHBOARD_PLUGIN_PORT',
			dependsOn: ['enable-dashboard-plugin'],
		}),
		'enable-chain-connector-plugin': flagParser.boolean({
			description:
				'Enable Chain Connector Plugin. Environment variable "LISK_ENABLE_CHAIN_CONNECTOR_PLUGIN" can also be used.',
			env: 'LISK_ENABLE_CHAIN_CONNECTOR_PLUGIN',
			default: false,
		}),
		url: flagParser.string({
			char: 'u',
			description: 'The url to the genesis block snapshot.',
		}),
	};

	public async getApplication(config: PartialApplicationConfig): Promise<Application> {
		const { flags } = await this.parse(StartCommand);
		// Download Genesis block
		if (['mainnet', 'testnet'].includes(flags.network)) {
			const dataPath = flags['data-path']
				? flags['data-path']
				: getDefaultPath(this.config.pjson.name);
			this.log('....', dataPath);
			this.log(`Genesis block from "${flags.network}" does not exists.`);
			await DownloadCommand.run([
				'--network',
				flags.network,
				'--url',
				flags.url as string,
				'--output',
				dataPath,
			]);
		}

		// Set Plugins Config
		setPluginConfig(config as ApplicationConfig, flags);
		const app = getApplication(config);

		if (flags['enable-forger-plugin']) {
			app.registerPlugin(new ForgerPlugin(), { loadAsChildProcess: true });
		}
		if (flags['enable-monitor-plugin']) {
			app.registerPlugin(new MonitorPlugin(), { loadAsChildProcess: true });
		}
		if (flags['enable-report-misbehavior-plugin']) {
			app.registerPlugin(new ReportMisbehaviorPlugin(), { loadAsChildProcess: true });
		}
		if (flags['enable-faucet-plugin']) {
			app.registerPlugin(new FaucetPlugin(), { loadAsChildProcess: true });
		}
		if (flags['enable-chain-connector-plugin']) {
			app.registerPlugin(new ChainConnectorPlugin(), { loadAsChildProcess: true });
		}

		return app;
	}

	public getApplicationConfigDir(): string {
		return join(__dirname, '../../config');
	}
}

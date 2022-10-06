/*
 * Copyright © 2021 Lisk Foundation
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
import { Command, Flags as flagParser } from '@oclif/core';
import * as fs from 'fs-extra';
import { dirname, join } from 'path';
import { DEFAULT_NETWORK, NETWORK, DOWNLOAD_URL } from '../../constants';
import {
	download,
	downloadAndValidate,
	extract,
	getChecksum,
	getDownloadedFileInfo,
} from '../../utils/download';
import { flags as commonFlags } from '../../utils/flags';
import { getDefaultPath, getNetworkConfigFilesPath } from '../../utils/path';
import { liskGenesisBlockUrl } from '../../utils/commons';

export default class DownloadCommand extends Command {
	static description = 'Download genesis block.';

	static examples = [
		'genesis-block:download --network mainnet -f',
		'genesis-block:download --network --data-path ./lisk/',
		'genesis-block:download --url http://mydomain.com/genesis_block.json.gz --data-path ./lisk/ --force',
	];

	static flags = {
		'data-path': flagParser.string(commonFlags.dataPath),
		network: flagParser.string({
			...commonFlags.network,
			env: 'LISK_NETWORK',
		}),
		url: flagParser.string({
			char: 'u',
			description: 'The url to the genesis block.',
		}),
		force: flagParser.boolean({
			char: 'f',
			description: 'Delete and overwrite existing blockchain data',
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(DownloadCommand);
		const { url, network, 'data-path': dataPath, force } = flags;

		if (!url && !network) {
			this.error('Please provide either url or network to download the genesis block.');
		}

		const customUrl = !!flags.url;
		const downloadUrl = url ?? liskGenesisBlockUrl(DOWNLOAD_URL, network as NETWORK);

		let genesisBlockPath: string;

		if (network && dataPath) {
			genesisBlockPath = getNetworkConfigFilesPath(dataPath, network).genesisBlockFilePath;
		} else if (network) {
			genesisBlockPath = getNetworkConfigFilesPath(getDefaultPath(), network).genesisBlockFilePath;
		} else if (dataPath) {
			genesisBlockPath = getNetworkConfigFilesPath(dataPath, DEFAULT_NETWORK).genesisBlockFilePath;
		} else {
			genesisBlockPath = join(process.cwd(), 'genesis_block.json');
		}

		if (fs.existsSync(genesisBlockPath) && !force) {
			this.error(
				`The genesis block file already exists at ${genesisBlockPath}. Use --force to override.`,
			);
		}

		const downloadDir = dirname(genesisBlockPath);
		const { fileName, filePath } = getDownloadedFileInfo(downloadUrl, downloadDir);

		this.log(`Downloading genesis block from ${downloadUrl}`);

		if (customUrl) {
			await download(downloadUrl, downloadDir);
			this.log(`Downloaded to path: ${filePath}.`);
		} else {
			await downloadAndValidate(downloadUrl, downloadDir);
			const checksum = getChecksum(downloadUrl, downloadDir);
			this.log(`Downloaded to path: ${filePath}.`);
			this.log(`Verified checksum: ${checksum}.`);
		}

		if (fs.existsSync(genesisBlockPath) && force) {
			this.log(`Removing existing genesis block at ${genesisBlockPath}`);
			fs.unlinkSync(genesisBlockPath);
		}

		this.log('Extracting genesis block file.');
		await extract(downloadDir, fileName, downloadDir, 0);

		this.log('Removing downloaded genesis block');
		fs.unlinkSync(filePath);

		this.log('Download completed.');
		this.log(`   ${genesisBlockPath}`);
	}
}

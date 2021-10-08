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

import * as fs from 'fs-extra';
import * as Config from '@oclif/config';
import * as path from 'path';
import DownloadCommand from '../../../src/commands/genesis-block/download';
import * as downloadUtils from '../../../src/utils/download';
import * as pathUtils from '../../../src/utils/path';
import { getConfig } from '../../utils/config';

describe('genesis-block:download command', () => {
	let stdout: string[];
	let stderr: string[];
	let config: Config.IConfig;
	let fsExistsSyncMock: jest.SpyInstance;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(downloadUtils, 'download').mockResolvedValue(undefined);
		jest.spyOn(downloadUtils, 'downloadAndValidate').mockResolvedValue(undefined);
		jest.spyOn(downloadUtils, 'getChecksum').mockResolvedValue('checksum' as never);
		jest.spyOn(downloadUtils, 'getDownloadedFileInfo').mockReturnValue({
			fileName: '/my/fileName',
			fileDir: '/my/fileDir',
			filePath: '/my/filePath',
		});
		jest.spyOn(downloadUtils, 'extract').mockResolvedValue(undefined);
		fsExistsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
		jest.spyOn(fs, 'unlinkSync').mockReturnValue();
	});

	it('should show error if no url or network is passed', async () => {
		await expect(DownloadCommand.run([], config)).rejects.toThrow(
			'Please provide either url or network to download the genesis block.',
		);
	});

	it('should show error if genesis block already exists', async () => {
		jest.spyOn(pathUtils, 'getNetworkConfigFilesPath').mockReturnValue({
			genesisBlockFilePath: '/my/path/genesis_block.json',
			configFilePath: 'my/config/path',
		});
		fsExistsSyncMock.mockReturnValue(true);

		await expect(DownloadCommand.run(['-n', 'mainnet'], config)).rejects.toThrow(
			'The genesis block file already exists at /my/path/genesis_block.json. Use --force to override.',
		);
	});

	it('should use default release path if network is provided and no url', async () => {
		jest.spyOn(path, 'dirname').mockReturnValue('');
		await DownloadCommand.run(['-n', 'mainnet'], config);

		expect(downloadUtils.downloadAndValidate).toHaveBeenCalledWith(
			'https://downloads.lisk.com/lisk/mainnet/genesis_block.json.tar.gz',
			'',
		);
	});

	it('should use url url is provided', async () => {
		jest.spyOn(path, 'dirname').mockReturnValue('');
		await DownloadCommand.run(['-n', 'mainnet', '-u', 'http://my/url/my/custom/gensis'], config);

		expect(downloadUtils.download).toHaveBeenCalledWith('http://my/url/my/custom/gensis', '');
	});
});

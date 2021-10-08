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
 */

import * as fs from 'fs-extra';
import * as axios from 'axios';
import { EventEmitter } from 'events';
import * as downloadUtil from '../../src/utils/download';

describe('download utils', () => {
	const url = 'https://snapshots.lisk.com/betanet/blockchain.db.tar.gz';
	const outDir = './tmp/cache/lisk-core';

	describe('#download', () => {
		beforeEach(() => {
			jest.spyOn(axios, 'default').mockResolvedValue({ data: { pipe: jest.fn() } } as any);
			jest.spyOn(fs, 'statSync');
			jest.spyOn(fs, 'createWriteStream');
			jest.spyOn(fs, 'existsSync');
			jest.spyOn(fs, 'unlinkSync').mockReturnValue();
		});

		it('should resolve if downloaded file', async () => {
			(fs.existsSync as jest.Mock).mockReturnValue(true);
			(fs.statSync as jest.Mock).mockReturnValue({ birthtime: new Date() });
			const stream = new EventEmitter();
			(fs.createWriteStream as jest.Mock).mockReturnValue(stream);

			setTimeout(() => stream.emit('finish'), 10);
			const res = await downloadUtil.download(url, outDir);
			return expect(res).toBeUndefined();
		});
	});

	describe('#downloadLiskAndValidate', () => {
		beforeEach(() => {
			jest.spyOn(axios, 'default').mockResolvedValue({ data: { pipe: jest.fn() } } as any);
			jest.spyOn(fs, 'createWriteStream');
			const stream = new EventEmitter();
			jest.spyOn(fs, 'createReadStream').mockReturnValue(stream as any);
			setTimeout(() => stream.emit('end'), 10);
			jest.spyOn(fs, 'readFileSync');
			jest.spyOn(downloadUtil, 'download').mockResolvedValue();
			jest.spyOn(downloadUtil, 'verifyChecksum');
			jest.spyOn(downloadUtil, 'getChecksum');
			jest
				.spyOn(downloadUtil, 'getDownloadedFileInfo')
				.mockReturnValue({ fileDir: '', fileName: '', filePath: '' });
		});

		it('should download lisk and validate release', async () => {
			(fs.readFileSync as jest.Mock).mockReturnValueOnce(
				'7607d6792843d6003c12495b54e34517a508d2a8622526aff1884422c5478971 tar filename here',
			);
			(downloadUtil.getChecksum as jest.Mock).mockReturnValue(
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			);

			await downloadUtil.downloadAndValidate(url, outDir);
			expect(downloadUtil.download).toHaveBeenCalledTimes(2);
			expect(downloadUtil.getChecksum).toHaveBeenCalledTimes(1);
			return expect(downloadUtil.getDownloadedFileInfo).toHaveBeenCalledTimes(1);
		});

		it('should throw error when validation fails', async () => {
			(fs.readFileSync as jest.Mock).mockReturnValueOnce(
				'9897d6792843d6003c12495b54e34517a508d2a8622526aff1884422c5478971 tar filename here',
			);
			(downloadUtil.verifyChecksum as jest.Mock).mockImplementation(() => {
				throw new Error('Checksum did not match');
			});

			await expect(downloadUtil.downloadAndValidate(url, outDir)).rejects.toThrow(
				'Checksum did not match',
			);
		});
	});
});

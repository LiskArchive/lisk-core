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
import * as tar from 'tar';
import { homedir } from 'os';
import * as Config from '@oclif/config';
import { join } from 'path';
import ExportCommand from '../../../src/commands/blockchain/export';
import { getConfig } from '../../utils/config';

describe('blockchain:export', () => {
	const defaultDataPath = join(homedir(), '.lisk', 'lisk-core');

	let stdout: string[];
	let stderr: string[];
	let config: Config.IConfig;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(tar, 'create').mockResolvedValue(true as never);
	});

	describe('when starting without flag', () => {
		it('should compress "blockchain.db" for default data path', async () => {
			await ExportCommand.run([], config);
			expect(tar.create).toHaveBeenCalledTimes(1);
			expect(tar.create).toHaveBeenCalledWith(
				{
					cwd: join(defaultDataPath, 'data'),
					file: join(process.cwd(), 'blockchain.db.tar.gz'),
					gzip: true,
				},
				['blockchain.db'],
			);
		});
	});

	describe('when starting with particular data-path', () => {
		it('should compress "blockchain.db" for given data path', async () => {
			await ExportCommand.run(['--data-path=/my/app/'], config);
			expect(tar.create).toHaveBeenCalledTimes(1);
			expect(tar.create).toHaveBeenCalledWith(
				{
					cwd: join('/my/app/', 'data'),
					file: join(process.cwd(), 'blockchain.db.tar.gz'),
					gzip: true,
				},
				['blockchain.db'],
			);
		});
	});

	describe('when starting with particular export path', () => {
		it('should compress "blockchain.db" for given data path', async () => {
			await ExportCommand.run(['--output=/my/dir/'], config);
			expect(tar.create).toHaveBeenCalledTimes(1);
			expect(tar.create).toHaveBeenCalledWith(
				{
					cwd: join(defaultDataPath, 'data'),
					file: join('/my/dir/', 'blockchain.db.tar.gz'),
					gzip: true,
				},
				['blockchain.db'],
			);
		});
	});
});

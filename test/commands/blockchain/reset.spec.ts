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

import * as inquirer from 'inquirer';
import { homedir } from 'os';
import { join } from 'path';
import * as appUtils from '../../../src/utils/application';
import * as dbUtils from '../../../src/utils/db';
import ResetCommand from '../../../src/commands/blockchain/reset';

const defaultDataPath = join(homedir(), '.lisk', 'lisk-core');

describe('blockchain:reset', () => {
	const pid = 56869;

	let stdout: string[];
	let stderr: string[];
	let kvStoreStubInstance;

	beforeEach(() => {
		stdout = [];
		stderr = [];
		kvStoreStubInstance = {
			clear: jest.fn(),
		};
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(dbUtils, 'getBlockchainDB').mockReturnValue(kvStoreStubInstance);
		jest.spyOn(appUtils, 'getPid').mockReturnValue(pid);
		jest.spyOn(inquirer, 'prompt').mockReturnValue({ answer: false });
	});

	describe('when application is running', () => {
		beforeEach(() => {
			jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		});

		describe('when reset without flags', () => {
			it('should log error and return', async () => {
				await expect(ResetCommand.run([])).rejects.toThrow(
					`Can't reset db while running application. Application at data path ${defaultDataPath} is running with pid ${pid}.`,
				);
			});
		});

		describe('when reset with data-path', () => {
			it('should log error and return', async () => {
				await expect(ResetCommand.run(['--data-path=/my/app/'])).rejects.toThrow(
					`Can't reset db while running application. Application at data path /my/app/ is running with pid ${pid}.`,
				);
			});
		});

		describe('when starting with skip confirmation', () => {
			it('should log error and return', async () => {
				await expect(ResetCommand.run(['--yes'])).rejects.toThrow(
					`Can't reset db while running application. Application at data path ${defaultDataPath} is running with pid ${pid}.`,
				);
			});
		});
	});

	describe('when application is not running', () => {
		beforeEach(() => {
			jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(false);
		});

		describe('when reset without flag', () => {
			it('should create db object for "blockchain.db" for default data path', async () => {
				await ResetCommand.run([]);
				expect(dbUtils.getBlockchainDB).toHaveBeenCalledTimes(1);
				expect(dbUtils.getBlockchainDB).toHaveBeenCalledWith(defaultDataPath);
			});

			it('should prompt user for confirmation', async () => {
				await ResetCommand.run([]);
				expect(inquirer.prompt).toHaveBeenCalledTimes(1);
				expect(inquirer.prompt).toHaveBeenCalledWith([
					{
						name: 'answer',
						message: 'Are you sure you want to reset the db?',
						type: 'list',
						choices: ['yes', 'no'],
					},
				]);
			});

			it('should reset the blockchain db', async () => {
				await ResetCommand.run([]);
				expect(kvStoreStubInstance.clear).toHaveBeenCalledTimes(1);
			});
		});

		describe('when reset with data-path', () => {
			beforeEach(() => {
				jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(false);
			});

			it('should create db object for "blockchain.db" for given data path', async () => {
				await ResetCommand.run(['--data-path=/my/app/']);
				expect(dbUtils.getBlockchainDB).toHaveBeenCalledTimes(1);
				expect(dbUtils.getBlockchainDB).toHaveBeenCalledWith('/my/app/');
			});

			it('should prompt user for confirmation', async () => {
				await ResetCommand.run(['--data-path=/my/app/']);
				expect(inquirer.prompt).toHaveBeenCalledTimes(1);
				expect(inquirer.prompt).toHaveBeenCalledWith([
					{
						name: 'answer',
						message: 'Are you sure you want to reset the db?',
						type: 'list',
						choices: ['yes', 'no'],
					},
				]);
			});

			it('should reset the blockchain db', async () => {
				await ResetCommand.run(['--data-path=/my/app/']);
				expect(kvStoreStubInstance.clear).toHaveBeenCalledTimes(1);
			});
		});

		describe('when skipping confirmation prompt', () => {
			beforeEach(() => {
				jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(false);
			});

			it('should create db object for "blockchain.db"', async () => {
				await ResetCommand.run(['--yes']);
				expect(dbUtils.getBlockchainDB).toHaveBeenCalledTimes(1);
			});

			it('should reset the blockchain db', async () => {
				await ResetCommand.run(['--yes']);
				expect(kvStoreStubInstance.clear).toHaveBeenCalledTimes(1);
			});
		});
	});
});

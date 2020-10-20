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
import { IPCChannel } from 'lisk-sdk';
import { when } from 'jest-when';
import * as Config from '@oclif/config';
import { BaseForgingCommand } from '../../src/base_forging';
import * as appUtils from '../../src/utils/application';
import EnableCommand from '../../src/commands/forging/enable';
import DisableCommand from '../../src/commands/forging/disable';
import { getConfig } from '../utils/config';

describe('forging', () => {
	const actionResult = {
		address: 'actionAddress',
		forging: true,
	};
	let stdout: string[];
	let stderr: string[];
	let config: Config.IConfig;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		jest.spyOn(BaseForgingCommand.prototype, 'printJSON').mockReturnValue();
		jest.spyOn(IPCChannel.prototype, 'startAndListen').mockResolvedValue();
		jest.spyOn(IPCChannel.prototype, 'invoke').mockResolvedValue(actionResult);
		jest.spyOn(inquirer, 'prompt').mockResolvedValue({ password: 'promptPassword' });
	});

	describe('forging:enable', () => {
		it('should throw an error when arg is not provided', async () => {
			await expect(EnableCommand.run([], config)).rejects.toThrow('Missing 1 required arg');
		});

		describe('when invoked with password', () => {
			it('should invoke action with given address and password', async () => {
				await EnableCommand.run(['myAddress', '--password=my-password'], config);
				expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: true,
					password: 'my-password',
				});
			});
		});

		describe('when invoked without password', () => {
			it('should prompt user for password', async () => {
				await EnableCommand.run(['myAddress'], config);
				expect(inquirer.prompt).toHaveBeenCalledTimes(1);
				expect(inquirer.prompt).toHaveBeenCalledWith([
					{
						type: 'password',
						message: 'Enter password to decrypt the encrypted passphrase: ',
						name: 'password',
						mask: '*',
					},
				]);
			});

			it('should invoke action with given address and password', async () => {
				await EnableCommand.run(['myAddress'], config);
				expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: true,
					password: 'promptPassword',
				});
			});
		});

		describe('when action is successful', () => {
			it('should invoke action with given address and user provided password', async () => {
				await EnableCommand.run(['myAddress', '--password=my-password'], config);
				expect(BaseForgingCommand.prototype.printJSON).toHaveBeenCalledTimes(1);
				expect(BaseForgingCommand.prototype.printJSON).toHaveBeenCalledWith(actionResult);
			});
		});

		describe('when action fail', () => {
			it('should log the error returned', async () => {
				when(IPCChannel.prototype.invoke as jest.Mock)
					.calledWith('app:updateForgingStatus', {
						address: 'myFailedEnabledAddress',
						forging: true,
						password: 'my-password',
					})
					.mockRejectedValue(new Error('Custom Error'));
				await expect(
					EnableCommand.run(['myFailedEnabledAddress', '--password=my-password'], config),
				).rejects.toThrow('Custom Error');
			});
		});
	});

	describe('forging:disable', () => {
		it('should throw an error when arg is not provided', async () => {
			await expect(DisableCommand.run([], config)).rejects.toThrow('Missing 1 required arg');
		});

		describe('when invoked with password', () => {
			it('should invoke action with given address and password', async () => {
				await DisableCommand.run(['myAddress', '--password=my-password'], config);
				expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: false,
					password: 'my-password',
				});
			});
		});

		describe('when invoked without password', () => {
			it('should prompt user for password', async () => {
				await DisableCommand.run(['myAddress'], config);
				expect(inquirer.prompt).toHaveBeenCalledTimes(1);
				expect(inquirer.prompt).toHaveBeenCalledWith([
					{
						type: 'password',
						message: 'Enter password to decrypt the encrypted passphrase: ',
						name: 'password',
						mask: '*',
					},
				]);
			});

			it('should invoke action with given address and password', async () => {
				await DisableCommand.run(['myAddress'], config);
				expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:updateForgingStatus', {
					address: 'myAddress',
					forging: false,
					password: 'promptPassword',
				});
			});
		});

		describe('when action is successful', () => {
			it('should invoke action with given address and user provided password', async () => {
				await DisableCommand.run(['myAddress', '--password=my-password'], config);
				expect(BaseForgingCommand.prototype.printJSON).toHaveBeenCalledTimes(1);
				expect(BaseForgingCommand.prototype.printJSON).toHaveBeenCalledWith(actionResult);
			});
		});

		describe('when action fail', () => {
			it('should log the error returned', async () => {
				when(IPCChannel.prototype.invoke as jest.Mock)
					.calledWith('app:updateForgingStatus', {
						address: 'myFailedDisabledAddress',
						forging: false,
						password: 'my-password',
					})
					.mockRejectedValue(new Error('Custom Error'));
				await expect(
					DisableCommand.run(['myFailedDisabledAddress', '--password=my-password'], config),
				).rejects.toThrow('Custom Error');
			});
		});
	});
});

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
import { when } from 'jest-when';
import * as fs from 'fs-extra';
import { IPCChannel } from 'lisk-sdk';
import * as Config from '@oclif/config';
import { getConfig } from '../../utils/config';
import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import GetCommand from '../../../src/commands/account/get';

describe('account:get command', () => {
	const queryResult = {
		address: '',
	};
	const address = 'c3ab2ac23512d9bf62b02775e22cf80df814eb1b';
	let stdout: string[];
	let stderr: string[];
	let config: Config.IConfig;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(IPCChannel.prototype, 'startAndListen').mockResolvedValue();
		jest.spyOn(IPCChannel.prototype, 'invoke');
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		when(IPCChannel.prototype.invoke as jest.Mock)
			.calledWith('app:getSchema')
			.mockResolvedValue({
				account: {
					$id: 'dummy',
					type: 'object',
					properties: { address: { dataType: 'bytes' } },
				},
			})
			.calledWith('app:getAccount', { address })
			.mockResolvedValue(
				'0a14c3ab2ac23512d9bf62b02775e22cf80df814eb1b10001800220208002a3a0a190a0a67656e657369735f38361800200028003080a094a58d1d121d0a14c3ab2ac23512d9bf62b02775e22cf80df814eb1b1080a094a58d1d',
			);
		jest.spyOn(baseIPC.prototype, 'printJSON');
	});

	describe('account:get', () => {
		it('should throw an error when arg is not provided', async () => {
			await expect(GetCommand.run([], config)).rejects.toThrow('Missing 1 required arg');
		});
	});

	describe('account:get address', () => {
		it('should get an account info and display as an object', async () => {
			await GetCommand.run([address], config);
			expect(IPCChannel.prototype.invoke).toHaveBeenCalledTimes(2);
			expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:getSchema');
			expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:getAccount', {
				address,
			});
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith(queryResult);
		});
	});

	describe('account:get unknown_address', () => {
		it('should throw an error when unknown address is specified', async () => {
			when(IPCChannel.prototype.invoke as jest.Mock)
				.calledWith('app:getAccount', { address: 'unknown_address' })
				.mockRejectedValue(new Error('unknown address'));

			await expect(GetCommand.run(['unknown_address'], config)).rejects.toThrow('unknown address');
		});
	});
});

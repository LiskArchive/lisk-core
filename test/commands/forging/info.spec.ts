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
import * as fs from 'fs-extra';
import { apiClient } from 'lisk-sdk';
import * as Config from '@oclif/config';
import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import InfoCommand from '../../../src/commands/forging/info';
import { getConfig } from '../../utils/config';

describe('forging:info command', () => {
	const forgingInfoMock = [{ address: 'fake-address', forging: true }];
	let stdout: string[];
	let stderr: string[];
	let config: Config.IConfig;
	let invokeMock: jest.Mock;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		invokeMock = jest.fn().mockResolvedValue(forgingInfoMock);
		jest.spyOn(apiClient, 'createIPCClient').mockResolvedValue({
			disconnect: jest.fn(),
			invoke: invokeMock,
		} as never);
		jest.spyOn(baseIPC.prototype, 'printJSON');
	});

	describe('forging:', () => {
		it('should throw an error when no arguments are provided.', async () => {
			await InfoCommand.run([], config);
			expect(invokeMock).toHaveBeenCalledTimes(1);
			expect(invokeMock).toHaveBeenCalledWith('app:getForgingStatus');
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith(forgingInfoMock);
		});
	});
});

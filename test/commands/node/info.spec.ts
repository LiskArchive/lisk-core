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
import { getConfig } from '../../utils/config';
import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import InfoCommand from '../../../src/commands/node/info';

describe('node:info command', () => {
	const queryResult = {
		version: '3.0.0-beta.1',
		networkVersion: '1.1',
		networkIdentifier: '873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
		lastBlockID: 'c955d438e5cc09cc0f78039876562b6cb613a14d155a69d80b1a50944822ee74',
		height: 297,
		finalizedHeight: 0,
		syncing: false,
		unconfirmedTransactions: 0,
		genesisConfig: {
			blockTime: 10,
			maxPayloadLength: 15360,
			rewards: {
				milestones: ['500000000', '400000000', '300000000', '200000000', '100000000'],
				offset: 2160,
				distance: 3000000,
			},
			communityIdentifier: 'Lisk',
			activeDelegates: 101,
			standbyDelegates: 2,
			totalAmount: '10000000000000000',
			delegateListRoundOffset: 2,
		},
	};

	let stdout: string[];
	let stderr: string[];
	let config: Config.IConfig;
	let getMock: jest.Mock;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(baseIPC.prototype, 'printJSON').mockReturnValue(queryResult as never);
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		getMock = jest.fn().mockResolvedValue(queryResult);
		jest.spyOn(apiClient, 'createIPCClient').mockResolvedValue({
			disconnect: jest.fn(),
			node: {
				getNodeInfo: getMock,
			},
		} as never);
	});

	describe('node:info', () => {
		it('should get node info and display as an object', async () => {
			await InfoCommand.run([], config);
			expect(getMock).toHaveBeenCalledTimes(1);
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith(queryResult);
		});
	});
});

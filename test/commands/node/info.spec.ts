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

import { expect, test } from '@oclif/test';
import * as sandbox from 'sinon';
import { IPCChannel } from 'lisk-sdk';
import baseIPC from '../../../src/base_ipc';

describe('node:info command', () => {
	const queryResult = {
		version: '3.0.0-beta.1',
		networkVersion: '1.1',
		networkID: 'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
		lastBlockID: 'yVXUOOXMCcwPeAOYdlYrbLYToU0VWmnYCxpQlEgi7nQ=',
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
	const printJSONStub = sandbox.stub().returns(queryResult);
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();
	ipcInvokeStub.withArgs('app:getNodeInfo').resolves(queryResult);

	const setupTest = () =>
		test
			.stub(baseIPC.prototype, 'printJSON', printJSONStub)
			.stub(IPCChannel.prototype, 'startAndListen', ipcStartAndListenStub)
			.stub(IPCChannel.prototype, 'invoke', ipcInvokeStub);

	describe('node:info', () => {
		setupTest()
			.command(['node:info'])
			.it('should get node info and display as an object', () => {
				expect(ipcInvokeStub).to.have.been.calledTwice;
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getNodeInfo');
				expect(printJSONStub).to.have.been.calledOnce;
				expect(printJSONStub).to.have.been.calledWithExactly(queryResult);
			});
	});
});

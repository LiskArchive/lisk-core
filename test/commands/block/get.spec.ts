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
import * as fs from 'fs-extra';
import { IPCChannel } from 'lisk-sdk';

import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';

const blockSchema = {
	$id: 'blockSchema',
	type: 'object',
	properties: {
		header: { dataType: 'bytes', fieldNumber: 1 },
		payload: { type: 'array', items: { dataType: 'bytes' }, fieldNumber: 2 },
	},
};
const blockHeaderSchema = {
	$id: 'blockHeaderSchema',
	type: 'object',
	properties: {
		version: { dataType: 'uint32', fieldNumber: 1 },
		timestamp: { dataType: 'uint32', fieldNumber: 2 },
		height: { dataType: 'uint32', fieldNumber: 3 },
		previousBlockID: { dataType: 'bytes', fieldNumber: 4 },
		transactionRoot: { dataType: 'bytes', fieldNumber: 5 },
		generatorPublicKey: { dataType: 'bytes', fieldNumber: 6 },
		reward: { dataType: 'uint64', fieldNumber: 7 },
		asset: { dataType: 'bytes', fieldNumber: 8 },
		signature: { dataType: 'bytes', fieldNumber: 9 },
	},
};
const blockHeadersAssets = {
	2: {
		$id: '/block-header/asset/v2',
		type: 'object',
		properties: {
			maxHeightPreviouslyForged: { dataType: 'uint32', fieldNumber: 1 },
			maxHeightPrevoted: { dataType: 'uint32', fieldNumber: 2 },
			seedReveal: { dataType: 'bytes', fieldNumber: 3 },
		},
	},
};

describe('block:get command', () => {
	const blockId = '4f7e41f5744c0c2a434f13afb186b77fb4b176a5298f91ed866680ff5ef13a6d';
	const blockDataAtHeightTwo = {
		header: {
			asset: {
				maxHeightPreviouslyForged: 0,
				maxHeightPrevoted: 0,
				seedReveal: '8903ea6e67ccd67bafa1c9c04184a387',
			},
			generatorPublicKey: 'a9a3c363a71a3089566352127cf0e6f79d3834e1d67b4132b98d35afd3b85375',
			height: 2,
			id: '085d7c9b7bddc8052be9eefe185f407682a495f1b4498677df1480026b74f2e9',
			previousBlockID: '4f7e41f5744c0c2a434f13afb186b77fb4b176a5298f91ed866680ff5ef13a6d',
			reward: '0',
			signature:
				'5aa36d00cbcd135b55484c17ba89da8ecbac4df2ccc2c0c12b9db0cf4e48c74122c6c8d5100cf83fa83f79d5684eccf2ef9e6c55408bac9dea45c2b5aa590a0c',
			timestamp: 1592924699,
			transactionRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
			version: 2,
		},
		payload: [],
	};
	const encodedBlockData =
		'0acc010802109bb4c8f705180222204f7e41f5744c0c2a434f13afb186b77fb4b176a5298f91ed866680ff5ef13a6d2a20e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8553220a9a3c363a71a3089566352127cf0e6f79d3834e1d67b4132b98d35afd3b8537538004216080010001a108903ea6e67ccd67bafa1c9c04184a3874a405aa36d00cbcd135b55484c17ba89da8ecbac4df2ccc2c0c12b9db0cf4e48c74122c6c8d5100cf83fa83f79d5684eccf2ef9e6c55408bac9dea45c2b5aa590a0c';
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();
	ipcInvokeStub
		.withArgs('app:getSchema')
		.resolves({
			block: blockSchema,
			blockHeader: blockHeaderSchema,
			blockHeadersAssets,
		})
		.withArgs('app:getBlockByID', { id: blockId })
		.resolves(encodedBlockData)
		.withArgs('app:getBlockByHeight', { height: 2 })
		.resolves(encodedBlockData);

	afterEach(() => {
		ipcInvokeStub.resetHistory();
		printJSONStub.resetHistory();
	});
	const setupTest = () =>
		test
			.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
			.stub(fs, 'existsSync', fsStub)
			.stub(baseIPC.prototype, 'printJSON', printJSONStub)
			.stub(IPCChannel.prototype, 'startAndListen', ipcStartAndListenStub)
			.stub(IPCChannel.prototype, 'invoke', ipcInvokeStub);

	describe('block:get', () => {
		setupTest()
			.command(['block:get'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg:'))
			.it('should throw an error when no arguments are provided.');
	});

	describe('block:get by height', () => {
		setupTest()
			.command(['block:get', '2'])
			.it('should get block info at height 2 and display as an object', () => {
				expect(ipcInvokeStub).to.have.been.calledTwice;
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getSchema');
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getBlockByHeight', { height: 2 });
				expect(printJSONStub).to.have.been.calledOnce;
				expect(printJSONStub).to.have.been.calledWithExactly(blockDataAtHeightTwo);
			});
	});

	describe('block:get by id', () => {
		setupTest()
			.command(['block:get', '4f7e41f5744c0c2a434f13afb186b77fb4b176a5298f91ed866680ff5ef13a6d'])
			.it('should get block info for the given id and display as an object', () => {
				expect(ipcInvokeStub).to.have.been.calledTwice;
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getSchema');
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getBlockByID', { id: blockId });
				expect(printJSONStub).to.have.been.calledOnce;
				expect(printJSONStub).to.have.been.calledWithExactly(blockDataAtHeightTwo);
			});
	});
});

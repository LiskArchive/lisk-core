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
	const blockId = 'T35B9XRMDCpDTxOvsYa3f7SxdqUpj5HthmaA/17xOm0=';
	const blockDataAtHeightTwo = {
		header: {
			asset: {
				maxHeightPreviouslyForged: 0,
				maxHeightPrevoted: 0,
				seedReveal: 'iQPqbmfM1nuvocnAQYSjhw==',
			},
			generatorPublicKey: 'qaPDY6caMIlWY1ISfPDm9504NOHWe0EyuY01r9O4U3U=',
			height: 2,
			id: 'CF18m3vdyAUr6e7+GF9AdoKklfG0SYZ33xSAAmt08uk=',
			previousBlockID: 'T35B9XRMDCpDTxOvsYa3f7SxdqUpj5HthmaA/17xOm0=',
			reward: '0',
			signature:
				'WqNtAMvNE1tVSEwXuonajsusTfLMwsDBK52wz05Ix0EixsjVEAz4P6g/edVoTszy755sVUCLrJ3qRcK1qlkKDA==',
			timestamp: 1592924699,
			transactionRoot: '47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
			version: 2,
		},
		payload: [],
	};
	const encodedBlockData =
		'CswBCAIQm7TI9wUYAiIgT35B9XRMDCpDTxOvsYa3f7SxdqUpj5HthmaA/17xOm0qIOOwxEKY/BwUmvv0yJlvuSQnrkHkZJuTTKSVmRt4UrhVMiCpo8NjpxowiVZjUhJ88Ob3nTg04dZ7QTK5jTWv07hTdTgAQhYIABAAGhCJA+puZ8zWe6+hycBBhKOHSkBao20Ay80TW1VITBe6idqOy6xN8szCwMErnbDPTkjHQSLGyNUQDPg/qD951WhOzPLvnmxVQIusnepFwrWqWQoM';
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();
	ipcInvokeStub
		.withArgs('app:getSchema')
		.resolves({
			blockSchema,
			blockHeaderSchema,
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
			.command(['block:get', 'T35B9XRMDCpDTxOvsYa3f7SxdqUpj5HthmaA/17xOm0='])
			.it('should get block info for the given id and display as an object', () => {
				expect(ipcInvokeStub).to.have.been.calledTwice;
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getSchema');
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getBlockByID', { id: blockId });
				expect(printJSONStub).to.have.been.calledOnce;
				expect(printJSONStub).to.have.been.calledWithExactly(blockDataAtHeightTwo);
			});
	});
});

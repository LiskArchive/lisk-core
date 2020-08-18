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
import { IPCChannel, transactionSchema } from 'lisk-sdk';

import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import { createTransferTransaction, encodeTransactionFromJSON } from '../../utils/transactions';

const transferAssetSchema = {
	$id: 'lisk/transfer-transaction',
	title: 'Transfer transaction asset',
	type: 'object',
	required: ['amount', 'recipientAddress', 'data'],
	properties: {
		amount: {
			dataType: 'uint64',
			fieldNumber: 1,
		},
		recipientAddress: {
			dataType: 'bytes',
			fieldNumber: 2,
			minLength: 20,
			maxLength: 20,
		},
		data: {
			dataType: 'string',
			fieldNumber: 3,
			minLength: 0,
			maxLength: 64,
		},
	},
};

const transactionsAssetSchemas = [
	{
		moduleType: 2,
		assetType: 0,
		schema: transferAssetSchema,
	},
];

describe('transaction:get command', () => {
	const { id: transactionId, ...transferTransaction } = createTransferTransaction({
		amount: '1',
		fee: '0.2',
		nonce: 1,
		recipientAddress: 'CQP0xctZmnkorvJ+MU6YKR0eOIg=',
	});
	const encodedTransaction = encodeTransactionFromJSON(
		transferTransaction as any,
		transactionSchema,
		transactionsAssetSchemas,
	);
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();
	ipcInvokeStub
		.withArgs('app:getSchema')
		.resolves({
			transactionSchema,
			transactionsAssetSchemas,
		})
		.withArgs('app:getTransactionByID', { id: transactionId })
		.resolves(encodedTransaction);

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

	describe('transaction:get', () => {
		setupTest()
			.command(['transaction:get'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg:'))
			.it('should throw an error when no arguments are provided.');
	});

	describe('transaction:get {transactionId}', () => {
		setupTest()
			.command(['transaction:get', transactionId as string])
			.it('should get transaction for the given id and display as an object', () => {
				expect(ipcInvokeStub).to.have.been.calledTwice;
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getSchema');
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:getTransactionByID', {
					id: transactionId,
				});
				expect(printJSONStub).to.have.been.calledOnce;
				expect(printJSONStub).to.have.been.calledWithExactly({
					...transferTransaction,
					id: transactionId,
				});
			});
	});
});

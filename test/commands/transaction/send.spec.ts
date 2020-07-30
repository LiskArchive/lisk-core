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
import { join } from 'path';
import { IPCChannel } from 'lisk-sdk';

import * as appUtils from '../../../src/utils/application';
import { createTransferTransaction, encodeTransactionFromJSON } from '../../utils/transactions';

const baseTransactionSchema = {
	$id: 'lisk/base-transaction',
	type: 'object',
	required: ['type', 'nonce', 'fee', 'senderPublicKey', 'asset'],
	properties: {
		type: {
			dataType: 'uint32',
			fieldNumber: 1,
		},
		nonce: {
			dataType: 'uint64',
			fieldNumber: 2,
		},
		fee: {
			dataType: 'uint64',
			fieldNumber: 3,
		},
		senderPublicKey: {
			dataType: 'bytes',
			fieldNumber: 4,
		},
		asset: {
			dataType: 'bytes',
			fieldNumber: 5,
		},
		signatures: {
			type: 'array',
			items: {
				dataType: 'bytes',
			},
			fieldNumber: 6,
		},
	},
};

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

const transactionsAssets = {
	8: transferAssetSchema,
};

describe('transaction:send command', () => {
	const { id: transactionId, ...transferTransaction } = createTransferTransaction({
		amount: '1',
		fee: '0.2',
		nonce: 1,
		recipientAddress: 'CQP0xctZmnkorvJ+MU6YKR0eOIg=',
	});
	const encodedTransaction = encodeTransactionFromJSON(
		transferTransaction as any,
		baseTransactionSchema,
		transactionsAssets,
	);
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const pathToAppPIDFiles = join(__dirname, 'fake_test_app');
	const ipcStartAndListenStub = sandbox.stub();
	ipcInvokeStub.withArgs('app:getSchema').resolves({
		baseTransaction: baseTransactionSchema,
		transactionsAssets,
	});

	afterEach(() => {
		ipcInvokeStub.resetHistory();
		printJSONStub.resetHistory();
	});

	const setupTest = () =>
		test
			.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
			.stub(fs, 'existsSync', fsStub)
			.stub(IPCChannel.prototype, 'startAndListen', ipcStartAndListenStub)
			.stub(IPCChannel.prototype, 'invoke', ipcInvokeStub)
			.stdout();

	describe('transaction:send', () => {
		setupTest()
			.command(['transaction:send'])
			.catch((error: Error) =>
				expect(error.message).to.contain(
					'Missing 1 required arg:\ntransaction  The transaction to be sent to the node\nSee more help with --help',
				),
			)
			.it('should throw an error when transaction argument is not provided.');
	});

	describe('transaction:send <base64 encoded transaction> --data-path=<path to a not running app>', () => {
		setupTest()
			.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
			.command(['transaction:send', encodedTransaction, `--data-path=${pathToAppPIDFiles}`])
			.catch((error: Error) =>
				expect(error.message).to.contain(
					`Application at data path ${pathToAppPIDFiles} is not running.`,
				),
			)
			.it('should throw an error when the application for the provided path is not running.');
	});

	describe('transaction:send <invalid base64 string> --data-path=<path to a not running app>', () => {
		setupTest()
			.command(['transaction:send', '%%%%%%', `--data-path=${pathToAppPIDFiles}`])
			.catch((error: Error) => {
				expect(error.message).to.contain(
					'The transaction must be provided as a base64 encoded string',
				);
			})
			.it('should throw error.');
	});

	describe('transaction:send <base64 encoded transaction> --data-path=<path to a running app>', () => {
		ipcInvokeStub
			.withArgs('app:postTransaction', { transaction: encodedTransaction })
			.resolves({ transactionId });

		setupTest()
			.command(['transaction:send', encodedTransaction, `--data-path=${pathToAppPIDFiles}`])
			.it('should return the id of the sent transaction', out => {
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:postTransaction', {
					transaction: encodedTransaction,
				});
				expect(out.stdout).to.contain(`Transaction with id: '${transactionId}' received by node`);
			});
	});

	describe('transaction:send <base64 encoded invalid transaction> --data-path=<path to a not running app>', () => {
		ipcInvokeStub
			.withArgs('app:postTransaction', { transaction: 'invalidAccountNonceTrs' })
			.rejects(
				new Error(
					'Error: Lisk validator found 1 error[s]:\nIncompatible transaction nonce for account: 0EaZ5XxKOEbJiPPBUwZ5b46uXBw=, Tx Nonce: 0, Account Nonce: 1',
				),
			);

		setupTest()
			.command(['transaction:send', 'invalidAccountNonceTrs', `--data-path=${pathToAppPIDFiles}`])
			.catch((error: Error) => {
				expect(error.message).to.contain(
					'Error: Lisk validator found 1 error[s]:\nIncompatible transaction nonce for account: 0EaZ5XxKOEbJiPPBUwZ5b46uXBw=, Tx Nonce: 0, Account Nonce: 1',
				);
			})
			.it('should throw error.');
	});
});

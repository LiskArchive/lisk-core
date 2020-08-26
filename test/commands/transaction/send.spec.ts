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
import { IPCChannel, transactionSchema } from 'lisk-sdk';

import * as appUtils from '../../../src/utils/application';
import {
	createTransferTransaction,
	encodeTransactionFromJSON,
	tokenTransferAssetSchema,
} from '../../utils/transactions';

const transactionsAssetSchemas = [
	{
		moduleID: 2,
		assetID: 0,
		schema: tokenTransferAssetSchema,
	},
];

describe('transaction:send command', () => {
	const { id: transactionId, ...transferTransaction } = createTransferTransaction({
		amount: '1',
		fee: '0.2',
		nonce: 1,
		recipientAddress: '0903f4c5cb599a7928aef27e314e98291d1e3888',
	});
	const encodedTransaction = encodeTransactionFromJSON(
		transferTransaction as any,
		transactionSchema,
		transactionsAssetSchemas,
	);
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const pathToAppPIDFiles = join(__dirname, 'fake_test_app');
	const ipcStartAndListenStub = sandbox.stub();
	ipcInvokeStub.withArgs('app:getSchema').resolves({
		transactionSchema,
		transactionsAssetSchemas,
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
			.catch((error: Error) => {
				expect(error.message).to.contain(
					'Missing 1 required arg:\ntransaction  A transaction to be sent to the node encoded as hex string\nSee more help with --help',
				);
			})
			.it('should throw an error when transaction argument is not provided.');
	});

	describe('transaction:send <hex encoded transaction> --data-path=<path to a not running app>', () => {
		setupTest()
			.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
			.command(['transaction:send', encodedTransaction, `--data-path=${pathToAppPIDFiles}`])
			.catch((error: Error) => {
				expect(error.message).to.contain(
					`Application at data path ${pathToAppPIDFiles} is not running.`,
				);
			})
			.it('should throw an error when the application for the provided path is not running.');
	});

	describe('transaction:send <invalid hex string> --data-path=<path to a not running app>', () => {
		setupTest()
			.command(['transaction:send', '%%%%%%', `--data-path=${pathToAppPIDFiles}`])
			.catch((error: Error) => {
				expect(error.message).to.contain(
					'The transaction must be provided as a hex encoded string',
				);
			})
			.it('should throw error.');
	});

	describe('transaction:send <hex encoded transaction> --data-path=<path to a running app>', () => {
		ipcInvokeStub
			.withArgs('app:postTransaction', { transaction: encodedTransaction })
			.resolves({ transactionId });

		setupTest()
			.command(['transaction:send', encodedTransaction, `--data-path=${pathToAppPIDFiles}`])
			.it('should return the id of the sent transaction', out => {
				expect(ipcInvokeStub).to.have.been.calledWithExactly('app:postTransaction', {
					transaction: encodedTransaction,
				});
				expect(out.stdout).to.contain(
					`Transaction with id: '${transactionId as string}' received by node`,
				);
			});
	});

	describe('transaction:send <hex encoded invalid transaction> --data-path=<path to a not running app>', () => {
		ipcInvokeStub
			.withArgs('app:postTransaction', { transaction: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815' })
			.rejects(
				new Error(
					'Error: Lisk validator found 1 error[s]:\nIncompatible transaction nonce for account: d04699e57c4a3846c988f3c15306796f8eae5c1c, Tx Nonce: 0, Account Nonce: 1',
				),
			);

		setupTest()
			.command([
				'transaction:send',
				'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
				`--data-path=${pathToAppPIDFiles}`,
			])
			.catch((error: Error) => {
				expect(error.message).to.contain(
					'Error: Lisk validator found 1 error[s]:\nIncompatible transaction nonce for account: d04699e57c4a3846c988f3c15306796f8eae5c1c, Tx Nonce: 0, Account Nonce: 1',
				);
			})
			.it('should throw error.');
	});
});

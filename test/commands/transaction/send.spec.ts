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
import { join } from 'path';
import { IPCChannel, transactionSchema } from 'lisk-sdk';
import { when } from 'jest-when';
import * as appUtils from '../../../src/utils/application';
import {
	createTransferTransaction,
	encodeTransactionFromJSON,
	tokenTransferAssetSchema,
} from '../../utils/transactions';
import SendCommand from '../../../src/commands/transaction/send';

describe('transaction:send command', () => {
	const transactionsAssetSchemas = [
		{
			moduleID: 2,
			assetID: 0,
			schema: tokenTransferAssetSchema,
		},
	];
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
	const pathToAppPIDFiles = join(__dirname, 'fake_test_app');

	let stdout: string[];
	let stderr: string[];

	beforeEach(() => {
		stdout = [];
		stderr = [];
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(IPCChannel.prototype, 'startAndListen').mockResolvedValue();
		jest.spyOn(IPCChannel.prototype, 'invoke');
		when(IPCChannel.prototype.invoke as jest.Mock)
			.calledWith('app:getSchema')
			.mockResolvedValue({
				transactionSchema,
				transactionsAssetSchemas,
			});
	});

	describe('transaction:send', () => {
		it('should throw an error when transaction argument is not provided.', async () => {
			await expect(SendCommand.run([])).rejects.toThrow('Missing 1 required arg:');
		});
	});

	describe('transaction:send <hex encoded transaction> --data-path=<path to a not running app>', () => {
		it('should throw an error when the application for the provided path is not running.', async () => {
			jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(false);
			await expect(
				SendCommand.run([encodedTransaction, `--data-path=${pathToAppPIDFiles}`]),
			).rejects.toThrow(`Application at data path ${pathToAppPIDFiles} is not running.`);
		});
	});

	describe('transaction:send <invalid hex string> --data-path=<path to a not running app>', () => {
		it('should throw error.', async () => {
			await expect(SendCommand.run(['%%%%%%', `--data-path=${pathToAppPIDFiles}`])).rejects.toThrow(
				'The transaction must be provided as a hex encoded string',
			);
		});
	});

	describe('transaction:send <hex encoded transaction> --data-path=<path to a running app>', () => {
		it('should return the id of the sent transaction', async () => {
			when(IPCChannel.prototype.invoke as jest.Mock)
				.calledWith('app:postTransaction', { transaction: encodedTransaction })
				.mockResolvedValue({ transactionId });
			await SendCommand.run([encodedTransaction, `--data-path=${pathToAppPIDFiles}`]);
			expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:postTransaction', {
				transaction: encodedTransaction,
			});
			expect(stdout[0]).toContain(
				`Transaction with id: '${transactionId as string}' received by node`,
			);
		});
	});

	describe('transaction:send <hex encoded invalid transaction> --data-path=<path to a not running app>', () => {
		it('should throw error.', async () => {
			when(IPCChannel.prototype.invoke as jest.Mock)
				.calledWith('app:postTransaction', {
					transaction: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
				})
				.mockRejectedValue(
					new Error(
						'Error: Lisk validator found 1 error[s]:\nIncompatible transaction nonce for account: d04699e57c4a3846c988f3c15306796f8eae5c1c, Tx Nonce: 0, Account Nonce: 1',
					),
				);

			await expect(
				SendCommand.run([
					'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
					`--data-path=${pathToAppPIDFiles}`,
				]),
			).rejects.toThrow(
				'Error: Lisk validator found 1 error[s]:\nIncompatible transaction nonce for account: d04699e57c4a3846c988f3c15306796f8eae5c1c, Tx Nonce: 0, Account Nonce: 1',
			);
		});
	});
});

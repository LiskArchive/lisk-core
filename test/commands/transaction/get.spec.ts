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
import { IPCChannel, transactionSchema } from 'lisk-sdk';
import { when } from 'jest-when';
import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import { createTransferTransaction, encodeTransactionFromJSON } from '../../utils/transactions';
import GetCommand from '../../../src/commands/transaction/get';

describe('transaction:get command', () => {
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

	const transactionsAssets = [
		{
			moduleID: 2,
			assetID: 0,
			schema: transferAssetSchema,
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
		transactionsAssets,
	);

	let stdout: string[];
	let stderr: string[];

	beforeEach(() => {
		stdout = [];
		stderr = [];
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(baseIPC.prototype, 'printJSON').mockReturnValue();
		jest.spyOn(IPCChannel.prototype, 'startAndListen').mockResolvedValue();
		jest.spyOn(IPCChannel.prototype, 'invoke');
		when(IPCChannel.prototype.invoke as jest.Mock)
			.calledWith('app:getSchema')
			.mockResolvedValue({
				transaction: transactionSchema,
				transactionsAssets,
			})
			.calledWith('app:getTransactionByID', { id: transactionId })
			.mockResolvedValue(encodedTransaction);
	});

	describe('transaction:get', () => {
		it('should throw an error when no arguments are provided.', async () => {
			await expect(GetCommand.run([])).rejects.toThrow('Missing 1 required arg:');
		});
	});

	describe('transaction:get {transactionId}', () => {
		it('should get transaction for the given id and display as an object', async () => {
			await GetCommand.run([transactionId as string]);
			expect(IPCChannel.prototype.invoke).toHaveBeenCalledTimes(2);
			expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:getSchema');
			expect(IPCChannel.prototype.invoke).toHaveBeenCalledWith('app:getTransactionByID', {
				id: transactionId,
			});
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
				...transferTransaction,
				id: transactionId,
			});
		});
	});
});

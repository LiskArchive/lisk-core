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
import { transactionSchema, apiClient } from 'lisk-sdk';
import * as Config from '@oclif/config';
import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import { createTransferTransaction, encodeTransactionFromJSON } from '../../utils/transactions';
import GetCommand from '../../../src/commands/transaction/get';
import { getConfig } from '../../utils/config';

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
	let config: Config.IConfig;
	let getMock: jest.Mock;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(baseIPC.prototype, 'printJSON').mockReturnValue();
		getMock = jest.fn().mockResolvedValue(encodedTransaction);
		jest.spyOn(apiClient, 'createIPCClient').mockResolvedValue({
			disconnect: jest.fn(),
			schemas: {
				transaction: transactionSchema,
				transactionsAssets,
			},
			transaction: {
				get: getMock,
				toJSON: jest.fn().mockReturnValue({
					...transferTransaction,
					id: transactionId,
				}),
			},
		} as never);
	});

	describe('transaction:get', () => {
		it('should throw an error when no arguments are provided.', async () => {
			await expect(GetCommand.run([], config)).rejects.toThrow('Missing 1 required arg:');
		});
	});

	describe('transaction:get {transactionId}', () => {
		it('should get transaction for the given id and display as an object', async () => {
			await GetCommand.run([transactionId as string], config);
			expect(getMock).toHaveBeenCalledWith(Buffer.from(transactionId as string, 'hex'));
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
			expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
				...transferTransaction,
				id: transactionId,
			});
		});
	});
});

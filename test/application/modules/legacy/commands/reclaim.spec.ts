/*
 * Copyright © 2022 Lisk Foundation
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
 */

import {
	BaseCommand,
	VerifyStatus,
	testing,
	codec,
	Transaction,
	cryptography,
	EventQueuer,
} from 'lisk-sdk';

// TODO: Update the import once this issue is closed: https://github.com/LiskHQ/lisk-sdk/issues/8372
import { PrefixedStateReadWriter } from '../../../../../node_modules/lisk-framework/dist-node/state_machine/prefixed_state_read_writer';

import { COMMAND_RECLAIM } from '../../../../../src/application/modules/legacy/constants';
import { LegacyModule } from '../../../../../src/application/modules/legacy/module';
import { ReclaimLSKCommand } from '../../../../../src/application/modules/legacy/commands/reclaim';
import { reclaimLSKParamsSchema } from '../../../../../src/application/modules/legacy/schemas';
import { getLegacyAddress } from '../../../../../src/application/modules/legacy/utils';
import { LegacyAccountStore } from '../../../../../src/application/modules/legacy/stores/legacyAccount';
import { AccountReclaimedEvent } from '../../../../../src/application/modules/legacy/events/accountReclaimed';

const {
	address: { getAddressFromPublicKey },
} = cryptography;

const chainID = Buffer.from(
	'e48feb88db5b5cf5ad71d93cdcd1d879b6d5ed187a36b0002cc34e0ef9883255',
	'hex',
);

const MODULE_NAME = 'legacy';
const COMMAND_NAME = 'reclaimLSK';
const senderPublicKey = '275ce55f7b42fab1a12f718a14eb886f59631d172e236be46255c33506a64c6c';
const legacyAddress = getLegacyAddress(Buffer.from(senderPublicKey, 'hex'));
const reclaimBalance = BigInt(10000);

const checkEventResult = (
	eventQueue: EventQueuer['eventQueue'],
	EventClass: any,
	moduleName: string,
	expectedResult: any,
	length = 1,
	index = 0,
) => {
	expect(eventQueue.getEvents()).toHaveLength(length);
	expect(eventQueue.getEvents()[index].toObject().name).toEqual(new EventClass(moduleName).name);

	const eventData = codec.decode<Record<string, unknown>>(
		new EventClass(moduleName).schema,
		eventQueue.getEvents()[index].toObject().data,
	);

	expect(eventData).toEqual(expectedResult);
};

const createStoreGetter = stateStore => ({
	getStore: (p1, p2) => stateStore.getStore(p1, p2),
});

const getReclaimTransaction = (transactionParams: any, customSchema?: any): Transaction => {
	const encodedTransactionParams = codec.encode(
		customSchema || reclaimLSKParamsSchema,
		transactionParams,
	);

	const reclaimLskTransaction = new Transaction({
		module: MODULE_NAME,
		command: COMMAND_NAME,
		senderPublicKey: Buffer.from(senderPublicKey, 'hex'),
		nonce: BigInt(0),
		fee: BigInt(1000000000),
		params: encodedTransactionParams,
		signatures: [Buffer.from(senderPublicKey, 'hex')],
	});

	return reclaimLskTransaction;
};

describe('Reclaim command', () => {
	let stateStore: PrefixedStateReadWriter;
	let legacyAccountStore: LegacyAccountStore;

	let reclaimLSKCommand: ReclaimLSKCommand;
	let mint: any;
	const validReclaimLskTransaction = getReclaimTransaction({
		amount: reclaimBalance,
	});

	beforeEach(() => {
		mint = jest.fn();
		const module = new LegacyModule();
		reclaimLSKCommand = new ReclaimLSKCommand(module.stores, module.events);
		reclaimLSKCommand.addDependencies({ mint } as any);

		stateStore = new PrefixedStateReadWriter(new testing.InMemoryPrefixedStateDB());
		legacyAccountStore = module.stores.get(LegacyAccountStore);
	});

	it('should inherit from BaseCommand', () => {
		expect(ReclaimLSKCommand.prototype).toBeInstanceOf(BaseCommand);
	});

	describe('constructor', () => {
		it('should have valid name', () => {
			expect(reclaimLSKCommand.name).toBe(COMMAND_RECLAIM);
		});

		it('should have valid schema', () => {
			expect(reclaimLSKCommand.schema).toEqual(reclaimLSKParamsSchema);
		});
	});

	describe('verify', () => {
		it('should return status when called with valid input', async () => {
			await legacyAccountStore.set(createStoreGetter(stateStore), legacyAddress, {
				balance: reclaimBalance,
			});
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: validReclaimLskTransaction,
					stateStore,
				})
				.createCommandVerifyContext(reclaimLSKParamsSchema);

			await expect(reclaimLSKCommand.verify(context)).resolves.toHaveProperty(
				'status',
				VerifyStatus.OK,
			);
		});

		it('should throw error when user send invalid amount', async () => {
			const invalidAmountReclaimTransaction = getReclaimTransaction({
				amount: reclaimBalance + BigInt(10000),
			});
			await legacyAccountStore.set(createStoreGetter(stateStore), legacyAddress, {
				balance: reclaimBalance,
			});
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidAmountReclaimTransaction,
					stateStore,
				})
				.createCommandVerifyContext(reclaimLSKParamsSchema);

			await expect(reclaimLSKCommand.verify(context)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});

		it('should throw error when user has no entry in the legacy account substore', async () => {
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: validReclaimLskTransaction,
					stateStore,
				})
				.createCommandVerifyContext(reclaimLSKParamsSchema);

			await expect(reclaimLSKCommand.verify(context)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});

		it('should throw error when transaction params does not follow reclaimLSKParamsSchema', async () => {
			const invalidSchema = {
				$id: '/legacy/command/invalidReclaimLSKParams',
				type: 'object',
				required: ['invalidParam'],
				properties: {
					invalidParam: {
						dataType: 'uint64',
						fieldNumber: 1,
					},
				},
			};
			const invalidParamTransaction = getReclaimTransaction(
				{ invalidParam: reclaimBalance },
				invalidSchema,
			);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidParamTransaction,
					stateStore,
				})
				.createCommandVerifyContext(invalidSchema);

			await expect(reclaimLSKCommand.verify(context)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});
	});

	describe('execute', () => {
		it('should add event to eventQueue on valid reclaim transaction', async () => {
			const unlock = jest.fn().mockReturnValue(true);
			const transfer = jest.fn().mockReturnValue(true);

			await legacyAccountStore.set(createStoreGetter(stateStore), legacyAddress, {
				balance: reclaimBalance,
			});

			const context = testing
				.createTransactionContext({
					chainID,
					transaction: validReclaimLskTransaction,
					stateStore,
				})
				.createCommandExecuteContext(reclaimLSKParamsSchema);

			reclaimLSKCommand.addDependencies({
				unlock,
				transfer,
			} as any);

			await reclaimLSKCommand.execute(context);
			expect(unlock).toHaveBeenCalledTimes(1);
			expect(transfer).toHaveBeenCalledTimes(1);

			// Check if the event is in the event queue
			checkEventResult(context.eventQueue, AccountReclaimedEvent, MODULE_NAME, {
				legacyAddress,
				address: getAddressFromPublicKey(Buffer.from(senderPublicKey, 'hex')),
				amount: reclaimBalance,
			});
		});
	});
});

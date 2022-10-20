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

import { BaseCommand, VerifyStatus } from 'lisk-sdk';

import { when } from 'jest-when';

import { COMMAND_RECLAIM } from '../../../../../src/application/modules/legacy/constants';
import { LegacyModule } from '../../../../../src/application/modules/legacy/module';
import { ReclaimLSKCommand } from '../../../../../src/application/modules/legacy/commands/reclaim';
import {
	reclaimLSKParamsSchema,
	legacyAccountResponseSchema,
} from '../../../../../src/application/modules/legacy/schemas';
import { getLegacyAddress } from '../../../../../src/application/modules/legacy/utils';

const getContext = (amount, publicKey, getMethodContext, getStore, eventQueue): any => {
	const params = { amount: BigInt(amount) };
	const senderPublicKey = Buffer.from(publicKey, 'hex');

	return {
		params,
		transaction: {
			senderPublicKey,
		},
		getStore,
		getMethodContext,
		eventQueue,
	} as any;
};

describe('Reclaim command', () => {
	let reclaimLSKCommand: ReclaimLSKCommand;
	let mint: any;
	const senderPublicKey = '275ce55f7b42fab1a12f718a14eb886f59631d172e236be46255c33506a64c6c';
	const legacyAddress = getLegacyAddress(Buffer.from(senderPublicKey, 'hex'));
	const reclaimBalance = BigInt(10000);
	const mockGetWithSchema = jest.fn();
	const mockStoreHas = jest.fn();
	const mockStoreDel = jest.fn();

	const getStore: any = () => ({
		getWithSchema: mockGetWithSchema,
		has: mockStoreHas,
		del: mockStoreDel,
	});

	const eventQueue: any = {
		add: jest.fn(),
	};

	const getMethodContext: any = () => ({
		getStore,
		eventQueue,
	});

	beforeEach(() => {
		mint = jest.fn();
		const module = new LegacyModule();
		reclaimLSKCommand = new ReclaimLSKCommand(module.stores, module.events);
		reclaimLSKCommand.addDependencies({ mint } as any);
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
		it(`should return status Ok`, async () => {
			const commandVerifyContextInput = getContext(
				reclaimBalance,
				senderPublicKey,
				getMethodContext,
				getStore,
				eventQueue,
			);

			when(mockStoreHas).calledWith(legacyAddress).mockReturnValue(true);
			when(mockGetWithSchema)
				.calledWith(legacyAddress, legacyAccountResponseSchema)
				.mockReturnValue({ balance: reclaimBalance });

			await expect(reclaimLSKCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.OK,
			);
		});

		it('should throw error when user send invalid amount', async () => {
			const commandVerifyContextInput = getContext(
				reclaimBalance + BigInt(10000),
				senderPublicKey,
				getMethodContext,
				getStore,
				eventQueue,
			);

			when(mockStoreHas).calledWith(legacyAddress).mockReturnValue(true);
			when(mockGetWithSchema)
				.calledWith(legacyAddress, legacyAccountResponseSchema)
				.mockReturnValue({ balance: reclaimBalance });

			await expect(reclaimLSKCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});

		it('should throw error when user has no entry in the legacy account substore', async () => {
			const commandVerifyContextInput = getContext(
				reclaimBalance,
				senderPublicKey,
				getMethodContext,
				getStore,
				eventQueue,
			);

			when(mockStoreHas).calledWith(legacyAddress).mockReturnValue(false);
			await expect(reclaimLSKCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});

		it('should throw error when transaction params does not follow reclaimLSKParamsSchema', async () => {
			const params = { balance: reclaimBalance };

			const commandVerifyContextInput = {
				params,
				transaction: {
					senderPublicKey: Buffer.from(senderPublicKey, 'hex'),
				},
				getStore,
				getMethodContext,
			} as any;

			await expect(reclaimLSKCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});
	});

	describe('execute', () => {
		it(`should add event to eventQueue on valid reclaim transaction`, async () => {
			const unlock = jest.fn().mockReturnValue(true);
			const transfer = jest.fn().mockReturnValue(true);

			const commandExecuteContextInput = getContext(
				reclaimBalance,
				senderPublicKey,
				getMethodContext,
				getStore,
				eventQueue,
			);

			when(mockStoreHas).calledWith(legacyAddress).mockReturnValue(true);
			when(mockGetWithSchema)
				.calledWith(legacyAddress, legacyAccountResponseSchema)
				.mockReturnValue({ balance: reclaimBalance });
			reclaimLSKCommand.addDependencies({
				unlock,
				transfer,
			} as any);

			await reclaimLSKCommand.execute(commandExecuteContextInput);
			expect(unlock).toHaveBeenCalledTimes(1);
			expect(transfer).toHaveBeenCalledTimes(1);
		});
	});
});

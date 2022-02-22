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

import { BaseCommand, codec, cryptography } from 'lisk-sdk';
import { when } from 'jest-when';

import {
	COMMAND_NAME_RECLAIM,
	COMMAND_ID_RECLAIM,
} from '../../../../../src/application/modules/legacy/constants';
import { ReclaimCommand } from '../../../../../src/application/modules/legacy/commands/reclaim';
import {
	reclaimParamsSchema,
	legacyAccountSchema,
} from '../../../../../src/application/modules/legacy/schemas';

const { getLegacyAddressFromPublicKey } = cryptography;

const getContext = (amount, publicKey, getAPIContext, getStore): any => {
	const mockParams = codec.encode(reclaimParamsSchema, { amount: BigInt(amount) });
	const mockSenderPublicKey = Buffer.from(publicKey, 'hex');

	return {
		transaction: {
			params: mockParams,
			senderPublicKey: mockSenderPublicKey,
		},
		getStore,
		getAPIContext,
	} as any;
};

describe('Reclaim command', () => {
	let reclaimCommand: ReclaimCommand;
	let mint: any;

	beforeEach(() => {
		mint = jest.fn();
		reclaimCommand = new ReclaimCommand(COMMAND_ID_RECLAIM);

		reclaimCommand.addDependencies({ mint } as any);
	});

	it('should inherit from BaseCommand', () => {
		expect(ReclaimCommand.prototype).toBeInstanceOf(BaseCommand);
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(reclaimCommand.id).toBe(COMMAND_ID_RECLAIM);
		});

		it('should have valid name', () => {
			expect(reclaimCommand.name).toBe(COMMAND_NAME_RECLAIM);
		});

		it('should have valid schema', () => {
			expect(reclaimCommand.schema).toEqual(reclaimParamsSchema);
		});
	});

	describe('execute', () => {
		const mockGetWithSchema = jest.fn();
		const mockStoreHas = jest.fn();
		const mockStoreDel = jest.fn();

		const getStore: any = () => ({
			getWithSchema: mockGetWithSchema,
			has: mockStoreHas,
			del: mockStoreDel,
		});

		const getAPIContext: any = () => ({
			getStore,
		});

		it(`should call mint for a valid reclaim transaction`, async () => {
			const senderPublicKey = '275ce55f7b42fab1a12f718a14eb886f59631d172e236be46255c33506a64c6c';
			const legacyAddressfromPublicKey = Buffer.from(
				getLegacyAddressFromPublicKey(Buffer.from(senderPublicKey, 'hex')),
				'hex',
			);

			const commandExecuteContextInput = getContext(
				BigInt(10000),
				senderPublicKey,
				getAPIContext,
				getStore,
			);

			when(mockStoreHas).calledWith(legacyAddressfromPublicKey).mockReturnValue(true);
			when(mockGetWithSchema)
				.calledWith(legacyAddressfromPublicKey, legacyAccountSchema)
				.mockReturnValue({ balance: BigInt(10000) });
			await reclaimCommand.execute(commandExecuteContextInput);
			expect(mint).toHaveBeenCalledTimes(1);
		});

		it('should reject the transaction when user send invalid amount', async () => {
			const senderPublicKey = '275ce55f7b42fab1a12f718a14eb886f59631d172e236be46255c33506a64c6c';
			const legacyAddressfromPublicKey = Buffer.from(
				getLegacyAddressFromPublicKey(Buffer.from(senderPublicKey, 'hex')),
				'hex',
			);

			const commandExecuteContextInput = getContext(
				BigInt(10000),
				senderPublicKey,
				getAPIContext,
				getStore,
			);

			when(mockStoreHas).calledWith(legacyAddressfromPublicKey).mockReturnValue(true);
			when(mockGetWithSchema)
				.calledWith(legacyAddressfromPublicKey, legacyAccountSchema)
				.mockReturnValue({ balance: BigInt(5000) });
			await expect(reclaimCommand.execute(commandExecuteContextInput)).rejects.toThrow();
			expect(mint).toHaveBeenCalledTimes(0);
		});

		it('should reject the transaction when user has no entry in the legacy account substore', async () => {
			const senderPublicKey = '275ce55f7b42fab1a12f718a14eb886f59631d172e236be46255c33506a64c6c';
			const legacyAddressfromPublicKey = Buffer.from(
				getLegacyAddressFromPublicKey(Buffer.from(senderPublicKey, 'hex')),
				'hex',
			);

			const commandExecuteContextInput = getContext(
				BigInt(10000),
				senderPublicKey,
				getAPIContext,
				getStore,
			);

			when(mockStoreHas).calledWith(legacyAddressfromPublicKey).mockReturnValue(false);
			await expect(reclaimCommand.execute(commandExecuteContextInput)).rejects.toThrow();
			expect(mint).toHaveBeenCalledTimes(0);
		});

		it('should reject the transaction when transaction params does not follow reclaimParamsSchema', async () => {
			const senderPublicKey = '275ce55f7b42fab1a12f718a14eb886f59631d172e236be46255c33506a64c6c';

			const commandExecuteContextInput = getContext(
				BigInt(10000),
				senderPublicKey,
				getAPIContext,
				getStore,
			);

			await expect(reclaimCommand.execute(commandExecuteContextInput)).rejects.toThrow();
			expect(mint).toHaveBeenCalledTimes(0);
		});
	});
});

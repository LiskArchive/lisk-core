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

import { BaseCommand, cryptography, VerifyStatus } from 'lisk-sdk';

import {
	COMMAND_ID_REGISTER_KEYS,
	COMMAND_NAME_REGISTER_KEYS,
} from '../../../../../src/application/modules/legacy/constants';

import { RegisterBLSKeyCommand } from '../../../../../src/application/modules/legacy/commands/register_bls_key';
import { registerBLSKeyParamsSchema } from '../../../../../src/application/modules/legacy/schemas';

const { getRandomBytes } = cryptography;

const getContext = (params, publicKey, getAPIContext): any => {
	const senderPublicKey = Buffer.from(publicKey, 'hex');
	return {
		params,
		transaction: {
			senderPublicKey,
		},
		getAPIContext,
	} as any;
};

describe('Register BLS Keys command', () => {
	let registerBLSKeyCommand: RegisterBLSKeyCommand;

	const getStore: any = () => ({
		getWithSchema: jest.fn(),
		has: jest.fn(),
		del: jest.fn(),
	});

	const getAPIContext: any = () => ({
		getStore,
	});

	beforeEach(() => {
		registerBLSKeyCommand = new RegisterBLSKeyCommand(COMMAND_ID_REGISTER_KEYS);
	});

	it('should inherit from BaseCommand', () => {
		expect(RegisterBLSKeyCommand.prototype).toBeInstanceOf(BaseCommand);
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(registerBLSKeyCommand.id).toBe(COMMAND_ID_REGISTER_KEYS);
		});

		it('should have valid name', () => {
			expect(registerBLSKeyCommand.name).toBe(COMMAND_NAME_REGISTER_KEYS);
		});

		it('should have valid schema', () => {
			expect(registerBLSKeyCommand.schema).toEqual(registerBLSKeyParamsSchema);
		});
	});

	describe('verify', () => {
		const publicKey = 'ac8fb4c7318a1ff9e399102f4b87e3d831e734a48013967bfdba978c9313455c';
		const transactionParams = {
			blsKey: getRandomBytes(48),
			proofOfPossession: getRandomBytes(96),
			generatorKey: getRandomBytes(32),
		};

		it(`should return status Ok`, async () => {
			const commandVerifyContextInput = getContext(transactionParams, publicKey, getAPIContext);
			const getValidatorAccount = jest.fn().mockReturnValue({ generatorKey: getRandomBytes(32) });
			registerBLSKeyCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerBLSKeyCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.OK,
			);
		});

		it(`should throw error when validator does not exists`, async () => {
			const commandVerifyContextInput = getContext(transactionParams, publicKey, getAPIContext);
			const getValidatorAccount = jest.fn().mockReturnValue(undefined);
			registerBLSKeyCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerBLSKeyCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});

		it(`should throw error when validator already has a registered BLS keys`, async () => {
			const commandVerifyContextInput = getContext(transactionParams, publicKey, getAPIContext);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: getRandomBytes(48), generatorKey: getRandomBytes(32) });
			registerBLSKeyCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerBLSKeyCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});
	});

	describe('execute', () => {
		const publicKey = 'ac8fb4c7318a1ff9e399102f4b87e3d831e734a48013967bfdba978c9313455c';
		const transactionParams = {
			blsKey: getRandomBytes(48),
			proofOfPossession: getRandomBytes(96),
			generatorKey: getRandomBytes(32),
		};

		it('should setValidatorGeneratorKey', async () => {
			const setValidatorBLSKey = jest.fn().mockReturnValue(true);
			const setValidatorGeneratorKey = jest.fn().mockReturnValue(true);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ generatorKey: Buffer.alloc(32, 255) });
			registerBLSKeyCommand.addDependencies({
				setValidatorBLSKey,
				setValidatorGeneratorKey,
				getValidatorAccount,
			} as any);
			const context = getContext(transactionParams, publicKey, getAPIContext);
			await expect(registerBLSKeyCommand.execute(context)).resolves.toBeUndefined();
			expect(setValidatorGeneratorKey).toHaveBeenCalledTimes(1);
		});

		it('should setValidatorBLSKey', async () => {
			const setValidatorBLSKey = jest.fn().mockReturnValue(true);
			const setValidatorGeneratorKey = jest.fn().mockReturnValue(true);
			const getValidatorAccount = jest.fn().mockReturnValue({ generatorKey: Buffer.alloc(32) });
			registerBLSKeyCommand.addDependencies({
				setValidatorBLSKey,
				getValidatorAccount,
				setValidatorGeneratorKey,
			} as any);
			const context = getContext(transactionParams, publicKey, getAPIContext);
			await expect(registerBLSKeyCommand.execute(context)).resolves.toBeUndefined();
			expect(setValidatorBLSKey).toHaveBeenCalledTimes(1);
		});

		it('should throw error if transaction params does not follow registerBLSKeyParamsSchema', async () => {
			const setValidatorBLSKey = jest.fn();
			const getValidatorAccount = jest.fn().mockReturnValue({ generatorKey: Buffer.alloc(32) });
			registerBLSKeyCommand.addDependencies({ setValidatorBLSKey, getValidatorAccount } as any);
			const invalidParams = {
				blsKey: getRandomBytes(48),
				proofOfPossession: getRandomBytes(64).toString('hex'),
			};
			const context = getContext(invalidParams, publicKey, getAPIContext);
			await expect(registerBLSKeyCommand.execute(context)).rejects.toThrow();
			expect(setValidatorBLSKey).toHaveBeenCalledTimes(0);
		});
	});
});

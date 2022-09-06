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

import { COMMAND_REGISTER_KEYS } from '../../../../../src/application/modules/legacy/constants';
import { LegacyModule } from '../../../../../src/application/modules/legacy/module';

import { RegisterKeysCommand } from '../../../../../src/application/modules/legacy/commands/register_keys';
import { registerKeysParamsSchema } from '../../../../../src/application/modules/legacy/schemas';

const {
	utils: { getRandomBytes },
} = cryptography;

const getContext = (params, publicKey, getAPIContext, eventQueue): any => {
	const senderPublicKey = Buffer.from(publicKey, 'hex');
	return {
		params,
		transaction: {
			senderPublicKey,
		},
		getAPIContext,
		eventQueue,
	} as any;
};

describe('Register keys command', () => {
	let registerKeysCommand: RegisterKeysCommand;

	const getStore: any = () => ({
		getWithSchema: jest.fn(),
		has: jest.fn(),
		del: jest.fn(),
	});

	const eventQueue: any = {
		add: jest.fn(),
	};

	const getAPIContext: any = () => ({
		getStore,
		eventQueue,
	});

	beforeEach(() => {
		const module = new LegacyModule();
		registerKeysCommand = new RegisterKeysCommand(module.stores, module.events);
	});

	it('should inherit from BaseCommand', () => {
		expect(RegisterKeysCommand.prototype).toBeInstanceOf(BaseCommand);
	});

	describe('constructor', () => {
		it('should have valid name', () => {
			expect(registerKeysCommand.name).toBe(COMMAND_REGISTER_KEYS);
		});

		it('should have valid schema', () => {
			expect(registerKeysCommand.schema).toEqual(registerKeysParamsSchema);
		});
	});

	describe('verify', () => {
		const publicKey = 'ac8fb4c7318a1ff9e399102f4b87e3d831e734a48013967bfdba978c9313455c';
		const transactionParams = {
			blsKey: getRandomBytes(48),
			proofOfPossession: getRandomBytes(96),
			generatorKey: getRandomBytes(32),
		};

		it('should return status OK', async () => {
			const commandVerifyContextInput = getContext(
				transactionParams,
				publicKey,
				getAPIContext,
				eventQueue,
			);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.OK,
			);
		});

		it('should throw error when validator does not exists', async () => {
			const commandVerifyContextInput = getContext(
				transactionParams,
				publicKey,
				getAPIContext,
				eventQueue,
			);
			const getValidatorAccount = jest.fn().mockReturnValue(undefined);
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});

		it('should throw error when validator has a no BLS keys', async () => {
			const commandVerifyContextInput = getContext(
				transactionParams,
				publicKey,
				getAPIContext,
				eventQueue,
			);
			const getValidatorAccount = jest.fn().mockReturnValue({ generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});

		it('should throw error when validator has a already registered BLS keys', async () => {
			const commandVerifyContextInput = getContext(
				transactionParams,
				publicKey,
				getAPIContext,
				eventQueue,
			);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: getRandomBytes(48), generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.verify(commandVerifyContextInput)).resolves.toHaveProperty(
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
			registerKeysCommand.addDependencies({
				setValidatorBLSKey,
				setValidatorGeneratorKey,
				getValidatorAccount,
			} as any);
			const context = getContext(transactionParams, publicKey, getAPIContext, eventQueue);
			await expect(registerKeysCommand.execute(context)).resolves.toBeUndefined();
			expect(setValidatorGeneratorKey).toHaveBeenCalledTimes(1);
		});

		it('should setValidatorBLSKey', async () => {
			const setValidatorBLSKey = jest.fn().mockReturnValue(true);
			const setValidatorGeneratorKey = jest.fn().mockReturnValue(true);
			const getValidatorAccount = jest.fn().mockReturnValue({ generatorKey: Buffer.alloc(32) });
			registerKeysCommand.addDependencies({
				setValidatorBLSKey,
				getValidatorAccount,
				setValidatorGeneratorKey,
			} as any);
			const context = getContext(transactionParams, publicKey, getAPIContext, eventQueue);
			await expect(registerKeysCommand.execute(context)).resolves.toBeUndefined();
			expect(setValidatorBLSKey).toHaveBeenCalledTimes(1);
		});

		it('should throw error if transaction params does not follow registerBLSKeyParamsSchema', async () => {
			const setValidatorBLSKey = jest.fn();
			const getValidatorAccount = jest.fn().mockReturnValue({ generatorKey: Buffer.alloc(32) });
			registerKeysCommand.addDependencies({ setValidatorBLSKey, getValidatorAccount } as any);
			const invalidParams = {
				blsKey: getRandomBytes(48),
				proofOfPossession: getRandomBytes(64).toString('hex'),
			};
			const context = getContext(invalidParams, publicKey, getAPIContext, eventQueue);
			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
			expect(setValidatorBLSKey).toHaveBeenCalledTimes(0);
		});

		it('should throw error when transaction params has no BLS key', async () => {
			const txParams = {
				proofOfPossession: getRandomBytes(96),
				generatorKey: getRandomBytes(32),
			};
			const context = getContext(txParams, publicKey, getAPIContext, eventQueue);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has invalid BLS key', async () => {
			const txParams = {
				blsKey: getRandomBytes(40),
				proofOfPossession: getRandomBytes(96),
				generatorKey: getRandomBytes(32),
			};
			const context = getContext(txParams, publicKey, getAPIContext, eventQueue);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has no proofOfPossession key', async () => {
			const txParams = {
				blsKey: getRandomBytes(48),
				generatorKey: getRandomBytes(32),
			};
			const context = getContext(txParams, publicKey, getAPIContext, eventQueue);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has invalid proofOfPossession key', async () => {
			const txParams = {
				blsKey: getRandomBytes(40),
				proofOfPossession: getRandomBytes(48),
				generatorKey: getRandomBytes(32),
			};
			const context = getContext(txParams, publicKey, getAPIContext, eventQueue);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has no generatorKey key', async () => {
			const txParams = {
				blsKey: getRandomBytes(48),
				proofOfPossession: getRandomBytes(48),
			};
			const context = getContext(txParams, publicKey, getAPIContext, eventQueue);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has invalid generatorKey key', async () => {
			const txParams = {
				blsKey: getRandomBytes(40),
				proofOfPossession: getRandomBytes(48),
				generatorKey: getRandomBytes(48),
			};
			const context = getContext(txParams, publicKey, getAPIContext, eventQueue);
			const getValidatorAccount = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			registerKeysCommand.addDependencies({ getValidatorAccount } as any);
			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});
	});
});

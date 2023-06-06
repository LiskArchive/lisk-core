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
	cryptography,
	VerifyStatus,
	testing,
	Transaction,
	codec,
	EventQueuer,
} from 'lisk-sdk';

// TODO: Update the import once this issue is closed: https://github.com/LiskHQ/lisk-sdk/issues/8372
import { PrefixedStateReadWriter } from '../../../../../node_modules/lisk-framework/dist-node/state_machine/prefixed_state_read_writer';

import { COMMAND_REGISTER_KEYS } from '../../../../../src/application/modules/legacy/constants';
import { LegacyModule } from '../../../../../src/application/modules/legacy/module';

import { RegisterKeysCommand } from '../../../../../src/application/modules/legacy/commands/register_keys';
import { registerKeysParamsSchema } from '../../../../../src/application/modules/legacy/schemas';
import { KeysRegisteredEvent } from '../../../../../src/application/modules/legacy/events/keysRegistered';

const {
	address: { getAddressFromPublicKey },
	utils: { getRandomBytes },
} = cryptography;

const MODULE_NAME = 'legacy';
const COMMAND_NAME = 'registerKeys';
const senderPublicKey = 'ac8fb4c7318a1ff9e399102f4b87e3d831e734a48013967bfdba978c9313455c';
const validatorAddress = getAddressFromPublicKey(Buffer.from(senderPublicKey, 'hex'));

const getRegisterKeysTransaction = (transactionParams: any, customSchema?: any): Transaction => {
	const encodedTransactionParams = codec.encode(
		customSchema || registerKeysParamsSchema,
		transactionParams,
	);

	const registerKeysTransaction = new Transaction({
		module: MODULE_NAME,
		command: COMMAND_NAME,
		senderPublicKey: Buffer.from(senderPublicKey, 'hex'),
		nonce: BigInt(0),
		fee: BigInt(1000000000),
		params: encodedTransactionParams,
		signatures: [Buffer.from(senderPublicKey, 'hex')],
	});

	return registerKeysTransaction;
};

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

const chainID = Buffer.from(
	'e48feb88db5b5cf5ad71d93cdcd1d879b6d5ed187a36b0002cc34e0ef9883255',
	'hex',
);

describe('Register keys command', () => {
	let registerKeysCommand: RegisterKeysCommand;

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
		const transactionParams = {
			blsKey: getRandomBytes(48),
			proofOfPossession: getRandomBytes(96),
			generatorKey: getRandomBytes(32),
		};

		it('should return status OK when called with valid params', async () => {
			// Mock dependencies
			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies({ getValidatorKeys } as any, { unbanValidator } as any);

			// Create context
			const stateStore = new PrefixedStateReadWriter(new testing.InMemoryPrefixedStateDB());
			const validRegisterKeysTransaction = getRegisterKeysTransaction(transactionParams);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: validRegisterKeysTransaction,
					stateStore,
				})
				.createCommandVerifyContext(registerKeysParamsSchema);

			await expect(registerKeysCommand.verify(context)).resolves.toHaveProperty(
				'status',
				VerifyStatus.OK,
			);
		});

		it('should return status FAIL when validator has an already registered BLS keys', async () => {
			const validRegisterKeysTransaction = getRegisterKeysTransaction(transactionParams);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: validRegisterKeysTransaction,
				})
				.createCommandVerifyContext(registerKeysParamsSchema);

			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ blsKey: getRandomBytes(48), generatorKey: getRandomBytes(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies({ getValidatorKeys } as any, { unbanValidator } as any);

			await expect(registerKeysCommand.verify(context)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});

		it('should throw error if transaction params does not follow registerBLSKeyParamsSchema', async () => {
			// Mock dependencies
			const setValidatorBLSKey = jest.fn();
			const getValidatorKeys = jest.fn().mockReturnValue({ generatorKey: Buffer.alloc(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies(
				{ setValidatorBLSKey, getValidatorKeys } as any,
				{ unbanValidator } as any,
			);

			// Create context
			const invalidParams = {
				blsKey: getRandomBytes(48),
				proofOfPossession: getRandomBytes(64).toString('hex'),
			};
			const invalidRegisterKeysParamsSchema = {
				$id: '/legacy/command/invalidRegisterKeysParams',
				type: 'object',
				required: ['blsKey', 'proofOfPossession'],
				properties: {
					blsKey: {
						dataType: 'bytes',
						fieldNumber: 1,
					},
					proofOfPossession: {
						dataType: 'string',
						fieldNumber: 2,
					},
				},
			};
			const invalidRegisterKeysTransaction = getRegisterKeysTransaction(
				invalidParams,
				invalidRegisterKeysParamsSchema,
			);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidRegisterKeysTransaction,
				})
				.createCommandVerifyContext(invalidRegisterKeysParamsSchema);

			await expect(registerKeysCommand.verify(context)).resolves.toHaveProperty(
				'status',
				VerifyStatus.FAIL,
			);
		});
	});

	describe('execute', () => {
		const transactionParams = {
			blsKey: getRandomBytes(48),
			proofOfPossession: getRandomBytes(96),
			generatorKey: getRandomBytes(32),
		};

		it('should call setValidatorGeneratorKey, setValidatorBLSKey and unban validator when params are valid', async () => {
			// Create mocked dependencies
			const setValidatorBLSKey = jest.fn().mockReturnValue(true);
			const setValidatorGeneratorKey = jest.fn().mockReturnValue(true);
			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ generatorKey: transactionParams.generatorKey });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies(
				{
					setValidatorBLSKey,
					getValidatorKeys,
					setValidatorGeneratorKey,
				} as any,
				{ unbanValidator } as any,
			);

			// Create context
			const validRegisterKeysTransaction = getRegisterKeysTransaction(transactionParams);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: validRegisterKeysTransaction,
				})
				.createCommandExecuteContext(registerKeysParamsSchema);

			await expect(registerKeysCommand.execute(context)).resolves.toBeUndefined();
			expect(setValidatorGeneratorKey).toHaveBeenCalledTimes(1);
			expect(setValidatorBLSKey).toHaveBeenCalledTimes(1);
			expect(unbanValidator).toHaveBeenCalledTimes(1);

			// Check if the event is in the event queue
			checkEventResult(context.eventQueue, KeysRegisteredEvent, MODULE_NAME, {
				address: validatorAddress,
				generatorKey: transactionParams.generatorKey,
				blsKey: transactionParams.blsKey,
			});
		});

		it('should throw error when setValidatorBLSKey fails', async () => {
			// Create mocked dependencies
			const setValidatorBLSKey = jest.fn(() => {
				throw new Error('Custom Error');
			});
			const setValidatorGeneratorKey = jest.fn().mockReturnValue(true);
			const getValidatorKeys = jest.fn().mockReturnValue({ generatorKey: Buffer.alloc(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies(
				{
					setValidatorBLSKey,
					getValidatorKeys,
					setValidatorGeneratorKey,
				} as any,
				{ unbanValidator } as any,
			);

			// Create context
			const validRegisterKeysTransaction = getRegisterKeysTransaction(transactionParams);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: validRegisterKeysTransaction,
				})
				.createCommandExecuteContext(registerKeysParamsSchema);

			await expect(registerKeysCommand.execute(context)).rejects.toThrow(new Error('Custom Error'));
			expect(setValidatorGeneratorKey).toHaveBeenCalledTimes(1);
			expect(setValidatorBLSKey).toHaveBeenCalledTimes(1);
			expect(unbanValidator).toHaveBeenCalledTimes(0);
		});

		it('should throw error when Public key of the transaction sender does not correspond to a registered validator', async () => {
			// Create mocked dependencies
			const setValidatorBLSKey = jest.fn().mockReturnValue(true);
			const setValidatorGeneratorKey = jest.fn(() => {
				throw new Error(
					'This address is not registered as validator. Only validators can register a generator key.',
				);
			});
			const getValidatorKeys = jest.fn().mockReturnValue({ generatorKey: Buffer.alloc(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies(
				{
					setValidatorBLSKey,
					getValidatorKeys,
					setValidatorGeneratorKey,
				} as any,
				{ unbanValidator } as any,
			);

			// Create context
			const validRegisterKeysTransaction = getRegisterKeysTransaction(transactionParams);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: validRegisterKeysTransaction,
				})
				.createCommandExecuteContext(registerKeysParamsSchema);

			await expect(registerKeysCommand.execute(context)).rejects.toThrow(
				new Error(
					'This address is not registered as validator. Only validators can register a generator key.',
				),
			);
			expect(setValidatorGeneratorKey).toHaveBeenCalledTimes(1);
			expect(setValidatorBLSKey).toHaveBeenCalledTimes(0);
			expect(unbanValidator).toHaveBeenCalledTimes(0);
		});

		it('should throw error when transaction params has no BLS key', async () => {
			// Mock dependencies
			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies({ getValidatorKeys } as any, { unbanValidator } as any);

			// Create context
			const invalidParams = {
				proofOfPossession: getRandomBytes(96),
				generatorKey: getRandomBytes(32),
			};
			const noBLSKeyRegisterKeysParamsSchema = {
				$id: '/legacy/command/noBLSKeyRegisterKeysParams',
				type: 'object',
				required: ['generatorKey', 'proofOfPossession'],
				properties: {
					proofOfPossession: {
						dataType: 'bytes',
						fieldNumber: 1,
					},
					generatorKey: {
						dataType: 'bytes',
						fieldNumber: 2,
					},
				},
			};
			const invalidRegisterKeysTransaction = getRegisterKeysTransaction(
				invalidParams,
				noBLSKeyRegisterKeysParamsSchema,
			);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidRegisterKeysTransaction,
				})
				.createCommandExecuteContext(noBLSKeyRegisterKeysParamsSchema);

			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has invalid BLS key', async () => {
			// Mock dependencies
			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies({ getValidatorKeys } as any, { unbanValidator } as any);

			// Create context
			const invalidParams = {
				blsKey: getRandomBytes(40),
				proofOfPossession: getRandomBytes(96),
				generatorKey: getRandomBytes(32),
			};
			const invalidBLSKeyParamsSchema = {
				...registerKeysParamsSchema,
				$id: '/legacy/command/invalidBLSKeyRegisterKeysParams',
				properties: {
					...registerKeysParamsSchema.properties,
					blsKey: {
						dataType: 'bytes',
						fieldNumber: 1,
					},
				},
			};
			const invalidRegisterKeysTransaction = getRegisterKeysTransaction(
				invalidParams,
				invalidBLSKeyParamsSchema,
			);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidRegisterKeysTransaction,
				})
				.createCommandExecuteContext(invalidBLSKeyParamsSchema);

			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has no proofOfPossession key', async () => {
			// Mock dependencies
			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies({ getValidatorKeys } as any, { unbanValidator } as any);

			// Create context
			const invalidParams = {
				blsKey: getRandomBytes(48),
				generatorKey: getRandomBytes(32),
			};
			const noProofOfPossessionParamsSchema = {
				...registerKeysParamsSchema,
				$id: '/legacy/command/noProofOfPossessionKeyRegisterKeysParams',
				required: ['blsKey', 'generatorKey'],
				properties: {
					blsKey: {
						dataType: 'bytes',
						fieldNumber: 1,
					},
					generatorKey: {
						dataType: 'bytes',
						fieldNumber: 2,
					},
				},
			};
			const invalidRegisterKeysTransaction = getRegisterKeysTransaction(
				invalidParams,
				noProofOfPossessionParamsSchema,
			);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidRegisterKeysTransaction,
				})
				.createCommandExecuteContext(noProofOfPossessionParamsSchema);

			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has invalid proofOfPossession key', async () => {
			// Mock dependencies
			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies({ getValidatorKeys } as any, { unbanValidator } as any);

			// Create context
			const invalidParams = {
				blsKey: getRandomBytes(48),
				proofOfPossession: getRandomBytes(48),
				generatorKey: getRandomBytes(32),
			};
			const invalidProofOfPossessionParamsSchema = {
				...registerKeysParamsSchema,
				$id: '/legacy/command/invalidProofOfPossessionKeyRegisterKeysParams',
				properties: {
					...registerKeysParamsSchema.properties,
					proofOfPossession: {
						dataType: 'bytes',
						fieldNumber: 2,
					},
				},
			};
			const invalidRegisterKeysTransaction = getRegisterKeysTransaction(
				invalidParams,
				invalidProofOfPossessionParamsSchema,
			);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidRegisterKeysTransaction,
				})
				.createCommandExecuteContext(invalidProofOfPossessionParamsSchema);

			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has no generatorKey key', async () => {
			// Mock dependencies
			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies({ getValidatorKeys } as any, { unbanValidator } as any);

			// Create context
			const invalidParams = {
				blsKey: getRandomBytes(48),
				proofOfPossession: getRandomBytes(48),
			};
			const noGeneratorKeyParamsSchema = {
				...registerKeysParamsSchema,
				$id: '/legacy/command/noGeneratorKeyRegisterKeysParams',
				required: ['blsKey', 'proofOfPossession'],
				properties: {
					blsKey: {
						dataType: 'bytes',
						fieldNumber: 1,
					},
					proofOfPossession: {
						dataType: 'bytes',
						fieldNumber: 2,
					},
				},
			};
			const invalidRegisterKeysTransaction = getRegisterKeysTransaction(
				invalidParams,
				noGeneratorKeyParamsSchema,
			);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidRegisterKeysTransaction,
				})
				.createCommandExecuteContext(noGeneratorKeyParamsSchema);

			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});

		it('should throw error when transaction params has invalid generatorKey key', async () => {
			// Mock dependencies
			const getValidatorKeys = jest
				.fn()
				.mockReturnValue({ blsKey: Buffer.alloc(48), generatorKey: getRandomBytes(32) });
			const unbanValidator = jest.fn();
			registerKeysCommand.addDependencies({ getValidatorKeys } as any, { unbanValidator } as any);

			// Create context
			const invalidParams = {
				blsKey: getRandomBytes(40),
				proofOfPossession: getRandomBytes(48),
				generatorKey: getRandomBytes(48),
			};
			const invalidGeneratorKeyParamsSchema = {
				...registerKeysParamsSchema,
				$id: '/legacy/command/invalidProofOfPossessionKeyRegisterKeysParams',
				properties: {
					...registerKeysParamsSchema.properties,
					generatorKey: {
						dataType: 'bytes',
						fieldNumber: 3,
					},
				},
			};
			const invalidRegisterKeysTransaction = getRegisterKeysTransaction(
				invalidParams,
				invalidGeneratorKeyParamsSchema,
			);
			const context = testing
				.createTransactionContext({
					chainID,
					transaction: invalidRegisterKeysTransaction,
				})
				.createCommandExecuteContext(invalidGeneratorKeyParamsSchema);

			await expect(registerKeysCommand.execute(context)).rejects.toThrow();
		});
	});
});

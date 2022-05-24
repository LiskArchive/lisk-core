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
	ValidatorsAPI,
	CommandExecuteContext,
	CommandVerifyContext,
	VerificationResult,
	VerifyStatus,
	validator as liskValidator,
	cryptography,
} from 'lisk-sdk';
import {
	COMMAND_ID_REGISTER_KEYS,
	COMMAND_NAME_REGISTER_KEYS,
	INVALID_BLS_KEY,
	INVALID_ED25519_KEY,
} from '../constants';
import { registerBLSKeyParamsSchema } from '../schemas';
import { registerBLSKeyData } from '../types';

const { getAddressFromPublicKey } = cryptography;
const { LiskValidationError, validator } = liskValidator;

export class RegisterBLSKeyCommand extends BaseCommand {
	public id = COMMAND_ID_REGISTER_KEYS;
	public name = COMMAND_NAME_REGISTER_KEYS;
	public schema = registerBLSKeyParamsSchema;
	public invalidBlsKey = INVALID_BLS_KEY;
	public invalidEd25519Key = INVALID_ED25519_KEY;
	private _validatorsAPI!: ValidatorsAPI;

	public addDependencies(validatorsAPI: ValidatorsAPI) {
		this._validatorsAPI = validatorsAPI;
	}

	public async verify(ctx: CommandVerifyContext): Promise<VerificationResult> {
		const params = (ctx.params as unknown) as registerBLSKeyData;
		const validatorAddress = getAddressFromPublicKey(ctx.transaction.senderPublicKey);
		const validatorAccount = await this._validatorsAPI.getValidatorAccount(
			ctx.getAPIContext(),
			validatorAddress,
		);
		if (!validatorAccount) {
			return {
				status: VerifyStatus.FAIL,
				error: new Error('Public key does not correspond to a registered validator.'),
			};
		}

		if (
			Buffer.compare(validatorAccount.generatorKey, this.invalidEd25519Key) !== 0 &&
			validatorAccount.generatorKey === params.generatorKey
		) {
			return {
				status: VerifyStatus.FAIL,
				error: new Error('Input generator key does not equal the one set in the store.'),
			};
		}

		if (
			validatorAccount.blsKey &&
			Buffer.compare(validatorAccount.blsKey, this.invalidBlsKey) !== 0
		) {
			return {
				status: VerifyStatus.FAIL,
				error: new Error('Validator already has a registered BLS key.'),
			};
		}

		return { status: VerifyStatus.OK };
	}

	public async execute(ctx: CommandExecuteContext): Promise<void> {
		const params = (ctx.params as unknown) as registerBLSKeyData;
		const validatorAddress = getAddressFromPublicKey(ctx.transaction.senderPublicKey);
		const validatorAccount = await this._validatorsAPI.getValidatorAccount(
			ctx.getAPIContext(),
			validatorAddress,
		);
		const reqErrors = validator.validate(registerBLSKeyParamsSchema, params);
		if (reqErrors.length) {
			throw new LiskValidationError(reqErrors);
		}

		if (Buffer.compare(validatorAccount.generatorKey, this.invalidEd25519Key) === 0) {
			await this._validatorsAPI.setValidatorGeneratorKey(
				ctx.getAPIContext(),
				validatorAddress,
				params.generatorKey,
			);
		}

		const isValidatorBLSKeySet = await this._validatorsAPI.setValidatorBLSKey(
			ctx.getAPIContext(),
			validatorAddress,
			params.proofOfPossession,
			params.blsKey,
		);

		if (!isValidatorBLSKeySet) {
			throw new Error('Failed to set validator BLS keys');
		}
	}
}

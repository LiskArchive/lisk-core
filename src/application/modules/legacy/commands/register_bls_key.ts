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
	// codec,
} from 'lisk-sdk';
import {
	COMMAND_ID_REGISTER_KEYS,
	COMMAND_NAME_REGISTER_KEYS,
	INVALID_BLS_KEY,
	TYPE_ID_KEYS_REGISTERED,
	MODULE_ID_LEGACY,
} from '../constants';
import {
	registerBLSKeyParamsSchema,
	// keysRegisteredEventDataSchema,
} from '../schemas';
import { registerBLSKeyData } from '../types';

const { getAddressFromPublicKey } = cryptography;
const { LiskValidationError, validator } = liskValidator;

export class RegisterBLSKeyCommand extends BaseCommand {
	public id = COMMAND_ID_REGISTER_KEYS;
	public name = COMMAND_NAME_REGISTER_KEYS;
	public schema = registerBLSKeyParamsSchema;
	public moduleID = MODULE_ID_LEGACY;
	public invalidBlsKey = INVALID_BLS_KEY;
	public typeID = TYPE_ID_KEYS_REGISTERED;
	private _validatorsAPI!: ValidatorsAPI;

	public addDependencies(validatorsAPI: ValidatorsAPI) {
		this._validatorsAPI = validatorsAPI;
	}

	public async verify(ctx: CommandVerifyContext): Promise<VerificationResult> {
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
		const reqErrors = validator.validate(registerBLSKeyParamsSchema, params);
		if (reqErrors.length) {
			throw new LiskValidationError(reqErrors);
		}

		const validatorAddress = getAddressFromPublicKey(ctx.transaction.senderPublicKey);

		await this._validatorsAPI.setValidatorGeneratorKey(
			ctx.getAPIContext(),
			validatorAddress,
			params.generatorKey,
		);

		await this._validatorsAPI.setValidatorBLSKey(
			ctx.getAPIContext(),
			validatorAddress,
			params.proofOfPossession,
			params.blsKey,
		);

		// TODO: Enable with the issue https://github.com/LiskHQ/lisk-core/issues/632
		// const topics = [
		// 	validatorAddress,
		// 	params.generatorKey,
		// 	params.blsKey
		// ];

		// const data = codec.encode(keysRegisteredEventDataSchema, {
		// 	address: validatorAddress,
		// 	generatorKey: params.generatorKey,
		// 	blsKey: params.blsKey
		// })

		// ctx.eventQueue.add(this.moduleID, this.typeID, data, topics)
	}
}

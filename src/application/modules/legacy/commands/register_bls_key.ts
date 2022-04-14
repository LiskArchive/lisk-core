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
	validator as liskValidator,
	cryptography,
} from 'lisk-sdk';
import { COMMAND_ID_REGISTER_BLS_KEY, COMMAND_NAME_REGISTER_BLS_KEY } from '../constants';
import { registerBLSKeyParamsSchema } from '../schemas';
import { registerBLSKeyData } from '../types';

const { getAddressFromPublicKey } = cryptography;
const { LiskValidationError, validator } = liskValidator;

export class RegisterBLSKeyCommand extends BaseCommand {
	public id = COMMAND_ID_REGISTER_BLS_KEY;
	public name = COMMAND_NAME_REGISTER_BLS_KEY;
	public schema = registerBLSKeyParamsSchema;
	private _validatorsAPI!: ValidatorsAPI;

	public addDependencies(validatorsAPI: ValidatorsAPI) {
		this._validatorsAPI = validatorsAPI;
	}

	public async execute(ctx: CommandExecuteContext): Promise<void> {
		const params = (ctx.params as unknown) as registerBLSKeyData;
		const reqErrors = validator.validate(registerBLSKeyParamsSchema, params);
		if (reqErrors.length) {
			throw new LiskValidationError(reqErrors);
		}

		const isValidatorBLSKeySet = await this._validatorsAPI.setValidatorBLSKey(
			ctx.getAPIContext(),
			getAddressFromPublicKey(ctx.transaction.senderPublicKey),
			params.proofOfPossession,
			params.blsKey,
		);

		if (!isValidatorBLSKeySet) {
			throw new Error('Failed to set validator BLS keys');
		}
	}
}

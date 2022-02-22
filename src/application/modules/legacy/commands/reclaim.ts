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
	CommandExecuteContext,
	validator as liskValidator,
	cryptography,
	TokenAPI,
	codec,
} from 'lisk-sdk';

import {
	COMMAND_ID_RECLAIM,
	COMMAND_NAME_RECLAIM,
	STORE_PREFIX_LEGACY_ACCOUNTS,
	CHAIN_ID,
	LOCAL_ID,
} from '../constants';

import { reclaimParamsSchema, legacyAccountSchema } from '../schemas';
import { ReclaimParamData, LegacyStoreData } from '../types';

const { LiskValidationError, validator } = liskValidator;
const { getLegacyAddressFromPublicKey, getAddressFromPublicKey } = cryptography;

export class ReclaimCommand extends BaseCommand {
	public name = COMMAND_NAME_RECLAIM;
	public id = COMMAND_ID_RECLAIM;
	public schema = reclaimParamsSchema;
	private _tokenAPI!: TokenAPI;

	public addDependencies(tokenAPI: TokenAPI) {
		this._tokenAPI = tokenAPI;
	}

	public async execute(ctx: CommandExecuteContext): Promise<void> {
		const transactionParams = codec.decode<ReclaimParamData>(
			reclaimParamsSchema,
			ctx.transaction.params,
		);

		const reqErrors = validator.validate(reclaimParamsSchema, transactionParams);
		if (reqErrors.length) {
			throw new LiskValidationError(reqErrors);
		}

		const legacyAddress = Buffer.from(
			getLegacyAddressFromPublicKey(ctx.transaction.senderPublicKey),
			'hex',
		);
		const legacyStore = ctx.getStore(this.moduleID, STORE_PREFIX_LEGACY_ACCOUNTS);

		const isLegacyAddressExists = await legacyStore.has(legacyAddress);
		if (!isLegacyAddressExists)
			throw new Error(
				`Legacy address corresponding to sender publickey ${ctx.transaction.senderPublicKey.toString(
					'hex',
				)} was not found`,
			);

		const legacyAccount = await legacyStore.getWithSchema<LegacyStoreData>(
			legacyAddress,
			legacyAccountSchema,
		);

		if (legacyAccount.balance !== transactionParams.amount)
			throw new Error(
				`Invalid amount:${transactionParams.amount} claimed by the sender: ${legacyAddress.toString(
					'hex',
				)}`,
			);

		await legacyStore.del(legacyAddress);

		await this._tokenAPI.mint(
			ctx.getAPIContext(),
			getAddressFromPublicKey(ctx.transaction.senderPublicKey),
			{ chainID: CHAIN_ID, localID: LOCAL_ID },
			transactionParams.amount,
		);
	}
}

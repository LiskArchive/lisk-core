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
	BaseEndpoint,
	JSONObject,
	ModuleEndpointContext,
	chain,
	cryptography,
	validator as liskValidator,
} from 'lisk-sdk';

import { STORE_PREFIX_LEGACY_ACCOUNTS } from './constants';
import { getLegacyAccountRequestSchema, legacyAccountSchema } from './schemas';
import { LegacyStoreData } from './types';

const { LiskValidationError, validator } = liskValidator;
const { getLegacyAddressFromPublicKey } = cryptography;
const { NotFoundError } = chain;

export class LegacyEndpoint extends BaseEndpoint {
	public async getLegacyAccount(
		ctx: ModuleEndpointContext,
	): Promise<JSONObject<LegacyStoreData> | undefined> {
		const reqErrors = validator.validate(getLegacyAccountRequestSchema, ctx.params);
		if (reqErrors.length) {
			throw new LiskValidationError(reqErrors);
		}

		const publicKey = Buffer.from(ctx.params.publicKey as string, 'hex');
		const legacyAddress = getLegacyAddressFromPublicKey(publicKey);
		const legacyStore = ctx.getStore(this.moduleID, STORE_PREFIX_LEGACY_ACCOUNTS);

		try {
			const isLegacyAddressExists = await legacyStore.has(publicKey);
			if (!isLegacyAddressExists) throw new NotFoundError(publicKey);

			const legacyAccount = await legacyStore.getWithSchema<LegacyStoreData>(
				publicKey,
				legacyAccountSchema,
			);
			return {
				legacyAddress,
				balance: legacyAccount.balance.toString(),
			};
		} catch (err) {
			if (err instanceof NotFoundError) {
				return undefined;
			}
			throw err;
		}
	}
}

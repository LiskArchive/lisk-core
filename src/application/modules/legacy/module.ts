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
	BaseModule,
	codec,
	GenesisBlockExecuteContext,
	validator as liskValidator,
} from 'lisk-sdk';

import { LegacyAPI } from './api';
import {
	MODULE_NAME_LEGACY,
	MODULE_ID_LEGACY,
	STORE_PREFIX_LEGACY_ACCOUNTS,
	LEGACY_ACCOUNT_LENGTH,
	LEGACY_ACC_MAX_TOTAL_BAL_NON_INC,
} from './constants';
import { LegacyEndpoint } from './endpoint';
import { genesisLegacyStoreSchema, legacyAccountSchema } from './schemas';
import { genesisLegacyStoreData } from './types';

const { LiskValidationError, validator } = liskValidator;
export class LegacyModule extends BaseModule {
	public name = MODULE_NAME_LEGACY;
	public id = MODULE_ID_LEGACY;
	public endpoint = new LegacyEndpoint(this.id);
	public api = new LegacyAPI(this.id);

	public async afterGenesisBlockExecute(ctx: GenesisBlockExecuteContext): Promise<void> {
		const legacyAssetsBuffer = ctx.assets.getAsset(this.id);

		const { accounts } = codec.decode<genesisLegacyStoreData>(
			genesisLegacyStoreSchema,
			legacyAssetsBuffer as Buffer,
		);

		const reqErrors = validator.validate(genesisLegacyStoreSchema, { accounts });
		if (reqErrors.length) {
			throw new LiskValidationError(reqErrors);
		}

		const uniqueLegacyAccounts = new Set();
		let totalBalance = BigInt('0');

		for (const account of accounts) {
			if (account.address.length !== LEGACY_ACCOUNT_LENGTH)
				throw new Error(
					`legacy address length is invalid, expected ${LEGACY_ACCOUNT_LENGTH}, actual ${account.address.length}`,
				);

			uniqueLegacyAccounts.add(account.address.toString('hex'));
			totalBalance += account.balance;
		}

		if (uniqueLegacyAccounts.size !== accounts.length) {
			throw new Error('Legacy address entries are not pair-wise distinct');
		}

		if (totalBalance >= LEGACY_ACC_MAX_TOTAL_BAL_NON_INC)
			throw new Error('Total balance for all legacy accounts cannot exceed 2^64');

		const legacyStore = ctx.getStore(this.id, STORE_PREFIX_LEGACY_ACCOUNTS);

		await Promise.all(
			accounts.map(async account =>
				legacyStore.setWithSchema(
					account.address,
					{ balance: account.balance },
					legacyAccountSchema,
				),
			),
		);
	}
}

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
import { MODULE_NAME_LEGACY, MODULE_ID_LEGACY, STORE_PREFIX_LEGACY_ACCOUNTS } from './constants';
import { LegacyEndpoint } from './endpoint';
import { genesisLegacyStoreSchema, legacyAccountSchema } from './schemas';

const { LiskValidationError, validator } = liskValidator;
export class LegacyModule extends BaseModule {
	public name = MODULE_NAME_LEGACY;
	public id = MODULE_ID_LEGACY;
	public endpoint = new LegacyEndpoint(this.id);
	public api = new LegacyAPI(this.id);

	// eslint-disable-next-line class-methods-use-this
	public async afterGenesisBlockExecute({
		assets,
		getStore,
	}: GenesisBlockExecuteContext): Promise<void> {
		const { data } = assets.filter(asset => asset.moduleID === this.id);
		try {
			const { accounts: genesisBlockAssetObject } = codec.decode(
				genesisLegacyStoreSchema,
				Buffer.from(data as string, 'hex'),
			);

			for (const account of genesisBlockAssetObject) {
				if (account.address.length !== 8) throw new Error('Invalid legacy account address');
				const reqErrors = validator.validate(genesisLegacyStoreSchema, account);
				if (reqErrors.length) {
					throw new LiskValidationError(reqErrors);
				}
			}

			const isDistinctPair = new Set(genesisBlockAssetObject.map(item => item.address));
			if (isDistinctPair.size !== genesisBlockAssetObject.length)
				throw new Error('List of legacy accounts is invalid');

			const totalBalance = genesisBlockAssetObject.reduce(
				(acc, account) => acc + BigInt(account.balance),
				BigInt('0'),
			);
			if (totalBalance >= 2 ** 64) throw new Error('Invalid balance');

			const legacyStore = getStore(this.id, STORE_PREFIX_LEGACY_ACCOUNTS);

			await Promise.all(
				genesisBlockAssetObject.map(acc =>
					legacyStore.setWithSchema(acc.address, acc.balance, legacyAccountSchema),
				),
			);
		} catch (error) {
			throw error;
		}
	}
}

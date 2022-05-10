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
	TokenAPI,
	ValidatorsAPI,
	codec,
	GenesisBlockExecuteContext,
	validator as liskValidator,
	utils,
} from 'lisk-sdk';

import { LegacyAPI } from './api';
import { LegacyEndpoint } from './endpoint';
import {
	MODULE_NAME_LEGACY,
	MODULE_ID_LEGACY,
	STORE_PREFIX_LEGACY_ACCOUNTS,
	LEGACY_ACCOUNT_LENGTH,
	LEGACY_ACC_MAX_TOTAL_BAL_NON_INC,
	defaultConfig,
} from './constants';
import { genesisLegacyStoreSchema, legacyAccountSchema } from './schemas';
import { ModuleConfig, ModuleInitArgs, genesisLegacyStoreData } from './types';

import { ReclaimCommand } from './commands/reclaim';
import { RegisterBLSKeyCommand } from './commands/register_bls_key';

const { LiskValidationError, validator } = liskValidator;
export class LegacyModule extends BaseModule {
	public name = MODULE_NAME_LEGACY;
	public id = MODULE_ID_LEGACY;
	public endpoint = new LegacyEndpoint(this.id);
	public api = new LegacyAPI(this.id);
	private _tokenAPI!: TokenAPI;
	private _validatorsAPI!: ValidatorsAPI;
	private _moduleConfig!: ModuleConfig;

	private readonly _reclaimCommand = new ReclaimCommand(this.id);
	private readonly _registerBlsKeyCommand = new RegisterBLSKeyCommand(this.id);

	// eslint-disable-next-line @typescript-eslint/member-ordering
	public commands = [this._reclaimCommand, this._registerBlsKeyCommand];

	public addDependencies(tokenAPI: TokenAPI, validatorsAPI: ValidatorsAPI) {
		this._tokenAPI = tokenAPI;
		this._validatorsAPI = validatorsAPI;
		this._reclaimCommand.addDependencies(this._tokenAPI);
		this._registerBlsKeyCommand.addDependencies(this._validatorsAPI);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init(args: ModuleInitArgs) {
		const { moduleConfig } = args;
		this._moduleConfig = utils.objects.mergeDeep({}, defaultConfig, moduleConfig) as ModuleConfig;
		this._reclaimCommand.init({ tokenIDReclaim: this._moduleConfig.tokenIDReclaim });
	}

	public async initGenesisState(ctx: GenesisBlockExecuteContext): Promise<void> {
		const legacyAssetsBuffer = ctx.assets.getAsset(this.id);

		if (!legacyAssetsBuffer) {
			return;
		}

		const { legacySubstore } = codec.decode<genesisLegacyStoreData>(
			genesisLegacyStoreSchema,
			legacyAssetsBuffer,
		);

		const reqErrors = validator.validate(genesisLegacyStoreSchema, { legacySubstore });
		if (reqErrors.length) {
			throw new LiskValidationError(reqErrors);
		}

		const uniqueLegacyAccounts = new Set();
		let totalBalance = BigInt('0');

		for (const account of legacySubstore) {
			if (account.address.length !== LEGACY_ACCOUNT_LENGTH)
				throw new Error(
					`legacy address length is invalid, expected ${LEGACY_ACCOUNT_LENGTH}, actual ${account.address.length}`,
				);

			uniqueLegacyAccounts.add(account.address.toString('hex'));
			totalBalance += account.balance;
		}

		if (uniqueLegacyAccounts.size !== legacySubstore.length) {
			throw new Error('Legacy address entries are not pair-wise distinct');
		}

		if (totalBalance >= LEGACY_ACC_MAX_TOTAL_BAL_NON_INC)
			throw new Error('Total balance for all legacy accounts cannot exceed 2^64');

		const legacyStore = ctx.getStore(this.id, STORE_PREFIX_LEGACY_ACCOUNTS);

		await Promise.all(
			legacySubstore.map(async account =>
				legacyStore.setWithSchema(
					account.address,
					{ balance: account.balance },
					legacyAccountSchema,
				),
			),
		);
	}
}

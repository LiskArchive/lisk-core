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
	ModuleMetadata,
} from 'lisk-sdk';

import { LegacyAPI } from './api';
import { LegacyEndpoint } from './endpoint';
import {
	MODULE_ID_LEGACY_BUFFER,
	LEGACY_ACCOUNT_LENGTH,
	LEGACY_ACC_MAX_TOTAL_BAL_NON_INC,
	ADDRESS_LEGACY_RESERVE,
	defaultConfig,
} from './constants';
import {
	legacyAccountRequestSchema,
	genesisLegacyStoreSchema,
	legacyAccountResponseSchema,
} from './schemas';

import { ModuleConfig, ModuleInitArgs, genesisLegacyStoreData } from './types';
import { LegacyAccountStore } from './stores/legacyAccountStore';
import { ReclaimCommand } from './commands/reclaim';
import { RegisterKeysCommand } from './commands/register_keys';

// eslint-disable-next-line prefer-destructuring
const validator: liskValidator.LiskValidator = liskValidator.validator;

export class LegacyModule extends BaseModule {
	public id = MODULE_ID_LEGACY_BUFFER;
	public endpoint = new LegacyEndpoint(this.name, this.stores, this.offchainStores);
	public api = new LegacyAPI(this.stores, this.events);
	public legacyReserveAddress = ADDRESS_LEGACY_RESERVE;
	private _tokenAPI!: TokenAPI;
	private _validatorsAPI!: ValidatorsAPI;
	private _moduleConfig!: ModuleConfig;

	private readonly _reclaimCommand = new ReclaimCommand(this.stores, this.events);
	private readonly _registerKeysCommand = new RegisterKeysCommand(this.stores, this.events);

	public constructor() {
		super();
		this.stores.register(LegacyAccountStore, new LegacyAccountStore(this.name));
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	public commands = [this._reclaimCommand, this._registerKeysCommand];

	public addDependencies(tokenAPI: TokenAPI, validatorsAPI: ValidatorsAPI) {
		this._tokenAPI = tokenAPI;
		this._validatorsAPI = validatorsAPI;
		this._reclaimCommand.addDependencies(this._tokenAPI);
		this._registerKeysCommand.addDependencies(this._validatorsAPI);
	}

	public metadata(): ModuleMetadata {
		return {
			id: this.id,
			name: this.name,
			endpoints: [
				{
					name: this.endpoint.getLegacyAccount.name,
					request: legacyAccountRequestSchema,
					response: legacyAccountResponseSchema,
				},
			],
			commands: this.commands.map(command => ({
				id: command.id,
				name: command.name,
				params: command.schema,
			})),
			events: [],
			assets: [],
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init(args: ModuleInitArgs) {
		const { moduleConfig } = args;
		this._moduleConfig = utils.objects.mergeDeep({}, defaultConfig, moduleConfig) as ModuleConfig;
		this._reclaimCommand.init({ tokenIDReclaim: this._moduleConfig.tokenIDReclaim });
	}

	public async initGenesisState(ctx: GenesisBlockExecuteContext): Promise<void> {
		const legacyAssetsBuffer = ctx.assets.getAsset(this.name);

		if (!legacyAssetsBuffer) {
			return;
		}

		const { legacySubstore } = codec.decode<genesisLegacyStoreData>(
			genesisLegacyStoreSchema,
			legacyAssetsBuffer,
		);

		validator.validate(genesisLegacyStoreSchema, { legacySubstore });
		const store = this.stores.get(LegacyAccountStore);
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

		if (totalBalance >= LEGACY_ACC_MAX_TOTAL_BAL_NON_INC) {
			throw new Error('Total balance for all legacy accounts cannot exceed 2^64');
		}

		const lockedAmount = await this._tokenAPI.getLockedAmount(
			ctx.getAPIContext(),
			this.legacyReserveAddress,
			this._moduleConfig.tokenIDReclaim,
			this.name,
		);

		if (totalBalance !== lockedAmount) {
			throw new Error('Total balance for all legacy accounts is not equal to locked amount');
		}

		await Promise.all(
			legacySubstore.map(async account =>
				store.set(ctx, account.address, { balance: account.balance }),
			),
		);
	}
}

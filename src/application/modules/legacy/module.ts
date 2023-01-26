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
	TokenMethod,
	ValidatorsMethod,
	codec,
	GenesisBlockExecuteContext,
	validator as liskValidator,
	utils,
	ModuleMetadata,
} from 'lisk-sdk';

import { LegacyMethod } from './method';
import { LegacyEndpoint } from './endpoint';
import {
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

import { ModuleConfig, ModuleConfigJSON, ModuleInitArgs, genesisLegacyStoreData } from './types';
import { getModuleConfig } from './utils';
import { LegacyAccountStore } from './stores/legacyAccountStore';
import { ReclaimLSKCommand } from './commands/reclaim';
import { RegisterKeysCommand } from './commands/register_keys';
import { ReclaimLSKEvent } from './events/reclaim';
import { RegisterKeysEvent } from './events/registerKeys';

// eslint-disable-next-line prefer-destructuring
const validator: liskValidator.LiskValidator = liskValidator.validator;

export class LegacyModule extends BaseModule {
	public endpoint = new LegacyEndpoint(this.stores, this.offchainStores);
	public method = new LegacyMethod(this.stores, this.events);
	public legacyReserveAddress = ADDRESS_LEGACY_RESERVE;
	private _tokenMethod!: TokenMethod;
	private _validatorsMethod!: ValidatorsMethod;
	private _moduleConfig!: ModuleConfig;

	private readonly _reclaimLSKCommand = new ReclaimLSKCommand(this.stores, this.events);
	private readonly _registerKeysCommand = new RegisterKeysCommand(this.stores, this.events);

	public constructor() {
		super();
		this.stores.register(LegacyAccountStore, new LegacyAccountStore(this.name));
		this.events.register(ReclaimLSKEvent, new ReclaimLSKEvent(this.name));
		this.events.register(RegisterKeysEvent, new RegisterKeysEvent(this.name));
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	public commands = [this._reclaimLSKCommand, this._registerKeysCommand];

	public addDependencies(tokenAPI: TokenMethod, validatorsMethod: ValidatorsMethod) {
		this._tokenMethod = tokenAPI;
		this._validatorsMethod = validatorsMethod;
		this._reclaimLSKCommand.addDependencies(this._tokenMethod);
		this._registerKeysCommand.addDependencies(this._validatorsMethod);
	}

	public metadata(): ModuleMetadata {
		return {
			endpoints: [
				{
					name: this.endpoint.getLegacyAccount.name,
					request: legacyAccountRequestSchema,
					response: legacyAccountResponseSchema,
				},
			],
			commands: this.commands.map(command => ({
				name: command.name,
				params: command.schema,
			})),
			events: this.events.values().map(e => ({
				name: e.name,
				data: e.schema,
			})),
			assets: [
				{
					version: 0,
					data: genesisLegacyStoreSchema,
				},
			],
			stores: [],
		};
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init(args: ModuleInitArgs) {
		const { genesisConfig, moduleConfig } = args;
		const mergedModuleConfig = utils.objects.mergeDeep(
			{},
			defaultConfig,
			moduleConfig,
		) as ModuleConfigJSON;
		this._moduleConfig = getModuleConfig(genesisConfig, mergedModuleConfig);
		this._reclaimLSKCommand.init({
			tokenIDReclaim: this._moduleConfig.tokenIDReclaim,
			moduleName: this.name,
		});
	}

	public async initGenesisState(ctx: GenesisBlockExecuteContext): Promise<void> {
		const legacyAssetsBuffer = ctx.assets.getAsset(this.name);

		if (!legacyAssetsBuffer) {
			return;
		}

		const { accounts } = codec.decode<genesisLegacyStoreData>(
			genesisLegacyStoreSchema,
			legacyAssetsBuffer,
		);

		validator.validate(genesisLegacyStoreSchema, { accounts });
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

		if (totalBalance >= LEGACY_ACC_MAX_TOTAL_BAL_NON_INC) {
			throw new Error('Total balance for all legacy accounts cannot exceed 2^64');
		}

		const lockedAmount = await this._tokenMethod.getLockedAmount(
			ctx.getMethodContext(),
			this.legacyReserveAddress,
			this._moduleConfig.tokenIDReclaim,
			this.name,
		);

		if (totalBalance !== lockedAmount) {
			throw new Error('Total balance for all legacy accounts is not equal to locked amount');
		}

		const legacyStore = this.stores.get(LegacyAccountStore);
		await Promise.all(
			accounts.map(async account =>
				legacyStore.set(ctx, account.address, { balance: account.balance }),
			),
		);
	}
}

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
	CommandVerifyContext,
	VerificationResult,
	VerifyStatus,
	validator as liskValidator,
	cryptography,
	TokenAPI,
	codec,
} from 'lisk-sdk';

import {
	COMMAND_ID_RECLAIM,
	COMMAND_NAME_RECLAIM,
	STORE_PREFIX_LEGACY_ACCOUNTS,
	MODULE_ID_LEGACY,
	TYPE_ID_ACCOUNT_RECLAIM,
	ADDRESS_LEGACY_RESERVE,
	TOKEN_ID_LSK_MAINCHAIN,
} from '../constants';

import {
	reclaimParamsSchema,
	legacyAccountResponseSchema,
	accountReclaimedEventDataSchema,
} from '../schemas';
import { ReclaimParamsData, LegacyStoreData } from '../types';

const { LiskValidationError, validator } = liskValidator;
const { getLegacyAddressFromPublicKey, getAddressFromPublicKey } = cryptography;

const getLegacyAddress = (publicKey): Buffer =>
	Buffer.from(getLegacyAddressFromPublicKey(publicKey), 'hex');
export class ReclaimCommand extends BaseCommand {
	public name = COMMAND_NAME_RECLAIM;
	public id = COMMAND_ID_RECLAIM;
	public moduleID = MODULE_ID_LEGACY;
	public schema = reclaimParamsSchema;
	public legacyReserveAddress = ADDRESS_LEGACY_RESERVE;
	public typeID = TYPE_ID_ACCOUNT_RECLAIM;
	public tokenID = TOKEN_ID_LSK_MAINCHAIN;
	private _tokenAPI!: TokenAPI;

	public addDependencies(tokenAPI: TokenAPI) {
		this._tokenAPI = tokenAPI;
	}

	public async verify(ctx: CommandVerifyContext): Promise<VerificationResult> {
		const params = (ctx.params as unknown) as ReclaimParamsData;
		const reqErrors = validator.validate(reclaimParamsSchema, params);
		if (reqErrors.length) {
			return {
				status: VerifyStatus.FAIL,
				error: new LiskValidationError(reqErrors),
			};
		}

		const legacyAddress = getLegacyAddress(ctx.transaction.senderPublicKey);
		const legacyStore = ctx.getStore(this.moduleID, STORE_PREFIX_LEGACY_ACCOUNTS);
		const isLegacyAddressExists = await legacyStore.has(legacyAddress);

		if (!isLegacyAddressExists) {
			return {
				status: VerifyStatus.FAIL,
				error: new Error('Public key does not correspond to a reclaimable account.'),
			};
		}

		const legacyAccount = await legacyStore.getWithSchema<LegacyStoreData>(
			legacyAddress,
			legacyAccountResponseSchema,
		);

		if (legacyAccount.balance !== params.amount) {
			return {
				status: VerifyStatus.FAIL,
				error: new Error('Input amount does not equal the balance of the legacy account.'),
			};
		}

		return { status: VerifyStatus.OK };
	}

	public async execute(ctx: CommandExecuteContext): Promise<void> {
		const params = (ctx.params as unknown) as ReclaimParamsData;
		const legacyAddress = getLegacyAddress(ctx.transaction.senderPublicKey);
		const legacyStore = ctx.getStore(this.moduleID, STORE_PREFIX_LEGACY_ACCOUNTS);
		await legacyStore.del(legacyAddress);

		const address = getAddressFromPublicKey(ctx.transaction.senderPublicKey);

		await this._tokenAPI.unlock(
			ctx.getAPIContext(),
			this.legacyReserveAddress,
			this.moduleID,
			this.tokenID,
			params.amount,
		);

		await this._tokenAPI.transfer(
			ctx.getAPIContext(),
			this.legacyReserveAddress,
			address,
			this.tokenID,
			params.amount,
		);

		const topics = [legacyAddress, address];

		const data = codec.encode(accountReclaimedEventDataSchema, {
			legacyAddress,
			address,
			amount: params.amount,
		});

		ctx.eventQueue.add(this.moduleID, Buffer.from([this.typeID]), data, topics);
	}
}

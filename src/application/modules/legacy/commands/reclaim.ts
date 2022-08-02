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
	ADDRESS_LEGACY_RESERVE,
	COMMAND_ID_RECLAIM_BUFFER,
	COMMAND_NAME_RECLAIM,
	MODULE_ID_LEGACY_BUFFER,
	STORE_PREFIX_LEGACY_ACCOUNTS,
	TYPE_ID_ACCOUNT_RECLAIM,
} from '../constants';

import {
	reclaimParamsSchema,
	legacyAccountResponseSchema,
	accountReclaimedEventDataSchema,
} from '../schemas';
import { ReclaimParamsData, LegacyStoreData, TokenIDReclaim } from '../types';

// eslint-disable-next-line prefer-destructuring
const validator: liskValidator.LiskValidator = liskValidator.validator;
const {
	address: { getAddressFromPublicKey },
	legacyAddress: { getLegacyAddressFromPublicKey },
} = cryptography;

const getLegacyAddress = (publicKey): Buffer =>
	Buffer.from(getLegacyAddressFromPublicKey(publicKey), 'hex');
export class ReclaimCommand extends BaseCommand {
	public name = COMMAND_NAME_RECLAIM;
	public id = COMMAND_ID_RECLAIM_BUFFER;
	public moduleID = MODULE_ID_LEGACY_BUFFER;
	public schema = reclaimParamsSchema;
	public legacyReserveAddress = ADDRESS_LEGACY_RESERVE;
	public typeID = TYPE_ID_ACCOUNT_RECLAIM;
	private _tokenAPI!: TokenAPI;
	private _tokenIDReclaim!: TokenIDReclaim;

	public addDependencies(tokenAPI: TokenAPI) {
		this._tokenAPI = tokenAPI;
	}

	public init(args: { tokenIDReclaim: TokenIDReclaim }) {
		this._tokenIDReclaim = args.tokenIDReclaim;
	}

	public async verify(ctx: CommandVerifyContext): Promise<VerificationResult> {
		const params = (ctx.params as unknown) as ReclaimParamsData;

		try {
			validator.validate(reclaimParamsSchema, params);
		} catch (err) {
			return {
				status: VerifyStatus.FAIL,
				error: err as Error,
			};
		}

		const legacyAddress = getLegacyAddress(ctx.transaction.senderPublicKey);
		const legacyStore = ctx.getStore(this.moduleID, STORE_PREFIX_LEGACY_ACCOUNTS);
		const isLegacyAddressExists = await legacyStore.has(legacyAddress);

		if (!isLegacyAddressExists) {
			const senderPublicKey = ctx.transaction.senderPublicKey.toString('hex');
			return {
				status: VerifyStatus.FAIL,
				error: new Error(`Legacy address corresponding to sender publickey ${senderPublicKey} was not found`),
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
			this._tokenIDReclaim,
			params.amount,
		);

		await this._tokenAPI.transfer(
			ctx.getAPIContext(),
			this.legacyReserveAddress,
			address,
			this._tokenIDReclaim,
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

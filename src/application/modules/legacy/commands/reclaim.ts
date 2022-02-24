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
} from 'lisk-sdk';

import {
	COMMAND_ID_RECLAIM,
	COMMAND_NAME_RECLAIM,
	STORE_PREFIX_LEGACY_ACCOUNTS,
} from '../constants';

import { reclaimParamsSchema, legacyAccountSchema } from '../schemas';
import { ReclaimParamsData, LegacyStoreData, TokenIDReclaim } from '../types';

const { LiskValidationError, validator } = liskValidator;
const { getLegacyAddressFromPublicKey, getAddressFromPublicKey } = cryptography;

const getLegacyAddress = (puhlicKey): Buffer =>
	Buffer.from(getLegacyAddressFromPublicKey(puhlicKey), 'hex');
export class ReclaimCommand extends BaseCommand {
	public name = COMMAND_NAME_RECLAIM;
	public id = COMMAND_ID_RECLAIM;
	public schema = reclaimParamsSchema;
	private _tokenAPI!: TokenAPI;
	private _tokenIDReclaim!: TokenIDReclaim;

	public addDependencies(tokenAPI: TokenAPI) {
		this._tokenAPI = tokenAPI;
	}

	public init(args: { tokenIDReclaim: TokenIDReclaim }) {
		this._tokenIDReclaim = args.tokenIDReclaim;
	}

	public async verify(ctx: CommandVerifyContext): Promise<VerificationResult> {
		const params = (ctx.params as any) as ReclaimParamsData;
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
				error: new Error(
					`Legacy address corresponding to sender publickey ${ctx.transaction.senderPublicKey.toString(
						'hex',
					)} was not found`,
				),
			};
		}

		const legacyAccount = await legacyStore.getWithSchema<LegacyStoreData>(
			legacyAddress,
			legacyAccountSchema,
		);

		if (legacyAccount.balance !== params.amount) {
			return {
				status: VerifyStatus.FAIL,
				error: new Error(
					`Invalid amount:${params.amount} claimed by the sender: ${legacyAddress.toString('hex')}`,
				),
			};
		}

		return { status: VerifyStatus.OK };
	}

	public async execute(ctx: CommandExecuteContext): Promise<void> {
		const params = (ctx.params as any) as ReclaimParamsData;
		const legacyAddress = getLegacyAddress(ctx.transaction.senderPublicKey);
		const legacyStore = ctx.getStore(this.moduleID, STORE_PREFIX_LEGACY_ACCOUNTS);
		await legacyStore.del(legacyAddress);

		await this._tokenAPI.mint(
			ctx.getAPIContext(),
			getAddressFromPublicKey(ctx.transaction.senderPublicKey),
			this._tokenIDReclaim,
			params.amount,
		);
	}
}

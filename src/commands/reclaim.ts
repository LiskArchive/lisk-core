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
} from 'lisk-sdk';
import {
	COMMAND_ID_RECLAIM,
	COMMAND_NAME_RECLAIM,
	STORE_PREFIX_LEGACY_ACCOUNTS,
} from '../application/modules/legacy/constants';
import { reclaimParamsSchema } from '../application/modules/legacy/schemas';

const { LiskValidationError, validator } = liskValidator;
const { getLegacyAddressFromPublicKey, getAddressFromPublicKey } = cryptography;

export class ReclaimCommand extends BaseCommand {
	public name = COMMAND_NAME_RECLAIM;
	public id = COMMAND_ID_RECLAIM;
	public schema = reclaimParamsSchema;

	public async execute(ctx: CommandExecuteContext): Promise<void> {
		const getTokenModule = new TokenAPI(this.moduleID);
		const reqErrors = validator.validate(reclaimParamsSchema, ctx.transaction.params);
		if (reqErrors.length) {
			throw new LiskValidationError(reqErrors);
		}

		const legacyAddress = getLegacyAddressFromPublicKey(ctx.transaction.senderPublicKey);
		const legacyStore = ctx.getStore(this.moduleID, STORE_PREFIX_LEGACY_ACCOUNTS);

		const isLegacyAddressExists = await legacyStore.has(Buffer.from(legacyAddress, 'hex'));
		if (!isLegacyAddressExists)
			throw new Error('Legacy address corresponding to sender publickey was not found');

		// Delete the entry from the legacy accounts substore if exists
		await legacyStore.del(Buffer.from(legacyAddress, 'hex'));

		// await getTokenModule.mint(
		// 	getAddressFromPublicKey(ctx.transaction.senderPublicKey),
		// 	0,
		// 	ctx.transaction.params.amount,
		// );
	}
}

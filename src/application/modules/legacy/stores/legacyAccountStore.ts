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
// TODO: Export 'BaseStore' directly from SDK once available
import { BaseStore } from '../../../../../node_modules/lisk-framework/dist-node/modules/base_store.js';

export interface legacyAccount {
	balance: bigint;
}

export const legacyAccountSchema = {
	$id: 'lisk/legacy/legacyAccount',
	type: 'object',
	required: ['balance'],
	properties: {
		balance: {
			dataType: 'uint64',
			fieldNumber: 1,
		},
	},
};

export class LegacyAccountStore extends BaseStore<legacyAccount> {
	public schema = legacyAccountSchema;
}

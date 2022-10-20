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
import { BaseEvent, EventQueuer } from 'lisk-sdk';

import { LENGTH_LEGACY_ADDRESS, LENGTH_ADDRESS } from '../constants';

export interface reclaimLSKEventData {
	legacyAddress: Buffer;
	address: Buffer;
	amount: bigint;
}

export const accountReclaimedEventDataSchema = {
	$id: 'lisk/legacy/accountReclaimedEventData',
	type: 'object',
	required: ['legacyAddress', 'address', 'amount'],
	properties: {
		legacyAddress: {
			dataType: 'bytes',
			maxLength: LENGTH_LEGACY_ADDRESS,
			fieldNumber: 1,
		},
		address: {
			dataType: 'bytes',
			maxLength: LENGTH_ADDRESS,
			fieldNumber: 2,
		},
		amount: {
			dataType: 'uint64',
			fieldNumber: 3,
		},
	},
};

export class ReclaimLSKEvent extends BaseEvent<reclaimLSKEventData> {
	public schema = accountReclaimedEventDataSchema;

	public log(ctx: EventQueuer, data: reclaimLSKEventData): void {
		this.add(ctx, data, [data.legacyAddress, data.address]);
	}
}

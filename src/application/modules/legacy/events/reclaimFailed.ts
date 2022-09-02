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
import { BaseEvent, EventQueuer } from '../../../../../node_modules/lisk-framework/dist-node/modules/base_event';

import { NUM_BYTES_LEGACY_ADDRESS, NUM_BYTES_ADDRESS } from '../constants';

export const enum ReclaimFailedReasons {
	RECLAIM_FAILED_NO_LEGACY_ACCOUNT = 0,
	RECLAIM_FAILED_INVALID_AMOUNT = 1,
}

export interface reclaimFailedEventData {
	legacyAddress: Buffer;
	address: Buffer;
	reason: ReclaimFailedReasons;
}

export const reclaimFailedEventDataSchema = {
	$id: 'lisk/legacy/reclaimFailedEventData',
	type: 'object',
	required: ['legacyAddress', 'address', 'reason'],
	properties: {
		legacyAddress: {
			dataType: 'bytes',
			length: NUM_BYTES_LEGACY_ADDRESS,
			fieldNumber: 1
		},
		address: {
			dataType: 'bytes',
			length: NUM_BYTES_ADDRESS,
			fieldNumber: 2
		},
		reason: {
			dataType: 'uint32',
			fieldNumber: 3
		}
	}
}

export class ReclaimFailedEvent extends BaseEvent<reclaimFailedEventData> {
	public schema = reclaimFailedEventDataSchema;

	public log(ctx: EventQueuer, data: reclaimFailedEventData): void {
		this.add(ctx, data, [data.legacyAddress, data.address]);
	}
}

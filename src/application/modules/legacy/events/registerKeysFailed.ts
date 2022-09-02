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

import { NUM_BYTES_ADDRESS } from '../constants';

export const enum RegisterKeysFailedReasons {
	KEY_REGISTRATION_FAILED_NO_VALIDATOR_ACCOUNT = 2,
	KEY_REGISTRATION_FAILED_KEYS_REGISTERED = 3,
}

export interface registerKeysEventData {
	address: Buffer;
	reason: RegisterKeysFailedReasons;
}

export const keyRegistrationFailedEventDataSchema = {
	$id: 'lisk/legacy/keyRegistrationFailedEventData',
	type: 'object',
	required: ['address', 'reason'],
	properties: {
		address: {
			dataType: 'bytes',
			length: NUM_BYTES_ADDRESS,
			fieldNumber: 1
		},
		reason: {
			dataType: 'uint32',
			fieldNumber: 2
		}
	}
}

export class RegisterKeysEvent extends BaseEvent<registerKeysEventData> {
	public schema = keyRegistrationFailedEventDataSchema;

	public log(ctx: EventQueuer, data: registerKeysEventData): void {
		this.add(ctx, data, [data.address]);
	}
}

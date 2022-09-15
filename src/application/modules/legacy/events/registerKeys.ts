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

import { LENGTH_ADDRESS, LENGTH_GENERATOR_KEY, LENGTH_BLS_KEY } from '../constants';

export interface registerKeysEventData {
	address: Buffer;
	generatorKey: Buffer;
	blsKey: Buffer;
}

export const keysRegisteredEventDataSchema = {
	$id: 'lisk/legacy/keysRegisteredEventData',
	type: 'object',
	required: ['address', 'generatorKey', 'blsKey'],
	properties: {
		address: {
			dataType: 'bytes',
			maxLength: LENGTH_ADDRESS,
			fieldNumber: 1,
		},
		generatorKey: {
			dataType: 'bytes',
			maxLength: LENGTH_GENERATOR_KEY,
			fieldNumber: 2,
		},
		blsKey: {
			dataType: 'bytes',
			maxLength: LENGTH_BLS_KEY,
			fieldNumber: 3,
		},
	},
};

export class RegisterKeysEvent extends BaseEvent<registerKeysEventData> {
	public schema = keysRegisteredEventDataSchema;

	public log(ctx: EventQueuer, data: registerKeysEventData): void {
		this.add(ctx, data, [data.address, data.generatorKey, data.blsKey]);
	}
}

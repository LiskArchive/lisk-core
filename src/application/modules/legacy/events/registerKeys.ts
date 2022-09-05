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
// TODO: Export 'BaseEvent' and 'EventQueuer' directly from SDK once available
import {
	BaseEvent,
	EventQueuer,
} from '../../../../../node_modules/lisk-framework/dist-node/modules/base_event';

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
			fieldNumber: 1,
		},
		generatorKey: {
			dataType: 'bytes',
			fieldNumber: 2,
		},
		blsKey: {
			dataType: 'bytes',
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

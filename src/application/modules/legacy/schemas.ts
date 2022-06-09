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

export const legacyAccountResponseSchema = {
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

export const reclaimParamsSchema = {
	$id: 'lisk/legacy/reclaim',
	type: 'object',
	required: ['amount'],
	properties: {
		amount: {
			dataType: 'uint64',
			fieldNumber: 1,
		},
	},
};

export const registerKeysParamsSchema = {
	$id: 'lisk/legacy/registerKeys',
	type: 'object',
	required: ['blsKey', 'proofOfPossession', 'generatorKey'],
	properties: {
		blsKey: {
			dataType: 'bytes',
			minLength: 48,
			maxLength: 48,
			fieldNumber: 1,
		},
		proofOfPossession: {
			dataType: 'bytes',
			minLength: 96,
			maxLength: 96,
			fieldNumber: 2,
		},
		generatorKey: {
			dataType: 'bytes',
			minLength: 32,
			maxLength: 32,
			fieldNumber: 3,
		},
	},
};

export const genesisLegacyStoreSchema = {
	$id: 'lisk/legacy/genesisLegacyStore',
	type: 'object',
	required: ['legacySubstore'],
	properties: {
		legacySubstore: {
			type: 'array',
			fieldNumber: 1,
			items: {
				type: 'object',
				required: ['address', 'balance'],
				properties: {
					address: {
						dataType: 'bytes',
						fieldNumber: 1,
					},
					balance: {
						dataType: 'uint64',
						fieldNumber: 2,
					},
				},
			},
		},
	},
};

export const legacyAccountRequestSchema = {
	$id: 'lisk/legacy/endpoint/getLegacyAccount',
	type: 'object',
	required: ['publicKey'],
	properties: {
		publicKey: {
			type: 'string',
			format: 'hex',
		},
	},
};

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

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

export const registerBLSKeyParamsSchema = {
	$id: 'lisk/legacy/registerBLSKey',
	type: 'object',
	required: ['blsKey', 'proofOfPossession', 'generatorKey'],
	properties: {
		blsKey: {
			dataType: 'bytes',
			fieldNumber: 1,
		},
		proofOfPossession: {
			dataType: 'bytes',
			fieldNumber: 2,
		},
		generatorKey: {
			dataType: 'bytes',
			fieldNumber: 3
		}
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

export const getLegacyAccountRequestSchema = {
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

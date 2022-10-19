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
	LENGTH_GENERATOR_KEY,
	LENGTH_PROOF_OF_POSSESSION,
	LENGTH_BLS_KEY,
	LENGTH_LEGACY_ADDRESS,
} from './constants';

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

export const reclaimLSKParamsSchema = {
	$id: 'lisk/legacy/reclaimLSK',
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
			minLength: LENGTH_BLS_KEY,
			maxLength: LENGTH_BLS_KEY,
			fieldNumber: 1,
		},
		proofOfPossession: {
			dataType: 'bytes',
			minLength: LENGTH_PROOF_OF_POSSESSION,
			maxLength: LENGTH_PROOF_OF_POSSESSION,
			fieldNumber: 2,
		},
		generatorKey: {
			dataType: 'bytes',
			minLength: LENGTH_GENERATOR_KEY,
			maxLength: LENGTH_GENERATOR_KEY,
			fieldNumber: 3,
		},
	},
};

export const genesisLegacyStoreSchema = {
	$id: 'lisk/legacy/genesisLegacyStore',
	type: 'object',
	required: ['accounts'],
	properties: {
		accounts: {
			type: 'array',
			fieldNumber: 1,
			items: {
				type: 'object',
				required: ['address', 'balance'],
				properties: {
					address: {
						dataType: 'bytes',
						minLength: LENGTH_LEGACY_ADDRESS,
						maxLength: LENGTH_LEGACY_ADDRESS,
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

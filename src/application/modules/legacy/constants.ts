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
 *
 */

export const MODULE_ID_LEGACY = 32768;
export const MODULE_NAME_LEGACY = 'legacy';
export const STORE_PREFIX_LEGACY_ACCOUNTS = 0x0000;
export const LEGACY_ACCOUNT_LENGTH = 8;
export const LEGACY_ACC_MAX_TOTAL_BAL_NON_INC = 2 ** 64;

// Commands
export const COMMAND_NAME_RECLAIM = 'reclaimLSK';
export const COMMAND_ID_RECLAIM = 0;
export const COMMAND_ID_REGISTER_KEYS = 1;
export const COMMAND_NAME_REGISTER_KEYS = 'registerkeys';

export const INVALID_BLS_KEY = Buffer.alloc(48);
export const INVALID_ED25519_KEY = Buffer.alloc(32, 255);

export const defaultConfig = {
	tokenIDReclaim: {
		chainID: 0,
		localID: 0,
	},
};

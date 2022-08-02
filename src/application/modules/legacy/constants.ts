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
import { cryptography } from 'lisk-sdk';

const { utils: { intToBuffer, hash } } = cryptography;

export const MODULE_ID_LEGACY = 32768;
export const MODULE_ID_LEGACY_BUFFER = intToBuffer(MODULE_ID_LEGACY, 4);
export const MODULE_NAME_LEGACY = 'legacy';
export const STORE_PREFIX_LEGACY_ACCOUNTS = 0x0000;
export const LEGACY_ACCOUNT_LENGTH = 8;
export const LEGACY_ACC_MAX_TOTAL_BAL_NON_INC = 2 ** 64;

// Commands
export const COMMAND_NAME_RECLAIM = 'reclaimLSK';
export const COMMAND_ID_RECLAIM = 0;
export const COMMAND_ID_RECLAIM_BUFFER = intToBuffer(COMMAND_ID_RECLAIM, 4);
export const COMMAND_ID_REGISTER_KEYS = 1;
export const COMMAND_ID_REGISTER_KEYS_BUFFER = intToBuffer(COMMAND_ID_REGISTER_KEYS, 4);
export const COMMAND_NAME_REGISTER_KEYS = 'registerkeys';
export const TYPE_ID_KEYS_REGISTERED = 0x0002;
export const TYPE_ID_ACCOUNT_RECLAIM = 0x0001;
export const ADDRESS_LEGACY_RESERVE = hash(Buffer.from('legacyReserve')).slice(0, 20);
export const TOKEN_ID_LSK_MAINCHAIN = Buffer.alloc(8);

export const INVALID_BLS_KEY = Buffer.alloc(48);

export const defaultConfig = {
	tokenIDReclaim: TOKEN_ID_LSK_MAINCHAIN,
};

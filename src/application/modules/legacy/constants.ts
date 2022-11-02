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

const {
	utils: { hash },
} = cryptography;

export const MODULE_NAME_LEGACY = 'legacy';
export const LEGACY_ACCOUNT_LENGTH = 8;
export const LEGACY_ACC_MAX_TOTAL_BAL_NON_INC = 2 ** 64;

// Commands
export const COMMAND_RECLAIM = 'reclaimLSK';
export const COMMAND_REGISTER_KEYS = 'registerKeys';
export const ADDRESS_LEGACY_RESERVE = hash(Buffer.from('legacyReserve', 'utf8')).slice(0, 20);
export const TOKEN_ID_LSK = '0000000000000000'; // On Mainnet

export const INVALID_BLS_KEY = Buffer.alloc(48);

export const defaultConfig = {
	tokenIDReclaim: TOKEN_ID_LSK,
};

export const LENGTH_LEGACY_ADDRESS = 8;
export const LENGTH_ADDRESS = 20;

export const LENGTH_GENERATOR_KEY = 32;
export const LENGTH_PROOF_OF_POSSESSION = 96;
export const LENGTH_BLS_KEY = 48;

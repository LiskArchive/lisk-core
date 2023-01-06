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
import { GenesisConfig, JSONObject } from 'lisk-sdk';

export interface LegacyStoreData {
	legacyAddress: string;
	balance: bigint;
}

export interface ReclaimLSKParamsData {
	amount: bigint;
}

export type TokenIDReclaim = Buffer;

export interface ModuleConfig {
	tokenIDReclaim: TokenIDReclaim;
}

export type ModuleConfigJSON = JSONObject<ModuleConfig>;

export interface ModuleInitArgs {
	genesisConfig: GenesisConfig;
	moduleConfig: Record<string, unknown>;
}

export interface registerKeysData {
	blsKey: Buffer;
	proofOfPossession: Buffer;
	generatorKey: Buffer;
}

export interface genesisLegacyStoreData {
	accounts: {
		address: Buffer;
		balance: bigint;
	}[];
}

export type ModuleName = string;

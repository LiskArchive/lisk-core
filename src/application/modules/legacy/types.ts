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

export interface LegacyStoreData {
	legacyAddress: string;
	balance: bigint;
}

export interface ReclaimParamsData {
	amount: bigint;
}

export interface TokenIDReclaim {
	chainID: number;
	localID: number;
}
export interface ModuleConfig {
	tokenIDReclaim: TokenIDReclaim;
}

export interface ModuleInitArgs {
	moduleConfig: Record<string, unknown>;
}

export interface registerKeysData {
	blsKey: Buffer;
	proofOfPossession: Buffer;
	generatorKey: Buffer;
}

export interface genesisLegacyStoreData {
	legacySubstore: {
		address: Buffer;
		balance: bigint;
	}[];
}

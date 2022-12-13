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

export interface Account {
	passphrase: string;
	privateKey: Buffer;
	publicKey: Buffer;
	address: string;
}

export interface GeneratorAccount extends Account {
	blsKey: Buffer;
	generatorKey: Buffer;
	proofOfPossession: Buffer;
}

export interface Stake {
	validatorAddress: string;
	amount: bigint;
}

export interface Transaction {
	module: string;
	command: string;
	fee: bigint;
	nonce: bigint;
	senderPublicKey: string;
	params: Record<string, unknown>;
	signatures: string[];
}

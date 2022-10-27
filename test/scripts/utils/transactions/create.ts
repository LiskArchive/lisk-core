/*
 * Copyright © 2020 Lisk Foundation
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

import { apiClient } from 'lisk-sdk';
import { Account } from '../accounts';

export interface Vote {
	delegateAddress: Buffer;
	amount: bigint;
}

interface TransactionInput {
	module: string;
	command: string;
	fee: bigint;
	nonce?: bigint;
	senderPublicKey: string;
	params: Record<string, unknown>;
	signatures?: string[];
}

const createAndSignTransaction = async (
	transaction: TransactionInput,
	privateKey: string,
	client: apiClient.APIClient,
	options?: Record<string, unknown>,
) => {
	const trx = await client.transaction.create(transaction, privateKey, options);

	return client.transaction.sign(trx, [privateKey], options);
};

export const createTransferTransaction = async (
	input: {
		nonce: bigint;
		recipientAddress: string;
		amount?: bigint;
		fromAccount: any;
		fee?: bigint;
	},
	client: apiClient.APIClient,
): Promise<Record<string, unknown>> => {
	const params = {
		recipientAddress: input.recipientAddress,
		amount: input.amount ?? BigInt('10000000000'),
		tokenID: '0000000000000000',
		data: '',
	};
	const tx = await createAndSignTransaction(
		{
			module: 'token',
			command: 'transfer',
			nonce: input.nonce,
			senderPublicKey: input.fromAccount.publicKey.toString('hex'),
			fee: input.fee ?? BigInt('200000'),
			params,
			signatures: [],
		},
		input.fromAccount.privateKey.toString('hex'),
		client,
	);

	return tx;
};

export const createDelegateRegisterTransaction = async (
	input: {
		account: Account;
		name: string;
		fee?: bigint;
		nonce: bigint;
	},
	client: apiClient.APIClient,
): Promise<Record<string, unknown>> => {
	const params = {
		name: input.name,
		blsKey: input.account.blsKey,
		proofOfPossession: input.account.proofOfPossession,
		generatorKey: input.account.generatorKey,
	};

	const tx = await createAndSignTransaction(
		{
			nonce: input.nonce,
			module: 'dpos',
			command: 'registerDelegate',
			senderPublicKey: input.account.publicKey.toString('hex'),
			fee: input.fee ?? BigInt('2500000000'),
			params,
			signatures: [],
		},
		input.account.privateKey.toString('hex'),
		client,
	);

	return tx;
};

export const createDelegateVoteTransaction = async (
	input: {
		nonce: bigint;
		account: Account;
		votes: Vote[];
		fee?: bigint;
	},
	client: apiClient.APIClient,
): Promise<Record<string, unknown>> => {
	const params = {
		votes: input.votes,
	};

	const tx = await createAndSignTransaction(
		{
			module: 'dpos',
			command: 'voteDelegate',
			nonce: input.nonce,
			senderPublicKey: input.account.publicKey.toString('hex'),
			fee: input.fee ?? BigInt('100000000'),
			params,
			signatures: [],
		},
		input.account.privateKey.toString('hex'),
		client,
	);

	return tx;
};

export const createMultiSignRegisterTransaction = async (
	input: {
		nonce: bigint;
		fee?: bigint;
		mandatoryKeys: Buffer[];
		optionalKeys: Buffer[];
		numberOfSignatures: number;
		senderAccount: Account;
		multisigKeys: any;
	},
	client: apiClient.APIClient,
): Promise<Record<string, unknown>> => {
	const params = {
		mandatoryKeys: input.mandatoryKeys,
		optionalKeys: input.optionalKeys,
		numberOfSignatures: input.numberOfSignatures,
		signatures: [],
	};
	const options = {
		multisignatureKeys: {
			mandatoryKeys: input.mandatoryKeys.map(mandatoryKey => mandatoryKey.toString('hex')),
			optionalKeys: input.optionalKeys.map(optionalKey => optionalKey.toString('hex')),
			numberOfSignatures: input.numberOfSignatures,
		},
	};
	let trx = await createAndSignTransaction(
		{
			module: 'auth',
			command: 'registerMultisignature',
			nonce: input.nonce,
			senderPublicKey: input.senderAccount.publicKey.toString('hex'),
			fee: input.fee ?? BigInt('1100000000'),
			params,
			signatures: [],
		},
		input.senderAccount.privateKey.toString('hex'),
		client,
		options,
	);
	trx = await client.transaction.sign(trx, input.multisigKeys, {
		includeSenderSignature: true,
		...options,
	});

	trx.params.signatures = trx.signatures;
	return trx;
};

// export const createMultisignatureTransferTransaction = async (
// 	input: {
// 		nonce: bigint;
// 		networkIdentifier: Buffer;
// 		recipientAddress: Buffer;
// 		amount: bigint;
// 		fee?: bigint;
// 		mandatoryKeys: Buffer[];
// 		optionalKeys: Buffer[];
// 		senderPublicKey: Buffer;
// 		passphrases: string[];
// 	},
// 	client: apiClient.APIClient,
// ): Promise<Record<string, unknown>> => {
// 	const asset = {
// 		recipientAddress: input.recipientAddress,
// 		amount: BigInt('10000000000'),
// 		data: '',
// 	};

// 	const tx = await createAndSignTransaction(
// 		{
// 			moduleID: 2,
// 			commandID: 0,
// 			nonce: input.nonce,
// 			senderPublicKey: input.senderPublicKey,
// 			fee: input.fee ?? BigInt('200000'),
// 			asset,
// 			signatures: [],
// 		},
// 		input.passphrases,
// 		client,
// 		{
// 			multisignatureKeys: {
// 				mandatoryKeys: input.mandatoryKeys,
// 				optionalKeys: input.optionalKeys,
// 			},
// 		},
// 	);

// 	return tx;
// };

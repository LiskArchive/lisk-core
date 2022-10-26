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

import { apiClient, cryptography } from 'lisk-sdk';

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
		account: any;
		name: string;
		fee?: bigint;
	},
	client: apiClient.APIClient,
): Promise<Record<string, unknown>> => {
	const { publicKey, privateKey } = cryptography.legacy.getPrivateAndPublicKeyFromPassphrase(
		input.account.passphrase,
	);
	const params = {
		name: input.name,
		blsKey: input.account.blsKey,
		proofOfPossession: input.account.proofOfPossession,
		generatorKey: input.account.generatorKey,
	};

	const tx = await createAndSignTransaction(
		{
			module: 'dpos',
			command: 'registerDelegate',
			senderPublicKey: publicKey.toString('hex'),
			fee: input.fee ?? BigInt('2500000000'),
			params,
			signatures: [],
		},
		privateKey.toString('hex'),
		client,
	);

	return tx;
};

// export const createDelegateVoteTransaction = async (
// 	input: {
// 		nonce: bigint;
// 		networkIdentifier: Buffer;
// 		passphrase: string;
// 		votes: Vote[];
// 		fee?: bigint;
// 	},
// 	client: apiClient.APIClient,
// ): Promise<Record<string, unknown>> => {
// 	const asset = {
// 		votes: input.votes,
// 	};

// 	const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(input.passphrase);

// 	const tx = await createAndSignTransaction(
// 		{
// 			moduleID: 5,
// 			commandID: 1,
// 			nonce: input.nonce,
// 			senderPublicKey: publicKey,
// 			fee: input.fee ?? BigInt('100000000'),
// 			asset,
// 			signatures: [],
// 		},
// 		[input.passphrase],
// 		client,
// 	);

// 	return tx;
// };

// export const createMultiSignRegisterTransaction = async (
// 	input: {
// 		nonce: bigint;
// 		networkIdentifier: Buffer;
// 		fee?: bigint;
// 		mandatoryKeys: Buffer[];
// 		optionalKeys: Buffer[];
// 		numberOfSignatures: number;
// 		senderPassphrase: string;
// 		passphrases: string[];
// 	},
// 	client: apiClient.APIClient,
// ): Promise<Record<string, unknown>> => {
// 	const asset = {
// 		mandatoryKeys: input.mandatoryKeys,
// 		optionalKeys: input.optionalKeys,
// 		numberOfSignatures: input.numberOfSignatures,
// 	};
// 	const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(input.senderPassphrase);
// 	const options = {
// 		multisignatureKeys: {
// 			mandatoryKeys: input.mandatoryKeys,
// 			optionalKeys: input.optionalKeys,
// 			numberOfSignatures: input.numberOfSignatures,
// 		},
// 	};
// 	let trx = await createAndSignTransaction(
// 		{
// 			moduleID: 4,
// 			commandID: 0,
// 			nonce: input.nonce,
// 			senderPublicKey: publicKey,
// 			fee: input.fee ?? BigInt('1100000000'),
// 			asset,
// 			signatures: [],
// 		},
// 		[input.senderPassphrase],
// 		client,
// 		options,
// 	);
// 	trx = await client.transaction.sign(trx, input.passphrases, {
// 		includeSenderSignature: true,
// 		...options,
// 	});

// 	return trx;
// };

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

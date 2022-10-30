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

import { apiClient, codec, cryptography } from 'lisk-sdk';

import {
	MODULE_TOKEN_TRANSFER,
	COMMAND_TOKEN_TRANSFER,
	MODULE_DPOS_MODULEE,
	COMMAND_DPOS_REGISTER_DELEGATE,
	COMMAND_DPOS_VOTE_DELEGATE,
	COMMAND_DPOS_UPDATE_GENERATOR_KEY,
	MODULE_AUTH_REGISTER_MULTISIGNATURE,
	COMMAND_AUTH_REGISTER_MULTISIGNATURE,
} from '../constants';
import {
	createSignatureForMultisignature,
	createSignatureObject,
	getSignBytes,
} from '../multisignature';
import { Account, TransactionInput, Vote } from '../types';
import { multisigRegMsgSchema } from '../schemas';

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
			module: MODULE_TOKEN_TRANSFER,
			command: COMMAND_TOKEN_TRANSFER,
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
			module: MODULE_DPOS_MODULEE,
			command: COMMAND_DPOS_REGISTER_DELEGATE,
			nonce: input.nonce,
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
			module: MODULE_DPOS_MODULEE,
			command: COMMAND_DPOS_VOTE_DELEGATE,
			nonce: input.nonce,
			senderPublicKey: input.account.publicKey.toString('hex'),
			fee: input.fee ?? BigInt('200000000'),
			params,
			signatures: [],
		},
		input.account.privateKey.toString('hex'),
		client,
	);

	return tx;
};

export const createUpdateGeneratorKeyTransaction = async (
	input: {
		account: Account;
		fee?: bigint;
		nonce: bigint;
		params: any;
	},
	client: apiClient.APIClient,
): Promise<Record<string, unknown>> => {
	const tx = await createAndSignTransaction(
		{
			module: MODULE_DPOS_MODULEE,
			command: COMMAND_DPOS_UPDATE_GENERATOR_KEY,
			nonce: input.nonce,
			senderPublicKey: input.account.publicKey.toString('hex'),
			fee: input.fee ?? BigInt('2500000000'),
			params: input.params,
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
		multisigAccountKeys: string[];
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

	let trx: any = await createAndSignTransaction(
		{
			module: MODULE_AUTH_REGISTER_MULTISIGNATURE,
			command: COMMAND_AUTH_REGISTER_MULTISIGNATURE,
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

	trx = await client.transaction.sign(trx, input.multisigAccountKeys, {
		includeSenderSignature: true,
		...options,
	});

	// Members sign in order
	const messageBytes = codec.encode(multisigRegMsgSchema, {
		address: cryptography.address.getAddressFromPublicKey(Buffer.from(trx.senderPublicKey, 'hex')),
		nonce: BigInt(trx.nonce),
		numberOfSignatures: trx.params.numberOfSignatures,
		mandatoryKeys: trx.params.mandatoryKeys.map(mandatoryKey => Buffer.from(mandatoryKey, 'hex')),
		optionalKeys: trx.params.optionalKeys.map(optionalKey => Buffer.from(optionalKey, 'hex')),
	});

	trx.params.signatures.push(
		createSignatureForMultisignature(messageBytes, Buffer.from(input.multisigAccountKeys[0], 'hex'))
			.signature,
	);

	trx.params.signatures.push(
		createSignatureForMultisignature(messageBytes, Buffer.from(input.multisigAccountKeys[1], 'hex'))
			.signature,
	);

	const txBuffer = getSignBytes(trx);

	trx.signatures = [];
	trx.signatures.push(createSignatureObject(txBuffer, input.senderAccount.privateKey).signature);

	return trx;
};

export const createMultisignatureTransferTransaction = async (
	input: {
		nonce: bigint;
		recipientAddress: string;
		amount: bigint;
		fee?: bigint;
		mandatoryKeys: Buffer[];
		optionalKeys: Buffer[];
		senderPublicKey: Buffer;
		multisigAccountKeys: any;
	},
	client: apiClient.APIClient,
): Promise<Record<string, unknown>> => {
	const params = {
		recipientAddress: input.recipientAddress,
		amount: BigInt('10000000000'),
		data: '',
	};

	const tx = await createAndSignTransaction(
		{
			module: MODULE_TOKEN_TRANSFER,
			command: COMMAND_TOKEN_TRANSFER,
			nonce: input.nonce,
			senderPublicKey: input.senderPublicKey.toString('hex'),
			fee: input.fee ?? BigInt('200000'),
			params,
			signatures: [],
		},
		input.multisigAccountKeys,
		client,
		{
			multisignatureKeys: {
				mandatoryKeys: input.mandatoryKeys,
				optionalKeys: input.optionalKeys,
			},
		},
	);

	return tx;
};

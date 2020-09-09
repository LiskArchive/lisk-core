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
/* eslint-disable no-console, @typescript-eslint/restrict-template-expressions */

import { IPCChannel, codec, transactions, RegisteredSchema } from 'lisk-sdk';
import { PassphraseAndKeys } from '../accounts';
import {
	createTransferTransaction,
	createDelegateRegisterTransaction,
	createReclaimTransaction,
	createDelegateVoteTransaction,
	Vote,
	createMultiSignRegisterTransaction,
	createMultisignatureTransferTransaction,
} from './create';

export const getBeddows = (lskAmount: string) =>
	BigInt(transactions.convertLSKToBeddows(lskAmount));

const generateRandomUserName = () => {
	const allLowerAlpha = [...'abcdefghijklmnopqrstuvwxyz'];

	const base = [...allLowerAlpha];

	return [...Array(20)].map(() => base[(Math.random() * base.length) | 0]).join('');
};

const nonceSequenceItems = (AccountNonce: number, count = 63) => [
	AccountNonce,
	...Array.from({ length: count }, (_, k) => AccountNonce + k + 1),
];

const getAccount = async (
	channel: IPCChannel,
	address: string,
): Promise<Record<string, unknown>> => {
	const schema = await channel.invoke<RegisteredSchema>('app:getSchema');
	const account = await channel.invoke<string>('app:getAccount', {
		address,
	});

	return codec.decodeJSON(schema.account, Buffer.from(account, 'hex'));
};

const getAccountNonce = async (channel: IPCChannel, address: string): Promise<number> => {
	const account = await getAccount(channel, address);
	const { sequence } = account as { sequence: { nonce: string } };
	return Number(sequence.nonce);
};

const handleTransaction = async (
	channel: IPCChannel,
	transaction: string,
	transactionMessage: string,
) => {
	try {
		const result: any = await channel.invoke('app:postTransaction', { transaction });

		if (result.transactionId) {
			console.log(`Sending ${transactionMessage} transaction: ${result.transactionId}`);
		} else {
			console.log(`Failed to send ${transactionMessage} transaction: ${transaction}`);
		}
	} catch (error) {
		console.error(`Error while sending ${transactionMessage} transaction: \n`, error);
	}
};

export const sendTokenTransferTransactions = async (
	channel: IPCChannel,
	nodeInfo: Record<string, unknown>,
	accounts: PassphraseAndKeys[],
	fromAccount: PassphraseAndKeys,
	fromGenesis = true,
) => {
	try {
		const AccountNonce = fromGenesis
			? await getAccountNonce(channel, fromAccount.address.toString('hex'))
			: 0;

		const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
		const transferTransactions = nonceSequenceItems(AccountNonce).map((nonce, index) => {
			return createTransferTransaction({
				nonce: BigInt(nonce),
				recipientAddress: accounts[index].address,
				amount: getBeddows(fromGenesis ? '2000' : '25'),
				fee: getBeddows('0.1'),
				networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
				passphrase: fromAccount.passphrase,
			});
		});

		const result = await Promise.all(
			transferTransactions.map(async transaction =>
				channel.invoke('app:postTransaction', { transaction }),
			),
		);

		for (const transaction of result as Array<Record<string, unknown>>) {
			if (transaction.transactionId) {
				console.log(`Sending token transfer transaction: ${transaction.transactionId}`);
			} else {
				console.log(`Failed to send token transfer transaction: ${transaction}`);
			}
		}
		console.log(`Sent token transfer transactions: ${transferTransactions.length}`);
	} catch (error) {
		console.error('Error while sending token transfer transaction: \n', error);
	}
};

export const sendDelegateRegistrationTransaction = async (
	channel: IPCChannel,
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
) => {
	const AccountNonce = await getAccountNonce(channel, fromAccount.address.toString('hex'));
	const username = generateRandomUserName();

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transaction = createDelegateRegisterTransaction({
		nonce: BigInt(AccountNonce),
		username,
		fee: getBeddows('15'),
		networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
		passphrase: fromAccount.passphrase,
	});

	await handleTransaction(channel, transaction, 'delegate registration');
};

export const sendVoteTransaction = async (
	channel: IPCChannel,
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
	votes: Vote[],
) => {
	const AccountNonce = await getAccountNonce(channel, fromAccount.address.toString('hex'));

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transaction = createDelegateVoteTransaction({
		nonce: BigInt(AccountNonce),
		votes,
		fee: getBeddows('0.3'),
		networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
		passphrase: fromAccount.passphrase,
	});

	await handleTransaction(channel, transaction, 'vote');
};

export const sendMultiSigRegistrationTransaction = async (
	channel: IPCChannel,
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
	asset: { mandatoryKeys: Buffer[]; optionalKeys: Buffer[]; numberOfSignatures: number },
	passphrases: string[],
) => {
	const AccountNonce = await getAccountNonce(channel, fromAccount.address.toString('hex'));

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transaction = createMultiSignRegisterTransaction({
		nonce: BigInt(AccountNonce),
		mandatoryKeys: asset.mandatoryKeys,
		optionalKeys: asset.optionalKeys,
		numberOfSignatures: asset.numberOfSignatures,
		senderPassphrase: fromAccount.passphrase,
		fee: getBeddows('0.5'),
		networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
		passphrases,
	});

	await handleTransaction(channel, transaction, 'multi signature registration');
};

export const sendTransferTransactionFromMultiSigAccount = async (
	channel: IPCChannel,
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
	asset: { mandatoryKeys: Buffer[]; optionalKeys: Buffer[] },
	passphrases: string[],
) => {
	const AccountNonce = await getAccountNonce(channel, fromAccount.address.toString('hex'));

	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const transaction = createMultisignatureTransferTransaction({
		senderPublicKey: fromAccount.publicKey,
		recipientAddress: fromAccount.address,
		amount: getBeddows('1'),
		nonce: BigInt(AccountNonce),
		mandatoryKeys: asset.mandatoryKeys,
		optionalKeys: asset.optionalKeys,
		fee: getBeddows('0.5'),
		networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
		passphrases,
	});

	await handleTransaction(channel, transaction, 'transfer transaction from multisig account');
};

export const sendReclaimTransactions = async (
	channel: IPCChannel,
	nodeInfo: Record<string, unknown>,
	fromAccount: PassphraseAndKeys,
) => {
	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
	const AccountNonce = await getAccountNonce(channel, fromAccount.address.toString('hex'));
	const transaction = createReclaimTransaction({
		nonce: BigInt(AccountNonce),
		amount: getBeddows('10000'),
		fee: getBeddows('0.4'),
		networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
		passphrase: fromAccount.passphrase,
	});

	await handleTransaction(channel, transaction, 'reclaim');
};

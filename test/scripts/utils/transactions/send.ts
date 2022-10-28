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

import { apiClient, transactions } from 'lisk-sdk';

import { Account, PassphraseAndKeys } from '../types';
import { TRANSACTIONS_PER_ACCOUNT } from '../constants';
import {
	createTransferTransaction,
	createDelegateRegisterTransaction,
	createDelegateVoteTransaction,
	Vote,
	createMultiSignRegisterTransaction,
	// createMultisignatureTransferTransaction,
} from './create';
import { wait } from '../wait';

export const getBeddows = (lskAmount: string) =>
	BigInt(transactions.convertLSKToBeddows(lskAmount));

const generateRandomUserName = () => {
	const allLowerAlpha = [...'abcdefghijklmnopqrstuvwxyz'];

	const base = [...allLowerAlpha];

	return [...Array(20)].map(() => base[(Math.random() * base.length) | 0]).join('');
};

const nonceSequenceItems = (AccountNonce: number, count = TRANSACTIONS_PER_ACCOUNT - 1) => [
	AccountNonce,
	...Array.from({ length: count }, (_, k) => AccountNonce + k + 1),
];

const getAccountNonce = async (address: string, client: apiClient.APIClient): Promise<number> => {
	const account = await client.invoke<any>('auth_getAuthAccount', { address });
	return Number(account.nonce);
};

const handleTransaction = async (
	transaction: any,
	transactionMessage: string,
	client: apiClient.APIClient,
) => {
	try {
		const result: any = await client.transaction.send(transaction);

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
	accounts: PassphraseAndKeys[],
	fromAccount: PassphraseAndKeys,
	fromGenesis = true,
	client: apiClient.APIClient,
) => {
	const AccountNonce = fromGenesis ? await getAccountNonce(fromAccount.address, client) : 0;

	const transferTransactions = await Promise.all(
		nonceSequenceItems(AccountNonce).map(async (nonce, index) => {
			const trx = await createTransferTransaction(
				{
					recipientAddress: accounts[index].address,
					nonce: BigInt(nonce),
					amount: getBeddows(fromGenesis ? '2000' : '25'),
					fee: BigInt('100000000'),
					fromAccount,
				},
				client,
			);

			return trx;
		}),
	);

	for (let i = 0; i < transferTransactions.length; i += 1) {
		await handleTransaction(transferTransactions[i], 'token transfer', client);
		// TODO: Remove wait
		await wait(20000);
	}
};

export const sendDelegateRegistrationTransaction = async (
	account: Account,
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(account.address, client);

	const name = generateRandomUserName();
	const transaction = await createDelegateRegisterTransaction(
		{
			name,
			nonce: BigInt(AccountNonce),
			fee: getBeddows('15'),
			account,
		},
		client,
	);

	await handleTransaction(transaction, 'delegate registration', client);
};

export const sendVoteTransaction = async (
	account: Account,
	votes: Vote[],
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(account.address, client);

	const transaction = await createDelegateVoteTransaction(
		{
			nonce: BigInt(AccountNonce),
			votes,
			fee: BigInt('100000000'),
			account,
		},
		client,
	);

	await handleTransaction(transaction, 'vote', client);
};

export const sendMultiSigRegistrationTransaction = async (
	account: Account,
	params: { mandatoryKeys: Buffer[]; optionalKeys: Buffer[]; numberOfSignatures: number },
	multisigKeys: any,
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(account.address, client);

	const transaction = await createMultiSignRegisterTransaction(
		{
			nonce: BigInt(AccountNonce),
			mandatoryKeys: params.mandatoryKeys,
			optionalKeys: params.optionalKeys,
			numberOfSignatures: params.numberOfSignatures,
			senderAccount: account,
			fee: BigInt('100000000'),
			multisigKeys,
		},
		client,
	);

	console.log(transaction);

	await handleTransaction(transaction, 'multi signature registration', client);
};

// export const sendTransferTransactionFromMultiSigAccount = async (
// 	nodeInfo: Record<string, unknown>,
// 	fromAccount: PassphraseAndKeys,
// 	asset: { mandatoryKeys: Buffer[]; optionalKeys: Buffer[] },
// 	passphrases: string[],
// 	client: apiClient.APIClient,
// ) => {
// 	const AccountNonce = await getAccountNonce(fromAccount.address.toString('hex'), client);

// 	const { networkIdentifier } = nodeInfo as { networkIdentifier: string };
// 	const transaction = await createMultisignatureTransferTransaction(
// 		{
// 			senderPublicKey: fromAccount.publicKey,
// 			recipientAddress: fromAccount.address,
// 			amount: getBeddows('1'),
// 			nonce: BigInt(AccountNonce),
// 			mandatoryKeys: asset.mandatoryKeys,
// 			optionalKeys: asset.optionalKeys,
// 			fee: getBeddows('0.5'),
// 			networkIdentifier: Buffer.from(networkIdentifier, 'hex'),
// 			passphrases,
// 		},
// 		client,
// 	);

// 	await handleTransaction(transaction, 'transfer transaction from multisig account', client);
// };

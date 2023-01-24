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

import { TRANSACTIONS_PER_ACCOUNT, DEFAULT_TX_FEES } from '../constants';
import {
	createTransferTransaction,
	createValidatorRegisterTransaction,
	createStakeTransaction,
	createUpdateGeneratorKeyTransaction,
	createMultiSignRegisterTransaction,
	createMultisignatureTransferTransaction,
} from './create';
import { Account, GeneratorAccount, Stake } from '../types';

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
	accounts: Account[],
	fromAccount: Account,
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
					fee: DEFAULT_TX_FEES,
					fromAccount,
				},
				client,
			);

			return trx;
		}),
	);

	for (let i = 0; i < transferTransactions.length; i++) {
		await handleTransaction(transferTransactions[i], 'token transfer', client);
	}
};

export const sendValidatorRegistrationTransaction = async (
	account: GeneratorAccount,
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(account.address, client);

	const name = generateRandomUserName();
	const transaction = await createValidatorRegisterTransaction(
		{
			name,
			nonce: BigInt(AccountNonce),
			fee: getBeddows('15'),
			account,
		},
		client,
	);

	await handleTransaction(transaction, 'validator registration', client);
};

export const sendStakeTransaction = async (
	account: GeneratorAccount,
	stakes: Stake[],
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(account.address, client);

	const transaction = await createStakeTransaction(
		{
			nonce: BigInt(AccountNonce),
			stakes,
			fee: DEFAULT_TX_FEES,
			account,
		},
		client,
	);

	await handleTransaction(transaction, 'stake', client);
};

export const sendUpdateGeneratorKeyTransaction = async (
	account: GeneratorAccount,
	params,
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(account.address, client);

	const transaction = await createUpdateGeneratorKeyTransaction(
		{
			nonce: BigInt(AccountNonce),
			fee: getBeddows('15'),
			account,
			params,
		},
		client,
	);

	await handleTransaction(transaction, 'update generatorKey', client);
};

export const sendMultiSigRegistrationTransaction = async (
	account: GeneratorAccount,
	params: { mandatoryKeys: Buffer[]; optionalKeys: Buffer[]; numberOfSignatures: number },
	multisigAccountKeys: string[],
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(account.address, client);

	const nodeInfo = await client.invoke<Record<string, any>>('system_getNodeInfo');

	const transaction = await createMultiSignRegisterTransaction(
		{
			chainID: Buffer.from(nodeInfo.chainID, 'hex'),
			nonce: BigInt(AccountNonce),
			mandatoryKeys: params.mandatoryKeys,
			optionalKeys: params.optionalKeys,
			numberOfSignatures: params.numberOfSignatures,
			senderAccount: account,
			fee: DEFAULT_TX_FEES,
			multisigAccountKeys,
		},
		client,
	);

	await handleTransaction(transaction, 'multi signature registration', client);
};

export const sendTransferTransactionFromMultiSigAccount = async (
	account: GeneratorAccount,
	params: { mandatoryKeys: Buffer[]; optionalKeys: Buffer[] },
	multisigAccountKeys: string[],
	client: apiClient.APIClient,
) => {
	const AccountNonce = await getAccountNonce(account.address, client);

	const transaction = await createMultisignatureTransferTransaction(
		{
			senderPublicKey: account.publicKey,
			recipientAddress: account.address,
			amount: getBeddows('1'),
			nonce: BigInt(AccountNonce),
			mandatoryKeys: params.mandatoryKeys,
			optionalKeys: params.optionalKeys,
			fee: DEFAULT_TX_FEES,
			multisigAccountKeys,
		},
		client,
	);

	await handleTransaction(transaction, 'transfer transaction from multisig account', client);
};

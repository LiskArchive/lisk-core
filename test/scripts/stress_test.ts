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
 */
/* eslint-disable no-console */

import { apiClient } from 'lisk-sdk';
import { createAccount, genesisAccount } from './utils/accounts';
import { PassphraseAndKeys, Account } from './utils/types';
import {
	sendTokenTransferTransactions,
	sendDelegateRegistrationTransaction,
	sendVoteTransaction,
	getBeddows,
	// sendMultiSigRegistrationTransaction,
	// sendTransferTransactionFromMultiSigAccount,
} from './utils/transactions/send';

import { wait } from './utils/wait';
import { TRANSACTIONS_PER_ACCOUNT } from './utils/constants';

const ITERATIONS = process.env.ITERATIONS ?? '1';
const STRESS_COUNT = TRANSACTIONS_PER_ACCOUNT * parseInt(ITERATIONS, 10);

const chunkArray = (myArray: PassphraseAndKeys[], chunkSize = TRANSACTIONS_PER_ACCOUNT) => {
	if (myArray.length <= chunkSize) {
		return [myArray];
	}

	return [myArray.slice(0, chunkSize), ...chunkArray(myArray.slice(chunkSize), chunkSize)];
};

const start = async (count = STRESS_COUNT) => {
	// const URL = process.env.WS_SERVER_URL || 'ws://localhost:7887/rpc-ws';
	const client = await apiClient.createIPCClient('~/.lisk/lisk-core');
	const accounts: Account[] = await Promise.all(
		[...Array(count)].map(async () => await createAccount()),
	);

	const accountsLen = accounts.length;
	// Due to TPool limit of 64 trx/account, fund initial accounts
	const fundInitialAccount: Account[] = accounts.slice(0, TRANSACTIONS_PER_ACCOUNT);
	await sendTokenTransferTransactions(fundInitialAccount, await genesisAccount(), true, client);

	// Wait for 2 blocks
	await wait(20000);

	const chunkedAccounts = chunkArray([...accounts]);
	for (let i = 0; i < chunkedAccounts.length; i += 1) {
		await sendTokenTransferTransactions(chunkedAccounts[i], fundInitialAccount[i], false, client);
	}

	console.log('\n');
	await wait(20000);

	for (let i = 0; i < accountsLen; i += 1) {
		await sendDelegateRegistrationTransaction(accounts[i], client);
	}

	console.log('\n');
	await wait(20000);
	// Vote
	for (let i = 0; i < accountsLen; i += 1) {
		const votes: any = [
			{ delegateAddress: accounts[accountsLen - i - 1].address, amount: getBeddows('20') },
			{
				delegateAddress: 'lskzort5bybu4rchqk6aj7sx2bbsu4azwf3wbutu4',
				amount: BigInt('1000000000'),
			},
		];
		await sendVoteTransaction(accounts[i], votes, client);
	}

	console.log('\n');
	await wait(20000);
	// Unvote
	for (let i = 0; i < accountsLen; i += 1) {
		const unVotes: any = [
			{ delegateAddress: accounts[accountsLen - i - 1].address, amount: getBeddows('-10') },
		];
		await sendVoteTransaction(accounts[i], unVotes, client);
	}

	console.log('\n');
	await wait(20000);

	// for (let i = 0; i < accountsLen; i += 1) {
	// 	const account1 = accounts[(i + 1) % accountsLen];
	// 	const account2 = accounts[(i + 2) % accountsLen];
	// 	const params = {
	// 		mandatoryKeys: [account1.publicKey],
	// 		optionalKeys: [account2.publicKey],
	// 		numberOfSignatures: 2,
	// 	};
	// 	const multisigKeys = [account1.privateKey.toString('hex'), account2.privateKey.toString('hex')];
	// 	await sendMultiSigRegistrationTransaction(accounts[i], params, multisigKeys, client);
	// }

	// console.log('\n');
	// await wait(40000);

	// for (let i = 0; i < accountsLen; i += 1) {
	// 	const account1 = accounts[(i + 1) % accountsLen];
	// 	const account2 = accounts[(i + 2) % accountsLen];
	// 	const asset = {
	// 		mandatoryKeys: [account1.publicKey],
	// 		optionalKeys: [account2.publicKey],
	// 	};
	// 	const passphrases = [account1.passphrase, account2.passphrase];
	// 	await sendTransferTransactionFromMultiSigAccount(
	// 		nodeInfo,
	// 		accounts[i],
	// 		asset,
	// 		passphrases,
	// 		client,
	// 	);
	// }

	client.disconnect();
};

const runScript = async () => {
	for (let i = 0; i < 3; i += 1) {
		console.log('Creating transactions count', i);
		await start();
	}
	console.info('Finished!!');
}

runScript().catch(console.error);

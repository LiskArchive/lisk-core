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

import * as os from 'os';
import { IPCChannel } from 'lisk-sdk';
import { PassphraseAndKeys, createAccount, genesisAccount } from './utils/accounts';
import {
	sendTokenTransferTransactions,
	sendDelegateRegistrationTransaction,
	sendVoteTransaction,
	getBeddows,
	sendMultiSigRegistrationTransaction,
	sendTransferTransactionFromMultiSigAccount,
	// sendReclaimTransactions,
} from './utils/transactions/send';

const TRANSACTIONS_PER_ACCOUNT = 64;
const ITERATIONS = process.env.ITERATIONS ?? '1';
const DATAPATH = process.env.DATAPATH ?? '~/.lisk/default';
const STRESS_COUNT = TRANSACTIONS_PER_ACCOUNT * parseInt(ITERATIONS, 10);

const chunkArray = (myArray: PassphraseAndKeys[], chunkSize = TRANSACTIONS_PER_ACCOUNT) => {
	if (myArray.length <= chunkSize) {
		return [myArray];
	}

	return [myArray.slice(0, chunkSize), ...chunkArray(myArray.slice(chunkSize), chunkSize)];
};

const getSocketsPath = (dataPath: string) => {
	const resolvedPath = dataPath.replace('~', os.homedir());
	const socketsDir = `${resolvedPath}/tmp/sockets`;

	return {
		root: `unix://${socketsDir}`,
		pub: `unix://${socketsDir}/lisk_pub.sock`,
		sub: `unix://${socketsDir}/lisk_sub.sock`,
		rpc: `unix://${socketsDir}/bus_rpc_socket.sock`,
	};
};

const startIPCChannel = async (): Promise<IPCChannel> => {
	const events: string[] = [];
	const actions = {};
	const socketsPath = getSocketsPath(DATAPATH);
	const channel = new IPCChannel('QAChannel', events, actions, { socketsPath });

	await channel.startAndListen();

	return channel;
};

const wait = async (ms = 10000) => new Promise(resolve => setTimeout(() => resolve(), ms));

const start = async (count = STRESS_COUNT) => {
	const channel = await startIPCChannel();
	const nodeInfo = await channel.invoke<Record<string, unknown>>('app:getNodeInfo');

	const accounts = [...Array(count)].map(() => createAccount());
	const accountsLen = accounts.length;
	// Due to TPool limit of 64 trx/account, fund initial accounts
	const fundInitialAccount: PassphraseAndKeys[] = accounts.slice(0, TRANSACTIONS_PER_ACCOUNT);
	await sendTokenTransferTransactions(channel, nodeInfo, fundInitialAccount, genesisAccount);
	// Wait for 2 blocks
	await wait(20000);

	const chunkedAccounts = chunkArray([...accounts]);
	for (let i = 0; i < chunkedAccounts.length; i += 1) {
		await sendTokenTransferTransactions(
			channel,
			nodeInfo,
			chunkedAccounts[i],
			fundInitialAccount[i],
			false,
		);
	}

	console.log('\n');
	await wait(20000);

	for (let i = 0; i < accountsLen; i += 1) {
		await sendDelegateRegistrationTransaction(channel, nodeInfo, accounts[i]);
	}

	console.log('\n');
	await wait(20000);
	// Vote
	for (let i = 0; i < accountsLen; i += 1) {
		const votes = [
			{ delegateAddress: accounts[accountsLen - i - 1].address, amount: getBeddows('20') },
			{
				delegateAddress: Buffer.from('5ade564399e670bd1d429583059067f3a6ca2b7f', 'hex'),
				amount: getBeddows('10'),
			},
		];
		await sendVoteTransaction(channel, nodeInfo, accounts[i], votes);
	}

	console.log('\n');
	await wait(20000);
	// Unvote
	for (let i = 0; i < accountsLen; i += 1) {
		const unVotes = [
			{ delegateAddress: accounts[accountsLen - i - 1].address, amount: getBeddows('-10') },
		];
		await sendVoteTransaction(channel, nodeInfo, accounts[i], unVotes);
	}

	console.log('\n');
	await wait(20000);

	for (let i = 0; i < accountsLen; i += 1) {
		const account1 = accounts[(i + 1) % accountsLen];
		const account2 = accounts[(i + 2) % accountsLen];
		const asset = {
			mandatoryKeys: [account1.publicKey],
			optionalKeys: [account2.publicKey],
			numberOfSignatures: 2,
		};
		const passphrases = [account1.passphrase, account2.passphrase];
		await sendMultiSigRegistrationTransaction(channel, nodeInfo, accounts[i], asset, passphrases);
	}

	console.log('\n');
	await wait(40000);

	for (let i = 0; i < accountsLen; i += 1) {
		const account1 = accounts[(i + 1) % accountsLen];
		const account2 = accounts[(i + 2) % accountsLen];
		const asset = {
			mandatoryKeys: [account1.publicKey],
			optionalKeys: [account2.publicKey],
		};
		const passphrases = [account1.passphrase, account2.passphrase];
		await sendTransferTransactionFromMultiSigAccount(
			channel,
			nodeInfo,
			accounts[i],
			asset,
			passphrases,
		);
	}

	// TODO: Use unclaimed account from devnet/alphanet genesis config

	// const accountToReclaim: CreateAccount = createAccount();
	// await sendReclaimTransactions(channel, nodeInfo, accountToReclaim);
	// console.log('\n');
	// await wait();

	console.info('Finished!!');
	channel.cleanup();
};

start().catch(console.error);

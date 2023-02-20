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

import {
	createAccount,
	genesisAccount,
	createGeneratorKey,
	getAccountKeyPath,
} from './utils/accounts';
import { TRANSACTIONS_PER_ACCOUNT, NUM_OF_ROUNDS, MAX_COMMISSION } from './utils/constants';
import {
	sendTokenTransferTransactions,
	sendValidatorRegistrationTransaction,
	sendStakeTransaction,
	getBeddows,
	sendUpdateGeneratorKeyTransaction,
	sendChangeCommissionTransaction,
	sendMultiSigRegistrationTransaction,
	sendTransferTransactionFromMultiSigAccount,
	sendTokenTransferTransaction,
	sendRegisterKeysTransaction,
	sendSidechainRegistrationTransaction,
} from './utils/transactions/send';
import { Account, GeneratorAccount, Stake } from './utils/types';
import { wait } from './utils/wait';
import { registerSidechainParams } from '../fixtures/interoperabilityParams';

const ITERATIONS = process.env.ITERATIONS ?? '1';
const STRESS_COUNT = TRANSACTIONS_PER_ACCOUNT * parseInt(ITERATIONS, 10);

let schemas;
let metadata;

const chunkArray = (myArray: Account[], chunkSize = TRANSACTIONS_PER_ACCOUNT) => {
	if (myArray.length <= chunkSize) {
		return [myArray];
	}

	return [myArray.slice(0, chunkSize), ...chunkArray(myArray.slice(chunkSize), chunkSize)];
};

export const getSchemas = () => schemas;

export const getMetadata = () => metadata;

const start = async (count, isValidatorsRegistered, isSidechainRegistered) => {
	const network = process.argv[2] || 'devnet';
	if (!['alphanet', 'devnet'].includes(network)) {
		console.error('Invalid argument passed, accepted values are devnet and alphanet');
		console.error('Exiting...');
		process.exit(1);
	}

	// const URL = process.env.WS_SERVER_URL || 'ws://localhost:7887/rpc-ws';
	const client = await apiClient.createIPCClient('~/.lisk/lisk-core');
	const accounts: GeneratorAccount[] = await Promise.all(
		[...Array(count)].map(async () => await createAccount()),
	);

	if (!schemas) {
		schemas = await client.invoke<Record<string, any>>('system_getSchema');
	}

	if (!metadata) {
		metadata = await client.invoke<Record<string, any>>('system_getMetadata');
	}

	const accountsLen = accounts.length;
	// Due to TPool limit of 64 trx/account, fund initial accounts
	const fundInitialAccount: Account[] = accounts.slice(0, TRANSACTIONS_PER_ACCOUNT);
	const accountKeyPath = getAccountKeyPath();
	await sendTokenTransferTransactions(
		fundInitialAccount,
		await genesisAccount(accountKeyPath),
		true,
		client,
	);

	// Wait for 2 blocks
	console.log('\n');
	await wait(20000);

	const chunkedAccounts = chunkArray([...accounts]);
	for (let i = 0; i < chunkedAccounts.length; i++) {
		await sendTokenTransferTransactions(chunkedAccounts[i], fundInitialAccount[i], false, client);
	}

	console.log('\n');
	await wait(20000);

	if (!isSidechainRegistered) {
		const nodeInfo = await client.node.getNodeInfo();
		const params = {
			...registerSidechainParams,
			chainID: nodeInfo.chainID.slice(0, 2).concat('000001'),
		};
		await sendSidechainRegistrationTransaction(accounts[0], params, client);
		// Wait for 2 blocks
		console.log('\n');
		await wait(20000);
	}

	for (let i = 0; i < accountsLen; i++) {
		await sendValidatorRegistrationTransaction(accounts[i], client);
	}

	console.log('\n');
	await wait(20000);
	// Stake
	for (let i = 0; i < accountsLen; i++) {
		const stakes: Stake[] = [
			{ validatorAddress: accounts[accountsLen - i - 1].address, amount: getBeddows('20') },
			{
				validatorAddress: 'lskzort5bybu4rchqk6aj7sx2bbsu4azwf3wbutu4',
				amount: BigInt('1000000000'),
			},
		];
		await sendStakeTransaction(accounts[i], stakes, client);
	}

	console.log('\n');
	await wait(20000);
	// Unstake
	for (let i = 0; i < accountsLen; i++) {
		const unStakes: Stake[] = [
			{ validatorAddress: accounts[accountsLen - i - 1].address, amount: getBeddows('-10') },
		];
		await sendStakeTransaction(accounts[i], unStakes, client);
	}

	console.log('\n');
	await wait(20000);

	// Update generatorKey
	for (let i = 0; i < accountsLen; i++) {
		const params = {
			generatorKey: await createGeneratorKey(accounts[i].passphrase, `m/25519'/134'/0'/${i}'`),
		};

		await sendUpdateGeneratorKeyTransaction(accounts[i], params, client);
	}

	console.log('\n');
	await wait(20000);

	// Change commission
	for (let i = 0; i < accountsLen; i++) {
		const params = {
			newCommission: Math.floor(Math.random() * MAX_COMMISSION),
		};

		await sendChangeCommissionTransaction(accounts[i], params, client);
	}

	console.log('\n');
	await wait(20000);

	for (let i = 0; i < accountsLen; i++) {
		const account1 = accounts[(i + 1) % accountsLen];
		const account2 = accounts[(i + 2) % accountsLen];
		const params = {
			mandatoryKeys: [account1.publicKey],
			optionalKeys: [account2.publicKey],
			numberOfSignatures: 2,
		};
		const multisigAccountKeys = [
			account1.privateKey.toString('hex'),
			account2.privateKey.toString('hex'),
		];
		await sendMultiSigRegistrationTransaction(accounts[i], params, multisigAccountKeys, client);
	}

	console.log('\n');
	await wait(20000);

	for (let i = 0; i < accountsLen; i += 1) {
		const account1 = accounts[(i + 1) % accountsLen];
		const account2 = accounts[(i + 2) % accountsLen];
		const params = {
			mandatoryKeys: [account1.publicKey],
			optionalKeys: [account2.publicKey],
		};
		const multisigAccountKeys = [
			account1.privateKey.toString('hex'),
			account2.privateKey.toString('hex'),
		];
		await sendTransferTransactionFromMultiSigAccount(
			accounts[i],
			params,
			multisigAccountKeys,
			client,
		);
	}

	// Wait for 2 blocks
	console.log('\n');
	await wait(20000);

	// require genesis accounts (validators) based on the network, default to devnet
	const { keys: validatorKeys } = require(`../../config/${network}/dev-validators.json`);

	// Send transactions from all genesis accounts
	for (let i = 0; i < validatorKeys.length; i++) {
		const keyPath = validatorKeys[i].keyPath;
		const account = await genesisAccount(keyPath);
		await sendTokenTransferTransaction(fundInitialAccount[0], account, client);

		if (!isValidatorsRegistered) {
			const params = {
				blsKey: validatorKeys[i].plain.blsKey,
				proofOfPossession: validatorKeys[i].plain.blsProofOfPossession,
				generatorKey: validatorKeys[i].plain.generatorKey,
			};
			await sendRegisterKeysTransaction(account, params, client);
		}

		// Remove wait once SDK fixes issue: https://github.com/LiskHQ/lisk-sdk/issues/8148
		await wait(1000);
	}

	console.log('\n');
	client.disconnect();
};

const createTransactions = async () => {
	// Add flag to update the status of validator keys registration
	let isValidatorsRegistered = false;
	let isSidechainRegistered = false;

	for (let i = 0; i < NUM_OF_ROUNDS; i++) {
		await start(STRESS_COUNT, isValidatorsRegistered, isSidechainRegistered);
		// Set isValidatorsRegistered flag to true after validators keys registration
		isValidatorsRegistered = true;
		isSidechainRegistered = true;
	}
	console.info('Finished!!');
};

createTransactions().catch(console.error);

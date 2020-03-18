/* eslint-disable no-await-in-loop */
const output = require('codeceptjs').output;
const crypto = require('crypto');
const {
	TO_BEDDOWS,
	createAccounts,
	TRANSACTIONS_PER_ACCOUNT,
	from,
	chunkArray,
} = require('../../utils');
const {
	GENESIS_ACCOUNT,
} = require('../../fixtures');

const I = actor();
const contractsByAddress = {};
const STRESS_COUNT = parseInt(process.env.STRESS_COUNT) || 64;

const accounts = createAccounts(STRESS_COUNT);
const chunkedAccounts = chunkArray([...accounts], TRANSACTIONS_PER_ACCOUNT);

const transferFundsFromGenesisAccount = async accountsToFund => {
	const LSK_TOKEN = 50000;
	// Get genesis account latest nonce
	const api = await I.call();
	const { result: { data: [{ nonce }] } } = await from(api.getAccounts({ address: GENESIS_ACCOUNT.address }));

	const transferToAccounts = accountsToFund.map((a, i) => ({
		recipientId: a.address,
		amount: TO_BEDDOWS(LSK_TOKEN),
		fee: Math.floor(100000000 * 100 * Math.random()).toString(),
		nonce: (parseInt(nonce, 10) + i).toString(),
	}));

	try {
		const transferTransactions = await I.transferToMultipleAccounts(
			transferToAccounts
		);

		await I.waitUntilTransactionsConfirmed();

		await Promise.all(
			transferTransactions.map(trx =>
				I.validateTransaction(trx.id, trx.asset.recipientId, LSK_TOKEN)
			)
		);
	} catch (error) {
		output.print('Error while processing transfer fund transaction', error);
	}
};

Feature('Generic stress test');

Scenario('Transfer funds', async () => {
	const initialAccounts = createAccounts(TRANSACTIONS_PER_ACCOUNT);
	await transferFundsFromGenesisAccount(initialAccounts);
	output.print('==========Initialized funds to 64 accounts from genesis account==========');

	const LSK_TOKEN = 100;
	const transferToAccounts = [];

	try {
		for (let i = 0; i < chunkedAccounts.length; i++) {
			const transferAccounts = chunkedAccounts[i].map((a, j) => ({
				recipientId: a.address,
				amount: TO_BEDDOWS(LSK_TOKEN),
				passphrase: initialAccounts[i].passphrase,
				fee: Math.floor(100000000 * 100 * Math.random()).toString(),
				nonce: j.toString(),
			}));

			transferToAccounts.push(...transferAccounts);
		}

		output.print('==========Start Transfer transaction Stress Test==========');
		const result = await I.transferToMultipleAccounts(transferToAccounts);

		await I.waitUntilTransactionsConfirmed();

		await Promise.all(
			result.map(trx =>
				I.validateTransaction(trx.id, trx.asset.recipientId, LSK_TOKEN, trx.senderId)
			)
		);
		output.print('==========End Transfer transaction Stress Test==========');
	} catch (error) {
		output.print('Error while processing transfer fund transaction', error);
	}
})
	.tag('@stress');

Scenario('Delegate Registration', async () => {
	output.print('==========Start Delegate Registration transaction Stress Test==========');

	try {
		const delegateAccounts = accounts.map(a => ({
			username: crypto.randomBytes(9).toString('hex'),
			passphrase: a.passphrase,
			fee: '2500000000',
			nonce: '0',
		}));

		const result = await I.registerMultipleDelegate(delegateAccounts);

		await I.waitUntilTransactionsConfirmed();

		await Promise.all(
			result.map(async a => {
				const api = await I.call();

				const account = await api.getAccounts({ username: a.asset.username });
				expect(account.data[0].delegate.username).to.deep.equal(a.asset.username);
			})
		);
		output.print('==========End Delegate Registration transaction Stress Test==========');
	} catch (error) {
		output.print('Error while processing delegate registration', error);
	}
})
	.tag('@stress');

Scenario('Cast vote', async () => {
	output.print('==========Start Cast vote transaction Stress Test==========');

	try {
		const delegateAccounts = accounts.map(a => ({
			votes: [a.publicKey],
			passphrase: a.passphrase,
			fee: '100000000',
			nonce: '1',
		}));

		const result = await I.castMultipleVotes(delegateAccounts);

		await I.waitUntilTransactionsConfirmed();

		await Promise.all(
			result.map(async a => {
				const api = await I.call();

				const account = await api.getVoters({ address: a.senderId });
				expect(
					account.data.voters.some(v => v.address === a.address)
				).to.deep.equal(true);
			})
		);
		output.print('==========End Cast vote transaction Stress Test==========');
	} catch (error) {
		output.print('Error while processing cast vote transaction', error);
	}
})
	.tag('@stress');

Scenario('Register Multi-signature account', async () => {
	output.print('==========Start multi signature transaction Stress Test==========');

	try {
		await Promise.all(
			accounts.map(async (a, index) => {
				const { passphrase, address } = a;
				const signer1 = accounts[(index + 1) % accounts.length];
				const signer2 = accounts[(index + 2) % accounts.length];
				const contracts = [signer1, signer2];
				const params = {
					lifetime: 1,
					minimum: 2,
					passphrase,
				};
				contractsByAddress[address] = contracts;

				await I.registerMultisignature(contracts, params, 0);
			})
		);

		await I.waitUntilTransactionsConfirmed();

		await Promise.all(
			accounts.map(async a => {
				const api = await I.call();

				const account = await api.getMultisignatureGroups(a.address);
				await I.expectMultisigAccountToHaveContracts(
					account,
					contractsByAddress[a.address]
				);
			})
		);
		output.print('==========End multi signature transaction Stress Test==========');
	} catch (error) {
		output.print(
			'Error while processing register multi-signature account transaction',
			error
		);
	}
})
	.tag('@stress');

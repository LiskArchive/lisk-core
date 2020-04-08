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
const { GENESIS_ACCOUNT } = require('../../fixtures');

const I = actor();
const contractsByAddress = {};
const STRESS_COUNT = parseInt(process.env.STRESS_COUNT) || 64;

const accounts = createAccounts(STRESS_COUNT);
const chunkedAccounts = chunkArray([...accounts], TRANSACTIONS_PER_ACCOUNT);

const transferFundsFromGenesisAccount = async accountsToFund => {
	const LSK_TOKEN = 50000;
	// Get genesis account latest nonce
	const api = await I.call();
	const {
		result: {
			data: [{ nonce }],
		},
	} = await from(api.getAccounts({ address: GENESIS_ACCOUNT.address }));

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
	output.print(
		'==========Initialized funds to 64 accounts from genesis account=========='
	);

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
				I.validateTransaction(
					trx.id,
					trx.asset.recipientId,
					LSK_TOKEN,
					trx.senderId
				)
			)
		);
		output.print('==========End Transfer transaction Stress Test==========');
	} catch (error) {
		output.print('Error while processing transfer fund transaction', error);
	}
}).tag('@stress');

Scenario('Delegate Registration', async () => {
	output.print(
		'==========Start Delegate Registration transaction Stress Test=========='
	);

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
				expect(account.data[0].username).to.deep.equal(a.asset.username);
			})
		);
		output.print(
			'==========End Delegate Registration transaction Stress Test=========='
		);
	} catch (error) {
		output.print('Error while processing delegate registration', error);
	}
}).tag('@stress');

Scenario('Cast vote and unVote', async () => {
	output.print('==========Start Cast vote transaction Stress Test==========');

	try {
		const voteAmount = '1000000000';
		const totalAccounts = accounts.length - 1;

		const votingAccounts = accounts.map((a, i) => {
			const accountToVote = accounts[totalAccounts - i];

			return {
				votes: [{ delegateAddress: accountToVote.address, amount: voteAmount }],
				passphrase: a.passphrase,
				fee: '100000000',
				nonce: '1',
			};
		});

		const result = await I.castMultipleVotes(votingAccounts);

		await I.waitUntilTransactionsConfirmed();

		await Promise.all(
			result.map(async (a, i) => {
				const api = await I.call();
				const accountVoted = accounts[totalAccounts - i];

				const account = await api.getAccounts({
					address: a.senderId,
				});
				expect(account.data[0].votes).to.deep.include(
					{ amount: voteAmount, delegateAddress: accountVoted.address }
				);
			})
		);
		output.print('==========End Cast vote transaction Stress Test==========');
		output.print('==========Start Cast unVote transaction Stress Test==========');

		const unVotingAccounts = accounts.map((a, i) => {
			const accountToUnVote = accounts[totalAccounts - i];

			return {
				votes: [{ delegateAddress: accountToUnVote.address, amount: `-${voteAmount}` }],
				passphrase: a.passphrase,
				fee: '100000000',
				nonce: '2',
			};
		});

		const unVoteResult = await I.castMultipleVotes(unVotingAccounts);

		await I.waitUntilTransactionsConfirmed();

		await Promise.all(
			unVoteResult.map(async a => {
				const api = await I.call();

				const account = await api.getAccounts({
					address: a.senderId,
				});
				expect(account.data[0].votes).to.be.empty;
			})
		);
		output.print('==========End Cast unVote transaction Stress Test==========');
	} catch (error) {
		output.print('Error while processing cast vote transaction', error);
	}
}).tag('@stress');

Scenario('Register and transfer from Multi-signature account', async () => {
	output.print(
		'==========Start multi signature transaction Stress Test=========='
	);

	try {
		const multiSigRegistrationAccounts = accounts.map((a, index) => {
			const { passphrase, address } = a;
			const signer1 = accounts[(index + 1) % accounts.length];
			const signer2 = accounts[(index + 2) % accounts.length];
			const params = {
				numberOfSignatures: 2,
				mandatoryKeys: [signer1.publicKey],
				optionalKeys: [signer2.publicKey],
				senderPassphrase: passphrase,
				passphrases: [signer1.passphrase, signer2.passphrase],
				nonce: '3',
				fee: '100000000',
			};
			contractsByAddress[address] = params;
			return params;
		});

		const result = await I.registerMultipleMultisignature(
			multiSigRegistrationAccounts
		);

		await I.waitUntilTransactionsConfirmed();

		await Promise.all(
			result.map(async a => {
				const api = await I.call();

				const account = await api.getAccounts({ address: a.senderId });
				expect(account.data[0].keys).to.deep.equal({
					optionalKeys: a.asset.optionalKeys,
					mandatoryKeys: a.asset.mandatoryKeys,
					numberOfSignatures: a.asset.numberOfSignatures,
				});
			})
		);
		output.print(
			'==========End multi signature transaction Stress Test=========='
		);

		// output.print('==========Start transfer from multi signature account Stress Test==========');
		// const LSK_TOKEN = 1;
		// const transferToAccounts = accounts.map(a => ({
		// 	recipientId: a.address,
		// 	amount: TO_BEDDOWS(LSK_TOKEN),
		// 	fee: '1000000000',
		// 	nonce: '65',
		// 	passphrases: [...contractsByAddress[a.address].passphrases],
		// 	keys: {
		// 		mandatoryKeys: contractsByAddress[a.address].mandatoryKeys,
		// 		optionalKeys: contractsByAddress[a.address].optionalKeys,
		// 	},
		// }));

		// const transferTransactions = await I.transferToMultipleAccounts(
		// 	transferToAccounts
		// );

		// await I.waitUntilTransactionsConfirmed();

		// await Promise.all(
		// 	transferTransactions.map(trx =>
		// 		I.validateTransaction(trx.id, trx.asset.recipientId, LSK_TOKEN)
		// 	)
		// );

		// output.print('==========End transfer from multi signature account Stress Test==========');
	} catch (error) {
		output.print(
			'Error while processing register multi-signature account transaction',
			error
		);
	}
}).tag('@stress');

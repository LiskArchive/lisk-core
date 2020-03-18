const output = require('codeceptjs').output;
const {
	TO_BEDDOWS,
	getFixtureUser,
	from,
	TRS_PER_BLOCK,
} = require('../../utils');

const I = actor();

Given('I have list of clients', async () => {
	try {
		const api = await I.call();
		const inValidAddresses = api.peers.filter(
			address => typeof address !== 'string'
		);

		expect(inValidAddresses).to.be.an('array').that.is.empty;
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Given('The delegates are enabled to forge', async () => {
	try {
		await I.checkIfDelegatesAreForging();
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Given('The network is moving', async () => {
	try {
		await I.checkIfNetworkIsMoving();
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Given('{int} lisk accounts exists with minimum balance', async count => {
	try {
		const amount = 0.1;
		const transfers = [];

		const randomAccounts = new Array(count)
			.fill(0)
			.map(() => I.createAccount());

		randomAccounts.forEach(async account => {
			const trx = await I.transfer({
				recipientId: account.address,
				amount: TO_BEDDOWS(amount),
			});
			transfers.push(trx);
		});

		await I.waitUntilTransactionsConfirmed();

		transfers.forEach(async ({ id, recipientId }) =>
			I.validateTransaction(id, recipientId, amount)
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Given(
	'{string} has a lisk account with balance {int} LSK tokens',
	async (userName, balance) => {
		try {
			const { address } = getFixtureUser('username', userName);
			await I.haveAccountWithBalance(address, balance);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Given('{string} has a account with second signature', async userName => {
	try {
		const { address, passphrase, secondPassphrase } = getFixtureUser(
			'username',
			userName
		);
		await I.haveAccountWithSecondSignature(
			address,
			passphrase,
			secondPassphrase
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Given('{string} has a account registered as delegate', async userName => {
	try {
		const { username, address, passphrase } = getFixtureUser(
			'username',
			userName
		);
		await I.haveAccountRegisteredAsDelegate({
			username,
			address,
			passphrase,
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Given(
	'{string} creates a multisignature account with {string}, {string}',
	async (user1, user2, user3) => {
		try {
			const { passphrase, address } = getFixtureUser('username', user1);
			const signer1 = getFixtureUser('username', user2);
			const signer2 = getFixtureUser('username', user3);
			const contracts = [signer1, signer2];
			const params = {
				lifetime: 1,
				minimum: 2,
				passphrase,
			};

			const isExists = await I.checkIfMultisigAccountExists(address, contracts);
			if (!isExists) {
				await from(I.registerMultisignature(contracts, params));
			}
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

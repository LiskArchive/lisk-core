const output = require('codeceptjs').output;
const {
	TO_BEDDOWS,
	getFixtureUser,
	GENESIS_ACCOUNT: { address: genesisAddress },
	from,
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
		const api = await I.call();
		const {
			result: {
				data: [{ nonce }],
			},
		} = await from(api.getAccounts({ address: genesisAddress }));

		randomAccounts.forEach(async account => {
			const trx = await I.transfer({
				recipientId: account.address,
				amount: TO_BEDDOWS(amount),
				nonce: (parseInt(nonce, 10) + 1).toString(),
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
			nonce: '1',
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
			const multiSigRegistrationAccount = {
				numberOfSignatures: 2,
				mandatoryKeys: [signer1.publicKey],
				optionalKeys: [signer2.publicKey],
				senderPassphrase: passphrase,
				passphrases: [signer1.passphrase, signer2.passphrase],
				nonce: '2',
				fee: '100000000',
			};

			const api = await I.call();
			const account = await api.getAccounts({ address });

			if (
				!(
					account.data[0].keys.mandatoryKeys[0] ===
					multiSigRegistrationAccount.mandatoryKeys[0]
				)
			) {
				await I.registerMultipleMultisignature(multiSigRegistrationAccount);
			}
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

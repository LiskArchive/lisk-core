const output = require('codeceptjs').output;
const { transactions } = require('lisk-elements');
const {
	getFixtureUser,
	from,
	TO_BEDDOWS,
	TRS_PER_BLOCK,
} = require('../../utils');
const { networkIdentifier } = require('../../fixtures');

const I = actor();
let response;
let multisignatureTrx;
let signatures;

When(
	'{string} send {int} LSK token to {int} random accounts',
	async (userName, amount, walletCount) => {
		try {
			const { passphrase } = getFixtureUser('username', userName);
			const seed = new Array(walletCount).fill(0);
			const randomAccounts = await Promise.all(
				seed.map(() => I.createAccount())
			);

			const transfers = randomAccounts.map(a => ({
				recipientId: a.address,
				amount: TO_BEDDOWS(amount),
				passphrase,
				networkIdentifier,
			}));

			const trxs = transfers.map(t => transactions.transfer(t));

			await from(
				Promise.all(trxs.map(t => I.broadcastAndValidateTransaction(t)))
			);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then(
	'I should get list of transactions in {string} queue',
	async (state1, state2) => {
		try {
			const api = await I.call();

			response = await from(api.getTransactionsByState(state1));
			expect(response.error).to.be.null;
			await I.expectResponseToBeValid(response.result, 'TransactionsResponse');

			await I.wait(1000);

			response = await from(api.getTransactionsByState(state2));
			expect(response.error).to.be.null;
			await I.expectResponseToBeValid(response.result, 'TransactionsResponse');

			const pendingTrxCount = await I.getPendingTransactionCount();
			await I.waitForBlock(Math.ceil(pendingTrxCount / TRS_PER_BLOCK));
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

When(
	'{string} sends {int} LSK token to a random account',
	async (userName, amount) => {
		try {
			const { passphrase } = getFixtureUser('username', userName);
			const { address } = await I.createAccount();

			multisignatureTrx = transactions.transfer({
				recipientId: address,
				amount: TO_BEDDOWS(amount),
				passphrase,
				networkIdentifier,
			});

			response = await from(
				I.broadcastAndValidateTransaction(multisignatureTrx)
			);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then('I should get list of transactions in {string} queue', async state => {
	try {
		const api = await I.call();

		response = await from(api.getTransactionsByState(state));
		expect(response.error).to.be.null;
		await I.expectResponseToBeValid(response.result, 'TransactionsResponse');
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When(
	'{string} and {string} sends the required signature',
	async (user1, user2) => {
		try {
			const signer1 = getFixtureUser('username', user1);
			const signer2 = getFixtureUser('username', user2);
			const contracts = [signer1, signer2];

			signatures = await I.createSignatures(contracts, multisignatureTrx);

			await Promise.all(
				signatures.map(s => I.broadcastAndValidateSignature(s))
			);
			await I.waitForTransactionToConfirm(multisignatureTrx.id);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then('multisignature transaction should get confirmed', async () => {
	try {
		const api = await I.call();

		const { result, error } = await from(
			api.getTransactions({ id: multisignatureTrx.id })
		);

		expect(error).to.be.null;
		signatures.forEach(s => {
			expect(result.data[0].signatures.includes(s.signature)).to.be.true;
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

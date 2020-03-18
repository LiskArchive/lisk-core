const output = require('codeceptjs').output;
const { TO_BEDDOWS, from } = require('../../utils');

const I = actor();
const transactions = [];
let userAccounts;
const secondPassphrase =
	'wagon stock borrow episode laundry kitten salute link globe zero feed marble';

const getUserAddress = (accounts, userName) =>
	accounts.filter(u => u.user === userName)[0].acc.address;

Given('I have account {string}', async users => {
	try {
		userAccounts = await Promise.all(
			users.split(',').map(async user => {
				const acc = await I.createAccount();
				return { user: user.trim(), acc };
			})
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(
	'I transfer {int}LSK to account {string} from genesis account',
	async (amount, user) => {
		try {
			const trx = await I.transfer(
				{
					recipientId: getUserAddress(userAccounts, user),
					amount: TO_BEDDOWS(amount),
				},
				0
			);

			trx.action = user;
			transactions.push(trx);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then(
	'I wait for transactions {string} to get confirmed in blockchain',
	async users => {
		try {
			const trxs = users
				.split(',')
				.map(user => transactions.find(t => t.action === user.trim()));

			await Promise.all(
				trxs.map(async trx => I.waitForTransactionToConfirm(trx.id))
			);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then(
	'I transfer {string}LSK from account {string} to {string}',
	async (amount, fromAcc, toAcc) => {
		try {
			const user = `${fromAcc}to${toAcc}`;
			const trx = await I.transfer(
				{
					recipientId: getUserAddress(userAccounts, toAcc),
					amount: TO_BEDDOWS(amount),
					data: user,
					passphrase: userAccounts.filter(u => u.user === fromAcc)[0].acc
						.passphrase,
				},
				0
			);

			trx.action = user;
			transactions.push(trx);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then(
	'I transfer {string}LSK from second signature account {string} to {string}',
	async (amount, fromAcc, toAcc) => {
		try {
			const user = `${fromAcc}to${toAcc}`;
			const trx = await I.transfer(
				{
					recipientId: getUserAddress(userAccounts, toAcc),
					amount: TO_BEDDOWS(amount),
					data: user,
					passphrase: userAccounts.filter(u => u.user === fromAcc)[0].acc
						.passphrase,
				},
				0
			);

			trx.action = user;
			transactions.push(trx);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then('I register second passphrase on account {string}', async user => {
	try {
		const { address, passphrase } = userAccounts.filter(
			u => u.user === user
		)[0].acc;

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

Then(
	'I wait for {string} blocks to make sure consicutive transactions included in one block',
	async () => {
		try {
			await I.waitUntilTransactionsConfirmed();
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then(
	'I expect transfer {string}LSK from {string} to {string} should succeeded',
	async (amount, fromUser, toUser) => {
		try {
			const api = await I.call();

			const { id } = transactions.find(
				t => t.action === `${fromUser}to${toUser}`
			);
			await I.waitForTransactionToConfirm(id);
			const { result, error } = await from(api.getTransactions({ id }));
			expect(error).to.be.null;
			expect(result.data[0].asset.amount).to.deep.equal(TO_BEDDOWS(amount));
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then(
	'I expect transfer {string}LSK from {string} to {string} should fail',
	async (amount, fromUser, toUser) => {
		try {
			const api = await I.call();
			const { id } = transactions.find(
				t => t.action === `${fromUser}to${toUser}`
			);
			const { result, error } = await from(api.getTransactionsFromPool({ id }));

			expect(error).to.be.null;
			result.map(r => expect(r.data).to.be.an('array').that.is.empty);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

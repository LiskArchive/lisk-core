const output = require('codeceptjs').output;
const {
	getFixtureUser,
	TO_BEDDOWS,
	GENESIS_ACCOUNT,
	from,
	TRS_PER_BLOCK,
} = require('../../utils');

const I = actor();
let multisigAccount;
let params;
let contracts;

Then(
	'{string}, {string} has a multisignature account with {string}',
	async (user1, user2, user3) => {
		try {
			const signer1 = getFixtureUser('username', user1);
			const signer2 = getFixtureUser('username', user2);
			const api = await I.call();

			multisigAccount = getFixtureUser('username', user3);
			contracts = [signer1, signer2];

			const account = await api.getMultisignatureGroups(
				multisigAccount.address
			);
			await I.expectMultisigAccountToHaveContracts(account, contracts);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Given(
	'I have {int} lisk account with {int} LSK tokens',
	async (userCount, amount) => {
		try {
			const wallets = new Array(userCount).fill(0);
			contracts = await Promise.all(wallets.map(() => I.createAccount()));
			const transfers = contracts.map(a => ({
				recipientId: a.address,
				amount: TO_BEDDOWS(amount),
				passphrase: GENESIS_ACCOUNT.password,
			}));

			const trxs = await I.transferToMultipleAccounts(transfers);
			const NUMBER_OF_BLOCKS = Math.ceil(trxs.length / TRS_PER_BLOCK);
			await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

			await trxs.map(t =>
				I.validateTransaction(
					t.id,
					t.recipientId,
					amount,
					GENESIS_ACCOUNT.address
				)
			);

			multisigAccount = contracts.pop();
		} catch (error) {
			output.error('TYPE_4_REGISTER_MULTI_SIGNATURE: ', error);
		}
	}
);

When('I create a multisignature account with {int} accounts', async count => {
	try {
		params = {
			lifetime: 1,
			minimum: count,
			maximum: count,
			passphrase: multisigAccount.passphrase,
		};

		await I.registerMultisignature(contracts, params);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(
	'I should be able to transact using multisignature account I created',
	async () => {
		try {
			const api = await I.call();
			const { address } = getFixtureUser('username', 'loki');
			const { passphrase } = multisigAccount;

			const transaction = await I.transfer({
				recipientId: address,
				amount: TO_BEDDOWS(1),
				passphrase,
			});

			await I.sendSignaturesForMultisigTrx(transaction, contracts);

			await I.waitForTransactionToConfirm(transaction.id);

			const { result, error } = await from(
				api.getTransactions({
					id: transaction.id,
					senderId: multisigAccount.address,
					recipientId: address,
				})
			);

			expect(error).to.be.null;
			expect(result.data[0].id).to.deep.equal(transaction.id);
			expect(result.data[0].senderId).to.deep.equal(multisigAccount.address);
			expect(result.data[0].recipientId).to.deep.equal(address);
			expect(result.data[0].signatures).to.have.lengthOf(contracts.length);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

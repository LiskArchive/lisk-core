const { TO_BEDDOWS, from } = require('../../utils');

const I = actor();
const transactions = [];
let users = ['A', 'B', 'X', 'Y', 'Z'];

const getUserAddress = userName => users.filter(u => u.user === userName)[0].acc.address;

Given('I have account A, B, X, Y, Z', async () => {
	users = await Promise.all(users.map(async user => {
		const acc = await I.createAccount();
		return { user, acc };
	}));
});

When('I transfer {int}LSK to account {string} and {string} from genesis account', async (amount, userA, userB) => {
	const trxA = await I.transfer({
		recipientId: getUserAddress(userA),
		amount: TO_BEDDOWS(amount),
	}, 0);

	const trxB = await I.transfer({
		recipientId: getUserAddress(userB),
		amount: TO_BEDDOWS(amount),
	}, 0);

	await I.waitForTransactionToConfirm(trxA.id);
	await I.waitForTransactionToConfirm(trxB.id);
});

Then('lisk account {string} and {string} should be created with balance {int}LSK', async (userA, userB, amount) => {
	const api = await I.call();
	const response1 = await from(api.getAccounts({ address: getUserAddress(userA) }));
	const response2 = await from(api.getAccounts({ address: getUserAddress(userB) }));

	[response1, response2].forEach(res => {
		expect(res.error).to.be.null;
		I.expectResponseToBeValid(res.result, 'AccountsResponse');
		expect(res.result.data[0].balance).to.deep.equal(TO_BEDDOWS(amount));
	});
});

Then('I transfer {string}LSK from account {string} to {string}', async (amount, fromAcc, toAcc) => {
	const trx = await I.transfer({
		recipientId: getUserAddress(toAcc),
		amount: TO_BEDDOWS(amount),
		passphrase: users.filter(u => u.user === fromAcc)[0].acc.passphrase,
	}, 0);
	const user = `${fromAcc}to${toAcc}`;
	trx.action = user;
	transactions.push(trx);
	console.log(trx.id, trx.action);
});

Then('I wait for a block', async () => {
	await I.waitForBlock(2);
});

Then('I expect transfer {string}LSK from A to X should be succeeded', async amount => {
	const api = await I.call();
	const { id } = transactions.find(t => t.action === 'AtoX');
	const { result, error } = await from(api.getTransactions({ id }));
	expect(error).to.be.null;
	expect(result.data[0].amount).to.deep.equal(TO_BEDDOWS(amount));
});

Then('I expect transfer {string}LSK from B to Y should be succeeded', async amount => {
	const api = await I.call();
	const { id } = transactions.find(t => t.action === 'BtoY');
	const { result, error } = await from(api.getTransactions({ id }));
	expect(error).to.be.null;
	expect(result.data[0].amount).to.deep.equal(TO_BEDDOWS(amount));
});

Then('I expect transfer {string}LSK from A to B should fail', async () => {
	const api = await I.call();
	const { id } = transactions.find(t => t.action === 'AtoB');
	const { result, error } = await from(api.getTransactionsFromPool({ id }));

	expect(error).to.be.null;
	result.map(r => expect(r.data).to.be.an('array').that.is.empty);
});

Then('I expect transfer {string}LSK from B to z should fail', async () => {
	const api = await I.call();
	const { id } = transactions.find(t => t.action === 'BtoZ');
	const { result, error } = await from(api.getTransactionsFromPool({ id }));

	expect(error).to.be.null;
	result.map(r => expect(r.data).to.be.an('array').that.is.empty);
});

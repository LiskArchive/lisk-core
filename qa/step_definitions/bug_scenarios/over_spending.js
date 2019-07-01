const { TO_BEDDOWS, from } = require('../../utils');

const I = actor();
let account;
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

Then('I transfer {float}LSK from account {string} to {string}', async (amount, userA, userX) => {
	const atox = await I.transfer({
		recipientId: getUserAddress(userX),
		amount: TO_BEDDOWS(amount),
		passphrase: users.filter(u => u.user === userA)[0].acc.passphrase,
	}, 0);
	transactions.push({ atox });
});

Then('I transfer {float}LSK from account {string} to {string}', async (amount, userB, userY) => {
	const btoy = await I.transfer({
		recipientId: getUserAddress(userY),
		amount: TO_BEDDOWS(amount),
		passphrase: users.filter(u => u.user === userB)[0].acc.passphrase,
	}, 0);
	transactions.push({ btoy });
});

Then('I transfer {float}LSK from account {string} to {string}', async (amount, userA, userB) => {
	const atob = await I.transfer({
		recipientId: getUserAddress(userB),
		amount: TO_BEDDOWS(amount),
		passphrase: users.filter(u => u.user === userA)[0].acc.passphrase,
	}, 0);
	transactions.push({ atob });
});

Then('I transfer {float}LSK from account {string} to {string}', async (amount, userB, userZ) => {
	const btoz = await I.transfer({
		recipientId: getUserAddress(userZ),
		amount: TO_BEDDOWS(amount),
		passphrase: users.filter(u => u.user === userB)[0].acc.passphrase,
	}, 0);
	transactions.push({ btoz });
});

Then('I wait for a block', async () => {
	await I.waitForBlock(2);
});

Then('I expect transfer {float}LSK from A to X should be succeeded', async amount => {
	const api = await I.call();
	const { id } = transactions.filter(t => t.atox);
	const { result, error } = await from(api.getTransactions({ id }));

	expect(error).to.be.null;
	expect(result.data[0].balance).to.deep.equal(TO_BEDDOWS(amount));
});

Then('I expect transfer {float}LSK from B to Y should be succeeded', async amount => {
	const api = await I.call();
	const { id } = transactions.filter(t => t.btoy);
	const { result, error } = await from(api.getTransactions({ id }));

	expect(error).to.be.null;
	expect(result.data[0].balance).to.deep.equal(TO_BEDDOWS(amount));
});

Then('I expect transfer {float}LSK from A to B should be failed', async () => {
	const api = await I.call();
	const { id } = transactions.filter(t => t.btoy);
	const { error } = await from(api.getTransactions({ id }));

	expect(error).to.be.not.null;
});

Then('I expect transfer {float}LSK from B to z should be failed', async () => {
	const api = await I.call();
	const { id } = transactions.filter(t => t.btoy);
	const { error } = await from(api.getTransactions({ id }));

	expect(error).to.be.not.null;
});

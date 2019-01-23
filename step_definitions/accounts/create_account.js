const { TO_BEDDOWS } = require('../../utils');

const I = actor();
let account;

When('I create a lisk account', async () => {
	account = await I.createAccount();
	const { passphrase, publicKey, address } = account;

	expect(passphrase).to.be.a('string');
	expect(passphrase.split(' ')).to.have.lengthOf(12);
	expect(publicKey).to.be.a('string');
	expect(address).to.be.a('string');
});

Then(/transfer (\d+)LSK to account from genesis account/, async amount => {
	await I.haveAccountWithBalance(account.address, amount);
});

Then(/lisk account should be created with balance (\d+)LSK/, async amount => {
	const api = await I.call();
	const result = await api.getAccounts({ address: account.address });
	expect(result.data[0].address).to.deep.equal(account.address);
	expect(result.data[0].balance).to.deep.equal(TO_BEDDOWS(amount));
});

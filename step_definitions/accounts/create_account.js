const {
	transaction: { utils },
} = require('lisk-elements');
const { TO_BEDDOWS, from } = require('../../utils');

const I = actor();
let account;

When('I create a lisk account', async () => {
	account = await I.createAccount();
	const { passphrase, publicKey, address } = account;

	expect(passphrase).to.be.a('string');
	expect(passphrase.split(' ')).to.have.lengthOf(12);
	expect(publicKey).to.be.a('string');
	expect(address).to.be.a('string');
	expect(utils.validatePublicKey(publicKey)).to.deep.equal(true);
	expect(utils.validateAddress(address)).to.deep.equal(true);
});

Then(/transfer (\d+)LSK to account from genesis account/, async amount => {
	const trx = await I.transfer({
		recipientId: account.address,
		amount: TO_BEDDOWS(amount),
	});

	await I.waitForTransactionToConfirm(trx.id);
});

Then(/lisk account should be created with balance (\d+)LSK/, async amount => {
	const api = await I.call();
	const response = await from(api.getAccounts({ address: account.address }));

	expect(response.error).to.be.null;
	await I.expectResponseToBeValid(response.result, 'AccountsResponse');
	expect(response.result.data[0].address).to.deep.equal(account.address);
	expect(response.result.data[0].balance).to.deep.equal(TO_BEDDOWS(amount));
});

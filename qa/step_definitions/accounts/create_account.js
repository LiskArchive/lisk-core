const output = require('codeceptjs').output;
const { validator } = require('lisk-elements');
const liskUtils = require('../../utils');

const I = actor();
let account;

When('I create a lisk account', async () => {
	try {
		account = await I.createAccount();
		const { passphrase, publicKey, address } = account;

		expect(passphrase).to.be.a('string');
		expect(passphrase.split(' ')).to.have.lengthOf(12);
		expect(publicKey).to.be.a('string');
		expect(address).to.be.a('string');
		expect(validator.validatePublicKey(publicKey)).to.deep.equal(true);
		expect(validator.validateAddress(address)).to.deep.equal(true);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(/transfer (\d+)LSK to account from genesis account/, async amount => {
	try {
		const trx = await I.transfer({
			recipientId: account.address,
			amount: liskUtils.TO_BEDDOWS(amount),
			nonce: '1',
		});

		await I.waitForTransactionToConfirm(trx.id);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(/lisk account should be created with balance (\d+)LSK/, async amount => {
	try {
		const api = await I.call();
		const response = await liskUtils.from(
			api.getAccounts({ address: account.address })
		);

		expect(response.error).to.be.null;
		await I.expectResponseToBeValid(response.result, 'AccountsResponse');
		expect(response.result.data[0].address).to.deep.equal(account.address);
		expect(response.result.data[0].balance).to.deep.equal(
			liskUtils.TO_BEDDOWS(amount)
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

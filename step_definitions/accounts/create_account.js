const output = require('codeceptjs').output;
const expect = require('chai').expect;

const I = actor();
const transfers = [];

When('I create a lisk account', async userTable => {
	try {
		userTable.rows.forEach(async (c, i) => {
			if (i < 1) {
				return; // skip a header of a table
			}
			const userName = c.cells[0].value;
			const account = await I.createAccount();
			const { passphrase, publicKey, address } = account;

			expect(passphrase).to.be.a('string');
			expect(passphrase.split(' ')).to.have.lengthOf(12);
			expect(publicKey).to.be.a('string');
			expect(address).to.be.a('string');

			await I.addAccount(userName, account);
		});
	} catch (error) {
		output.error(error);
	}
});

Then(/transfer (\d+)LSK to all account from genesis account/, async amount => {
	try {
		const accounts = Object.values(await I.getAllAccount());

		accounts.forEach(async account => {
			const trx = await I.haveAccountWithBalance(account.address, amount);
			transfers.push(trx);
		});
	} catch (error) {
		output.error(error);
	}
});

Then(/Validate if (\d+)LSK was transfered was successful/, async amount => {
	try {
		if (transfers.length > 0) {
			await I.waitForBlock();
			transfers.forEach(async ({ id, recipientId }) => {
				await I.validateTransaction(id, recipientId, amount);
			});
		}
	} catch (error) {
		output.error(error);
	}
});

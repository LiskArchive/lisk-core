const expect = require('chai').expect;

const I = actor();
let transfers = [];

When("I create a lisk account", async function (userTable) {
  const api = await I.call();

  userTable.rows.forEach(async (c, i) => {
    if (i < 1) {
      return; // skip a header of a table
    }
    const userName = c.cells[0].value;
    const account = { passphrase, publicKey, address } = api.createAccount();

    expect(passphrase).to.be.a('string');
    expect(passphrase.split(' ')).to.have.lengthOf(12);
    expect(publicKey).to.be.a('string');
    expect(address).to.be.a('string');

    await I.addAccount(userName, account);
  });
});

Then(/transfer (\d+)LSK to all account from genesis account/, async function (amount) {
  const accounts = Object.values(await I.getAllAccount());

  accounts.forEach(async (account) => {
    const recipientId = account.address;

    const trx = await I.transfer(recipientId, amount);
    transfers.push(trx);
  });
});

Then(/Validate if (\d+)LSK was transfered was successful/, async function (amount) {
  await I.waitForBlock();

  transfers.forEach(async ({ id, recipientId }) => {
    await I.validateTransfer(id, recipientId, amount)
  })
})

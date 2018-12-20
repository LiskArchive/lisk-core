const { getFixtureUser, LISK, GENESIS_ACCOUNT, from } = require('../../utils');

const I = actor();
let multisigAccount;
let params;
let contracts;

Then('{string}, {string} has a multisignature account with {string}', async (user1, user2, user3) => {
  const signer1 = getFixtureUser('username', user1);
  const signer2 = getFixtureUser('username', user2);
  const api = await I.call();

  multisigAccount = getFixtureUser('username', user3);
  contracts = [signer1, signer2];

  const account = await api.getMultisignatureGroups(multisigAccount.address);
  await I.expectMultisigAccountToHaveContracts(account, contracts);
});

Given('I have {int} lisk account with {int} LSK tokens', async (userCount, amount) => {
  const wallets = new Array(userCount).fill(0);
  contracts = await Promise.all(wallets.map(() => I.createAccount()));
  const tranfers = contracts.map(a => ({ recipientId: a.address, amount: LISK(amount), passphrase: GENESIS_ACCOUNT.password }));

  await I.transferToMultiple(tranfers)
  multisigAccount = contracts.pop();
});

When('I create a multisignature account with {int} accounts', async () => {
  params = {
    lifetime: 1,
    minimum: 15,
    maximum: 15,
    passphrase: multisigAccount.passphrase,
  };

  await I.registerMultisignature(contracts, params);
});

Then('I should be able to transact using multisignature account I created', async () => {
  const api = await I.call();
  const { address } = getFixtureUser('username', 'loki');
  const { passphrase } = multisigAccount;

  const transaction = await I.transfer({ recipientId: address, amount: LISK(1), passphrase });

  await I.sendSignaturesForMultisigTrx(transaction, contracts);
  const confirmedMultiSigTrx = await from(api.getTransactions({
    id: transaction.id,
    senderId: multisigAccount.address,
    recipientId: address,
  }));
  expect(confirmedMultiSigTrx.error).to.be.null;
  expect(confirmedMultiSigTrx.result.data[0].id).to.deep.equal(transaction.id);
  expect(confirmedMultiSigTrx.result.data[0].signatures).to.have.lengthOf(contracts.length);
});

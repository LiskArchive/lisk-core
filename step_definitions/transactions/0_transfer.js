const { getFixtureUser, BEDDOWS } = require('../../utils');

const I = actor();

Then('{string} should be able to send {int}LSK tokens to {string}', async (user1, amount, user2) => {
  const sender = getFixtureUser(user1);
  const recipient = getFixtureUser(user2);

  const transfer = await I.transfer({ recipientId: recipient.address, amount: BEDDOWS(amount), passphrase: sender.passphrase });
  await I.waitForBlock();
  await I.validateTransaction(transfer.id, recipient.address, amount, sender.address);
});

Then('{string} should be able to send {int}LSK tokens to himself', async (user, amount) => {
  const { address, passphrase } = getFixtureUser(user);

  const transfer = await I.transfer({ recipientId: address, amount: BEDDOWS(amount), passphrase });
  await I.waitForBlock();
  await I.validateTransaction(transfer.id, address, amount, address);
});

const { ASGARD_FIXTURE } = require('../../fixtures');
const { LISK, getFixtureUser } = require('../../utils');

const I = actor();

Given('I have list of clients', async function () {
    const api = await I.call();
    const addresses = [...api.seed, ...api.nodes];
    const inValidAddresses = addresses.filter(address => typeof address !== 'string');

    expect(inValidAddresses).to.be.an('array').that.is.empty;
});

Given('The node is forging', async function () {
    return 'pending';
});

Given('The network is moving', async function () {
    return 'pending';
});

Given('{int} lisk accounts exists with minimum balance', async (count) => {
    const amount = 0.1;
    const transfers = [];
    const api = await I.call();

    const randomAccounts = new Array(count).fill(0).map(() => api.createAccount());

    randomAccounts.forEach(async (account) => {
        const trx = await I.transfer(account.address, amount)
        transfers.push(trx);
    });

    await I.waitForBlock(count);

    transfers.forEach(async ({ id, recipientId }) => {
        await I.validateTransfer(id, recipientId, amount)
    })
});

Given('{string} has a lisk account with balance {int} LSK tokens', async function (userName, balance) {
    const { address } = getFixtureUser('username', userName);
    await I.haveAccountWithBalance(address, balance);
});

Given('{string} has a account with second signature', async function (userName) {
    const { address, passphrase, secondPassphrase } = getFixtureUser('username', userName);
    await I.haveAccountWithSecondSignature(address, passphrase, secondPassphrase);
});

Given('{string} has a account registered as delegate', async function (userName) {
    const { username, address, passphrase, secondPassphrase } = getFixtureUser('username', userName);
    await I.haveAccountRegisteredAsDelegate(username, address, passphrase, secondPassphrase);
});

Given('{string} has a multisignature account with {string}, {string}', async function (user1, user2, user3) {
    const requester = { passphrase, secondPassphrase } = getFixtureUser('username', user1);
    const signer1 = getFixtureUser('username', user2);
    const signer2 = getFixtureUser('username', user3);
    const keepers = [signer1, signer2];
    const params = {
        lifetime: 1,
        minimum: 2,
        passphrase,
    };

    await I.haveMultiSignatureAccount(requester, keepers, params);
});

Then('I have minimum balance in my account for transaction {string}', async function (transactionType, fees) {
    return 'pending';
});

// TODO: Interface for user I to give different type of account
// A<T>

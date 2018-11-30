const I = actor();

Given('I have list of clients', async function () {
    await I.haveClientAddresses()
        .then(addresses => {
            const inValidAddresses = addresses.filter(address => typeof address !== 'string');
            expect(inValidAddresses).to.be.an('array').that.is.empty;
        });
});

Given('The node is forging', function () {
    return 'pending';
});

Given('The network is moving', function () {
    return 'pending';
});

Given('{int} lisk accounts exists with minimum balance', async (count) => {
    const amount = 0.1;
    const transfers = []
    const api = await I.call();
    const accounts = new Array(count).fill(0).map(() => api.createAccount());

    accounts.forEach(async (account) => {
        const trx = await I.transfer(account.address, amount)
        transfers.push(trx);
    });

    await I.waitForBlock(count);

    transfers.forEach(async ({ id, recipientId }) => {
        await I.validateTransfer(id, recipientId, amount)
    })
});

Given('I have a lisk account', function () {
    return 'pending';
});

Given('I have a account with second signature enabled', () => {
    return 'pending';
});

Given('I have a account registered as delegate', () => {
    return 'pending';
});

Given('I have a multisignature account', () => {
    return 'pending';
});

Then('I have minimum balance in my account for transaction {string}', function (transactionType, fees) {
    return 'pending';
});

// TODO: Interface for user I to give different type of account
// A<T>

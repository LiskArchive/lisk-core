const APIClient = require('lisk-elements').APIClient;

const { networkConfig, expect, apiHelper } = global.context;

Given('I have list of clients', function () {
    this.addresses = [...networkConfig.seed, ...networkConfig.nodes];
    const validAddresses = this.addresses.filter(address => typeof address !== 'string');
    expect(validAddresses).to.be.an('array').that.is.empty;
    expect(apiHelper.clients).to.be.an('array');
    apiHelper.clients.forEach(helperClient => {
        expect(this.addresses).that.includes(helperClient.address);
        expect(helperClient.client).to.be.an.instanceof(APIClient);
    });
});

Given('The node is forging', function () {
    return 'pending';
});

Given('The network is moving', function () {
    return 'pending';
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

const APIClient = require('lisk-elements').APIClient;

const { networkConfig, expect, apiHelper } = global.context;

Given("I have list of clients", function() {
    this.addresses = [...networkConfig.seed, ...networkConfig.nodes];
    const validAddresses = this.addresses.filter(address => typeof address !== 'string');
    expect(validAddresses).to.be.an('array').that.is.empty;
    expect(apiHelper.clients).to.be.an('array');
    apiHelper.clients.forEach(helperClient => {
        expect(this.addresses).that.includes(helperClient.address);
        expect(helperClient.client).to.be.an.instanceof(APIClient);
    });
})

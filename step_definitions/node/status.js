const Promise = require('bluebird');
const { expect } = require('chai');
const { api } = require('../../domains');
const { config } = require('../../fixtures/index');

Given("I have the valid address", async function() {
    this.address = config.config().seed;
});

Given("I have a list of valid address", async function() {
    this.address = config.config().nodes;
});

When("I make a get request", async function() {
    this.results = await Promise.all(this.address.map(async (nodeAddress) => {
        return await api.getNodeStatus(nodeAddress);
    }));
});

Then("I should get node status",  async function() {
    this.results.forEach(res => {
        expect(res).to.have.all.keys("meta", "data", "links");
        expect(res.data).to.have.all.keys("broadhash",
            "consensus",
            "currentTime",
            "secondsSinceEpoch",
            "height",
            "loaded",
            "networkHeight",
            "syncing",
            "transactions",
        );
        expect(res.data.transactions).to.have.all.keys("confirmed",
        "unconfirmed",
        "unprocessed",
        "unsigned",
        "total",
        );
    });
});

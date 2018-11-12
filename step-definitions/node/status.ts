import * as Promise from 'bluebird';
import { expect } from "chai";
import { Given, When, Then } from "cucumber";
import { api } from "../../domains";
import { config } from '../../fixtures/index';

Given("I have the valid address", async function() {
    this.address = config.config().seed;
});

Given("I have a list of valid address", async function() {
    this.address = config.config().nodes;
});

When("I make a get request", async function() {
    this.results = await Promise.all(this.address.map(async (nodeAddress): Promise<string> => {
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

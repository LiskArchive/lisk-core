const Promise = require('bluebird');

const { lisk_schema, expect, apiHelper, networkConfig } = global.context;
const { api_spec: { definitions: { NodeStatusResponse, NodeStatus } } } = lisk_schema;
const addresses = [networkConfig.seed, networkConfig.nodes];

NodeStatusResponse.properties.data = NodeStatus;

When("I request for node status", async () => {
    this.results = await Promise.all(addresses.map(async address => await apiHelper.getNodeStatus(address)));
});

Then("I should get node status", async () => {
    await this.results.forEach(res => {
        expect(res).to.be.jsonSchema(NodeStatusResponse);
    });
});

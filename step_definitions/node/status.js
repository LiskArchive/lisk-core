const Promise = require('bluebird');

const { lisk_schema, expect, apiHelper } = global.context;
const { api_spec: { definitions: { NodeStatusResponse, NodeStatus } } } = lisk_schema;

NodeStatusResponse.properties.data = NodeStatus;

let nodeStatus = [];

When("I request for node status", async function() {
    nodeStatus = await Promise.all(this.addresses.map(async address => await apiHelper.getNodeStatus(address)));
})

Then("I should get node status", async function() {
    await nodeStatus.forEach(res => {
        expect(res).to.be.jsonSchema(NodeStatusResponse);
    });
})

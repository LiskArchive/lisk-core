const Promise = require('bluebird');

const { lisk_schema, expect, apiHelper } = global.context;
const { api_spec: { definitions: { NodeStatusResponse, NodeStatus } } } = lisk_schema;

let nodeStatus = [];

NodeStatusResponse.properties.data = NodeStatus;

When("I request for node status", async function () {
    nodeStatus = await Promise.all(this.addresses.map(async address => await apiHelper.getNodeStatus(address)));
});

Then("I have the status from all the nodes", async function () {
    nodeStatus.forEach(res => {
        expect(res).to.be.jsonSchema(NodeStatusResponse);
    });
});

Then('consensus should be above 50%', () => {
    if (nodeStatus.length > 1) {
        nodeStatus.forEach(res => {
            expect(res.data.consensus).to.be.above(50);
        })
    }
});

Then('networkHeight should be greater than or equal to height', () => {
    nodeStatus.forEach(res => {
        expect(res.data.networkHeight).to.satisfy(nHeight => {
            return nHeight >= res.data.height;
        });
    })
});

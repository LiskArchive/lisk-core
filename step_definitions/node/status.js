const Promise = require('bluebird');
const lisk_schema = require('lisk-schema');

const I = actor();

const { api_spec: { definitions: { NodeStatusResponse, NodeStatus } } } = lisk_schema;

let nodeStatus = [];

NodeStatusResponse.properties.data = NodeStatus;

When("I request for node status", async function () {
    const addresses = await I.haveClientAddresses();
    const api = await I.call();

    nodeStatus = await Promise.all(addresses.map(address => api.getNodeStatus(address)));
});

Then("I have the status from all the nodes", async function () {
    nodeStatus.forEach(res => {
        expect(res).to.be.jsonSchema(NodeStatusResponse);
    });
});

Then('consensus should be above 50%', () => {
    if (nodeStatus.length > 1) {
        nodeStatus.forEach(res => {
            // no check for dev environment
            if (process.env.NETWORK && process.env.NETWORK !== 'development') {
                expect(res.data.consensus).to.be.above(50);
            }
        })
    }
});

Then('networkHeight should be greater than or equal to height', () => {
    nodeStatus.forEach(res => {
        if (process.env.NETWORK && process.env.NETWORK !== 'development') {
            expect(res.data.networkHeight).to.satisfy(nHeight => {
                return nHeight >= res.data.height;
            });
        }
    })
});

const Promise = require('bluebird');

const { lisk_schema, expect, apiHelper } = global.context;
const { api_spec: { definitions: { NodeConstantsResponse, NodeConstants, Fees } } } = lisk_schema;

let results = [];

NodeConstants.properties.fees = Fees;
NodeConstantsResponse.properties.data = NodeConstants;

When('I request for node constants', async function () {
  results = await Promise.all(this.addresses.map(async address => await apiHelper.getNodeConstants(address)));
});

Then('I have the constants from all the nodes', async function () {
  results.forEach(res => {
    expect(res).to.be.jsonSchema(NodeConstantsResponse);
  });
});

Then('should have a valid epoch time', function () {
  results.forEach(res => {
    // TODO: Need to get epoch value from lisk constants for strict compare
    expect(res.data.epoch).to.deep.equal("2016-05-24T17:00:00.000Z");
  });
});

Then('fees should be', function (feeJson) {
  results.forEach(res => {
    expect(res.data.fees).to.deep.equal({
      "send": "10000000",
      "vote": "100000000",
      "secondSignature": "500000000",
      "delegate": "2500000000",
      "multisignature": "500000000",
      "dappRegistration": "2500000000",
      "dappWithdrawal": "10000000",
      "dappDeposit": "10000000"
    });
  });
});

const Promise = require('bluebird');
const { schema } = require('lisk-commons');

const I = actor();

let nodeStatus = [];

When("I request for node status", async function () {
  const api = await I.call();

  nodeStatus = await Promise.all([...api.seed, ...api.nodes].map(address => api.getNodeStatus(address)));
});

Then("I have the status from all the nodes", async function () {
  return nodeStatus.forEach(async res => {
    await I.expectResponseToBeValid(res, 'NodeStatusResponse');
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

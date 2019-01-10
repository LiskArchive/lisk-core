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

Then('networkHeight should be greater than or equal to height', () => {
  nodeStatus.forEach(res => {
    if (process.env.NETWORK && process.env.NETWORK !== 'development') {
      expect(res.data.networkHeight).to.satisfy(nHeight => {
        return nHeight >= res.data.height;
      });
    }
  })
});

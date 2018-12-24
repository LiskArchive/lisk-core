const I = actor();

let results = [];

When('I request for node constants', async function () {
  const api = await I.call();

  results = await Promise.all([...api.seed, ...api.nodes].map(address => api.getNodeConstants(address)));
});

Then('I have the constants from all the nodes', async function () {
  return results.forEach(async res => {
    await I.expectResponseToBeValid(res, 'NodeConstantsResponse');
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

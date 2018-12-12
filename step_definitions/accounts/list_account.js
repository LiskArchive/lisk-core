const { from, getFixtureUser, splitBy } = require('../../utils');

const I = actor();
let response;

When("I look for list of accounts without any params", async function () {
  const api = await I.call();
  response = await from(api.getAccounts());

  expect(response.error).to.deep.equal(null);
});

Then('I should get list of accounts sorted by {string} in {string} order', async function (field, order) {
  await I.expectResponseToBeValid(response.result, 'AccountsResponse');
  await I.expectResponseToBeSortedBy(response.result, field, order);
});

When('I search for a particular account {string}', async function (address) {
  const api = await I.call();
  response = await from(api.getAccounts({ address }));

  expect(response.error).to.deep.equal(null);
  expect(response.result.data[0].address).to.deep.equal(address);
});

Then('I should get my account details', async function () {
  await I.expectResponseToBeValid(response.result, 'AccountsResponse');
});

When('I look for list of account with {string}', async function (params) {
  const api = await I.call();
  const accountParams = splitBy(params, '=');

  response = await from(api.getAccounts(accountParams));
  expect(response.error).to.deep.equal(null);
  await I.expectResponseToBeValid(response.result, 'AccountsResponse');
});

Then('I should get account details according to {string}', async function (params) {
  const accountParams = splitBy(params, '=');

  await I.expectAccountResultToMatchParams(response.result, accountParams);
});

When('{string} requests {string}', async function (username, type) {
  const api = await I.call();
  const account = getFixtureUser('username', username);

  response = await from(api.getMultisignatureGroups(account.address));
});

Then('{string} should get {string} account', async function (username, type) {
  const account = getFixtureUser('username', username);

  expect(response.error).to.deep.equal(null);
  expect(response.result.data[0].address).to.deep.equal(account.address);

  await I.expectResponseToBeValid(response.result, 'MultisignatureGroupsResponse');
});

When('{string} and {string} requests {string} account', async function (user1, user2, type) {
  const api = await I.call();
  const account = getFixtureUser('username', user1);

  response = await from(api.getMultisignatureMemberships(account.address));
  expect(response.error).to.deep.equal(null);

  await I.expectResponseToBeValid(response.result, 'MultisignatureGroupsResponse');
});

Then('{string} and {string} should get {string} account', async function (user1, user2, type) {
  const account1 = getFixtureUser('username', user1);
  const account2 = getFixtureUser('username', user2);
  const members = response.result.data[0].members.map(member => member.address);

  expect(response.error).to.deep.equal(null);
  expect(members).to.include.members([account1.address, account2.address]);

  await I.expectResponseToBeValid(response.result, 'MultisignatureGroupsResponse');
});

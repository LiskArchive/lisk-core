const expect = require('chai').expect;

const I = actor();
let accounts = [];

When("I look for list of accounts without any params", async function () {
  const api = await I.call();
  accounts = await api.getAccounts();
});

Then('I should get list of accounts sorted by {string} in {string} order', function (field, order) {

});

When('I search for a particular account {string}', async function (address) {

})

Then('I should get my account details', async function (address) {

})

When('I look for list of accounts with {string} and {string}', async function (params, value) {

})

Then('I should get account details according to {string} and {string}', async function (params, value) {

})

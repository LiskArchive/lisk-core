const { config } = require('../../fixtures/index');

Given("I have list of addresses", async function() {
    this.address = [...config.config().nodes, ...config.config().seed];
});

When("The node is running", async function() {

});

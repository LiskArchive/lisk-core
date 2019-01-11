const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for blocks without any params', async () => {
	const api = await I.call();

	response = await from(api.getBlocks());
	expect(response.error).to.be.null;
});

Then(
	'I should get list of blocks sorted by {string} in {string} order',
	async (field, order) => {
		await I.expectResponseToBeValid(response.result, 'BlocksResponse');
		await I.expectResponseToBeSortedBy(response.result.data, field, order);
		await I.expectDefaultCount(response.result);
	}
);

When('I request for blocks with {string}', async params => {
	const api = await I.call();

	response = await from(api.getBlocks(splitBy(params)));
	expect(response.error).to.be.null;
});

Then('I should get blocks according to {string}', async params => {
	await I.expectBlockResultToMatchParams(response.result, splitBy(params));
});

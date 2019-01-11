const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for delegates list with {string}', async params => {
	const api = await I.call();

	response = await from(api.getDelegates(splitBy(params)));
	expect(response.error).to.be.null;
});

Then('I should get delegates according to {string}', async params => {
	await I.expectResponseToBeValid(response.result, 'DelegatesResponse');
	await I.expectDelegatesToMatchParams(response.result, splitBy(params));
});

When('I request for forging delegates list with {string}', async params => {
	const api = await I.call();

	response = await from(api.getForgers(splitBy(params)));
	expect(response.error).to.be.null;
});

Then(
	'I should get next forging delegates list according to {string}',
	async params => {
		await I.expectResponseToBeValid(response.result, 'ForgersResponse');
		await I.expectDelegatesToMatchParams(response.result, splitBy(params));
	}
);

When(
	'I request for forging delegates statistics {string} with {string}',
	async (address, params) => {
		const api = await I.call();

		response = await from(api.getForgingStatistics(address, splitBy(params)));
		expect(response.error).to.be.null;
	}
);

Then('I should get forging delegate statistics', async () => {
	await I.expectResponseToBeValid(response.result, 'ForgingStatsResponse');
});

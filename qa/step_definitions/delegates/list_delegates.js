const output = require('codeceptjs').output;
const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for delegates list with {string}', async params => {
	try {
		const api = await I.call();

		response = await from(api.getDelegates(splitBy(params)));
		expect(response.error).to.be.null;
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('I should get delegates according to {string}', async params => {
	try {
		await I.expectResponseToBeValid(response.result, 'DelegatesResponse');
		await I.expectDelegatesToMatchParams(response.result, splitBy(params));
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When('I request for forging delegates list with {string}', async params => {
	try {
		const api = await I.call();

		response = await from(api.getForgers(splitBy(params)));
		expect(response.error).to.be.null;
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(
	'I should get next forging delegates list according to {string}',
	async params => {
		try {
			await I.expectResponseToBeValid(response.result, 'ForgersResponse');
			await I.expectDelegatesToMatchParams(response.result, splitBy(params));
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

When(
	'I request for forging delegates statistics {string} with {string}',
	async (address, params) => {
		try {
			const api = await I.call();

			response = await from(api.getForgingStatistics(address, splitBy(params)));
			expect(response.error).to.be.null;
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then('I should get forging delegate statistics', async () => {
	try {
		await I.expectResponseToBeValid(response.result, 'ForgingStatsResponse');
	} catch (error) {
		output.error(error);
		throw error;
	}
});

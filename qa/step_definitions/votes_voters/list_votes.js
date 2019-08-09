const output = require('codeceptjs').output;
const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for votes with {string}', async params => {
	try {
		const api = await I.call();
		params = splitBy(params);

		response = await from(api.getVotes(params));
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('I should get votes according to {string}', async params => {
	try {
		const { result, error } = response;
		params = splitBy(params);

		expect(error).to.be.null;
		await I.expectResponseToBeValid(result, 'VotesResponse');
		await I.expectVotesResultToMatchParams(result, params);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

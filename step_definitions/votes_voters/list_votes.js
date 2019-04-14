const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for votes with {string}', async params => {
	const api = await I.call();
	params = splitBy(params);

	response = await from(api.getVotes(params));
});

Then('I should get votes according to {string}', async params => {
	const { result, error } = response;
	params = splitBy(params);

	expect(error).to.be.null;
	await I.expectResponseToBeValid(result, 'VotesResponse');
	await I.expectVotesResultToMatchParams(result, params);
});

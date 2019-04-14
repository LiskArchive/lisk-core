const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for voters with {string}', async params => {
	const api = await I.call();
	params = splitBy(params);

	response = await from(api.getVoters(params));
});

Then('I should get voters according to {string}', async params => {
	const { result, error } = response;
	params = splitBy(params);

	expect(error).to.be.null;
	await I.expectResponseToBeValid(result, 'VotersResponse');
	await I.expectVotersResultToMatchParams(result, params);
});

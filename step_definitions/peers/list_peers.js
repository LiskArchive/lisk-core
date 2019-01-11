const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for peers without any params', async () => {
	const api = await I.call();

	response = await from(api.getPeers());
	return expect(response.error).to.be.null;
});

Then('I should get list of peers', async () => {
	await I.expectDefaultCount(response.result);
	await I.expectResponseToBeValid(response.result, 'PeersResponse');
});

Then(
	'Peers should be sorted by {string} in {string} order by default',
	async (sortKey, order) => {
		await I.expectResponseToBeSortedBy(response.result.data, sortKey, order);
	}
);

When('I request for peers with {string}', async () => {
	const api = await I.call();

	response = await from(api.getPeers());
	return expect(response.error).to.be.null;
});

Then('I should get list of peers according to {string}', async params => {
	await I.expectResponseToBeValid(response.result, 'PeersResponse');
	if (process.env.NETWORK && process.env.NETWORK !== 'development') {
		await I.expectResultToMatchParams(response.result, splitBy(params));
	}
});

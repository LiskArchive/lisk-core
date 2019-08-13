const output = require('codeceptjs').output;
const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for peers without any params', async () => {
	try {
		const api = await I.call();

		response = await from(api.getPeers());
		return expect(response.error).to.be.null;
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('I should get list of peers', async () => {
	try {
		await I.expectDefaultCount(response.result);
		await I.expectResponseToBeValid(response.result, 'PeersResponse');
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(
	'Peers should be sorted by {string} in {string} order by default',
	async (sortKey, order) => {
		try {
			await I.expectResponseToBeSortedBy(response.result.data, sortKey, order);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

When('I request for peers with {string}', async params => {
	try {
		const api = await I.call();

		response = await from(api.getPeers(splitBy(params)));
		return expect(response.error).to.be.null;
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('I should get list of peers according to {string}', async params => {
	try {
		await I.expectResponseToBeValid(response.result, 'PeersResponse');
		if (process.env.NETWORK && process.env.NETWORK !== 'development') {
			await I.expectResultToMatchParams(response.result, splitBy(params));
		}
	} catch (error) {
		output.error(error);
		throw error;
	}
});

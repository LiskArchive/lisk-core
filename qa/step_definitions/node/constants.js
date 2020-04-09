const output = require('codeceptjs').output;
const { constants } = require('lisk-elements');

const I = actor();

let results = [];

When('I request for node constants', async () => {
	try {
		const api = await I.call();

		results = await Promise.all(
			api.peers.map(address => api.getNodeConstants(address))
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('I have the constants from all the nodes', async () => {
	try {
		results.forEach(async res => {
			await I.expectResponseToBeValid(res, 'NodeConstantsResponse');
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('should have a valid epoch time', () => {
	try {
		results.forEach(res => {
			expect(new Date(res.data.epoch)).to.deep.equal(
				new Date(constants.EPOCH_TIME)
			);
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

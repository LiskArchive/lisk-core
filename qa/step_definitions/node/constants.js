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

Then('fees should be', () => {
	try {
		results.forEach(res => {
			expect(res.data.fees).to.deep.equal({
				send: '10000000',
				vote: '100000000',
				secondSignature: '500000000',
				delegate: '2500000000',
				multisignature: '500000000',
				dappRegistration: '2500000000',
				dappWithdrawal: '10000000',
				dappDeposit: '10000000',
			});
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

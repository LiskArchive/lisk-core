const { constants } = require('lisk-elements').transaction;

const I = actor();

let results = [];

When('I request for node constants', async () => {
	const api = await I.call();

	results = await Promise.all(
		[api.seed, ...api.peers].map(address => api.getNodeConstants(address))
	);
});

Then('I have the constants from all the nodes', async () =>
	results.forEach(async res => {
		await I.expectResponseToBeValid(res, 'NodeConstantsResponse');
	})
);

Then('should have a valid epoch time', () => {
	results.forEach(res => {
		expect(new Date(res.data.epoch)).to.deep.equal(
			new Date(constants.EPOCH_TIME)
		);
	});
});

Then('fees should be', () => {
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
});

const output = require('codeceptjs').output;

const I = actor();

let nodeStatus = [];

When('I request for node status', async () => {
	try {
		const api = await I.call();

		nodeStatus = await Promise.all(
			api.peers.map(async address => ({
				status: api.getNodeStatus(address),
				address,
			}))
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('I have the status from all the nodes', async () => {
	try {
		const api = await I.call();

		nodeStatus.forEach(async ({ status, address }) => {
			const nodeConstants = await api.getNodeConstants(address);
			if (nodeConstants.data.version >= '2.0.0') {
				const nodeStatusResponse = await status;
				await I.expectResponseToBeValid(
					nodeStatusResponse,
					'NodeStatusResponse'
				);
			}
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('networkHeight should be greater than or equal to height', async () => {
	try {
		nodeStatus.forEach(async ({ status }) => {
			if (process.env.NETWORK && process.env.NETWORK !== 'development') {
				const nodeStatusResponse = await status;
				expect(nodeStatusResponse.data.networkHeight).to.satisfy(
					nHeight => nodeStatusResponse.data.height >= nHeight
				);
			}
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

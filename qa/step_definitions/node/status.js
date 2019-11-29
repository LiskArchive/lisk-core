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
		nodeStatus.forEach(async ({ status }) => {
			const nodeStatusResponse = await status;
			await I.expectResponseToBeValid(nodeStatusResponse, 'NodeStatusResponse');
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

const I = actor();

let nodeStatus = [];

When('I request for node status', async () => {
	const api = await I.call();

	nodeStatus = await Promise.all(
		api.peers.map(async address => ({
			status: api.getNodeStatus(address),
			address,
		}))
	);
});

Then('I have the status from all the nodes', async () => {
	const api = await I.call();

	nodeStatus.forEach(async ({ status, address }) => {
		const nodeConstants = await api.getNodeConstants(address);
		if (nodeConstants.data.version >= '2.0.0') {
			const nodeStatusResponse = await status;
			await I.expectResponseToBeValid(nodeStatusResponse, 'NodeStatusResponse');
		}
	});
});

Then('networkHeight should be greater than or equal to height', async () => {
	nodeStatus.forEach(async ({ status }) => {
		if (process.env.NETWORK && process.env.NETWORK !== 'development') {
			const nodeStatusResponse = await status;
			expect(nodeStatusResponse.data.networkHeight).to.satisfy(
				nHeight => nodeStatusResponse.data.height >= nHeight
			);
		}
	});
});

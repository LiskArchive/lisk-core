const I = actor();

let nodeStatus = [];

When('I request for node status', async () => {
	const api = await I.call();

	nodeStatus = await Promise.all(
		api.peers.map(address => api.getNodeStatus(address))
	);
});

Then('I have the status from all the nodes', async () =>
	nodeStatus.forEach(async res => {
		await I.expectResponseToBeValid(res, 'NodeStatusResponse');
	})
);

Then('networkHeight should be greater than or equal to height', () => {
	nodeStatus.forEach(res => {
		if (process.env.NETWORK && process.env.NETWORK !== 'development') {
			expect(res.data.networkHeight).to.satisfy(
				nHeight => res.data.height >= nHeight
			);
		}
	});
});

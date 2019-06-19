Feature('NodeUpgrade: Smoke Test');

Scenario('Node status', async I => {
	const api = await I.call();
	const nodeStatus = await api.getNodeStatus();

	await I.expectResponseToBeValid(nodeStatus, 'NodeStatusResponse');
})
	.tag('@blockchain')
	.tag('@node_status');

Scenario('Blockchain is growing', async I => {
	const api = await I.call();
	const nodeStatus = await api.getNodeStatus();

	await I.expectResponseToBeValid(nodeStatus, 'NodeStatusResponse');
	await I.waitUntilNodeSyncWithNetwork(
		nodeStatus.data.height,
		nodeStatus.data.networkHeight
	);
})
	.tag('@blockchain')
	.tag('@growing');

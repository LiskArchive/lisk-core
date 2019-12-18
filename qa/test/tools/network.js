const output = require('codeceptjs').output;
const fs = require('fs');
const path = require('path');
const { from, config, getIpByDns } = require('../../utils');
const { seedNode } = require('../../fixtures');

const I = actor();
const configPath = () => path.resolve(__dirname, '../../fixtures/config.json');

const splitDelegatesByPeers = (delegates, peers) => {
	try {
		if (peers.length === 0) {
			output.print(
				'\n',
				'***********Please run npm run tools:peers:config to generate peer list*************',
				'\n'
			);
			process.exit(1);
		}

		if (peers.length > 101) {
			peers.splice(101);
		}

		const delegateList = peers.map(() => []);

		let counter = 0;
		while (delegates.length) {
			if (counter > delegateList.length - 1) {
				counter = 0;
			} else {
				const delegate = delegates.shift();
				delegateList[counter].push(delegate);
				counter += 1;
			}
		}

		return delegateList;
	} catch (error) {
		output.error(error);
		throw error;
	}
};

const updateForgingStatus = async ({
	ipAddress,
	delegateList,
	isEnable,
	defaultPassword,
}) => {
	try {
		const api = await I.call();

		return delegateList.map(async delegate => {
			const params = {
				forging: isEnable,
				password: defaultPassword,
				publicKey: delegate.publicKey,
			};

			let res;
			try {
				res = await from(api.updateForgingStatus(params, ipAddress));
				expect(res.error).to.be.null;
				expect(res.result.data[0].forging).to.deep.equal(isEnable);
				output.print(
					`Delegate with publicKey: ${
						delegate.publicKey
					}, forging: ${isEnable} on node: ${ipAddress}`
				);
			} catch (err) {
				output.error(res.error);
				output.error(err);
				output.print(
					`Failed to set forging: ${isEnable} for delegate with publicKey: ${
						delegate.publicKey
					}, on node: ${ipAddress}`
				);
			}
		});
	} catch (error) {
		output.print(error);
		throw error;
	}
};

const enableDisableDelegates = isEnable => {
	const enableOrDisable = isEnable ? 'enable' : 'disable';

	try {
		const {
			peers,
			forging: { defaultPassword, delegates },
		} = config;

		const peerDelegateList = splitDelegatesByPeers(delegates, peers);

		peers.forEach((ipAddress, i) => {
			const delegateList = peerDelegateList[i];

			output.print(
				`${
					delegateList.length
				} delegates ${enableOrDisable}d to on node ===> ${ipAddress}`,
				'\n'
			);

			return updateForgingStatus({
				ipAddress,
				delegateList,
				isEnable,
				defaultPassword,
			});
		});
	} catch (error) {
		output.error(`Failed to ${enableOrDisable} forging due to error: `);
		output.error(error);
		process.exit(1);
	}
};

const checkIfAllPeersConnected = async () => {
	try {
		const allPeers = await I.getAllPeers(100, 0);
		// TODO: Remove this once DO API is stable
		const flakyPeers = 8; // Sometimes DO can not start few nodes so keeping flaky peers into consideration.
		const expectPeerCount =
			(process.env.NODES_PER_REGION || 1) * 10 - 1 - flakyPeers;

		output.print(
			`Number of peers connected in network: ${
				allPeers.length
			}, Expected peers: ${expectPeerCount}`
		);

		while (allPeers.length >= expectPeerCount) {
			return true;
		}
		await I.wait(5000);
		return checkIfAllPeersConnected();
	} catch (error) {
		output.error(error);
		throw error;
	}
};

const getConfigContent = () => {
	try {
		const config_path = configPath();
		const configBuffer = fs.readFileSync(config_path);
		return JSON.parse(configBuffer);
	} catch (error) {
		output.error(error);
		throw error;
	}
};

const updateConfigContent = configContent => {
	try {
		const config_path = configPath();
		fs.writeFileSync(config_path, JSON.stringify(configContent));
		output.print(JSON.stringify(configContent.peers, null, '\t'));
		output.print(
			`Updated ${
				configContent.peers.length
			} peers to config file: ${config_path}`
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
};

const mergePeers = (seedAddress, configContentPeers, allPeers) => {
	// sometimes httpPort will be undefined so giving it 4000 as it will be default

	const peers = allPeers.map(p => `${p.ip}:${p.httpPort || 4000}`);
	const uniquePeers = new Set([seedAddress, ...configContentPeers, ...peers]);
	return [...uniquePeers].slice(0, 101).filter(p => p);
};

Feature('Network tools');

Scenario('List peers', async () => {
	try {
		const allPeers = await I.getAllPeers(100, 0);
		output.print('Peers config list: ', JSON.stringify(allPeers, null, '\t'));
	} catch (error) {
		output.print('Failed to get peers list: ');
		output.error(error);
		process.exit(1);
	}
}).tag('@peers_list');

Scenario('Add seed node to config', async () => {
	try {
		const seedAddress = await getIpByDns(seedNode);
		const configContent = getConfigContent();

		configContent.peers = []; // To avoid duplication first remove everything
		configContent.peers.push(`${seedAddress}:${4000}`);
		updateConfigContent(configContent);
	} catch (error) {
		output.error(error);
	}
}).tag('@seed_node');

Scenario('Add network peers to config', async () => {
	try {
		const partialConnectedPeers = await I.getAllPeers(100, 0);
		const fullPeerList = await Promise.all(
			partialConnectedPeers.map(async p =>
				I.getAllPeers(100, 0, 'connected', `${p.ip}:${p.httpPort}`)
			)
		);
		const allPeers = fullPeerList.reduce((acc, val) => acc.concat(val), []);
		const configContent = getConfigContent();
		const seedAddress = await getIpByDns(seedNode);
		const uniquePeers = mergePeers(
			`${seedAddress}:${4000}`,
			configContent.peers,
			allPeers
		);

		configContent.peers = []; // To avoid duplication first remove everything
		configContent.peers.push(...uniquePeers);
		updateConfigContent(configContent);
	} catch (error) {
		output.print('Failed to add peers to config: ');
		output.error(error);
		process.exit(1);
	}
}).tag('@network_nodes');

Scenario('Check if peers are connected', async () => {
	await checkIfAllPeersConnected();
}).tag('@peers_connected');

Scenario('Enable delegates', async () => {
	enableDisableDelegates(true);
}).tag('@delegates_enable');

Scenario('Disable delegates', async () => {
	enableDisableDelegates(false);
}).tag('@delegates_disable');

Scenario('Upgrade node', async () => {
	try {
		const configContent = getConfigContent();
		const upgradedNodeHostName = process.env.DROPLET_FQDN;
		const seedAddress = await getIpByDns(upgradedNodeHostName);

		configContent.peers.push(seedAddress);

		if (process.env.NETWORK === 'testnet') {
			configContent.httpPort = 7000;
			configContent.wsPort = 7001;
		} else if (process.env.NETWORK === 'mainnet') {
			configContent.httpPort = 8000;
			configContent.wsPort = 8001;
		}

		updateConfigContent(configContent);
	} catch (error) {
		output.error(error);
	}
}).tag('@upgrade_node');

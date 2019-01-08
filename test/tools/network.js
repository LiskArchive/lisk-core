const fs = require('fs');
const path = require('path');
const { from, chunkArray } = require('../../utils');

const env = process.env.NETWORK || 'development';

const getConfigPath = () => {
  let configPath;
  if (env === 'development') {
    configPath = '../../fixtures/config.json';
  } else {
    configPath = `../../fixtures/${env}/config.json`;
  }
  return path.resolve(__dirname, configPath);
}

const enableDisableDelegates = (api, isEnable) => {
  try {
    const configPath = getConfigPath();
    const configBuffer = fs.readFileSync(configPath);
    const configContent = JSON.parse(configBuffer);
    const enableOrDisable = isEnable ? "enable" : "disable";
    const {
      nodes,
      forging: {
        defaultPassword,
        delegates,
      }
    } = configContent;

    if (nodes.length === 0) {
      console.log('\n', '***********Please run npm run tools:peers:config to add nodes to list*************', '\n');
      process.exit(1);
    }

    const chunkSize = Math.ceil(delegates.length / nodes.length);
    const delegateList = chunkArray(delegates, chunkSize);

    return nodes.map((ip_address, i) => {
      console.log(`${delegateList[i].length} delegates ${enableOrDisable}d to on node ===> ${ip_address}`, '\n');

      return delegateList[i].map(async (delegate) => {
        const params = {
          "forging": isEnable,
          "password": defaultPassword,
          "publicKey": delegate.publicKey,
        };

        console.log(`${enableOrDisable}ing delegate publicKey ===> ${delegate.publicKey} on node ===> ${ip_address}`);

        const { result, error } = await from(api.updateForgingStatus(params, ip_address));
        expect(error).to.be.null;
        expect(result.data[0].forging).to.deep.equal(isEnable);
      });
    });
  } catch (error) {
    console.error(`Failed to ${enableOrDisable} forging due to error: `, error);
    process.exit(1);
  }
}

const checkIfAllPeersConnected = async (I) => {
  try {
    const allPeers = await I.getAllPeers(100, 0);
    const expectPeerCount = process.env.NODES_PER_REGION * 10;

    console.log(`Number of peers connected in network: ${allPeers.length}, Expected peers: ${expectPeerCount}`);

    while (allPeers.length >= expectPeerCount) {
      return true;
    }
    return await checkIfAllPeersConnected(I);
  } catch (error) {
    return error;
  }
};

Feature('Network tools');

Scenario('Peer list @peers_list', async (I) => {
  try {
    const allPeers = await I.getAllPeers(100, 0);
    console.log('Peers config list: ', JSON.stringify(allPeers, null, '\t'));
  } catch (error) {
    console.error('Failed to get peers list: ', error);
    process.exit(1);
  }
});

Scenario('Add peers to config @peers_config', async (I) => {
  try {
    const configPath = getConfigPath();
    const configBuffer = fs.readFileSync(configPath);
    const configContent = JSON.parse(configBuffer);
    const allPeers = await I.getAllPeers(100, 0);
    const requiredPeers = allPeers.slice(0, 101).map(p => p.ip);
    const unionNodes = new Set([...configContent.nodes, ...configContent.seed, ...requiredPeers]);

    configContent.nodes.push(...unionNodes);
    fs.writeFileSync(configPath, JSON.stringify(configContent));

    console.log(`Updated ${requiredPeers.length} peers to config file: ${configPath}`, JSON.stringify(requiredPeers, null, '\t'));
  } catch (error) {
    console.error('Failed to add peers to config: ', error);
    process.exit(1);
  }
});

Scenario('Add peers to config @peers_connected', async (I) => {
  await checkIfAllPeersConnected(I);
});

Scenario('Enable delegates @delegates_enable', async (I) => {
  const api = await I.call();
  enableDisableDelegates(api, true);
});

Scenario('Disable delegates @delegates_disable', async (I) => {
  const api = await I.call();
  enableDisableDelegates(api, false);
});

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

const enableDisableDelegates = (api, enableOrDisable) => {
  const configPath = getConfigPath();
  const configBuffer = fs.readFileSync(configPath);
  const configContent = JSON.parse(configBuffer);
  const {
    nodes,
    forging: {
      defaultPassword,
      delegates,
    }
  } = configContent;

  if (nodes.length === 0) {
    console.log('\n', '***********Please run npm run tools:peer:config to add nodes to list*************', '\n');
    process.exit(1);
  }

  const chunkSize = Math.ceil(delegates.length / nodes.length);
  const delegateList = chunkArray(delegates, chunkSize);

  return nodes.map((ip_address, i) => {
    console.log(`${delegateList[i].length} delegates on node==> ${ip_address}`, '\n');
    return delegateList[i].map(async (delegate) => {
      const params = {
        "forging": enableOrDisable,
        "password": defaultPassword,
        "publicKey": delegate.publicKey,
      };

      console.log(`Delegate publicKey==> ${delegate.publicKey}`);
      const { result, error } = await from(api.updateForgingStatus(params, ip_address));

      expect(error).to.be.null;
      expect(result.data[0].forging).to.deep.equal(enableOrDisable);
    });
  });
}

Feature('Network tools');

Scenario('Peer list @peer_list', async (I) => {
  let peers = await I.getAllPeers(100, 0);
  peers = peers.map(p => p.ip);
  console.log('Peers list', JSON.stringify(peers, null, '\t'));
});

Scenario('Add peers to config @peer_config', async (I) => {
  let peers = await I.getAllPeers(100, 0);
  peers = peers.slice(0, 101).map(p => p.ip);

  console.log(`Writing ${peers.length} peers to config file: `, JSON.stringify(peers, null, '\t'));

  const configPath = getConfigPath();
  const configBuffer = fs.readFileSync(configPath);
  const configContent = JSON.parse(configBuffer);

  const unionNodes = new Set([...configContent.nodes, ...configContent.seed, ...peers]);

  configContent.nodes.push(...unionNodes);
  fs.writeFileSync(configPath, JSON.stringify(configContent));
  console.log('Updated config!!');
});

Scenario('Enable delegates @delegates_enable', async (I) => {
  const api = await I.call();
  enableDisableDelegates(api, true);
});

Scenario('Disable delegates @delegates_disable', async (I) => {
  const api = await I.call();
  enableDisableDelegates(api, false);
});

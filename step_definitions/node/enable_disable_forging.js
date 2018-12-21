const { getFixtureUser } = require('../../utils');
const { config } = require('../../fixtures');

const I = actor();
const appConfig = config();

Given('The node is forging', async () => {
  const { forging: { delegates: [{ publicKey }] } } = appConfig;
  await I.getForgingDelegateNode(publicKey);
});

When('I disable forging', async () => {
  return 'pending';
});

Then('The node should not forge', async () => {
  return 'pending';
});

Given('The node is not forging', async () => {
  return 'pending';
});

When('I enable forging', async () => {
  return 'pending';
});

Then('The node should forge', async () => {
  return 'pending';
});

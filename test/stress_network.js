const crypto = require('crypto');
const {
  BEDDOWS,
  getAddressFromPublicKey,
  getKeys,
  generateMnemonic,
  createAccounts,
} = require('../utils');

const I = actor();
const contractsByAddress = {};
const STRESS_COUNT = parseInt(process.env.STRESS_COUNT) || 1000;

const getRandomNodeStatus = async () => {
  const api = await I.call();
  return api.getNodeStatus();
}

const getPendingTrxCount = async () => {
  const {
    data: {
      transactions: {
        unconfirmed, unprocessed, unsigned
      }
    }
  } = await getRandomNodeStatus();

  return unconfirmed + unprocessed + unsigned;
};

const accounts = createAccounts(STRESS_COUNT);

Feature('Stress network test');

Scenario('Transfer funds', async () => {
  const LSK_TOKEN = 100;
  const transferTrx = accounts.map((a) => {
    return {
      recipientId: a.address,
      amount: BEDDOWS(LSK_TOKEN),
    }
  });
  const pendingTrxCnt = await getPendingTrxCount();

  await I.waitForBlock(pendingTrxCnt);

  const transfer_transactions = await I.transferToMultipleAccounts(transferTrx);

  await I.waitForBlock(STRESS_COUNT);

  await Promise.all(transfer_transactions.map(trx => {
    I.validateTransaction(trx.id, trx.recipientId, LSK_TOKEN);
  }));
}).tag('@slow').tag('@stress');

Scenario('Second passphrase on an account', async () => {
  const pendingTrxCnt = await getPendingTrxCount();

  await I.waitForBlock(pendingTrxCnt);

  await Promise.all(accounts.map(async (a) => {
    a.secondPassphrase = generateMnemonic();
    return await I.registerSecondPassphrase(a.passphrase, a.secondPassphrase, 0);
  }));

  await I.waitForBlock(STRESS_COUNT);

  await Promise.all(accounts.map(async a => {
    const { publicKey } = getKeys(a.secondPassphrase);
    const api = await I.call();

    const account = await api.getAccounts({ address: a.address });
    expect(account.data[0].secondPublicKey).to.deep.equal(publicKey);
  }));
}).tag('@slow').tag('@stress');

Scenario('Delegate Registration', async () => {
  const pendingTrxCnt = await getPendingTrxCount();

  await I.waitForBlock(pendingTrxCnt);

  await Promise.all(accounts.map(async (a) => {
    a.username = crypto.randomBytes(9).toString('hex');

    return await I.registerAsDelegate({
      username: a.username,
      passphrase: a.passphrase,
      secondPassphrase: a.secondPassphrase,
    }, 0);
  }));

  await I.waitForBlock(STRESS_COUNT + 25);

  await Promise.all(accounts.map(async a => {
    const api = await I.call();

    const account = await api.getDelegates({ address: a.address });
    expect(account.data[0].username).to.deep.equal(a.username);
  }));
}).tag('@slow').tag('@stress');

Scenario('Cast vote', async () => {
  const pendingTrxCnt = await getPendingTrxCount();

  await I.waitForBlock(pendingTrxCnt);

  await Promise.all(accounts.map(async (a) => {
    return await I.castVotes({
      votes: [a.publicKey],
      passphrase: a.passphrase,
      secondPassphrase: a.secondPassphrase,
    }, 0);
  }));

  await I.waitForBlock(STRESS_COUNT + 25);

  await Promise.all(accounts.map(async a => {
    const api = await I.call();

    const account = await api.getVoters({ address: a.address });
    expect(account.data.voters.some(v => v.address === a.address)).to.deep.equal(true);
  }));
}).tag('@slow').tag('@stress');

Scenario('Register Multi-signature account', async () => {
  const pendingTrxCnt = await getPendingTrxCount();

  await I.waitForBlock(pendingTrxCnt);

  const multiSignatureTrx = await Promise.all(accounts.map(async (a, index) => {
    const { passphrase, secondPassphrase, address } = a;
    const signer1 = accounts[(index + 1) % accounts.length];
    const signer2 = accounts[(index + 2) % accounts.length];
    const contracts = [signer1, signer2];
    const params = {
      lifetime: 1,
      minimum: 2,
      passphrase,
      secondPassphrase,
    };
    contractsByAddress[address] = contracts;

    await I.registerMultisignature(contracts, params, 0);
  }));

  await I.waitForBlock(multiSignatureTrx.length + 25);

  await Promise.all(accounts.map(async a => {
    const api = await I.call();

    const account = await api.getMultisignatureGroups(a.address);
    await I.expectMultisigAccountToHaveContracts(account, contractsByAddress[a.address]);
  }));
}).tag('@slow').tag('@stress');

Scenario('DApp registration', async () => {
  const pendingTrxCnt = await getPendingTrxCount();

  await I.waitForBlock(pendingTrxCnt);

  const dAppsTrxs = await Promise.all(accounts.map(async (a) => {
    const dAppName = crypto.randomBytes(5).toString('hex');
    const options = {
      name: dAppName,
      category: 1,
      description: `dApp for ${dAppName}`,
      tags: '2',
      type: 0,
      link: `https://github.com/blocksafe/SDK-notice/dapp-multi-${dAppName}/master.zip`,
      icon: `http://www.blocksafefoundation.com/dapp-multi-${dAppName}/header.jpg`,
    };

    a.dAppName = dAppName;
    return await I.registerDapp({
      passphrase: a.passphrase,
      secondPassphrase: a.secondPassphrase,
      options
    }, 0);
  }));

  await I.waitForBlock(STRESS_COUNT);

  await Promise.all(dAppsTrxs.map(async (trx) => {
    const address = getAddressFromPublicKey(trx.senderPublicKey);
    await I.sendSignaturesForMultisigTrx(trx, contractsByAddress[address], 0);
  }));

  await I.waitForBlock(STRESS_COUNT + 25);

  await Promise.all(accounts.map(async a => {
    const api = await I.call();

    const account = await api.getDapp({ name: a.dAppName });
    expect(account.data[0].name).to.deep.equal(a.dAppName);
  }));
}).tag('@slow').tag('@stress');

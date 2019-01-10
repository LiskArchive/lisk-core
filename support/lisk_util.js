const elements = require('lisk-elements');
const API = require('./api.js');
const { config, GENESIS_ACCOUNT, ASGARD_FIXTURE } = require('../fixtures');
const { BEDDOWS, BLOCK_TIME, TRS_PER_BLOCK, from, getFixtureUser } = require('../utils');

const networkConfig = config();
const users = {};

const Helper = codecept_helper;

class LiskUtil extends Helper {
  /**
   *
   * @param {Array} list of ip addresses
   */
  call(config = networkConfig) {
    return new API(config);
  }

  /**
   * returns network config object
   */
  haveNetworkConfig() {
    return networkConfig;
  }

  /**
   * Returns genesis account object
   */
  haveGenesisAccount() {
    return GENESIS_ACCOUNT;
  }

  /**
   * Returns asgard account fixture object
   */
  haveAsgardFixture() {
    return ASGARD_FIXTURE();
  }

  /**
   * Add user account to memory
   * @param {string} name name for the account
   * @param {Object} user account object
   */
  addAccount(name, user) {
    users[name] = user;
  }

  /**
   * Get account from memory
   * @param {string} name account name
   */
  getAccount(name) {
    return users[name];
  }

  /**
   * Get all the accounts from memory
   */
  getAllAccount() {
    return users;
  }

  /**
   *
   * @param {number} ms - wait time in millisecond
   * @returns {Promise}
   */
  async wait(ms) {
    return new Promise(r => setTimeout(() => {
      r()
    }, ms));
  }

  /**
   * wait until the network reaches the specific block height
   * @param {number} transactionCount - block can process 25 transactions
   */
  async waitForBlock(transactionCount = 25) {
    if(transactionCount > 0) {
      const extraBlocks = Math.ceil(transactionCount / TRS_PER_BLOCK);
      const { data: { height } } = await this.call().getNodeStatus();
      return await this.waitUntilBlock(height + extraBlocks);
    }
    return true;
  }

  /**
   * check node height and wait until it reaches the expected height
   * @param {number} expectedHeight - expected height to reach
   */
  async waitUntilBlock(expectedHeight) {
    const { data: { height } } = await this.call().getNodeStatus();
    if (height >= expectedHeight) {
      return height;
    }
    console.log(`Timestamp: ${new Date().toISOString()}, current height: ${height}, expected height: ${expectedHeight}`);
    await this.wait(BLOCK_TIME);
    await this.waitUntilBlock(expectedHeight);
  }

  /**
   * create lisk account wallet
   * @returns account object
   */
  createAccount() {
    const passphrase = elements.passphrase.Mnemonic.generateMnemonic();
    const { publicKey } = elements.cryptography.getKeys(passphrase);
    const address = elements.cryptography.getAddressFromPublicKey(publicKey);

    return {
      passphrase,
      publicKey,
      address,
    }
  }

  async broadcastAndValidateTransaction(transaction) {
    const { seed: [ip] } = networkConfig;
    const { result, error } = await from(this.call().broadcastTransactions(transaction, ip));

    expect(error).to.be.null;
    this.helpers['ValidateHelper'].expectResponseToBeValid(result, 'GeneralStatusResponse');
  }

  async broadcastAndValidateSignature(signature) {
    const { seed: [ip] } = networkConfig;
    const { result, error } = await from(this.call().broadcastSignatures(signature, ip));

    expect(error).to.be.null;
    this.helpers['ValidateHelper'].expectResponseToBeValid(result, 'SignatureResponse')
    return expect(result.data.message).to.deep.equal('Signature Accepted');
  }

  /**
   * Broadcast a transaction and validate response
   * @param {Object} transaction - The transaction to be broadcasted
   * @param {Number} blocksToWait - Number of blocks to wait
   * @returns {Object} transaction
   */
  async broadcastAndValidateTransactionAndWait(transaction, blocksToWait = 1) {
    await this.broadcastAndValidateTransaction(transaction);
    await this.waitForBlock(blocksToWait);
  }

  /**
   * Broadcast a signature transaction and validate response
   * @param {Object} signature - The signature transaction to be broadcasted
   * @param {Number} blocksToWait - Number of blocks to wait
   * @param {*} signature
   */
  async broadcastAndValidateSignatureAndWait(signature, count = 25) {
    await this.broadcastAndValidateSignature(signature);
    await this.waitForBlock(blocksToWait);
  }

  /**
   * Generate signature for a given accounts and transaction
   * @param {Array} accounts List of accounts
   * @param {Object} transaction Transaction object
   */
  createSignatures(accounts, transaction) {
    return accounts.map(account => {
      const signature = elements.transaction.utils.multiSignTransaction(
        transaction,
        account.passphrase,
      );

      return {
        transactionId: transaction.id,
        publicKey: account.publicKey,
        signature,
      }
    })
  }

  /**
   * Transfer tokens from one account to another
   * @param {Object} account - account data
   * @param {string} account.recipientId - The recipient address
   * @param {string} account.amount - The amount sender wants to transfer to recipient
   * @param {string} account.passphrase - The sender passphrase, default is genesis account
   * @param {string} account.secondPassphrase - The sender second passphrase
   * @param {Number} blocksToWait - Number of blocks to wait
   * @returns {Object} transaction
   */
  async transfer(account, blocksToWait) {
    if (!account.passphrase) {
      account.passphrase = GENESIS_ACCOUNT.password
    }

    const trx = elements.transaction.transfer(account);

    await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));

    return trx;
  }

  /**
   * Multiple Transfers transaction from one account to another
   * @param {Object} accounts - accounts data
   * @param {string} accounts.recipientId - The recipient address
   * @param {string} accounts.amount - The amount sender wants to transfer to recipient
   * @param {string} accounts.passphrase - The sender passphrase, default is genesis account
   * @param {string} accounts.secondPassphrase - The sender second passphrase
   * @returns {Object} transaction
   */
  async transferToMultipleAccounts(accounts) {
    const trxs = accounts.map(a => {
      if (!a.passphrase) {
        a.passphrase = GENESIS_ACCOUNT.password
      }
      return elements.transaction.transfer(a);
    });

    await from(Promise.all(trxs.map(t => this.broadcastAndValidateTransaction(t))));

    return trxs;
  }

  async sendSignaturesForMultisigTrx(transaction, contracts, blocksToWait) {
    const signatures = contracts.map(s => ({
      transactionId: transaction.id,
      publicKey: s.publicKey,
      signature: elements.transaction.utils.multiSignTransaction(
        transaction,
        s.passphrase,
      ),
    }));

    await Promise.all(signatures.map(async s => await this.broadcastAndValidateSignature(s)));
    await this.waitForBlock(blocksToWait);
  }

  /**
   * Register second passphrase on an account
   * @param {string} passphrase - User account passphrase
   * @param {string} secondPassphrase - New secondPassphrase to register on account
   * @param {Number} blocksToWait - Number of blocks to wait
   * @returns {Object} transaction
   */
  async registerSecondPassphrase(passphrase, secondPassphrase, blocksToWait) {
    const trx = elements.transaction.registerSecondPassphrase({
      passphrase,
      secondPassphrase,
    });

    await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));

    return trx;
  }

  /**
   * Register as delegate
   * @param {Object} params - parameters for registering as delegate
   * @param {string} params.username - Username for registering as delegate
   * @param {string} params.passphrase - User account passphrase
   * @param {string} params.secondPassphrase - User secondPassphrase
   * @param {Number} blocksToWait - Number of blocks to wait
   * @returns {Object} transaction
   */
  async registerAsDelegate(params, blocksToWait) {
    const trx = elements.transaction.registerDelegate(params);

    await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));

    return trx;
  }

  /**
   * Cast votes to delegates
   * @param {Object} params - parameters to cast vote for delegate
   * @param {Array} params.votes - list of publickeys for upvote
   * @param {string} params.passphrase - User account passphrase
   * @param {string} params.secondPassphrase - User account second passphrase
   * @param {Number} blocksToWait - Number of blocks to wait
   */
  async castVotes(params, blocksToWait) {
    const trx = elements.transaction.castVotes(params);
    await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));
  }

  /**
   * Cast unvotes to delegates
   * @param {Object} params - parameters to cast vote for delegate
   * @param {Array} params.unvotes - list of publickeys for downvote
   * @param {string} params.passphrase - User account passphrase
   * @param {string} params.secondPassphrase - User account second passphrase
   * @param {Number} blocksToWait - Number of blocks to wait
   */
  async castUnvotes(params, blocksToWait) {
    const trx = elements.transaction.castVotes(params);
    await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));
  }

  /**
   * Register multisignature account
   * @param {Array} accounts - List of accounts for register multisignature account
   * @param {Object} params - parameters to register for multisignature account
   * @param {number} params.lifetime - Timeframe in which a multisignature transaction will exist in memory before the transaction is confirmed
   * @param {number} params.minimum - Minimum signatures required to confirm multisignature transaction
   * @param {string} params.passphrase - Passphrase of the multisignature account creator
   * @param {string} params.secondPassphrase - Second passphrase of the multisignature account creator
   * @param {Number} blocksToWait - Number of blocks to wait
   * @returns
   */
  async registerMultisignature(accounts, params, blocksToWait) {
    const keysgroup = accounts.map(account => account.publicKey);

    const registerMultisignatureTrx = elements.transaction.registerMultisignature({ keysgroup, ...params });

    const signatures = this.createSignatures(accounts, registerMultisignatureTrx);

    await this.broadcastAndValidateTransactionAndWait(registerMultisignatureTrx, blocksToWait);

    await Promise.all(signatures.map(s => this.broadcastAndValidateSignature(s)));

    await this.waitForBlock(blocksToWait);
    return registerMultisignatureTrx;
  }

  /**
   *
   * @param {Object} data Parameters for registering dApp
   * @param {string} data.passphrase Passphrase of the dApp registrar
   * @param {string} data.secondPassphrase second passphrase of the dApp registrar
   * @param {Object} data.options Options for registering dApp
   * @param {Number} blocksToWait - Number of blocks to wait
   */
  async registerDapp(data, blocksToWait) {
    const dAppTrx = elements.transaction.createDapp(data);

    await this.broadcastAndValidateTransactionAndWait(dAppTrx, blocksToWait);

    return dAppTrx;
  }

  async checkIfdAppRegistered(name) {
    const { result, error } = await from(this.call().getDapp({ name }));

    expect(error).to.be.null;
    return result.data.length && result.data[0].name === name;
  }

  /**
   *
   * @param {string} id - transaction id for validation
   * @param {string} recipientId - recipient address
   * @param {string} amount - amount sent my sender to validate againt the transaction
   * @param {string} senderId - sender address, default is genesis account
   */
  async validateTransaction(id, recipientId, amount, senderId = GENESIS_ACCOUNT.address) {
    const response = await from(this.call().getTransactions({
      id,
      senderId,
      recipientId
    }));

    expect(response.error).to.be.null;
    this.helpers['ValidateHelper'].expectResponseToBeValid(response.result, 'TransactionsResponse');
    return expect(response.result.data[0].amount).to.deep.equal(BEDDOWS(amount));
  }

  async checkIfVoteOrUnvoteCasted(votesOrUnvotes, passphrase) {
    const { address } = getFixtureUser("passphrase", passphrase);
    const { result, error } = await from(
      this.call().getVoters({ address })
    );

    expect(error).to.be.null;
    this.helpers["ValidateHelper"].expectResponseToBeValid(
      result,
      "VotersResponse"
    );

    const isVoted = result.data &&
      result.data.voters &&
      result.data.voters.some(v => votesOrUnvotes.includes(v.publicKey));

    return isVoted;
  }

  async checkIfMultisigAccountExists(address, contracts) {
    const { result, error } = await from(this.call().getMultisignatureGroups(address));

    if (error && error.message === 'Status 404 : Multisignature account not found') {
      return false;
    } else if (result.data.length && result.data[0].members) {
      const members = contracts.map(c => c.address);
      return result.data[0].members.some(m => members.includes(m.address));
    }
    return false;
  }

  /**
   * returns count of transactions in queue
   */
  async getPendingTransactionCount() {
    const { data: {
      transactions: {
        unconfirmed,
        unprocessed,
        unsigned,
      } } } = await this.call().getNodeStatus();

    return unconfirmed + unprocessed + unsigned;
  }

  async getAllPeers(limit, offset) {
    const { result, error } = await from(this.call().getPeers({ limit, offset, }));

    expect(error).to.be.null;

    const count = Math.ceil(result.meta.count / limit) - 1;

    const pagination = Array(count).fill().map((v, i) => (limit * (i + 1)));

    let peerList = result.data;

    await pagination.reduce(async (acc, curr) => {
      const { result, error } = await from(this.call().getPeers({ limit, offset: curr, }));

      expect(error).to.be.null;
      acc.push(...result.data);
      return acc;
    }, peerList);

    return peerList;
  }

  async getAllForgingNodes() {
    const peers = await this.getAllPeers(100, 0);
    const forgingStatus = await Promise.all(peers.map(async p => {
      const { result, error } = await from(this.call().getForgingStatus({}, p.ip));

      expect(error).to.be.null;
      if (result && result.data.length) {
        const forgingDelegates = result.data.filter(d => d.forging);
        return { ip: p.ip, ...forgingDelegates[0] };
      }
      return;
    }));
    return forgingStatus.filter(n => n);
  }

  async getForgingDelegateNode(publicKey) {
    const forgingNodes = await this.getAllForgingNodes();
    return forgingNodes.filter(n => n.publicKey === publicKey && n.forging);
  }

  async getAllNodeHeights() {
    const peers = await this.getAllPeers(100, 0);

    return await Promise.all(peers.map(async p => {
      const response = await from(this.call().getNodeStatus(p.ip));

      if (response.result && response.result.data) {
        return response.result.data.height;
      }
      return;
    }));
  }

  async checkIfNetworkIsMoving() {
    let heights = await this.getAllNodeHeights();
    const previous_height = Math.max(heights.filter(h => h));

    await this.waitForBlock();

    heights = await this.getAllNodeHeights();
    const current_height = Math.max(heights.filter(h => h));

    expect(current_height).to.be.above(previous_height);
  }

  async checkIfDelegatesAreForging() {
    const { result, error } = await from(this.getAllForgingNodes());

    expect(error).to.be.null;
    result.forEach(d => {
      expect(d.forging).to.deep.equal(true);
    });
  }

  async waitForTransactionToConfirm(id) {
    const { result, error } = await from(this.call().getTransactions({ id }));

    expect(error).to.be.null;
    while (result.data.length) {
      return result;
    }
    await this.waitForBlock();
    return await this.waitForTransactionToConfirm(id);
  }

  async getPendingTrxCount() {
    const {
      data: {
        transactions: {
          unconfirmed, unprocessed, unsigned
        }
      }
    } = await this.call().getNodeStatus();

    return unconfirmed + unprocessed + unsigned;
  };

  async waitForPendingTransaction(limit, trs_type) {
    const pendingTrxCnt = await this.getPendingTrxCount();

    console.log(`Timestamp: ${new Date().toISOString()}, Transaction Type: ${trs_type}, Pending Transactions: ${pendingTrxCnt}, RATE_LIMIT: ${limit}`);

    while (pendingTrxCnt === 0 || limit <= 0) {
      return true;
    }

    limit = limit - 1;
    await this.waitForBlock(TRS_PER_BLOCK);
    return await this.waitForPendingTransaction(limit, trs_type);
  }
}

module.exports = LiskUtil

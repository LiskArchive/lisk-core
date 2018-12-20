const elements = require('lisk-elements');
const API = require('./api.js');
const { config, GENESIS_ACCOUNT, ASGARD_FIXTURE } = require('../fixtures');
const { LISK, BLOCK_TIME, TRS_PER_BLOCK, from, getFixtureUser } = require('../utils');

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
   *
   * @param {number} transactionCount - total transactions sent, default 1
   */
  async waitForBlock(transactionCount = 25) {
    const waitTime = (transactionCount / TRS_PER_BLOCK) * BLOCK_TIME;
    await this.wait(waitTime);
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
    const { result, error } = await from(this.call().broadcastTransactions(transaction));

    expect(error).to.be.null;
    this.helpers['ValidateHelper'].expectResponseToBeValid(result, 'GeneralStatusResponse')
  }

  async broadcastAndValidateSignature(signature) {
    const { result, error } = await from(this.call().broadcastSignatures(signature));

    expect(error).to.be.null;
    this.helpers['ValidateHelper'].expectResponseToBeValid(result, 'SignatureResponse')
    expect(result.data.message).to.deep.equal('Signature Accepted');
  }

  /**
   * Broadcast a transaction and validate response
   * @param {Object} transaction - The transaction to be broadcasted
   * @returns {Object} transaction
   */
  async broadcastAndValidateTransactionAndWait(transaction) {
    await this.broadcastAndValidateTransaction(transaction);
    await this.waitForBlock();
  }

  async broadcastAndValidateSignatureAndWait(signature) {
    await this.broadcastAndValidateSignature(signature);
    await this.waitForBlock();
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
   * @returns {Object} transaction
   */
  async transfer(account) {
    if (!account.passphrase) {
      account.passphrase = GENESIS_ACCOUNT.password
    }

    const trx = elements.transaction.transfer(account);

    await from(this.broadcastAndValidateTransactionAndWait(trx));

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
  async transferToMultiple(accounts) {
    const trxs = accounts.map(a => elements.transaction.transfer(a));

    await from(Promise.all(trxs.map(t => this.broadcastAndValidateTransaction(t))));
    await this.waitForBlock();

    return trxs;
  }

  async sendSignaturesForMultisigTrx(transaction, contracts) {
    const signatures = contracts.map(s => ({
      transactionId: transaction.id,
      publicKey: s.publicKey,
      signature: elements.transaction.utils.multiSignTransaction(
        transaction,
        s.passphrase,
      ),
    }));

    await Promise.all(signatures.map(s => this.broadcastAndValidateSignature(s)));
    await this.waitForBlock();
  }

  /**
   * Register second passphrase on an account
   * @param {string} passphrase - User account passphrase
   * @param {string} secondPassphrase - New secondPassphrase to register on account
   * @returns {Object} transaction
   */
  async registerSecondPassphrase(passphrase, secondPassphrase) {
    const trx = elements.transaction.registerSecondPassphrase({
      passphrase,
      secondPassphrase,
    });

    await from(this.broadcastAndValidateTransactionAndWait(trx));

    return trx;
  }

  /**
   * Register as delegate
   * @param {Object} params - parameters for registering as delegate
   * @param {string} params.username - Username for registering as delegate
   * @param {string} params.passphrase - User account passphrase
   * @param {string} params.secondPassphrase - User secondPassphrase
   * @returns {Object} transaction
   */
  async registerAsDelegate(params) {
    const trx = elements.transaction.registerDelegate(params);

    await from(this.broadcastAndValidateTransactionAndWait(trx));

    return trx;
  }

  /**
   * Cast votes to delegates
   * @param {Object} params - parameters to cast vote for delegate
   * @param {Array} params.votes - list of publickeys for upvote
   * @param {string} params.passphrase - User account passphrase
   * @param {string} params.secondPassphrase - User account second passphrase
   */
  async castVotes(params) {
    const { votes, passphrase } = params;
    const isVoted = await this.checkIfVoteOrUnvoteCasted(votes, passphrase);

    if (isVoted) {
      return;
    }
    const trx = elements.transaction.castVotes(params);
    await from(this.broadcastAndValidateTransactionAndWait(trx));
  }

  /**
   * Cast unvotes to delegates
   * @param {Object} params - parameters to cast vote for delegate
   * @param {Array} params.unvotes - list of publickeys for downvote
   * @param {string} params.passphrase - User account passphrase
   * @param {string} params.secondPassphrase - User account second passphrase
   */
  async castUnvotes(params) {
    const { unvotes, passphrase } = params;
    const isUnvoted = await this.checkIfVoteOrUnvoteCasted(unvotes, passphrase);

    if (isUnvoted) {
      return;
    }
    const trx = elements.transaction.castVotes(params);
    await from(this.broadcastAndValidateTransactionAndWait(trx));
  }

  /**
   * Register multisignature account
   * @param {Array} accounts - List of accounts for register multisignature account
   * @param {Object} params - parameters to register for multisignature account
   * @param {number} params.lifetime - Timeframe in which a multisignature transaction will exist in memory before the transaction is confirmed
   * @param {number} params.minimum - Minimum signatures required to confirm multisignature transaction
   * @param {string} params.passphrase - Passphrase of the multisignature account creator
   * @param {string} params.secondPassphrase - Second passphrase of the multisignature account creator
   * @returns
   */
  async registerMultisignature(accounts, params) {
    const keysgroup = accounts.map(account => account.publicKey);
    const registerMultisignatureTrx = elements.transaction.registerMultisignature({ keysgroup, ...params });
    await this.waitForBlock();
    const signatures = this.createSignatures(accounts, registerMultisignatureTrx);
    await this.broadcastAndValidateTransactionAndWait(registerMultisignatureTrx);
    await Promise.all(signatures.map(s => this.broadcastAndValidateSignature(s)));
    await this.waitForBlock();
    return registerMultisignatureTrx;
  }

  /**
   *
   * @param {Object} data Parameters for registering dApp
   * @param {string} data.passphrase Passphrase of the dApp registrar
   * @param {string} data.secondPassphrase second passphrase of the dApp registrar
   * @param {Object} data.options Options for registering dApp
   */
  async registerDapp(data) {
    const dAppTrx = elements.transaction.createDapp(data);

    await this.broadcastAndValidateTransactionAndWait(dAppTrx);

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
    return expect(response.result.data[0].amount).to.deep.equal(LISK(amount));
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
}

module.exports = LiskUtil

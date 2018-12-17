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
   * Broadcast a transaction and validate response
   * @param {Object} transaction - The transaction to be broadcasted
   * @returns {Object} transaction
   */
  async broadcastAndValidateTransaction(transaction) {
    const { result, error } = await from(this.call().broadcastTransactions(transaction));

    this.helpers['ResponseValidator'].expectResponseToBeValid(result, 'GeneralStatusResponse')
    expect(error).to.deep.equal(null);
    expect(result.data.message).to.deep.equal('Transaction(s) accepted');

    return result;
  }

  async broadcastAndValidateSignature(signature) {
    const { result, error } = await from(this.call().broadcastSignatures(signature));

    this.helpers['ResponseValidator'].expectResponseToBeValid(result, 'SignatureResponse')
    expect(error).to.deep.equal(null);
    expect(result.data.message).to.deep.equal('Signature Accepted');

    return result;
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
        publicKey: account.keyPair.publicKey,
        signature,
      }
    })
  }

  /**
   * Transfer tokens from one account to another
   * @param {Object} transactionData - Transfer transaction data
   * @param {string} transactionData.recipientId - The recipient address
   * @param {string} transactionData.amount - The amount sender wants to transfer to recipient
   * @param {string} transactionData.passphrase - The sender passphrase, default is genesis account
   * @param {string} transactionData.secondPassphrase - The sender second passphrase
   * @returns {Object} transaction
   */
  async transfer(transactionData) {

    const trx = elements.transaction.transfer(transactionData);

    const { result, error } = await from(this.broadcastAndValidateTransaction(trx));
    expect(error).to.deep.equal(null);
    this.helpers['ResponseValidator'].expectResponseToBeValid(result, 'GeneralStatusResponse');

    await this.waitForBlock();

    return trx;
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

    const { result, error } = await from(this.broadcastAndValidateTransaction(trx));
    expect(error).to.deep.equal(null);

    return result;
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

    const { result, error } = await from(this.broadcastAndValidateTransaction(trx));
    expect(error).to.deep.equal(null);

    return result;
  }

  /**
   * Cast votes to delegates
   * @param {Object} params - parameters to cast vote for delegate
   * @param {string} params.passphrase - User account passphrase
   * @param {string} params.secondPassphrase - User account second passphrase
   * @returns {Object} transaction
   */
  async castVotes(params) {
    const trx = elements.transaction.castVotes(params);

    const { result, error } = await from(this.broadcastAndValidateTransaction(trx));
    expect(error).to.deep.equal(null);

    return result;
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
    const requester = getFixtureUser('passphrase', params.passphrase);

    const multiSigAccount = await from(this.call().getMultisignatureGroups(requester.address));

    if (!multiSigAccount.result) {
      const keysgroup = accounts.map(account => account.keyPair.publicKey);

      const registerMultisignatureTrx = elements.transaction.registerMultisignature({ keysgroup, ...params });

      const signatures = this.createSignatures(accounts, registerMultisignatureTrx);

      const broadcastedTrx = await from(this.broadcastAndValidateTransaction(registerMultisignatureTrx));

      expect(broadcastedTrx.error).to.deep.equal(null);

      await this.waitForBlock();

      signatures.forEach(async (signature) => {
        const broadcastedSignature = await from(this.broadcastAndValidateSignature(signature));
        expect(broadcastedSignature.error).to.deep.equal(null);
      });

      await this.waitForBlock();
    }

    return multiSigAccount.result;
  }

  /**
   *
   * @param {Object} params Parameters for registering dApp
   * @param {string} params.passphrase Passphrase of the dApp registrar
   * @param {Object} params.options Options for registering dApp
   */
  async registerDapp({ passphrase, options }) {
    const dAppTrx = elements.transaction.createDapp({ passphrase, options });

    await this.broadcastAndValidateTransaction(dAppTrx);
  }

  /**
   *
   * @param {string} id - transaction id for validation
   * @param {string} recipientId - recipient address
   * @param {string} amount - amount sent my sender to validate againt the transaction
   * @param {string} senderId - sender address, default is genesis account
   */
  async validateTransfer(id, recipientId, amount, senderId = GENESIS_ACCOUNT.address) {
    const transaction = await this.call().getTransactions({
      id,
      senderId,
      recipientId
    });

    this.helpers['ResponseValidator'].expectResponseToBeValid(transaction, 'TransactionsResponse');
    expect(transaction.data[0].amount).to.deep.equal(LISK(amount));
  }
}

module.exports = LiskUtil

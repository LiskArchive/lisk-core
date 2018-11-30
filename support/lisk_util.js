const { transaction } = require('lisk-elements');
const chai = require('chai');
const API = require('./api.js');
const { config, GENESIS_ACCOUNT } = require('../fixtures');

chai.use(require('chai-json-schema'));

const expect = chai.expect;
const networkConfig = config();
const api = new API(networkConfig);

const users = {};

const BLOCK_TIME = 10000;
const TRS_PER_BLOCK = 25;
// Beddows
const BEDDOWS = 10 ** 8;
// amount converted from lisk to beddows
const LISK = amount => String(BEDDOWS * amount);

const Helper = codecept_helper;

class LiskUtil extends Helper {
  call() {
    return api;
  }

  useGenesisAccount() {
    return GENESIS_ACCOUNT;
  }

  haveClientAddresses() {
    return [...api.seed, ...api.nodes]
  }

  haveNetworkConfig() {
    return networkConfig;
  }

  expect() {
    return expect;
  }

  addAccount(name, user) {
    users[name] = user;
  }

  getAccount(name) {
    return users[name];
  }

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
    const waitTime = (transactionCount/TRS_PER_BLOCK) * BLOCK_TIME;
    await this.wait(waitTime);
  }

  /**
   *
   * @param {string} recipientId - The recipient address
   * @param {string} amount - The amount sender wants to transfer to recipient
   * @param {string} passphrase - The sender passphrase, default is genesis account
   * @returns {Object} transaction
   */
  async transfer(recipientId, amount, passphrase = GENESIS_ACCOUNT.password) {
    const trx = transaction.transfer({
      amount: LISK(amount),
      recipientId,
      passphrase,
    });

    const res = await api.broadcastTransactions(trx);

    expect(res.data.message).to.deep.equal('Transaction(s) accepted');

    return trx;
  }

  /**
   *
   * @param {string} id - transaction id for validation
   * @param {string} recipientId - recipient address
   * @param {string} amount - amount sent my sender to validate againt the transaction
   * @param {string} senderId - sender address, default is genesis account
   */
  async validateTransfer(id, recipientId, amount, senderId = GENESIS_ACCOUNT.address) {
    const transaction = await api.getTransactions({
      id,
      senderId,
      recipientId
    });

    expect(transaction.data[0].amount).to.deep.equal(LISK(amount));
  }
}

module.exports = LiskUtil

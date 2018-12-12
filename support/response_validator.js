const lisk_commons = require('lisk-commons');
const chai = require('chai');
const { LISK, from } = require('../utils');
const LiskUtil = require('./lisk_util');

const Helper = codecept_helper;
const liskUtil = new LiskUtil();

chai.use(require('chai-json-schema'));
chai.use(require("chai-sorted"));

const expect = chai.expect;

class ResponseValidator extends Helper {
  async getSchemaDefinition(name) {
    const { result, error } = await from(lisk_commons.schema());

    expect(error).to.deep.equal(null);
    return result.definitions[name];
  }

  async haveAccount(params) {
    const { result, error } = await from(liskUtil.call().getAccounts(params));
    const { data: [account] } = result;

    expect(error).to.deep.equal(null);
    this.expectResponseToBeValid(result, 'AccountsResponse');
    return account;
  }

  async haveAccountWithBalance(address, balance) {
    const account = await this.haveAccount({ address });

    if (!account || !(account.balance >= LISK(balance))) {
      // take a diff and transfer only as much the balance required to be
      await liskUtil.transfer(address, balance);
      await liskUtil.waitForBlock();
    }
    return account;
  }

  async haveAccountWithSecondSignature(address, passphrase, secondPassphrase) {
    const account = await this.haveAccountWithBalance(address, 100);

    if (account && account.secondPublicKey) {
      expect(account.secondPublicKey).to.be.an('string').to.have.lengthOf(64);
    } else {
      await liskUtil.registerSecondPassphrase(passphrase, secondPassphrase);
      await liskUtil.waitForBlock();
    }
    return account;
  }

  async haveAccountRegisteredAsDelegate(username, address, passphrase, secondPassphrase) {
    const account = await this.haveAccountWithBalance(address, 100);

    if (account && account.delegate) {
      this.expectResponseToBeValid(account.delegate, 'Delegate');
    } else {
      await liskUtil.registerAsDelegate({ username, passphrase });
      await liskUtil.waitForBlock();
    }
    return account;
  }

  async haveMultiSignatureAccount(requester, keepers, params) {
    const account = await this.haveAccountWithBalance(requester.address, 100);

    await liskUtil.registerMultisignature(keepers, params);
    return account;
  }

  async expectResponseToBeValid(response, definition) {
    const schemaDefinition = await this.getSchemaDefinition(definition);

    return expect(response).to.be.jsonSchema(schemaDefinition);
  }

  expectResponseToBeSorted(response, params) {
    expect(response.data, params).to.be.sorted(params);
  }

  expectResponseToBeSortedBy(response, field, order) {
    if (order.toLowerCase() === 'asc') {
      return expect(response.data).to.be.ascendingBy(field);
    }
    return expect(response.data).to.be.descendingBy(field);
  }

  expectAccountResultToMatchParams(response, params) {
    const [[k, v]] = Object.entries(params);
    if (["limit", "sort", "offset", "username"].includes(k)) {
      this.handleOtherParams(response, k, v, params);
    } else {
      expect(response.data[0][k]).to.deep.equal(v);
    }
  }

  handleOtherParams(response, key, value, params) {
    switch (key) {
      case "username":
        expect(response.data[0].delegate.username).to.deep.equal(value);
        break;

      case "limit":
        expect(response.data).to.have.lengthOf(value);
        break;

      case "offset":
        expect(response.meta.offset).to.deep.equal(parseInt(value));
        break;

      case "sort":
        const [field, order] = value.split(':');
        this.expectResponseToBeSortedBy(response, field, order);
        break;
    }
  }
}

module.exports = ResponseValidator;

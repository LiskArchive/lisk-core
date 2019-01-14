const lisk_commons = require('lisk-commons');
const chai = require('chai');
const { LISK, BEDDOWS, from, sortBy, flattern } = require('../utils');
const LiskUtil = require('./lisk_util');

const Helper = codecept_helper;
const liskUtil = new LiskUtil();

chai.use(require('chai-json-schema'));
chai.use(require('chai-sorted'));
chai.use(require('chai-bignumber')());

const expect = chai.expect;
const otherFields = [
	'username',
	'limit',
	'sort',
	'offset',
	'senderIdOrRecipientId',
	'minAmount',
	'maxAmount',
	'fromTimestamp',
	'toTimestamp',
];

class ValidateHelper extends Helper {
	async getSchemaDefinition(name) {
		const { result, error } = await from(lisk_commons.schema());

		expect(error).to.be.null;
		return result.definitions[name];
	}

	async haveAccount(params) {
		const { result, error } = await from(liskUtil.call().getAccounts(params));
		const {
			data: [account],
		} = result;

		expect(error).to.be.null;
		this.expectResponseToBeValid(result, 'AccountsResponse');
		return account;
	}

	async haveAccountWithBalance(address, balance) {
		const account = await this.haveAccount({ address });

		if (!account || !(LISK(account.balance) >= balance)) {
			if (account) {
				balance = Math.ceil(balance - LISK(account.balance));
			}

			await liskUtil.transfer({
				recipientId: address,
				amount: BEDDOWS(balance),
			});
		}
		await this.haveAccount({ address });
	}

	async haveAccountWithSecondSignature(address, passphrase, secondPassphrase) {
		const account = await this.haveAccountWithBalance(address, 100);

		if (account && account.secondPublicKey) {
			expect(account.secondPublicKey)
				.to.be.an('string')
				.to.have.lengthOf(64);
		} else {
			await liskUtil.registerSecondPassphrase(passphrase, secondPassphrase);
			await liskUtil.waitForBlock();
		}
		return account;
	}

	async haveAccountRegisteredAsDelegate(params) {
		const account = await this.haveAccountWithBalance(params.address, 100);

		if (account && account.delegate) {
			this.expectResponseToBeValid(account.delegate, 'Delegate');
		} else {
			if (account && account.secondPublicKey) {
				delete params.secondPassphrase;
			}
			await liskUtil.registerAsDelegate(params);
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

	expectResponseToBeSortedBy(data, field, order) {
		const result = data.map(item => item[field]);
		if (result.length > 0 && !Number.isNaN(result[0])) {
			return expect(result).to.deep.equal(sortBy(result, order));
		}

		if (order.toLowerCase() === 'asc') {
			return expect(result).to.be.ascending;
		}
		return expect(result).to.be.descending;
	}

	expectResultToMatchParams(response, params) {
		Object.entries(params).forEach(item => {
			const [k, v] = item;
			if (otherFields.includes(k)) {
				this.handleOtherParams(response, k, v);
			} else {
				const data = flattern(response.data[0]);
				expect(data[k].toString()).to.deep.equal(v);
			}
		});
	}

	expectBlockResultToMatchParams(response, params) {
		const [[k, v]] = Object.entries(params);
		if (['limit', 'sort', 'offset', 'blockId'].includes(k)) {
			this.handleOtherParams(response, k, v);
		} else {
			const data = flattern(response.data[0]);
			expect(data[k].toString()).to.deep.equal(v);
		}
	}

	expectDelegatesToMatchParams(response, params) {
		const [[k, v]] = Object.entries(params);
		if (['limit', 'sort', 'offset', 'search'].includes(k)) {
			this.handleOtherParams(response, k, v);
		} else {
			const data = flattern(response.data[0]);
			expect(data[k].toString()).to.deep.equal(v);
		}
	}

	expectMultisigAccountToHaveContracts(account, contracts) {
		const addresses = account.data[0].members.map(m => m.address);
		expect(contracts.every(c => addresses.includes(c.address))).to.deep.equal(
			true
		);
	}

	expectVotesResultToMatchParams(response, params) {
		Object.entries(params).forEach(item => {
			const [k, v] = item;
			if (['sort'].includes(k)) {
				const [field, order] = v.split(':');
				this.expectResponseToBeSortedBy(response.data.votes, field, order);
			} else if (k !== 'limit') {
				expect(response.data[k].toString()).to.deep.equal(v);
			}
		});
	}

	expectVotersResultToMatchParams(response, params) {
		Object.entries(params).forEach(item => {
			const [k, v] = item;
			if (['sort'].includes(k)) {
				const [field, order] = v.split(':');
				this.expectResponseToBeSortedBy(response.data.voters, field, order);
			} else if (k !== 'limit') {
				expect(response.data[k].toString()).to.deep.equal(v);
			}
		});
	}

	expectDefaultCount(response) {
		expect(response.data.length).to.be.at.most(10);
	}

	handleOtherParams(response, key, value) {
		switch (key) {
			case 'username': {
				expect(response.data[0].delegate.username).to.deep.equal(value);
				break;
			}
			case 'limit':
				expect(response.data).to.have.lengthOf(value);
				break;

			case 'offset':
				expect(response.meta.offset).to.deep.equal(parseInt(value));
				break;

			case 'sort': {
				const [field, order] = value.split(':');
				this.expectResponseToBeSortedBy(response.data, field, order);
				break;
			}

			case 'blockId':
				expect(response.data[0].id).to.deep.equal(value);
				break;

			case 'search': {
				response.data.forEach(element => {
					const pattern = new RegExp(value);
					expect(element.username).to.match(pattern);
				});
				break;
			}
			case 'senderIdOrRecipientId': {
				const result = [
					response.data[0].senderId,
					response.data[0].recipientId,
				];
				expect(result).to.include(value);
				break;
			}
			case 'minAmount':
			case 'maxAmount':
				response.data.forEach(t => {
					if (key === 'minAmount') {
						expect(t.amount).to.be.bignumber.at.least(value);
					} else {
						expect(t.amount).to.be.bignumber.at.most(value);
					}
				});
				break;
			case 'fromTimestamp':
			case 'toTimestamp':
				response.data.forEach(t => {
					if (key === 'fromTimestamp') {
						expect(t.timestamp).to.be.bignumber.at.least(value);
					} else {
						expect(t.timestamp).to.be.bignumber.at.most(value);
					}
				});
				break;
			default:
				break;
		}
	}
}

module.exports = ValidateHelper;

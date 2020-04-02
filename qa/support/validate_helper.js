const output = require('codeceptjs').output;
const chai = require('chai');
const apiSchema = require('../api_schema');
const { TO_LISK, TO_BEDDOWS, from, sortBy, flattern } = require('../utils');
const LiskUtil = require('./lisk_util');
const { GENESIS_ACCOUNT } = require('../fixtures');

/* eslint camelcase: ["error", {allow: ["codecept_helper"]}] */
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
		try {
			const { result, error } = await from(apiSchema.schema());

			expect(error).to.be.null;
			return result.definitions[name];
		} catch (error) {
			output.error(error);
			throw error;
		}
	}

	async haveAccount(params) {
		try {
			const { result, error } = await from(liskUtil.call().getAccounts(params));
			const {
				data: [account],
			} = result;

			expect(error).to.be.null;
			this.expectResponseToBeValid(result, 'AccountsResponse');
			return account;
		} catch (error) {
			output.error(error);
			throw error;
		}
	}

	async haveAccountWithBalance(address, balance) {
		try {
			const account = await this.haveAccount({ address });

			if (!account || !(TO_LISK(account.balance) >= balance)) {
				if (account) {
					balance = Math.ceil(balance - TO_LISK(account.balance));
				}

				const {
					result: {
						data: [{ nonce }],
					},
				} = await from(
					liskUtil.call().getAccounts({ address: GENESIS_ACCOUNT.address })
				);

				await liskUtil.transfer({
					recipientId: address,
					amount: TO_BEDDOWS(balance),
					nonce: (parseInt(nonce, 10) + 1).toString(),
					fee: '100000000',
				});
			}
			await this.haveAccount({ address });
		} catch (error) {
			output.error(error);
		}
	}

	async haveAccountRegisteredAsDelegate(params) {
		try {
			const account = await this.haveAccount({ address: params.address });

			if (account && account.delegate) {
				this.expectResponseToBeValid(account.delegate, 'Delegate');
			} else {
				params.fee = '2500000000';
				params.nonce = '0';
				await liskUtil.registerAsDelegate(params);
			}
			return account;
		} catch (error) {
			output.error(error);
			throw error;
		}
	}

	async expectResponseToBeValid(response, definition) {
		try {
			const schemaDefinition = await this.getSchemaDefinition(definition);

			return expect(response).to.be.jsonSchema(schemaDefinition);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}

	expectResponseToBeSortedBy(data, field, order) {
		try {
			const result = data.map(item => item[field]);
			if (result.length > 0 && !Number.isNaN(result[0])) {
				return expect(result).to.deep.equal(sortBy(result, order));
			}

			if (order.toLowerCase() === 'asc') {
				return expect(result).to.be.ascending;
			}
			return expect(result).to.be.descending;
		} catch (error) {
			output.error(error);
			throw error;
		}
	}

	expectResultToMatchParams(response, params) {
		try {
			Object.entries(params).forEach(item => {
				const [k, v] = item;
				if (otherFields.includes(k)) {
					this.handleOtherParams(response, k, v);
				} else {
					const data = flattern(response.data[0]);
					expect(data[k].toString()).to.deep.equal(v);
				}
			});
		} catch (error) {
			output.error(error);
		}
	}

	expectBlockResultToMatchParams(response, params) {
		try {
			const [[k, v]] = Object.entries(params);
			if (['limit', 'sort', 'offset', 'blockId'].includes(k)) {
				this.handleOtherParams(response, k, v);
			} else {
				const data = flattern(response.data[0]);
				expect(data[k].toString()).to.deep.equal(v);
			}
		} catch (error) {
			output.error(error);
		}
	}

	expectDelegatesToMatchParams(response, params) {
		try {
			const [[k, v]] = Object.entries(params);
			if (['limit', 'sort', 'offset', 'search'].includes(k)) {
				this.handleOtherParams(response, k, v);
			} else {
				const data = flattern(response.data[0]);
				expect(data[k].toString()).to.deep.equal(v);
			}
		} catch (error) {
			output.error(error);
		}
	}

	expectMultisigAccountToHaveContracts(account, contracts) {
		try {
			const addresses = account.data[0].members.map(m => m.address);
			expect(contracts.every(c => addresses.includes(c.address))).to.deep.equal(
				true
			);
		} catch (error) {
			output.error(error);
		}
	}

	expectVotesResultToMatchParams(response, params) {
		try {
			Object.entries(params).forEach(item => {
				const [k, v] = item;
				if (['sort'].includes(k)) {
					const [field, order] = v.split(':');
					this.expectResponseToBeSortedBy(response.data.votes, field, order);
				} else if (k !== 'limit') {
					expect(response.data[k].toString()).to.deep.equal(v);
				}
			});
		} catch (error) {
			output.error(error);
		}
	}

	expectVotersResultToMatchParams(response, params) {
		try {
			Object.entries(params).forEach(item => {
				const [k, v] = item;
				if (['sort'].includes(k)) {
					const [field, order] = v.split(':');
					this.expectResponseToBeSortedBy(response.data.voters, field, order);
				} else if (k !== 'limit') {
					expect(response.data[k].toString()).to.deep.equal(v);
				}
			});
		} catch (error) {
			output.error(error);
		}
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
						expect(t.asset.amount).to.be.bignumber.at.least(value);
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

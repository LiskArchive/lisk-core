const from = require('./from');
const liskTransactions = require('./lisk_transactions');
const { ASGARD_FIXTURE, GENESIS_ACCOUNT, config } = require('../fixtures');

const BLOCK_TIME = 10000;

const TRS_PER_BLOCK = 25;

const TRS_POOL_LIMIT = 1000;

const TRS_TYPE = {
	TRANSFER: 0,
	SECOND_PASSPHRASE: 1,
	DELEGATE_REGISTRATION: 2,
	VOTE: 3,
	MULTI_SIGNATURE: 4,
	DAPP: 5,
};

const getFixtureUser = (propertyName, value) =>
	ASGARD_FIXTURE.find(user => user[propertyName] === value);

const splitBy = (value, separator = '=') =>
	value.split('&').reduce((acc, curr) => {
		const [k, v] = curr.split(separator);
		acc[k] = v;
		return acc;
	}, {});

const sortBy = (items, order) => {
	const sortFactor = order.toLowerCase() === 'desc' ? -1 : 1;

	return items.sort((a, b) => (a - b) * sortFactor);
};

const flattern = obj =>
	Object.assign(
		{},
		...(function _flatten(o) {
			return [].concat(
				...Object.keys(o).map(k =>
					typeof o[k] === 'object' ? _flatten(o[k]) : { [k]: o[k] }
				)
			);
		})(obj)
	);

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */
const chunkArray = (myArray, chunkSize) => {
	const results = [];

	while (myArray.length) {
		results.push(myArray.splice(0, chunkSize));
	}

	return results;
};

module.exports = {
	config,
	BLOCK_TIME,
	TRS_PER_BLOCK,
	GENESIS_ACCOUNT,
	TRS_TYPE,
	TRS_POOL_LIMIT,
	getFixtureUser,
	from,
	splitBy,
	sortBy,
	flattern,
	chunkArray,
	...liskTransactions,
};

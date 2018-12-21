const elements = require('lisk-elements');

const { ASGARD_FIXTURE, GENESIS_ACCOUNT } = require('../fixtures');
const from = require('./from');

const BLOCK_TIME = 10000;
const TRS_PER_BLOCK = 25;

// amount converted from lisk to beddows
const BEDDOWS = amount => elements.transaction.utils.convertLSKToBeddows(amount.toString());

// amount converted from beddows to lisk
const LISK = amount => elements.transaction.utils.convertBeddowsToLSK(amount.toString());

const getFixtureUser = (propertyName, value) =>
  ASGARD_FIXTURE.find(user => user[propertyName] === value);

const splitBy = (value, separator = "=") => {
  return value
    .split("&")
    .reduce((acc, curr) => {
      const [k, v] = curr.split(separator);
      acc[k] = v;
      return acc;
    }, {});
}

const sortBy = (items, order) => {
  const sortFactor = order.toLowerCase() === 'desc' ? -1 : 1;

  return items.sort((a, b) => {
    return (a - b) * sortFactor;
  });
}

const flattern = obj => {
  return Object.assign(
    {},
    ...function _flatten(o) {
      return [].concat(...Object.keys(o)
        .map(k =>
          typeof o[k] === 'object' ?
            _flatten(o[k]) :
            ({ [k]: o[k] })
        )
      );
    }(obj)
  )
}

const dappMultiAccountName = () => `dapp-multi${new Date().getTime()}`;

module.exports = {
  BLOCK_TIME,
  TRS_PER_BLOCK,
  GENESIS_ACCOUNT,
  BEDDOWS,
  LISK,
  getFixtureUser,
  from,
  splitBy,
  sortBy,
  flattern,
  dappMultiAccountName,
}

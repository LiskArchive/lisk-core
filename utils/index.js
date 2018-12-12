const { ASGARD_FIXTURE } = require('../fixtures');
const from = require('./from');

const BLOCK_TIME = 10000;
const TRS_PER_BLOCK = 25;
// Beddows
const BEDDOWS = 10 ** 8;
// amount converted from lisk to beddows
const LISK = amount => String(BEDDOWS * amount);

const getFixtureUser = (propertyName, value) =>
  ASGARD_FIXTURE.find(user => user[propertyName] === value);

const splitBy = (value, separator = "=") => {
  const result = {};

  const [k, v] = value.split(separator);
  result[k] = v;
  return result;
}

const sortBy = (items, order) => {
  const sortFactor = order.toLowerCase() === 'desc' ? -1 : 1;

  return items.sort((a, b) => {
    return (a - b) * sortFactor;
  });
}

module.exports = {
  BLOCK_TIME,
  TRS_PER_BLOCK,
  BEDDOWS,
  LISK,
  getFixtureUser,
  from,
  splitBy,
  sortBy,
}

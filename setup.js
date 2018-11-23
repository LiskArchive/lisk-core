const lisk_schema = require('lisk-schema');
const chai = require('chai');
const api_helper = require('./support/api_helper.js');
const { config } = require('./utils/index.js');
const networkConfig = config.config();

chai.use(require('chai-json-schema'));

const expect = chai.expect;
const apiHelper = new api_helper(networkConfig);

const context = {
  expect,
  lisk_schema,
  networkConfig,
  apiHelper
}

global.context = context;

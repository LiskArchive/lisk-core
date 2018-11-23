const defaultConfig = require('../config/config.json');
const alphaConfig = require('../config/alpha/config.json');

const env = process.env.NETWORK || 'development';

const config = () => env === 'development' ? defaultConfig : alphaConfig;

module.exports = {
  config
}

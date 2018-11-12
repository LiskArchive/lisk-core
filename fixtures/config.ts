const defaultConfig = require('../config/config.json');
const alphaConfig = require('../config/alpha/config.json');

const env = process.env.NETWORK || 'development';

export const config = () => env === 'development' ? defaultConfig : alphaConfig;

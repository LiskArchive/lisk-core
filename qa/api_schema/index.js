const $RefParser = require('json-schema-ref-parser');
const api_spec = require('./api_spec.json');

const schema = async () => {
	return $RefParser.dereference(api_spec);
};

module.exports = {
	schema,
};

const $RefParser = require('json-schema-ref-parser');
const api_spec = require('./api_spec.json');

const schema = async () => {
	try {
		return await $RefParser.dereference(api_spec);
	} catch (error) {
		throw error;
	}
};

module.exports = {
	schema,
};

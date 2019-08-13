const output = require('codeceptjs').output;
const { getFixtureUser } = require('../../utils');

const I = actor();
When('{string} register as a delegate', async userName => {
	try {
		const { username, address, passphrase } = getFixtureUser(
			'username',
			userName
		);

		await I.haveAccountRegisteredAsDelegate({
			username,
			address,
			passphrase,
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

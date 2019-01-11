const { getFixtureUser, from, BEDDOWS } = require('../../utils');

const I = actor();
let response;

When(
	'{string} wants to transfer {int}LSK to {string}',
	async (sender, amount, recepient) => {
		const user1 = getFixtureUser(sender);
		const user2 = getFixtureUser(recepient);

		response = await from(
			I.transfer({
				recipientId: user2.address,
				amount: BEDDOWS(amount),
				passphrase: user1.passphrase,
			})
		);
		await I.waitForBlock();
		expect(response.error).to.be.null;
	}
);

Then(
	'{string} should receive {int}LSK from {string}',
	async (recepient, amount, sender) => {
		const user1 = getFixtureUser(sender);
		const user2 = getFixtureUser(recepient);
		const { id } = response.result;

		await I.validateTransaction(id, user2.address, amount, user1.address);
	}
);

When('{string} transfers {int}LSK token to himself', async (sender, amount) => {
	const { address, passphrase } = getFixtureUser(sender);

	response = await from(
		I.transfer({
			recipientId: address,
			amount: BEDDOWS(amount),
			passphrase,
		})
	);
	await I.waitForBlock();
	expect(response.error).to.be.null;
});

Then(
	'{string} should receive {int}LSK in his account',
	async (sender, amount) => {
		const { address } = getFixtureUser(sender);
		const { id } = response.result;

		await I.validateTransaction(id, address, amount, address);
	}
);

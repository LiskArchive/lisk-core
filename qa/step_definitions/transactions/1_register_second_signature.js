const output = require('codeceptjs').output;
const { getFixtureUser, from, TO_BEDDOWS } = require('../../utils');

const I = actor();
let response;

When(
	'{string} wants to transfer {int}LSK to {string}',
	async (sender, amount, recepient) => {
		try {
			const user1 = getFixtureUser('username', sender);
			const user2 = getFixtureUser('username', recepient);

			response = await from(
				I.transfer({
					recipientId: user2.address,
					amount: TO_BEDDOWS(amount),
					passphrase: user1.passphrase,
					secondPassphrase: user1.secondPassphrase,
				})
			);
			expect(response.error).to.be.null;
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then(
	'{string} should receive {int}LSK from {string}',
	async (recepient, amount, sender) => {
		try {
			const user1 = getFixtureUser('username', sender);
			const user2 = getFixtureUser('username', recepient);
			const { id } = response.result;

			await I.validateTransaction(id, user2.address, amount, user1.address);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

When('{string} transfers {int}LSK token to himself', async (sender, amount) => {
	try {
		const { address, passphrase, secondPassphrase } = getFixtureUser(
			'username',
			sender
		);

		response = await from(
			I.transfer({
				recipientId: address,
				amount: TO_BEDDOWS(amount),
				passphrase,
				secondPassphrase,
			})
		);
		expect(response.error).to.be.null;
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(
	'{string} should receive {int}LSK in his account',
	async (sender, amount) => {
		try {
			const { address } = getFixtureUser('username', sender);
			const { id } = response.result;

			await I.validateTransaction(id, address, amount, address);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

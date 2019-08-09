const output = require('codeceptjs').output;
const { getFixtureUser, TO_BEDDOWS } = require('../../utils');

const I = actor();

Then(
	'{string} should be able to send {int}LSK tokens to {string}',
	async (user1, amount, user2) => {
		try {
			const sender = getFixtureUser('username', user1);
			const recipient = getFixtureUser('username', user2);

			const transfer = await I.transfer({
				recipientId: recipient.address,
				amount: TO_BEDDOWS(amount),
				passphrase: sender.passphrase,
			});
			await I.validateTransaction(
				transfer.id,
				recipient.address,
				amount,
				sender.address
			);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then(
	'{string} should be able to send {int}LSK tokens to himself',
	async (user, amount) => {
		try {
			const { address, passphrase } = getFixtureUser('username', user);

			const transfer = await I.transfer({
				recipientId: address,
				amount: TO_BEDDOWS(amount),
				passphrase,
			});
			await I.validateTransaction(transfer.id, address, amount, address);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

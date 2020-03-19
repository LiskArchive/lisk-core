const output = require('codeceptjs').output;
const { getFixtureUser, from, TRS_PER_BLOCK } = require('../../utils');

const I = actor();

When('{string} cast vote for a delegate {string}', async (sender, receiver) => {
	try {
		const { address, publicKey } = getFixtureUser('username', receiver);
		const { passphrase } = getFixtureUser('username', sender);
		const votes = [publicKey];

		const isVoted = await I.checkIfVoteOrUnvoteCasted(votes, address);

		if (isVoted) {
			return;
		}
		await from(I.castVotes({ votes, passphrase }));
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When('{string} cast my vote for himself', async userName => {
	try {
		const { passphrase, address, publicKey } = getFixtureUser(
			'username',
			userName
		);
		const votes = [publicKey];

		const isVoted = await I.checkIfVoteOrUnvoteCasted(votes, address);

		if (isVoted) {
			return;
		}
		await from(I.castVotes({ votes, passphrase }));
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(
	'delegate {string} should received vote from {string}',
	async (receiver, sender) => {
		try {
			const delegate = getFixtureUser('username', receiver);
			const voter = getFixtureUser('username', sender);
			const api = await I.call();

			const {
				data: { unconfirmedTransactions },
			} = await api.getNodeStatus();
			if (unconfirmedTransactions > 0) {
				await I.waitUntilTransactionsConfirmed();
			}

			const { result, error } = await from(
				api.getVoters({ address: delegate.address })
			);
			expect(error).to.be.null;
			expect(result.data.address).to.deep.equal(delegate.address);
			expect(
				result.data.voters.some(v => v.address === voter.address)
			).to.deep.equal(true);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

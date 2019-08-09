const output = require('codeceptjs').output;
const { from, getFixtureUser, splitBy } = require('../../utils');

const I = actor();
let response;

When('I look for list of accounts without any params', async () => {
	try {
		const api = await I.call();
		response = await from(api.getAccounts());

		expect(response.error).to.be.null;
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(
	'I should get list of accounts sorted by {string} in {string} order',
	async (field, order) => {
		try {
			await I.expectResponseToBeValid(response.result, 'AccountsResponse');
			await I.expectResponseToBeSortedBy(response.result.data, field, order);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

When('I search for a particular account {string}', async address => {
	try {
		const api = await I.call();
		response = await from(api.getAccounts({ address }));

		expect(response.error).to.be.null;
		expect(response.result.data[0].address).to.deep.equal(address);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('I should get my account details', async () => {
	try {
		await I.expectResponseToBeValid(response.result, 'AccountsResponse');
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When('I look for list of account with {string}', async params => {
	try {
		const api = await I.call();
		params = splitBy(params);

		response = await from(api.getAccounts(params));
		expect(response.error).to.be.null;
		await I.expectResponseToBeValid(response.result, 'AccountsResponse');
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('I should get account details according to {string}', async params => {
	try {
		params = splitBy(params);

		await I.expectResultToMatchParams(response.result, params);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When('{string} requests {string}', async username => {
	try {
		const api = await I.call();
		const account = getFixtureUser('username', username);

		response = await from(api.getMultisignatureGroups(account.address));
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then('{string} should get {string} account', async username => {
	try {
		const account = getFixtureUser('username', username);

		expect(response.error).to.be.null;
		expect(response.result.data[0].address).to.deep.equal(account.address);

		await I.expectResponseToBeValid(
			response.result,
			'MultisignatureGroupsResponse'
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When('{string} and {string} requests {string} account', async user1 => {
	try {
		const api = await I.call();
		const account = getFixtureUser('username', user1);

		response = await from(api.getMultisignatureMemberships(account.address));
		expect(response.error).to.be.null;

		await I.expectResponseToBeValid(
			response.result,
			'MultisignatureGroupsResponse'
		);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Then(
	'{string} and {string} should get {string} account',
	async (user1, user2) => {
		try {
			const account1 = getFixtureUser('username', user1);
			const account2 = getFixtureUser('username', user2);
			const members = response.result.data[0].members.map(
				member => member.address
			);

			expect(response.error).to.be.null;
			expect(members).to.include.members([account1.address, account2.address]);

			await I.expectResponseToBeValid(
				response.result,
				'MultisignatureGroupsResponse'
			);
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

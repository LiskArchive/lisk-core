const { from, splitBy } = require('../../utils');

const I = actor();
let response;

When('I request for transactions without any params', async () => {
	const api = await I.call();

	response = await from(api.getTransactions());
});

Then(
	'I should get list of {int} transactions sorted by field {string} and order {string}',
	async (count, field, order) => {
		const { result, error } = response;

		expect(error).to.be.null;
		await I.expectResponseToBeValid(result, 'TransactionsResponse');
		await I.expectDefaultCount(result);
		await I.expectResponseToBeSortedBy(result.data, field, order);
	}
);

When('I request for transactions with {string}', async params => {
	const api = await I.call();
	params = splitBy(params);

	response = await from(api.getTransactions(params));
});

Then('I should get transactions according to {string}', async params => {
	const { result, error } = response;
	params = splitBy(params);

	expect(error).to.be.null;
	await I.expectResponseToBeValid(result, 'TransactionsResponse');
	await I.expectResultToMatchParams(result, params);
});

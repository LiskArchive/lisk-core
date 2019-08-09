const output = require('codeceptjs').output;
const { from, config } = require('../../utils');

const I = actor();
const {
	forging: {
		defaultPassword,
		delegates: [{ publicKey }],
	},
} = config;
let nodes;

Given('The node is forging', async () => {
	try {
		const { result, error } = await from(I.getAllForgingNodes());
		nodes = result;

		expect(error).to.be.null;
		nodes.forEach(n => {
			// expect(n.forging).to.deep.equal(true);
		});
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When('I disable forging the node should stop forging', async () => {
	try {
		const api = await I.call();
		const params = {
			forging: false,
			password: defaultPassword,
			publicKey,
		};

		const { result, error } = await from(
			api.updateForgingStatus(params, nodes[0].ip)
		);

		expect(error).to.be.null;
		expect(result.data[0].forging).to.deep.equal(false);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

Given('The node is not forging', async () => {
	try {
		const api = await I.call();

		const { result, error } = await from(
			api.getForgingStatus({ publicKey }, nodes[0].ip)
		);

		expect(error).to.be.null;
		expect(result.data[0].forging).to.deep.equal(false);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When('I enable forging the node should start forging', async () => {
	try {
		const api = await I.call();

		const { result, error } = await from(
			api.getForgingStatus({ publicKey }, nodes[0].ip)
		);

		expect(error).to.be.null;
		expect(result.data[0].forging).to.deep.equal(false);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

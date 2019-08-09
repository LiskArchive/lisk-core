const output = require('codeceptjs').output;
const { getFixtureUser, from, dappMultiAccountName } = require('../../utils');

const I = actor();

let options;
let multiSigTrx;

When('{string} register for dApp {string}', async (userName, dAppName) => {
	try {
		const { passphrase } = getFixtureUser('username', userName);
		options = {
			name: dAppName,
			category: 1,
			description: `dApp for ${dAppName}`,
			tags: '2',
			type: 0,
			link: `https://github.com/blocksafe/SDK-notice/${dappMultiAccountName()}/master.zip`,
			icon: `http://www.blocksafefoundation.com/${dappMultiAccountName()}/header.jpg`,
		};

		const isRegistered = await I.checkIfdAppRegistered(dAppName);
		if (!isRegistered) {
			await I.registerDapp({ passphrase, options });
		}
	} catch (error) {
		output.error(error);
		throw error;
	}
});

When(
	'{string} uses second signature account to register for dApp {string}',
	async (userName, dAppName) => {
		try {
			const { passphrase, secondPassphrase } = getFixtureUser(
				'username',
				userName
			);
			options = {
				name: dAppName,
				category: 1,
				description: `dApp for ${dAppName}`,
				tags: '2',
				type: 0,
				link: `https://github.com/blocksafe/SDK-notice/${dappMultiAccountName()}/master.zip`,
				icon: `http://www.blocksafefoundation.com/${dappMultiAccountName()}/header.jpg`,
			};

			const isRegistered = await I.checkIfdAppRegistered(dAppName);
			if (!isRegistered) {
				await I.registerDapp({ passphrase, secondPassphrase, options });
			}
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

When(
	'{string} uses multi signature account to register for dApp {string}',
	async (userName, dAppName) => {
		try {
			const { passphrase } = getFixtureUser('username', userName);
			options = {
				name: dAppName,
				category: 1,
				description: `dApp for ${dAppName}`,
				tags: '2',
				type: 0,
				link: `https://github.com/blocksafe/SDK-notice/${dappMultiAccountName()}/master.zip`,
				icon: `http://www.blocksafefoundation.com/${dappMultiAccountName()}/header.jpg`,
			};

			const isRegistered = await I.checkIfdAppRegistered(dAppName);
			if (!isRegistered) {
				multiSigTrx = await I.registerDapp({ passphrase, options });
			}
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

When(
	'{string}, {string} send signatures for dApp {string}',
	async (user1, user2, dAppName) => {
		try {
			const isRegistered = await I.checkIfdAppRegistered(dAppName);
			if (!isRegistered) {
				const signer1 = getFixtureUser('username', user1);
				const signer2 = getFixtureUser('username', user2);
				const contracts = [signer1, signer2];

				await I.sendSignaturesForMultisigTrx(multiSigTrx, contracts);
			}
		} catch (error) {
			output.error(error);
			throw error;
		}
	}
);

Then('dApp {string} should be registered', async name => {
	try {
		const api = await I.call();

		const dApp = await from(api.getDapp({ name }));

		expect(dApp.error).to.be.null;
		expect(dApp.result.data[0].name).to.deep.equal(name);
	} catch (error) {
		output.error(error);
		throw error;
	}
});

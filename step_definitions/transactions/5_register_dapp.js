const { getFixtureUser, from, dappMultiAccountName } = require('../../utils');

const I = actor();

let options;
let multiSigTrx;

When('{string} register for dApp {string}', async (userName, dAppName) => {
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
});

When(
	'{string} uses second signature account to register for dApp {string}',
	async (userName, dAppName) => {
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
	}
);

When(
	'{string} uses multi signature account to register for dApp {string}',
	async (userName, dAppName) => {
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
	}
);

When(
	'{string}, {string} send signatures for dApp {string}',
	async (user1, user2, dAppName) => {
		const isRegistered = await I.checkIfdAppRegistered(dAppName);
		if (!isRegistered) {
			const signer1 = getFixtureUser('username', user1);
			const signer2 = getFixtureUser('username', user2);
			const contracts = [signer1, signer2];

			await I.sendSignaturesForMultisigTrx(multiSigTrx, contracts);
		}
	}
);

Then('dApp {string} should be registered', async name => {
	const api = await I.call();

	const dApp = await from(api.getDapp({ name }));

	expect(dApp.error).to.be.null;
	expect(dApp.result.data[0].name).to.deep.equal(name);
});

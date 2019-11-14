const output = require('codeceptjs').output;
const crypto = require('crypto');
const {
	TO_BEDDOWS,
	getKeys,
	generateMnemonic,
	createAccounts,
	TRS_TYPE,
	TRS_PER_BLOCK,
} = require('../../utils');

const I = actor();
const contractsByAddress = {};
const STRESS_COUNT = parseInt(process.env.STRESS_COUNT) || 25;
const NUMBER_OF_BLOCKS = Math.ceil(STRESS_COUNT / TRS_PER_BLOCK);
const EXTRA_LIMIT = Math.ceil(NUMBER_OF_BLOCKS + NUMBER_OF_BLOCKS * 0.1);

const accounts = createAccounts(STRESS_COUNT);

Feature('Generic stress test');

Scenario('Transfer funds', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.TRANSFER
		}==========`
	);

	const LSK_TOKEN = 100;
	const transferTrx = accounts.map(a => ({
		recipientId: a.address,
		amount: TO_BEDDOWS(LSK_TOKEN),
	}));

	try {
		const transferTransactions = await I.transferToMultipleAccounts(
			transferTrx
		);

		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			transferTransactions.map(trx =>
				I.validateTransaction(trx.id, trx.asset.recipientId, LSK_TOKEN)
			)
		);
	} catch (error) {
		output.print('Error while processing transfer fund transaction', error);
	}
})
	.tag('@slow')
	.tag('@generic_t')
	.tag('@stress');

Scenario('Second passphrase on an account', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.SECOND_PASSPHRASE
		}==========`
	);

	try {
		await Promise.all(
			accounts.map(async a => {
				a.secondPassphrase = generateMnemonic();
				await I.registerSecondPassphrase(a.passphrase, a.secondPassphrase, 0);
			})
		);

		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			accounts.map(async a => {
				const { publicKey } = getKeys(a.secondPassphrase);
				const api = await I.call();

				const account = await api.getAccounts({ publicKey: a.publicKey });
				expect(account.data[0].secondPublicKey).to.deep.equal(publicKey);
			})
		);
	} catch (error) {
		output.print(
			'Error while processing second passphrase on an account',
			error
		);
	}
})
	.tag('@slow')
	.tag('@generic_spp')
	.tag('@stress');

Scenario('Delegate Registration', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.DELEGATE_REGISTRATION
		}==========`
	);

	try {
		await Promise.all(
			accounts.map(async a => {
				a.username = crypto.randomBytes(9).toString('hex');

				await I.registerAsDelegate(
					{
						username: a.username,
						passphrase: a.passphrase,
						secondPassphrase: a.secondPassphrase,
					},
					0
				);
			})
		);

		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			accounts.map(async a => {
				const api = await I.call();

				const account = await api.getDelegates({ publicKey: a.publicKey });
				expect(account.data[0].username).to.deep.equal(a.username);
			})
		);
	} catch (error) {
		output.print('Error while processing delegate registration', error);
	}
})
	.tag('@slow')
	.tag('@generic_dr')
	.tag('@stress');

Scenario('Cast vote', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.VOTE
		}==========`
	);

	try {
		await Promise.all(
			accounts.map(a =>
				I.castVotes(
					{
						votes: [a.publicKey],
						passphrase: a.passphrase,
						secondPassphrase: a.secondPassphrase,
					},
					0
				)
			)
		);

		await I.waitForBlock(NUMBER_OF_BLOCKS + 1);

		await Promise.all(
			accounts.map(async a => {
				const api = await I.call();

				const account = await api.getVoters({ publicKey: a.publicKey });
				expect(
					account.data.voters.some(v => v.address === a.address)
				).to.deep.equal(true);
			})
		);
	} catch (error) {
		output.print('Error while processing cast vote transaction', error);
	}
})
	.tag('@slow')
	.tag('@generic_cv')
	.tag('@stress');

Scenario('Register Multi-signature account', async () => {
	output.print(
		`==========Running Stress Test, Transaction Type: ${
			TRS_TYPE.MULTI_SIGNATURE
		}==========`
	);

	try {
		await Promise.all(
			accounts.map(async (a, index) => {
				const { passphrase, secondPassphrase, address } = a;
				const signer1 = accounts[(index + 1) % accounts.length];
				const signer2 = accounts[(index + 2) % accounts.length];
				const contracts = [signer1, signer2];
				const params = {
					lifetime: 1,
					minimum: 2,
					passphrase,
					secondPassphrase,
				};
				contractsByAddress[address] = contracts;

				await I.registerMultisignature(contracts, params, 0);
			})
		);

		await I.waitForBlock(EXTRA_LIMIT);

		await Promise.all(
			accounts.map(async a => {
				const api = await I.call();

				const account = await api.getMultisignatureGroups(a.address);
				await I.expectMultisigAccountToHaveContracts(
					account,
					contractsByAddress[a.address]
				);
			})
		);
	} catch (error) {
		output.print(
			'Error while processing register multi-signature account transaction',
			error
		);
	}
})
	.tag('@slow')
	.tag('@generic_ms')
	.tag('@stress');

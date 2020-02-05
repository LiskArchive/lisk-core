const chai = require('chai');
const { cryptography, passphrase: passphraseUtil, transactions } = require('lisk-elements');
const output = require('codeceptjs').output;
const API = require('./api.js');
const {
	config,
	GENESIS_ACCOUNT,
	ASGARD_FIXTURE,
	seedNode,
	networkIdentifier,
} = require('../fixtures');
const { TO_BEDDOWS, BLOCK_TIME, from } = require('../utils');

const users = {};
chai.config.truncateThreshold = 0;

/* eslint camelcase: ["error", {allow: ["codecept_helper"]}] */
const Helper = codecept_helper;

class LiskUtil extends Helper {
	/**
	 *
	 * @param {Array} list of ip addresses
	 */
	call(apiConfig = config) {
		return new API(apiConfig);
	}

	/**
	 * returns network config object
	 */
	haveNetworkConfig() {
		return config;
	}

	/**
	 * Returns genesis account object
	 */
	haveGenesisAccount() {
		return GENESIS_ACCOUNT;
	}

	/**
	 * Returns asgard account fixture object
	 */
	haveAsgardFixture() {
		return ASGARD_FIXTURE();
	}

	/**
	 * Add user account to memory
	 * @param {string} name name for the account
	 * @param {Object} user account object
	 */
	addAccount(name, user) {
		users[name] = user;
	}

	/**
	 * Get account from memory
	 * @param {string} name account name
	 */
	getAccount(name) {
		return users[name];
	}

	/**
	 * Get all the accounts from memory
	 */
	getAllAccount() {
		return users;
	}

	/**
	 *
	 * @param {number} ms - wait time in millisecond
	 * @returns {Promise}
	 */
	async wait(ms) {
		return new Promise(r =>
			setTimeout(() => {
				r();
			}, ms)
		);
	}

	/**
	 * wait until the network reaches the specific block height
	 * @param {number} numberOfBlocks - number of blocks to wait
	 */
	async waitForBlock(numberOfBlocks = 1) {
		if (numberOfBlocks > 0) {
			const {
				data: { height },
			} = await this.call().getNodeStatus();
			await this.waitUntilBlock(height + numberOfBlocks);
		}
		return true;
	}

	/**
	 * check node height and wait until it reaches the expected height
	 * @param {number} expectedHeight - expected height to reach
	 */
	async waitUntilBlock(expectedHeight, counter) {
		const {
			data: { height },
		} = await this.call().getNodeStatus();
		const pendingTrxCnt = await this.getPendingTransactionCount();

		counter = counter ? (counter += 1) : 1;

		output.print(
			`Counter: ${counter}, Timestamp: ${new Date().toISOString()}, current height: ${height}, expected height: ${expectedHeight}, pending trxs: ${pendingTrxCnt}`
		);

		if (counter >= 20) {
			return true;
		}

		if (height >= expectedHeight) {
			// Remove the buffer time when network is stable
			if (pendingTrxCnt >= 0) {
				await this.wait(BLOCK_TIME);
			}
			return height;
		}

		await this.wait(BLOCK_TIME);
		await this.waitUntilBlock(expectedHeight, counter);
		return true;
	}

	/**
	 * create lisk account wallet
	 * @returns account object
	 */
	createAccount() {
		const passphrase = passphraseUtil.Mnemonic.generateMnemonic();
		const { publicKey } = cryptography.getKeys(passphrase);
		const address = cryptography.getAddressFromPublicKey(publicKey);

		return {
			passphrase,
			publicKey,
			address,
		};
	}

	/**
	 * Broadcast a transaction to network and validate response
	 * @param {object} transaction transaction object
	 */
	async broadcastAndValidateTransaction(transaction) {
		const { result, error } = await from(
			this.call().broadcastTransactions(transaction)
		);

		if (error) {
			output.print(`Failed to broadcast transaction: ${transaction.id}`);
			output.error(error);
			return;
		}
		expect(error).to.be.null;
		this.helpers.ValidateHelper.expectResponseToBeValid(
			result,
			'GeneralStatusResponse'
		);
		expect(result.data.message).to.deep.equal('Transaction(s) accepted');
	}

	/**
	 * Broadcast a signature to network and validate response
	 * @param {object} transaction transaction object
	 */
	async broadcastAndValidateSignature(signature) {
		const { result, error } = await from(
			this.call().broadcastSignatures(signature)
		);

		if (error) {
			output.print(
				'Failed to broadcast signature for transaction: ',
				signature.transactionId
			);
			output.error(error);
			return;
		}
		expect(error).to.be.null;
		this.helpers.ValidateHelper.expectResponseToBeValid(
			result,
			'SignatureResponse'
		);
		expect(result.data.message).to.deep.equal('Signature Accepted');
	}

	/**
	 * Broadcast a transaction, validate response and wait for a block to forge
	 * @param {Object} transaction - The transaction to be broadcasted
	 * @param {Number} blocksToWait - Number of blocks to wait, default 1 block
	 * @returns {Object} transaction
	 */
	async broadcastAndValidateTransactionAndWait(transaction, blocksToWait = 1) {
		await this.broadcastAndValidateTransaction(transaction);
		await this.waitForBlock(blocksToWait);
	}

	/**
	 * Broadcast a signature transaction, validate response and wait for a block to forge
	 * @param {Object} signature - The signature transaction to be broadcasted
	 * @param {Number} blocksToWait - Number of blocks to wait, default 1 block
	 * @param {*} signature
	 */
	async broadcastAndValidateSignatureAndWait(signature, blocksToWait = 1) {
		await this.broadcastAndValidateSignature(signature);
		await this.waitForBlock(blocksToWait);
	}

	/**
	 * Generate signature for a given accounts and transaction
	 * @param {Array} accounts List of accounts
	 * @param {Object} transaction Transaction object
	 */
	createSignatures(accounts, transaction) {
		return accounts.map(account => {
			const signature = transactions.createSignatureObject({
				transaction,
				passphrase: account.passphrase,
				networkIdentifier,
			}).signature;

			return {
				transactionId: transaction.id,
				publicKey: account.publicKey,
				signature,
			};
		});
	}

	/**
	 * Transfer tokens from one account to another
	 * @param {Object} account - account data
	 * @param {string} account.recipientId - The recipient address
	 * @param {string} account.amount - The amount sender wants to transfer to recipient
	 * @param {string} account.passphrase - The sender passphrase, default is genesis account
	 * @param {string} account.secondPassphrase - The sender second passphrase
	 * @param {Number} blocksToWait - Number of blocks to wait
	 * @returns {Object} transaction
	 */
	async transfer(account, blocksToWait) {
		if (!account.passphrase) {
			account.passphrase = GENESIS_ACCOUNT.password;
		}
		account.networkIdentifier = networkIdentifier;

		const trx = transactions.transfer(account);

		await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));

		return trx;
	}

	/**
	 * Multiple Transfers transaction from one account to another
	 * @param {Object} accounts - accounts data
	 * @param {string} accounts.recipientId - The recipient address
	 * @param {string} accounts.amount - The amount sender wants to transfer to recipient
	 * @param {string} accounts.passphrase - The sender passphrase, default is genesis account
	 * @param {string} accounts.secondPassphrase - The sender second passphrase
	 * @returns {Object} transaction
	 */
	async transferToMultipleAccounts(accounts) {
		const trxs = accounts.map(a => {
			if (!a.passphrase) {
				a.passphrase = GENESIS_ACCOUNT.password;
			}
			a.networkIdentifier = networkIdentifier;

			return transactions.transfer(a);
		});

		await from(
			Promise.all(trxs.map(t => this.broadcastAndValidateTransaction(t)))
		);

		return trxs;
	}

	/**
	 * Prepare signature for a given transaction with contracts and broadcast the signatures
	 * @param {object} transaction transaction corresponding to signatures
	 * @param {array} contracts signers required to approve the transaction
	 * @param {number} blocksToWait number of blocks to wait for the transaction to confirm
	 */
	async sendSignaturesForMultisigTrx(transaction, contracts, blocksToWait) {
		const signatures = contracts.map(s => ({
			transactionId: transaction.id,
			networkIdentifier,
			publicKey: s.publicKey,
			signature: transactions.createSignatureObject({
				transaction,
				passphrase: s.passphrase,
				networkIdentifier,
			}).signature,
		}));

		await Promise.all(
			signatures.map(s => this.broadcastAndValidateSignature(s))
		);
		await this.waitForBlock(blocksToWait);
	}

	/**
	 * Register second passphrase on an account
	 * @param {string} passphrase - User account passphrase
	 * @param {string} secondPassphrase - New secondPassphrase to register on account
	 * @param {Number} blocksToWait - Number of blocks to wait
	 * @returns {Object} transaction
	 */
	async registerSecondPassphrase(passphrase, secondPassphrase, blocksToWait) {
		const trx = transactions.registerSecondPassphrase({
			passphrase,
			secondPassphrase,
			networkIdentifier,
		});

		await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));

		return trx;
	}

	/**
	 * Register as delegate
	 * @param {Object} params - parameters for registering as delegate
	 * @param {string} params.username - Username for registering as delegate
	 * @param {string} params.passphrase - User account passphrase
	 * @param {string} params.secondPassphrase - User secondPassphrase
	 * @param {Number} blocksToWait - Number of blocks to wait
	 * @returns {Object} transaction
	 */
	async registerAsDelegate(params, blocksToWait) {
		const trx = transactions.registerDelegate({
			...params,
			networkIdentifier,
		});

		await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));

		return trx;
	}

	/**
	 * Cast votes to delegates
	 * @param {Object} params - parameters to cast vote for delegate
	 * @param {Array} params.votes - list of publickeys for upvote
	 * @param {string} params.passphrase - User account passphrase
	 * @param {string} params.secondPassphrase - User account second passphrase
	 * @param {Number} blocksToWait - Number of blocks to wait
	 */
	async castVotes(params, blocksToWait) {
		const trx = transactions.castVotes({
			...params,
			networkIdentifier,
		});
		await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));
	}

	/**
	 * Cast unvotes to delegates
	 * @param {Object} params - parameters to cast vote for delegate
	 * @param {Array} params.unvotes - list of publickeys for downvote
	 * @param {string} params.passphrase - User account passphrase
	 * @param {string} params.secondPassphrase - User account second passphrase
	 * @param {Number} blocksToWait - Number of blocks to wait
	 */
	async castUnvotes(params, blocksToWait) {
		const trx = transactions.castUnvotes({
			...params,
			networkIdentifier,
		});
		await from(this.broadcastAndValidateTransactionAndWait(trx, blocksToWait));
	}

	/**
	 * Register multisignature account
	 * @param {Array} accounts - List of accounts for register multisignature account
	 * @param {Object} params - parameters to register for multisignature account
	 * @param {number} params.lifetime - Timeframe in which a multisignature transaction will exist in memory before the transaction is confirmed
	 * @param {number} params.minimum - Minimum signatures required to confirm multisignature transaction
	 * @param {string} params.passphrase - Passphrase of the multisignature account creator
	 * @param {string} params.secondPassphrase - Second passphrase of the multisignature account creator
	 * @param {Number} blocksToWait - Number of blocks to wait
	 * @returns
	 */
	async registerMultisignature(accounts, params, blocksToWait) {
		const keysgroup = accounts.map(account => account.publicKey);

		const registerMultisignatureTrx = transactions.registerMultisignature(
			{ ...params, keysgroup, networkIdentifier }
		);

		const signatures = this.createSignatures(
			accounts,
			registerMultisignatureTrx
		);

		await this.broadcastAndValidateTransactionAndWait(
			registerMultisignatureTrx,
			blocksToWait
		);

		await Promise.all(
			signatures.map(s => this.broadcastAndValidateSignature(s))
		);

		await this.waitForBlock(blocksToWait);
		return registerMultisignatureTrx;
	}

	/**
	 *
	 * @param {Object} data Parameters for registering dApp
	 * @param {string} data.passphrase Passphrase of the dApp registrar
	 * @param {string} data.secondPassphrase second passphrase of the dApp registrar
	 * @param {Object} data.options Options for registering dApp
	 * @param {Number} blocksToWait - Number of blocks to wait
	 */
	async registerDapp(data, blocksToWait) {
		const dAppTrx = transactions.createDapp({
			...data,
			networkIdentifier,
		});

		await this.broadcastAndValidateTransactionAndWait(dAppTrx, blocksToWait);

		return dAppTrx;
	}

	async checkIfdAppRegistered(name) {
		const { result, error } = await from(this.call().getDapp({ name }));

		expect(error).to.be.null;
		return result.data.length && result.data[0].name === name;
	}

	/**
	 *
	 * @param {string} id - transaction id for validation
	 * @param {string} recipientId - recipient address
	 * @param {string} amount - amount sent my sender to validate againt the transaction
	 * @param {string} senderId - sender address, default is genesis account
	 */
	async validateTransaction(
		id,
		recipientId,
		amount,
		senderId = GENESIS_ACCOUNT.address
	) {
		const response = await from(
			this.call().getTransactions({
				id,
				senderId,
				recipientId,
			})
		);

		expect(response.error).to.be.null;
		this.helpers.ValidateHelper.expectResponseToBeValid(
			response.result,
			'TransactionsResponse'
		);

		expect(response.result.data).to.be.an('array').that.is.not.empty;
		return expect(response.result.data[0].asset.amount).to.deep.equal(
			TO_BEDDOWS(amount)
		);
	}

	async checkIfVoteOrUnvoteCasted(votesOrUnvotes, address) {
		const { result, error } = await from(this.call().getVoters({ address }));

		expect(error).to.be.null;
		this.helpers.ValidateHelper.expectResponseToBeValid(
			result,
			'VotersResponse'
		);

		const isVoted =
			result.data &&
			result.data.voters &&
			result.data.voters.some(v => votesOrUnvotes.includes(v.publicKey));

		return isVoted;
	}

	/**
	 * Check if the multisignature transaction confirmed in the network
	 * @param {string} address multisignature account address
	 * @param {array} contracts multisignature contracts
	 */
	async checkIfMultisigAccountExists(address, contracts) {
		const { result, error } = await from(
			this.call().getMultisignatureGroups(address)
		);

		if (error && error.message === 'Multisignature account not found') {
			output.print(error.message);
			return false;
		}
		if (result.data && result.data.length && result.data[0].members) {
			const members = contracts.map(c => c.address);
			return result.data[0].members.some(m => members.includes(m.address));
		}
		output.print(error);
		return false;
	}

	/**
	 * returns count of transactions in queue
	 */
	async getPendingTransactionCount() {
		const { result } = await from(this.call().getTransactionsFromPool({}));

		return result.reduce((acc, curr) => acc + curr.meta.count, 0);
	}

	/**
	 * Returns list if all the peers in the network, connected, disconnected and blocked
	 * @param {number} limit initial limit
	 * @param {number} offset initial offset
	 */
	async getAllPeers(limit, offset, state = 'connected', node = undefined) {
		const peerResult = await from(
			this.call().getPeers({ limit, offset, state }, node)
		);

		if (!process.env.NETWORK || process.env.NETWORK === 'development') {
			return [seedNode];
		}

		expect(peerResult.error).to.be.null;

		const count = Math.ceil(peerResult.result.meta.count / limit) - 1;

		const pagination = Array(count)
			.fill()
			.map((v, i) => limit * (i + 1));

		const peerList = peerResult.result.data;

		await pagination.reduce(async (acc, curr) => {
			const accRes = await acc;
			const { result, error } = await from(
				this.call().getPeers({ limit, offset: curr })
			);

			expect(error).to.be.null;
			accRes.push(...result.data);
			return accRes;
		}, peerList);

		return peerList;
	}

	/**
	 * Returns list of all the forging nodes with ip address and corresponding publickey
	 */
	async getAllForgingNodes() {
		const peers = await this.getAllPeers(100, 0);
		const forgingStatus = await Promise.all(
			peers.map(async p => {
				const { result, error } = await from(
					this.call().getForgingStatus({}, `${p.ip}:4000`)
				);

				expect(error).to.be.null;
				if (result && result.data.length) {
					const forgingDelegates = result.data.filter(d => d.forging);

					if (forgingDelegates[0]) {
						return { ip: p.ip, ...forgingDelegates[0] };
					}
					return false;
				}
				return false;
			})
		);

		return forgingStatus.filter(n => n);
	}

	/**
	 * Returns list of all the forging nodes for a given publickey
	 * @param {string} publicKey delegate account publickey
	 */
	async getForgingDelegateNode(publicKey) {
		const forgingNodes = await this.getAllForgingNodes();
		return forgingNodes.filter(n => n.publicKey === publicKey && n.forging);
	}

	/**
	 * Returns the list of all the node heights
	 */
	async getAllNodeHeights() {
		const peers = await this.getAllPeers(100, 0);

		await Promise.all(
			peers.map(async p => {
				const response = await from(this.call().getNodeStatus(p.ip));

				if (response.result && response.result.data) {
					return response.result.data.height;
				}
				return false;
			})
		);
	}

	/**
	 * Validates if the network is moving every 10 seconds
	 */
	async checkIfNetworkIsMoving() {
		let heights = await this.getAllNodeHeights();
		const previousHeight = Math.max(heights.filter(h => h));

		await this.waitForBlock();

		heights = await this.getAllNodeHeights();
		const currentHeight = Math.max(heights.filter(h => h));

		expect(currentHeight).to.be.above(previousHeight);
	}

	/**
	 * Validates if delegates are forging on nodes
	 */
	async checkIfDelegatesAreForging() {
		const { result, error } = await from(this.getAllForgingNodes());

		expect(error).to.be.null;
		result.forEach(d => {
			expect(d.forging).to.deep.equal(true);
		});
	}

	/**
	 * Waits until the transaction is confirmed on the network
	 * @param {string} id transaction id
	 */
	async waitForTransactionToConfirm(id, numberOfBlocks = 1, counter) {
		counter = counter ? (counter += 1) : 1;
		const { result, error } = await from(this.call().getTransactions({ id }));

		if (counter >= 5) {
			output.print(
				`Counter: ${counter}, Timestamp: ${new Date().toISOString()}, Transaction: ${id}`
			);
			return true;
		}

		expect(error).to.be.null;
		if (result.data.length) {
			return result;
		}
		await this.waitForBlock(numberOfBlocks);
		await this.waitForTransactionToConfirm(id, numberOfBlocks, counter);
		return true;
	}

	async waitUntilNodeSyncWithNetwork(height, expectedHeight) {
		output.print(
			`Node sync started height: ${height}, ExpectedHeight to reach: ${expectedHeight}`
		);
		const nodeStatus = await this.call().getNodeStatus();

		if (nodeStatus.data.height >= expectedHeight) {
			output.print(
				`Reached expected height: ${expectedHeight}, Node current height: ${
				nodeStatus.data.height
				}`
			);
			return;
		}
		await this.waitForBlock(10);
		await this.waitUntilNodeSyncWithNetwork(height, expectedHeight);
	}
}

module.exports = LiskUtil;

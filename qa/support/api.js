const output = require('codeceptjs').output;
const elements = require('lisk-elements');

class API {
	constructor(config) {
		const { peers } = config;

		this.peers = peers;
		this.clients = this.createApiClients();
	}

	createApiClients() {
		return this.peers.map(node => {
			const url = `http://${node}`;
			const client = new elements.APIClient([url]);
			return {
				node,
				url,
				client,
			};
		});
	}

	getClientByAddress(node) {
		if (node) {
			const clientList = this.clients.filter(
				client => client.node === node
			)[0];
			return clientList ? clientList.client : this.clients[0].client;
		}
		// TODO: until the network is stablized and
		// broadcasting works as expected we have to use seednode
		return this.clients[0].client;
	}

	async getNodeStatus(node) {
		try {
			const client = this.getClientByAddress(node);
			return client.node.getStatus();
		} catch (error) {
			output.print('API.getNodeStatus: Error while processing request');
			output.error(error);
			await this.getNodeStatus(node);
		}
		return true;
	}

	async getNodeConstants(node) {
		try {
			const client = this.getClientByAddress(node);
			return client.node.getConstants();
		} catch (error) {
			output.print('API.getNodeConstants: Error while processing request');
			output.error(error);
			await this.getNodeConstants(node);
		}
		return true;
	}

	async getForgingStatus(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.node.getForgingStatus(params);
		} catch (error) {
			output.print('API.getForgingStatus: Error while processing request');
			output.error(error);
			await this.getForgingStatus(params, node);
		}
		return true;
	}

	async updateForgingStatus(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.node.updateForgingStatus(params);
		} catch (error) {
			output.print('API.updateForgingStatus: Error while processing request');
			output.error(error);
			await this.updateForgingStatus(params, node);
		}
		return true;
	}

	async getTransactionsByState(state, params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.node.getTransactions(state, params);
		} catch (error) {
			output.print(
				'API.getTransactionsByState: Error while processing request'
			);
			output.error(error);
			await this.getTransactionsByState(state, params, node);
		}
		return true;
	}

	async getTransactionsFromPool(params, states = ['pending', 'ready', 'received', 'validated', 'verified']) {
		try {
			return Promise.all(states.map(state => this.getTransactionsByState(state, params, '')));
		} catch (error) {
			output.print(
				'API.getTransactionsFromPool: Error while processing request'
			);
			output.error(error);
		}
		return true;
	}

	async getPeers(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.peers.get(params);
		} catch (error) {
			output.print('API.getPeers: Error while processing request');
			output.error(error);
			await this.getPeers(params, node);
		}
		return true;
	}

	async getAccounts(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.accounts.get(params);
		} catch (error) {
			output.print('API.getAccounts: Error while processing request');
			output.error(error);
			await this.getAccounts(params, node);
		}
		return true;
	}

	async getMultisignatureGroups(address, params = {}, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.accounts.getMultisignatureGroups(address, params);
		} catch (error) {
			output.print(
				'API.getMultisignatureGroups: Error while processing request'
			);
			output.error(error);
			await this.getMultisignatureGroups(address, (params = {}), node);
		}
		return true;
	}

	async getMultisignatureMemberships(address, params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.accounts.getMultisignatureMemberships(address, params);
		} catch (error) {
			output.print(
				'API.getMultisignatureMemberships: Error while processing request'
			);
			output.error(error);
			await this.getMultisignatureMemberships(address, params, node);
		}
		return true;
	}

	async getBlocks(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.blocks.get(params);
		} catch (error) {
			output.print('API.getBlocks: Error while processing request');
			output.error(error);
			await this.getBlocks(params, node);
		}
		return true;
	}

	async getTransactions(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.transactions.get(params);
		} catch (error) {
			output.print('API.getTransactions: Error while processing request');
			output.error(error);
			await this.getTransactions(params, node);
		}
		return true;
	}

	async broadcastTransactions(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.transactions.broadcast(params);
		} catch (error) {
			output.print('API.broadcastTransactions: Error while processing request');
			output.error(error);
			await this.broadcastTransactions(params, node);
		}
		return true;
	}

	async broadcastSignatures(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.signatures.broadcast(params);
		} catch (error) {
			output.print('API.broadcastSignatures: Error while processing request');
			output.error(error);
			await this.broadcastSignatures(params, node);
		}
		return true;
	}

	async getForgers(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.delegates.getForgers(params);
		} catch (error) {
			output.print('API.getForgers: Error while processing request');
			output.error(error);
			await this.getForgers(params, node);
		}
		return true;
	}

	async getForgingStatistics(address, params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.delegates.getForgingStatistics(address, params);
		} catch (error) {
			output.print('API.getForgingStatistics: Error while processing request');
			output.error(error);
			await this.getForgingStatistics(address, params, node);
		}
		return true;
	}

	async getDelegates(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.delegates.get(params);
		} catch (error) {
			output.print('API.getDelegates: Error while processing request');
			output.error(error);
			await this.getDelegates(params, node);
		}
		return true;
	}

	async getVotes(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.votes.get(params);
		} catch (error) {
			output.print('API.getVotes: Error while processing request');
			output.error(error);
			await this.getVotes(params, node);
		}
		return true;
	}

	async getVoters(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.voters.get(params);
		} catch (error) {
			output.print('API.getVoters: Error while processing request');
			output.error(error);
			await this.getVoters(params, node);
		}
		return true;
	}

	async getDapp(params, node) {
		try {
			const client = this.getClientByAddress(node);
			return client.dapps.get(params);
		} catch (error) {
			output.print('API.getDapp: Error while processing request');
			output.error(error);
			await this.getDapp(params, node);
		}
		return true;
	}
}

module.exports = API;

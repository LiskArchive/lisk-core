const output = require('codeceptjs').output;
const elements = require('lisk-elements');

class API {
	constructor(config) {
		const { peers, httpPort } = config;

		this.peers = peers;
		this.httpPort = httpPort;
		this.clients = this.createApiClients();
	}

	createApiClients() {
		return this.peers.map(ip => {
			const url = `http://${ip}:${this.httpPort}`;
			const client = new elements.APIClient([url]);
			return {
				ip,
				url,
				client,
			};
		});
	}

	async getClientByAddress(ipAddress) {
		if (ipAddress) {
			const clientList = this.clients.filter(client => client.ip === ipAddress)[0];
			return clientList
				? clientList.client
				: this.clients[0].client;
		}
		// TODO: until the network is stablized and
		// broadcasting works as expected we have to use seednode
		return this.clients[0].client;
	}

	async getNodeStatus(ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.node.getStatus();
		} catch (error) {
			output.print('API.getNodeStatus: Error while processing request');
			output.error(error);
			await this.getNodeStatus(ipAddress);
		}
		return true;
	}

	async getNodeConstants(ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.node.getConstants();
		} catch (error) {
			output.print('API.getNodeConstants: Error while processing request');
			output.error(error);
			await this.getNodeConstants(ipAddress);
		}
		return true;
	}

	async getForgingStatus(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.node.getForgingStatus(params);
		} catch (error) {
			output.print('API.getForgingStatus: Error while processing request');
			output.error(error);
			await this.getForgingStatus(params, ipAddress);
		}
		return true;
	}

	async updateForgingStatus(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.node.updateForgingStatus(params);
		} catch (error) {
			output.print('API.updateForgingStatus: Error while processing request');
			output.error(error);
			await this.updateForgingStatus(params, ipAddress);
		}
		return true;
	}

	async getTransactionsByState(state, params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.node.getTransactions(state, params);
		} catch (error) {
			output.print('API.getTransactionsByState: Error while processing request');
			output.error(error);
			await this.getTransactionsByState(state, params, ipAddress);
		}
		return true;
	}

	async getPeers(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.peers.get(params);
		} catch (error) {
			output.print('API.getPeers: Error while processing request');
			output.error(error);
			await this.getPeers(params, ipAddress);
		}
		return true;
	}

	async getAccounts(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.accounts.get(params);
		} catch (error) {
			output.print('API.getAccounts: Error while processing request');
			output.error(error);
			await this.getAccounts(params, ipAddress);
		}
		return true;
	}

	async getMultisignatureGroups(address, params = {}, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.accounts.getMultisignatureGroups(address, params);
		} catch (error) {
			output.print('API.getMultisignatureGroups: Error while processing request');
			output.error(error);
			await this.getMultisignatureGroups(address, (params = {}), ipAddress);
		}
		return true;
	}

	async getMultisignatureMemberships(address, params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.accounts.getMultisignatureMemberships(address, params);
		} catch (error) {
			output.print('API.getMultisignatureMemberships: Error while processing request');
			output.error(error);
			await this.getMultisignatureMemberships(address, params, ipAddress);
		}
		return true;
	}

	async getBlocks(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.blocks.get(params);
		} catch (error) {
			output.print('API.getBlocks: Error while processing request');
			output.error(error);
			await this.getBlocks(params, ipAddress);
		}
		return true;
	}

	async getTransactions(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.transactions.get(params);
		} catch (error) {
			output.print('API.getTransactions: Error while processing request');
			output.error(error);
			await this.getTransactions(params, ipAddress);
		}
		return true;
	}

	async broadcastTransactions(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.transactions.broadcast(params);
		} catch (error) {
			output.print('API.broadcastTransactions: Error while processing request');
			output.error(error);
			await this.broadcastTransactions(params, ipAddress);
		}
		return true;
	}

	async broadcastSignatures(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.signatures.broadcast(params);
		} catch (error) {
			output.print('API.broadcastSignatures: Error while processing request');
			output.error(error);
			await this.broadcastSignatures(params, ipAddress);
		}
		return true;
	}

	async getForgers(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.delegates.getForgers(params);
		} catch (error) {
			output.print('API.getForgers: Error while processing request');
			output.error(error);
			await this.getForgers(params, ipAddress);
		}
		return true;
	}

	async getForgingStatistics(address, params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.delegates.getForgingStatistics(address, params);
		} catch (error) {
			output.print('API.getForgingStatistics: Error while processing request');
			output.error(error);
			await this.getForgingStatistics(address, params, ipAddress);
		}
		return true;
	}

	async getDelegates(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.delegates.get(params);
		} catch (error) {
			output.print('API.getDelegates: Error while processing request');
			output.error(error);
			await this.getDelegates(params, ipAddress);
		}
		return true;
	}

	async getVotes(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.votes.get(params);
		} catch (error) {
			output.print('API.getVotes: Error while processing request');
			output.error(error);
			await this.getVotes(params, ipAddress);
		}
		return true;
	}

	async getVoters(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.voters.get(params);
		} catch (error) {
			output.print('API.getVoters: Error while processing request');
			output.error(error);
			await this.getVoters(params, ipAddress);
		}
		return true;
	}

	async getDapp(params, ipAddress) {
		try {
			const client = await this.getClientByAddress(ipAddress);
			return client.dapps.get(params);
		} catch (error) {
			output.print('API.getDapp: Error while processing request');
			output.error(error);
			await this.getDapp(params, ipAddress);
		}
		return true;
	}
}

module.exports = API;

const output = require('codeceptjs').output;
const elements = require('lisk-elements');
const { seedNode } = require('../fixtures');

class API {
	constructor(config) {
		const { seed, nodes, httpPort } = config;

		this.seed = seed;
		this.nodes = nodes;
		this.httpPort = httpPort;

		const apiClients = () => {
			const ips = [...this.seed, ...this.nodes];
			return ips.map(ip => {
				const url = `http://${ip}:${httpPort}`;
				const client = new elements.APIClient([url]);
				return {
					ip,
					url,
					client,
				};
			});
		};
		this.clients = apiClients();
	}

	static getClientByAddress(clients, ip_address) {
		const seedIp = seedNode()[0];
		if (ip_address) {
			const clientList = clients.filter(client => client.ip === ip_address)[0];
			return clientList
				? clientList.client
				: clients.filter(client => client.ip === seedIp)[0].client;
		}
		// TODO: The network is not stable with propagation and broadcasting
		// once its stable need to uncomment get random ip
		// const ip = getRandomIpAddress();
		return clients.filter(client => client.ip === seedIp)[0].client;
	}

	async getNodeStatus(ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.node.getStatus();
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getNodeStatus(ip_address);
		}
		return true;
	}

	async getNodeConstants(ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.node.getConstants();
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getNodeConstants(ip_address);
		}
		return true;
	}

	async getForgingStatus(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.node.getForgingStatus(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getForgingStatus(params, ip_address);
		}
		return true;
	}

	async updateForgingStatus(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.node.updateForgingStatus(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.updateForgingStatus(params, ip_address);
		}
		return true;
	}

	async getTransactionsByState(state, params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.node.getTransactions(state, params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getTransactionsByState(state, params, ip_address);
		}
		return true;
	}

	async getPeers(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.peers.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getPeers(params, ip_address);
		}
		return true;
	}

	async getAccounts(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.accounts.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getAccounts(params, ip_address);
		}
		return true;
	}

	async getMultisignatureGroups(address, params = {}, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.accounts.getMultisignatureGroups(address, params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getMultisignatureGroups(address, (params = {}), ip_address);
		}
		return true;
	}

	async getMultisignatureMemberships(address, params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.accounts.getMultisignatureMemberships(address, params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getMultisignatureMemberships(address, params, ip_address);
		}
		return true;
	}

	async getBlocks(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.blocks.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getBlocks(params, ip_address);
		}
		return true;
	}

	async getTransactions(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.transactions.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getTransactions(params, ip_address);
		}
		return true;
	}

	async broadcastTransactions(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.transactions.broadcast(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.broadcastTransactions(params, ip_address);
		}
		return true;
	}

	async broadcastSignatures(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.signatures.broadcast(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.broadcastSignatures(params, ip_address);
		}
		return true;
	}

	async getForgers(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.delegates.getForgers(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getForgers(params, ip_address);
		}
		return true;
	}

	async getForgingStatistics(address, params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.delegates.getForgingStatistics(address, params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getForgingStatistics(address, params, ip_address);
		}
		return true;
	}

	async getDelegates(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.delegates.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getDelegates(params, ip_address);
		}
		return true;
	}

	async getVotes(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.votes.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getVotes(params, ip_address);
		}
		return true;
	}

	async getVoters(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.voters.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getVoters(params, ip_address);
		}
		return true;
	}

	async getDapp(params, ip_address) {
		try {
			const client = API.getClientByAddress(this.clients, ip_address);
			return client.dapps.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getDapp(params, ip_address);
		}
		return true;
	}
}

module.exports = API;

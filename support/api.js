const output = require('codeceptjs').output;
const elements = require('lisk-elements');
const { seedNode } = require('../fixtures');

class API {
	constructor(config) {
		const { peers, httpPort } = config;

		this.seed = seedNode;
		this.peers = peers;
		this.httpPort = httpPort;

		const apiClients = () => {
			const ips = [this.seed, ...this.peers];
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

	static getClientByAddress(clients, ipAddress) {
		if (ipAddress) {
			const clientList = clients.filter(client => client.ip === ipAddress)[0];
			return clientList
				? clientList.client
				: clients.filter(client => client.ip === seedNode)[0].client;
		}
		// TODO: The network is not stable with propagation and broadcasting
		// once its stable need to uncomment get random ip
		// const ip = getRandomIpAddress();
		return clients.filter(client => client.ip === seedNode)[0].client;
	}

	async getNodeStatus(ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.node.getStatus();
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getNodeStatus(ipAddress);
		}
		return true;
	}

	async getNodeConstants(ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.node.getConstants();
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getNodeConstants(ipAddress);
		}
		return true;
	}

	async getForgingStatus(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.node.getForgingStatus(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getForgingStatus(params, ipAddress);
		}
		return true;
	}

	async updateForgingStatus(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.node.updateForgingStatus(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.updateForgingStatus(params, ipAddress);
		}
		return true;
	}

	async getTransactionsByState(state, params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.node.getTransactions(state, params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getTransactionsByState(state, params, ipAddress);
		}
		return true;
	}

	async getPeers(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.peers.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getPeers(params, ipAddress);
		}
		return true;
	}

	async getAccounts(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.accounts.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getAccounts(params, ipAddress);
		}
		return true;
	}

	async getMultisignatureGroups(address, params = {}, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.accounts.getMultisignatureGroups(address, params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getMultisignatureGroups(address, (params = {}), ipAddress);
		}
		return true;
	}

	async getMultisignatureMemberships(address, params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.accounts.getMultisignatureMemberships(address, params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getMultisignatureMemberships(address, params, ipAddress);
		}
		return true;
	}

	async getBlocks(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.blocks.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getBlocks(params, ipAddress);
		}
		return true;
	}

	async getTransactions(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.transactions.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getTransactions(params, ipAddress);
		}
		return true;
	}

	async broadcastTransactions(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.transactions.broadcast(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.broadcastTransactions(params, ipAddress);
		}
		return true;
	}

	async broadcastSignatures(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.signatures.broadcast(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.broadcastSignatures(params, ipAddress);
		}
		return true;
	}

	async getForgers(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.delegates.getForgers(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getForgers(params, ipAddress);
		}
		return true;
	}

	async getForgingStatistics(address, params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.delegates.getForgingStatistics(address, params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getForgingStatistics(address, params, ipAddress);
		}
		return true;
	}

	async getDelegates(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.delegates.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getDelegates(params, ipAddress);
		}
		return true;
	}

	async getVotes(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.votes.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getVotes(params, ipAddress);
		}
		return true;
	}

	async getVoters(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.voters.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getVoters(params, ipAddress);
		}
		return true;
	}

	async getDapp(params, ipAddress) {
		try {
			const client = API.getClientByAddress(this.clients, ipAddress);
			return client.dapps.get(params);
		} catch (error) {
			output.error('Error while processing request', error);
			await this.getDapp(params, ipAddress);
		}
		return true;
	}
}

module.exports = API;

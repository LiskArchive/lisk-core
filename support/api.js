const elements = require('lisk-elements');
const { config } = require('../fixtures');

class API {
    constructor(config) {
        const { seed, nodes } = config;

        this.seed = seed;
        this.nodes = nodes;

        const apiClients = () => {
            const ips = [...this.seed, ...this.nodes];
            return ips.map(ip => {
                const client = new elements.APIClient([ip]);
                return {
                    ip,
                    client
                }
            })
        }
        this.clients = apiClients();
    }

    static getClientByAddress(clients, address) {
        if (!address) {
            const { seed: [ip] } = config();
            return clients.filter(client => client.ip === ip)[0].client;
        }
        const ip = `http://${address}:${config().httpPort}`;
        return clients.filter(client => client.ip === ip)[0].client;
    }

    async getNodeStatus(address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.node.getStatus();
    }

    async getNodeConstants(address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.node.getConstants();
    }

    async getForgingStatus(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.node.getForgingStatus(params);
    }

    async updateForgingStatus(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.node.updateForgingStatus(params);
    }

    async updateForgingStatus(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.node.updateForgingStatus(params);
    }

    async getTransactionsByState(state, params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.node.getTransactions(state, params);
    }

    async getPeers(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.peers.get(params);
    }

    async getAccounts(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.accounts.get(params);
    }

    async getMultisignatureGroups(address, params = {}, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.accounts.getMultisignatureGroups(address, params);
    }

    async getMultisignatureMemberships(address, params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.accounts.getMultisignatureMemberships(address, params);
    }

    async getBlocks(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.blocks.get(params);
    }

    async getTransactions(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.transactions.get(params);
    }

    async broadcastTransactions(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.transactions.broadcast(params);
    }

    async broadcastSignatures(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.signatures.broadcast(params);
    }

    async getDelegates(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.delegates.get(params);
    }

    async getForgers(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.delegates.getForgers(params);
    }

    async getForgingStatistics(address, params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.delegates.getForgingStatistics(address, params);
    }

    async getDelegates(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.delegates.get(params);
    }

    async getVotes(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.votes.get(params);
    }

    async getVoters(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.voters.get(params);
    }

    async getDapp(params, address) {
        const client = API.getClientByAddress(this.clients, address);
        return client.dapps.get(params);
    }
}

module.exports = API;

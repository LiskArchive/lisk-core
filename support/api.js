const elements = require('lisk-elements');
const { config } = require('../fixtures');

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
                    client
                }
            })
        }
        this.clients = apiClients();
    }

    static getClientByAddress(clients, ip_address) {
        if (!ip_address) {
            const { seed: [ip] } = config();
            return clients.filter(client => client.ip === ip)[0].client;
        }
        return clients.filter(client => client.ip === ip_address)[0].client;
    }

    async getNodeStatus(ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.node.getStatus();
    }

    async getNodeConstants(ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.node.getConstants();
    }

    async getForgingStatus(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.node.getForgingStatus(params);
    }

    async updateForgingStatus(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.node.updateForgingStatus(params);
    }

    async getTransactionsByState(state, params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.node.getTransactions(state, params);
    }

    async getPeers(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.peers.get(params);
    }

    async getAccounts(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.accounts.get(params);
    }

    async getMultisignatureGroups(address, params = {}, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.accounts.getMultisignatureGroups(address, params);
    }

    async getMultisignatureMemberships(address, params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.accounts.getMultisignatureMemberships(address, params);
    }

    async getBlocks(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.blocks.get(params);
    }

    async getTransactions(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.transactions.get(params);
    }

    async broadcastTransactions(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.transactions.broadcast(params);
    }

    async broadcastSignatures(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.signatures.broadcast(params);
    }

    async getDelegates(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.delegates.get(params);
    }

    async getForgers(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.delegates.getForgers(params);
    }

    async getForgingStatistics(address, params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.delegates.getForgingStatistics(address, params);
    }

    async getDelegates(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.delegates.get(params);
    }

    async getVotes(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.votes.get(params);
    }

    async getVoters(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.voters.get(params);
    }

    async getDapp(params, ip_address) {
        const client = API.getClientByAddress(this.clients, ip_address);
        return client.dapps.get(params);
    }
}

module.exports = API;

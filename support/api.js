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

    static getClientByIp(clients, ip) {
        const result = clients.filter(client => client.ip === ip)[0];
        if (result && result.client, ip) {
            return result.client;
        } else {
            // Role back to seed node
            const { seed: [ip] } = config();

            return clients.filter(client => client.ip === ip)[0].client;
        }
    }

    createAccount() {
        const passphrase = elements.passphrase.Mnemonic.generateMnemonic();
        const { publicKey } = elements.cryptography.getKeys(passphrase);
        const address = elements.cryptography.getAddressFromPublicKey(publicKey);

        return {
            passphrase,
            publicKey,
            address,
        }
    }

    async getNodeStatus(ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.node.getStatus();
    }

    async getNodeConstants(ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.node.getConstants();
    }

    async getForgingStatus(ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.node.getForgingStatus();
    }

    async updateForgingStatus(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.node.updateForgingStatus(params);
    }

    async updateForgingStatus(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.node.updateForgingStatus(params);
    }

    async getTransactionsByState(state, params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.node.getTransactions(state, params);
    }

    async getPeers(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.peers.get(params);
    }

    async getAccounts(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.accounts.get(params);
    }

    async getMultisignatureGroups(address, params = {}, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.accounts.getMultisignatureGroups(address, params);
    }

    async getMultisignatureMemberships(address, params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.accounts.getMultisignatureMemberships(address, params);
    }

    async getBlocks(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.blocks.get(params);
    }

    async getTransactions(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.transactions.get(params);
    }

    async broadcastTransactions(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.transactions.broadcast(params);
    }

    async broadcastSignatures(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.signatures.broadcast(params);
    }

    async getDelegates(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.delegates.get(params);
    }

    async getForgers(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.delegates.getForgers(params);
    }

    async getForgingStatistics(address, params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.delegates.getForgingStatistics(address, params);
    }

    async getDelegates(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.delegates.get(params);
    }

    async getVotes(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.votes.get(params);
    }

    async getVoters(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.voters.get(params);
    }

    async getDapp(params, ip) {
        const client = API.getClientByIp(this.clients, ip);
        return client.dapps.get(params);
    }
}

module.exports = API;

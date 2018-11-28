const elements = require('lisk-elements')

const { passphrase, cryptography } = elements

class APIHelper {
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
        if (result && result.client) {
            return result.client;
        } else {
            // Role back to seed node
            return clients.filter(client => client.ip === config.seed)[0].client;
        }
    }

    static createAccount() {
        const passphraseWord = passphrase.Mnemonic.generateMnemonic();
        const { publicKey } = cryptography.getKeys(passphraseWord);
        const address = cryptography.getAddressFromPublicKey(publicKey);

        return {
            passphrase,
            publicKey,
            ip,
        }
    }

    async getNodeStatus(ip) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.node.getStatus();
    }

    async getNodeConstants(ip) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.node.getConstants();
    }

    async getForgingStatus(ip) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.node.getForgingStatus();
    }

    async updateForgingStatus(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.node.updateForgingStatus(params);
    }

    async updateForgingStatus(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.node.updateForgingStatus(params);
    }

    async getTransactionsByState(ip, state, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.node.getTransactions(state, params);
    }

    async getPeers(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.peers.get(params);
    }

    async getAccount(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.accounts.get(params);
    }

    async getMultisignatureGroup(ip, address, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.accounts.getMultisignatureGroup(address, params);
    }

    async getMultisignatureMemberships(ip, address, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.accounts.getMultisignatureMemberships(address, params);
    }

    async getBlocks(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.blocks.get(params);
    }

    async getTransactions(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.transactions.get(params);
    }

    async broadcastTransactions(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.transactions.broadcast(params);
    }

    async broadcastSignatures(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.signatures.broadcast(params);
    }

    async getDelegates(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.delegates.get(params);
    }

    async getForgers(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.delegates.getForgers(params);
    }

    async getForgingStatistics(ip, address, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.delegates.getForgingStatistics(address, params);
    }

    async getDelegates(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.delegates.get(params);
    }

    async getVotes(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.votes.get(params);
    }

    async getVoters(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.voters.get(params);
    }

    async getDapp(ip, params) {
        const client = APIHelper.getClientByIp(this.clients, ip);
        return await client.dapps.get(params);
    }
}

module.exports = APIHelper;

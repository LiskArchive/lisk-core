const elements = require('lisk-elements')

const { passphrase, cryptography } = elements

class APIHelper {
    constructor(config) {
        const { seed, nodes } = config;
        this.seed = seed;
        this.nodes = nodes;

        const apiClients = () => {
            const addresses = [...this.seed, ...this.nodes];
            return addresses.map(address => {
                const client = new elements.APIClient([address]);
                return {
                    address,
                    client
                }
            })
        }
        this.clients = apiClients();
    }

    static getClientByAddress (clients, address) {
        const result = clients.filter(client => client.address === address)[0];
        if (result && result.client) {
            return result.client;
        } else {
            // Role back to seed node
            return clients.filter(client => client.address === config.seed)[0].client;
        }
    }

    async getNodeStatus(address) {
        const client = APIHelper.getClientByAddress(this.clients, address);
        return await client.node.getStatus();
    }

    async getNodeConstants(address) {
        const client = APIHelper.getClientByAddress(this.clients, address);
        return await client.node.getConstants();
    }

    static createAccount() {
        const passphraseWord = passphrase.Mnemonic.generateMnemonic();
        const { publicKey } = cryptography.getKeys(passphraseWord);
        const address = cryptography.getAddressFromPublicKey(publicKey);

        return {
            passphrase,
            publicKey,
            address,
        }
    }

    async getAccount(address) {
        const client = APIHelper.getClientByAddress(this.clients, address);
        return  await client.accounts.get({ address, limit: 1 });
    }
}

module.exports = APIHelper;

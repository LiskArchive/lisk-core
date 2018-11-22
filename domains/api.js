const elements = require('lisk-elements');

const getNodeStatus = async (address) => {
    const client = new elements.APIClient([address]);
    return await client.node.getStatus();
}

module.exports = {
    getNodeStatus
}

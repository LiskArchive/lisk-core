import elements from 'lisk-elements';

export const getNodeStatus = async (address: string) => {
    const client = new elements.APIClient([address]);
    return await client.node.getStatus();
}

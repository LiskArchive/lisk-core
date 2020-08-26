/*
 * Copyright © 2019 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

import { codec, IPCChannel, systemDirs } from 'lisk-sdk';
import { Schema } from '@liskhq/lisk-codec';
import { createAccount, genesisAccount } from './accounts';
import { createTransferTransaction } from './transactions';

interface CodecSchema {
  accountSchema: Schema;
  blockSchema: Schema;
  blockHeaderSchema: Schema;
  blockHeadersAssets: {
    [key: number]: Schema;
  };
  transactionSchema: Schema;
  transactionsAssetSchemas: {
    moduleType: number;
    assetType: number;
    schema: Schema;
  }[];
}

const getSocketsPath = (dataPath: string, network: string) => {
  const dirs = systemDirs(network, dataPath);
  return {
    root: `unix://${dirs.sockets}`,
    pub: `unix://${dirs.sockets}/lisk_pub.sock`,
    sub: `unix://${dirs.sockets}/lisk_sub.sock`,
    rpc: `unix://${dirs.sockets}/bus_rpc_socket.sock`,
  };
};

const startIPCChannel = async (): Promise<IPCChannel> => {
  const events: string[] = [];
  const actions = {};
  // rootPath: check configuration(network specific, devnet, alphanet, testnet, mainnet) to find rootPath name
  // label: check configuration(network specific, devnet, alphanet, testnet, mainnet) to find label name

  const socketsPath = getSocketsPath('/Users/manu/.lisk', 'default');
  const channel = new IPCChannel(
    'QAChannel',
    events,
    actions,
    { socketsPath }
  );

  await channel.startAndListen();

  return channel;
}

const getAccount = async (channel: IPCChannel, schema: CodecSchema, address: string): Promise<Record<string, unknown>> => {
  const account = await channel.invoke<string>('app:getAccount', {
    address,
  });

  return codec.decodeJSON(schema.accountSchema, Buffer.from(account, 'base64'));
}

const tokenTransfer = (nonce: Number, nodeInfo: Record<string, unknown>) => {
  const newAccount = createAccount();

  return createTransferTransaction({
    nonce: BigInt(nonce),
    recipientAddress: newAccount.address,
    amount: BigInt('1000000000'),
    networkIdentifier: Buffer.from((nodeInfo as { networkID: string }).networkID, 'hex'),
    passphrase: genesisAccount.passphrase,
  });
}

const init = async (count = 100) => {
  const channel = await startIPCChannel();
  const schema = await channel.invoke<CodecSchema>('app:getSchema');
  const nodeInfo = await channel.invoke<Record<string, unknown>>('app:getNodeInfo');
  const account = await getAccount(channel, schema, '0EaZ5XxKOEbJiPPBUwZ5b46uXBw=');
  const { nonce } = (account as { sequence: { nonce: string } }).sequence;
  const trxs = Array.from({ length: count }, (_, k) => k + 1)
  const transaction = tokenTransfer(nonce, nodeInfo);
  await channel.invoke('app:postTransaction', { transaction });
}

init().then(() => console.log('Sending transactions')).catch(console.error);

/*
 * Copyright © 2020 Lisk Foundation
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

import { IPCChannel, systemDirs } from 'lisk-sdk';
import { createAccount } from './accounts';
import {
  sendTokenTransferTransactions,
  sendReclaimTransactions,
  sendDelegateRegistrationTransactions,
} from './transactions/send';

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
  const channel = new IPCChannel('QAChannel', events, actions, { socketsPath });

  await channel.startAndListen();

  return channel;
};

const wait = (ms = 10000) => new Promise(resolve => setTimeout(() => resolve(), ms));

const start = async () => {
  const channel = await startIPCChannel();
  const nodeInfo = await channel.invoke<Record<string, unknown>>('app:getNodeInfo');

  await sendTokenTransferTransactions(channel, nodeInfo);
  console.log('\n');
  await wait();

  await sendDelegateRegistrationTransactions(channel, nodeInfo);
  console.log('\n');

  const accountToReclaim = createAccount();
  await sendReclaimTransactions(channel, nodeInfo, accountToReclaim.passphrase);
  console.log('\n');
  await wait();

  console.info('Finished!!');
  process.exit(0);
};

start().catch(console.error);

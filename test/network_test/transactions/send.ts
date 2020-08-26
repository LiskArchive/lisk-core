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
 *
 */

import { IPCChannel, codec } from 'lisk-sdk';
import { Schema } from '@liskhq/lisk-codec';
import { Mnemonic } from '@liskhq/lisk-passphrase';
import { createAccount, genesisAccount } from '../accounts';
import {
  createTransferTransaction,
  createDelegateRegisterTransaction,
  createReclaimTransaction,
} from './create';

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

const generateRandomUserName = () => Mnemonic.generateMnemonic().split(' ').join('').substr(0, 20);

const nonceSequenceItems = (AccountNonce: number, count = 1) => [
  AccountNonce,
  ...Array.from({ length: count }, (_, k) => AccountNonce + k + 1),
];

const getAccount = async (
  channel: IPCChannel,
  address: string,
): Promise<Record<string, unknown>> => {
  const schema = await channel.invoke<CodecSchema>('app:getSchema');
  const account = await channel.invoke<string>('app:getAccount', {
    address,
  });

  return codec.decodeJSON(schema.accountSchema, Buffer.from(account, 'base64'));
};

const getAccountNonce = async (channel: IPCChannel, address: string): Promise<number> => {
  const account = await getAccount(channel, address);
  const { sequence } = account as { sequence: { nonce: string } };
  return Number(sequence.nonce);
};

export const sendTokenTransferTransactions = async (
  channel: IPCChannel,
  nodeInfo: Record<string, unknown>,
) => {
  try {
    const AccountNonce = await getAccountNonce(channel, genesisAccount.address);

    const { networkID } = nodeInfo as { networkID: string };
    const transactions = nonceSequenceItems(AccountNonce).map(nonce => {
      const newAccount = createAccount();

      return createTransferTransaction({
        nonce: BigInt(nonce),
        recipientAddress: newAccount.address,
        amount: BigInt('1000000000'),
        fee: BigInt('400000'),
        networkIdentifier: Buffer.from(networkID, 'base64'),
        passphrase: genesisAccount.passphrase,
      });
    });

    const result = await Promise.all(transactions.map(async transaction => await channel.invoke('app:postTransaction', { transaction })));

    for (const transaction of result as Array<Record<string, unknown>>) {
      if (transaction.transactionId) {
        console.log(`Sending token transfer transaction: ${transaction.transactionId}`);
      } else {
        console.log(`Failed to send token transfer transaction: ${transaction}`);
      }
    }
    console.log(`Sent token transfer transactions: ${transactions.length}`);
  } catch (error) {
    console.error('Error while sending token transfer transaction: \n', error);
  }
};

export const sendDelegateRegistrationTransactions = async (
  channel: IPCChannel,
  nodeInfo: Record<string, unknown>,
) => {
  try {
    const AccountNonce = await getAccountNonce(channel, genesisAccount.address);

    const { networkID } = nodeInfo as { networkID: string };
    const transactions = nonceSequenceItems(AccountNonce).map(nonce => {
      return createDelegateRegisterTransaction({
        nonce: BigInt(nonce),
        username: generateRandomUserName(),
        fee: BigInt('2500000000'),
        networkIdentifier: Buffer.from(networkID, 'base64'),
        passphrase: genesisAccount.passphrase,
      });
    });

    const result = await Promise.all(transactions.map(async transaction => await channel.invoke('app:postTransaction', { transaction })));

    for (const transaction of result as Array<Record<string, unknown>>) {
      if (transaction.transactionId) {
        console.log(`Sending delegate registration transaction: ${transaction.transactionId}`);
      } else {
        console.log(`Failed to send delegate registration transaction: ${transaction}`);
      }
    }
    console.log(`Sent delegate registration transactions: ${transactions.length}`);
  } catch (error) {
    console.error('Error while sending delegate registration transaction: \n', error);
  }

};

export const sendReclaimTransactions = async (
  channel: IPCChannel,
  nodeInfo: Record<string, unknown>,
  passphrase: string,
) => {
  try {
    const { networkID } = nodeInfo as { networkID: string };
    const AccountNonce = await getAccountNonce(channel, genesisAccount.address);
    const transaction = createReclaimTransaction({
      nonce: BigInt(AccountNonce),
      amount: BigInt('1000000000'),
      fee: BigInt('400000'),
      networkIdentifier: Buffer.from(networkID, 'base64'),
      passphrase: passphrase,
    });

    const result: any = await channel.invoke('app:postTransaction', { transaction });
    if (result.transactionId) {
      console.log(`Sent reclaim transaction: ${result.transactionId}`);
    } else {
      console.log(`Failed to send token transfer transaction: ${transaction}`);
    }
  } catch (error) {
    console.error('Error while sending reclaim transaction: \n', error);
  }
};

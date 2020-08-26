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

import {
  codec,
  cryptography,
  DPoSVoteAsset,
  DPoSRegisterAsset,
  KeysRegisterAsset,
  Transaction,
  TokenTransferAsset,
  transactions,
} from 'lisk-sdk';

export const createTransferTransaction = (input: {
  recipientAddress: Buffer;
  amount?: bigint;
  nonce: bigint;
  networkIdentifier: Buffer;
  passphrase: string;
  fee?: bigint;
}): string => {
  const { schema } = new TokenTransferAsset(BigInt(5000000));
  const encodedAsset = codec.encode(schema, {
    recipientAddress: input.recipientAddress,
    amount: input.amount ?? BigInt('10000000000'),
    data: '',
  });
  const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(input.passphrase);

  const tx = new Transaction({
    moduleID: 2,
    assetID: 0,
    nonce: input.nonce,
    senderPublicKey: publicKey,
    fee: input.fee ?? BigInt('200000'),
    asset: encodedAsset,
    signatures: [],
  });
  (tx.signatures as Buffer[]).push(
    cryptography.signData(Buffer.concat([input.networkIdentifier, tx.getSigningBytes()]), input.passphrase),
  );

  console.log(tx);

  return tx.getBytes().toString('base64')
};

export const createDelegateRegisterTransaction = (input: {
  nonce: bigint;
  networkIdentifier: Buffer;
  passphrase: string;
  username: string;
  fee?: bigint;
}): string => {
  const encodedAsset = codec.encode(new DPoSRegisterAsset().schema, {
    username: input.username,
  });
  const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(input.passphrase);

  const tx = new Transaction({
    moduleID: 5,
    assetID: 0,
    nonce: input.nonce,
    senderPublicKey: publicKey,
    fee: input.fee ?? BigInt('2500000000'),
    asset: encodedAsset,
    signatures: [],
  });
  (tx.signatures as Buffer[]).push(
    cryptography.signData(Buffer.concat([input.networkIdentifier, tx.getSigningBytes()]), input.passphrase),
  );

  return tx.getBytes().toString('base64');
};

export const createDelegateVoteTransaction = (input: {
  nonce: bigint;
  networkIdentifier: Buffer;
  passphrase: string;
  fee?: bigint;
  votes: { delegateAddress: Buffer; amount: bigint }[];
}): string => {
  const encodedAsset = codec.encode(new DPoSVoteAsset().schema, {
    votes: input.votes,
  });
  const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(input.passphrase);

  const tx = new Transaction({
    moduleID: 5,
    assetID: 1,
    nonce: input.nonce,
    senderPublicKey: publicKey,
    fee: input.fee ?? BigInt('100000000'),
    asset: encodedAsset,
    signatures: [],
  });
  (tx.signatures as Buffer[]).push(
    cryptography.signData(Buffer.concat([input.networkIdentifier, tx.getSigningBytes()]), input.passphrase),
  );
  return tx.getBytes().toString('base64');
};

export const createMultiSignRegisterTransaction = (input: {
  nonce: bigint;
  networkIdentifier: Buffer;
  fee?: bigint;
  mandatoryKeys: Buffer[];
  optionalKeys: Buffer[];
  numberOfSignatures: number;
  senderPassphrase: string;
  passphrases: string[];
}): string => {
  const { schema } = new KeysRegisterAsset();
  const encodedAsset = codec.encode(schema, {
    mandatoryKeys: input.mandatoryKeys,
    optionalKeys: input.optionalKeys,
    numberOfSignatures: input.numberOfSignatures,
  });
  const asset = {
    mandatoryKeys: input.mandatoryKeys,
    optionalKeys: input.optionalKeys,
    numberOfSignatures: input.numberOfSignatures,
  };
  const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(input.senderPassphrase);
  const transaction = [input.senderPassphrase, ...input.passphrases].reduce<
    Record<string, unknown>
  >(
    (prev, current) => {
      return transactions.signMultiSignatureTransaction(
        schema,
        prev,
        input.networkIdentifier,
        current,
        asset,
        true,
      );
    },
    {
      moduleID: 4,
      assetID: 0,
      nonce: input.nonce,
      senderPublicKey: publicKey,
      fee: input.fee ?? BigInt('1100000000'),
      asset,
      signatures: [],
    },
  );

  const tx = new Transaction({ ...transaction, asset: encodedAsset } as any);
  return tx.getBytes().toString('base64');
};

export const createMultisignatureTransferTransaction = (input: {
  nonce: bigint;
  networkIdentifier: Buffer;
  recipientAddress: Buffer;
  amount: bigint;
  fee?: bigint;
  mandatoryKeys: Buffer[];
  optionalKeys: Buffer[];
  senderPublicKey: Buffer;
  passphrases: string[];
}): string => {
  const { schema } = new TokenTransferAsset(BigInt(5000000));
  const asset = {
    recipientAddress: input.recipientAddress,
    amount: BigInt('10000000000'),
    data: '',
  };
  const encodedAsset = codec.encode(schema, asset);
  const transaction = input.passphrases.reduce<Record<string, unknown>>(
    (prev, current) => {
      return transactions.signMultiSignatureTransaction(schema, prev, input.networkIdentifier, current, {
        mandatoryKeys: input.mandatoryKeys,
        optionalKeys: input.optionalKeys,
      });
    },
    {
      moduleID: 2,
      assetID: 0,
      nonce: input.nonce,
      senderPublicKey: input.senderPublicKey,
      fee: input.fee ?? BigInt('1100000000'),
      asset,
      signatures: [],
    },
  );

  const tx = new Transaction({ ...transaction, asset: encodedAsset } as any);
  return tx.getBytes().toString('base64');
};

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

import {
	cryptography,
	transactions,
	codec,
	TokenTransferAsset,
	KeysRegisterAsset,
	DPoSVoteAsset,
} from 'lisk-sdk';
import { genesisBlock } from '../../src/config/devnet';
import { Schema } from '../../src/base_ipc';

const account = {
	passphrase: 'endless focus guilt bronze hold economy bulk parent soon tower cement venue',
	privateKey:
		'owyeKxBZlwK5hdGP7lVyG1ZpGHfNLHC73BkRgY2ryblQipZYcSU1lbNuL43Ce/9uZ7Ob3UZlMb6cb4xAElOXnA==',
	publicKey: 'UIqWWHElNZWzbi+Nwnv/bmezm91GZTG+nG+MQBJTl5w=',
	address: 'nKvuPSdCZna4Us5rgEyy/f980LU=',
};

const tokenTransferAsset = new TokenTransferAsset(BigInt(500000));

export const tokenTransferAssetSchema = tokenTransferAsset.schema;
export const keysRegisterAssetSchema = new KeysRegisterAsset().schema;
export const dposVoteAssetSchema = new DPoSVoteAsset().schema;

export const genesisBlockTransactionRoot = Buffer.from(
	genesisBlock.header.transactionRoot,
	'base64',
);
export const communityIdentifier = 'Lisk';

export const networkIdentifier = cryptography.getNetworkIdentifier(
	genesisBlockTransactionRoot,
	communityIdentifier,
);

export const networkIdentifierStr = networkIdentifier.toString('base64');

export const createTransferTransaction = ({
	amount,
	fee,
	recipientAddress,
	nonce,
}: {
	amount: string;
	fee: string;
	recipientAddress: string;
	nonce: number;
}): Record<string, unknown> => {
	const transaction = transactions.signTransaction(
		tokenTransferAsset.schema,
		{
			moduleID: 2,
			assetID: 0,
			nonce: BigInt(nonce),
			fee: BigInt(transactions.convertLSKToBeddows(fee)),
			senderPublicKey: Buffer.from(account.publicKey, 'base64'),
			asset: {
				amount: BigInt(transactions.convertLSKToBeddows(amount)),
				recipientAddress: Buffer.from(recipientAddress, 'base64'),
				data: '',
			},
		},
		networkIdentifier,
		account.passphrase,
	) as any;

	return {
		...transaction,
		id: transaction.id.toString('base64'),
		senderPublicKey: transaction.senderPublicKey.toString('base64'),
		signatures: transaction.signatures.map(s => (s as Buffer).toString('base64')),
		asset: {
			...transaction.asset,
			amount: transaction.asset.amount.toString(),
			recipientAddress: transaction.asset.recipientAddress.toString('base64'),
		},
		nonce: transaction.nonce.toString(),
		fee: transaction.fee.toString(),
	};
};

export const encodeTransactionFromJSON = (
	transaction: Record<string, unknown>,
	baseSchema: Schema,
	assetsSchemas: { moduleID: number; assetID: number; schema: Schema }[],
): string => {
	const transactionTypeAssetSchema = assetsSchemas.find(
		as => as.moduleID === transaction.moduleID && as.assetID === transaction.assetID,
	);

	if (!transactionTypeAssetSchema) {
		throw new Error('Transaction type not found.');
	}

	const transactionAssetBuffer = codec.encode(
		transactionTypeAssetSchema.schema,
		codec.fromJSON(transactionTypeAssetSchema.schema, transaction.asset as object),
	);

	const transactionBuffer = codec.encode(
		baseSchema,
		codec.fromJSON(baseSchema, {
			...transaction,
			asset: transactionAssetBuffer,
		}),
	);

	return transactionBuffer.toString('base64');
};

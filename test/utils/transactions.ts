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

import { transactions, codec } from 'lisk-sdk';
import { config } from '../../src/config/devnet';

interface Schema {
	readonly $id: string;
	readonly type: string;
	readonly properties: Record<string, unknown>;
}

const account = {
	passphrase: 'endless focus guilt bronze hold economy bulk parent soon tower cement venue',
	privateKey:
		'owyeKxBZlwK5hdGP7lVyG1ZpGHfNLHC73BkRgY2ryblQipZYcSU1lbNuL43Ce/9uZ7Ob3UZlMb6cb4xAElOXnA==',
	publicKey: 'UIqWWHElNZWzbi+Nwnv/bmezm91GZTG+nG+MQBJTl5w=',
	address: 'nKvuPSdCZna4Us5rgEyy/f980LU=',
};

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
}): transactions.TransactionJSON => {
	const transaction = new transactions.TransferTransaction({
		nonce: BigInt(nonce),
		fee: BigInt(transactions.utils.convertLSKToBeddows(fee)),
		senderPublicKey: Buffer.from(account.publicKey, 'base64'),
		asset: {
			amount: BigInt(transactions.utils.convertLSKToBeddows(amount)),
			recipientAddress: Buffer.from(recipientAddress, 'base64'),
			data: '',
		},
	});

	transaction.sign(Buffer.from(config.networkVersion), account.passphrase);

	return {
		id: transaction.id.toString('base64'),
		type: transaction.type,
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
	transaction: transactions.TransactionJSON,
	baseSchema: Schema,
	assetsSchemas: { [key: number]: Schema },
): string => {
	const transactionTypeAssetSchema = assetsSchemas[transaction.type];

	if (!transactionTypeAssetSchema) {
		throw new Error('Transaction type not found.');
	}

	const transactionAssetBuffer = codec.encode(
		transactionTypeAssetSchema,
		codec.fromJSON(transactionTypeAssetSchema, transaction.asset),
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

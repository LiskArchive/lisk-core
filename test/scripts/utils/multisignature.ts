/*
 * Copyright © 2022 Lisk Foundation
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
import { codec, cryptography } from 'lisk-sdk';
import { TAG_TRANSACTION, MESSAGE_TAG_MULTISIG_REG } from './constants';
import { baseTransactionSchema, multisigRegParams } from './schemas';

export const createSignatureObject = (txBuffer, privateKey) => ({
	signature: cryptography.ed.signData(
		TAG_TRANSACTION,
		Buffer.from('04000000', 'hex'),
		txBuffer,
		privateKey,
	),
});

export const getParamsBytes = params => codec.encode(multisigRegParams, params);

export const getSignBytes = tx => {
	const paramsBytes = getParamsBytes({
		...tx.params,
		numberOfSignatures: Number(tx.params.numberOfSignatures),
		mandatoryKeys: tx.params.mandatoryKeys.map(mandatoryKey => Buffer.from(mandatoryKey, 'hex')),
		optionalKeys: tx.params.optionalKeys.map(optionalKey => Buffer.from(optionalKey, 'hex')),
	});
	const signingTx = {
		...tx,
		nonce: BigInt(tx.nonce),
		fee: BigInt(tx.fee),
		senderPublicKey: Buffer.from(tx.senderPublicKey, 'hex'),
		params: paramsBytes,
		signatures: [],
	};
	return codec.encode(baseTransactionSchema, signingTx);
};

export const createSignatureForMultisignature = (messageBytes, privateKey) => ({
	signature: cryptography.ed.signData(
		MESSAGE_TAG_MULTISIG_REG,
		Buffer.from('04000000', 'hex'),
		messageBytes,
		privateKey,
	),
});

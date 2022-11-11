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
import {
	TAG_TRANSACTION,
	TAG_MULTISIG_REG,
	MODULE_AUTH,
	COMMAND_AUTH_REGISTER_MULTISIGNATURE,
} from './constants';
import { getSchemas, getMetadata } from '../stress_test';

let multisigRegParams;
let baseTransactionSchema;

export const createSignatureObject = (chainID, txBuffer, privateKey) => ({
	signature: cryptography.ed.signData(TAG_TRANSACTION, chainID, txBuffer, privateKey),
});

export const getParamsBytes = (paramsSchema, params) => codec.encode(paramsSchema, params);

export const getSignBytes = tx => {
	if (!multisigRegParams) {
		const metadata = getMetadata();
		metadata.modules.forEach(module => {
			if (module.name === MODULE_AUTH) {
				const result = module.commands.find(
					command => command.name === COMMAND_AUTH_REGISTER_MULTISIGNATURE,
				);
				multisigRegParams = result.params;
			}
		});
	}

	const paramsBytes = getParamsBytes(multisigRegParams, {
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

	if (!baseTransactionSchema) {
		const schemas = getSchemas();
		baseTransactionSchema = schemas.transaction;
	}

	return codec.encode(baseTransactionSchema, signingTx);
};

export const createSignatureForMultisignature = (chainID, messageBytes, privateKey) => ({
	signature: cryptography.ed.signData(TAG_MULTISIG_REG, chainID, messageBytes, privateKey),
});

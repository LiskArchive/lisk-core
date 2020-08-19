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

import { flags as flagParser } from '@oclif/command';
import { transactions, codec, TransactionJSON } from 'lisk-sdk';
import BaseIPCCommand from '../../base_ipc';
import { flags as commonFlags } from '../../utils/flags';
import { getPassphraseFromPrompt } from '../../utils/reader';

export default class SignCommand extends BaseIPCCommand {
	static description = 'Sign an encoded transaction.';

	static args = [
		{
			name: 'networkIdentifier',
			required: true,
			description: 'Network identifier defined for a network(mainnet | testnet).',
		},
		{
			name: 'transaction',
			required: true,
			description: 'The transaction to be signed encoded as base64 string',
		},
	];

	static flags = {
		...BaseIPCCommand.flags,
		passphrase: flagParser.string(commonFlags.passphrase),
		'include-sender-signature': flagParser.boolean({
			description: 'Include sender signature in transaction.',
		}),
		'mandatory-keys': flagParser.string({
			multiple: true,
			description: 'Mandatory publicKey string in base64 format.',
		}),
		'optional-keys': flagParser.string({
			multiple: true,
			description: 'Optional publicKey string in base64 format.',
		}),
		json: flagParser.boolean({
			char: 'j',
			description: 'Print the transaction in JSON format.',
		}),
	};

	static examples = [
		'transaction:sign hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= CAIQABgCIIDC1y8qIA/po/GiG1Uw8n+HpBS1SeealAvyT98rLwXn8iru7MhqMicIgMLXLxIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QGtgC2NbDYXDv/HlmxYg4Qg4B/3kzSZUWl0Y0qgfzvege/XsB50JBjC7i6NH1dgr9CbL/6qotUBPEZCnZ2yL1AY=',
	];

	async run(): Promise<void> {
		const {
			args: { networkIdentifier, transaction },
			flags: {
				'include-sender-signature': includeSenderSignature,
				json,
				'mandatory-keys': mandatoryKeys,
				'optional-keys': optionalKeys,
				passphrase: passphraseSource,
			},
		} = this.parse(SignCommand);

		const transactionJSON = (this._codec.decodeTransaction(
			transaction,
		) as unknown) as TransactionJSON;
		const { asset, assetType, moduleType } = transactionJSON;
		const assetSchema = this._schema.transactionsAssetSchemas.find(
			as => as.moduleType === moduleType && as.assetType === assetType,
		);

		if (!assetSchema) {
			throw new Error(
				`Transaction moduleType:${moduleType} with assetType:${assetType} is not registered in the application`,
			);
		}

		const passphrase = passphraseSource ?? (await getPassphraseFromPrompt('passphrase', true));
		const networkIdentifierBuffer = Buffer.from(networkIdentifier, 'base64');
		const { id, ...transactionJSONWithoutID } = (transactionJSON as unknown) as Record<
			string,
			unknown
		>;
		const transactionObject = this._codec.transactionFromJSON(
			assetSchema.schema,
			transactionJSONWithoutID,
		);
		transactionObject.asset = codec.fromJSON(assetSchema.schema, asset);
		let signedTransaction: Record<string, unknown>;

		if (mandatoryKeys || optionalKeys) {
			const keys = {
				mandatoryKeys: mandatoryKeys ? mandatoryKeys.map(k => Buffer.from(k, 'base64')) : [],
				optionalKeys: optionalKeys ? optionalKeys.map(k => Buffer.from(k, 'base64')) : [],
			};

			signedTransaction = transactions.signMultiSignatureTransaction(
				assetSchema.schema,
				transactionObject,
				networkIdentifierBuffer,
				passphrase,
				keys,
				includeSenderSignature,
			);
		} else {
			signedTransaction = transactions.signTransaction(
				assetSchema.schema,
				transactionObject,
				networkIdentifierBuffer,
				passphrase,
			);
		}

		if (json) {
			const { id: transactionID, ...signedTransactionWithoutID } = signedTransaction;
			this.printJSON(this._codec.transactionToJSON(assetSchema.schema, signedTransactionWithoutID));
		} else {
			this.printJSON({
				transaction: this._codec.encodeTransaction(assetSchema.schema, signedTransaction),
			});
		}
	}
}

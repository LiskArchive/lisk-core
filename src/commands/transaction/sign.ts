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
			description: 'The transaction to be signed encoded as hex string',
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
			description: 'Mandatory publicKey string in hex format.',
		}),
		'optional-keys': flagParser.string({
			multiple: true,
			description: 'Optional publicKey string in hex format.',
		}),
		json: flagParser.boolean({
			char: 'j',
			description: 'Print the transaction in JSON format.',
		}),
	};

	static examples = [
		'transaction:sign 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 0802100018022080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32270880c2d72f1214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a406b600b635b0d85c3bff1e59b1620e1083807fde4cd26545a5d18d2a81fcef7a07bf5ec079d090630bb8ba347d5d82bf426cbffaaa8b5404f1190a7676c8bd406',
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
		const { asset, assetID, moduleID } = transactionJSON;
		const assetSchema = this._schema.transactionsAssetSchemas.find(
			as => as.moduleID === moduleID && as.assetID === assetID,
		);

		if (!assetSchema) {
			throw new Error(
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				`Transaction moduleID:${moduleID.toString()} with assetID:${assetID.toString()} is not registered in the application`,
			);
		}

		const passphrase = passphraseSource ?? (await getPassphraseFromPrompt('passphrase', true));
		const networkIdentifierBuffer = Buffer.from(networkIdentifier, 'hex');
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
				mandatoryKeys: mandatoryKeys ? mandatoryKeys.map(k => Buffer.from(k, 'hex')) : [],
				optionalKeys: optionalKeys ? optionalKeys.map(k => Buffer.from(k, 'hex')) : [],
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

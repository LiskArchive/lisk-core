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
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { flags as flagParser } from '@oclif/command';
import { codec, cryptography, transactions, validator } from 'lisk-sdk';
import BaseIPCCommand from '../../base_ipc';
import { flags as commonFlags } from '../../utils/flags';
import { getAssetFromPrompt, getPassphraseFromPrompt } from '../../utils/reader';
import { LiskValidationError } from '../../../../lisk-sdk/node_modules/@liskhq/lisk-validator/dist-node';

interface Args {
	readonly nonce: string;
	readonly fee: string;
	readonly type: number;
	readonly networkIdentifier: string;
}

export default class CreateCommand extends BaseIPCCommand {
	static strict = false;
	static description = 'Creates a transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!';

	static args = [
		{
			name: 'networkIdentifier',
			required: true,
			description:
				'Network identifier defined for the network or main | test for the Lisk Network.',
		},
		{
			name: 'fee',
			required: true,
			description: 'Transaction fee in Beddows.',
		},
		{
			name: 'nonce',
			required: true,
			description: 'Nonce of the transaction.',
		},
		{
			name: 'type',
			required: true,
			description: 'Register transaction type.',
		},
	];

	static examples = [
		'transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --asset=\'{"amount":100000000,"recipientAddress":"qwBBp9P3ssKQtbg01Gvce364WBU=","data":"send token"}\'',
		'transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8',
	];

	static flags = {
		...BaseIPCCommand.flags,
		passphrase: flagParser.string(commonFlags.passphrase),
		'no-signature': flagParser.boolean({
			description:
				'Creates the transaction without a signature. Your passphrase will therefore not be required',
		}),
		'sender-publickey': flagParser.string({
			char: 's',
			description:
				'Creates the transaction with provided sender publickey, when passphrase is not provided',
		}),
		asset: flagParser.string({
			char: 'a',
			description: 'Creates transaction with specific asset information',
		}),
		json: flagParser.boolean({
			char: 'j',
			description: 'Print the transaction in JSON format',
		}),
	};

	async run(): Promise<void> {
		const {
			args,
			flags: {
				passphrase: passphraseSource,
				'no-signature': noSignature,
				'sender-publickey': senderPublicKeySource,
				asset: assetSource,
				json,
			},
		} = this.parse(CreateCommand);
		const { fee, nonce, networkIdentifier, type } = args as Args;
		const assetSchema = this._schema.transactionsAssets[type];

		if (!assetSchema) {
			throw new Error(`Transaction type:${type} is not registered in the application`);
		}
		const rawAsset = assetSource
			? JSON.parse(assetSource)
			: await getAssetFromPrompt(assetSchema, []);

		// Validate asset
		const assetObject = codec.fromJSON(assetSchema, rawAsset);
		const assetErrors = validator.validator.validate(assetSchema, assetObject);
		if (assetErrors.length) {
			throw new LiskValidationError([...assetErrors]);
		}

		if (!senderPublicKeySource && noSignature) {
			throw new Error('Sender publickey must be specified when no-signature flags is used');
		}

		const incompleteTransaction: Record<string, unknown> = {
			type: Number(type),
			nonce,
			fee,
			senderPublicKey: senderPublicKeySource,
			asset: assetObject,
			signatures: [],
		};
		let passphrase = '';

		if (passphraseSource || !noSignature) {
			passphrase = passphraseSource ?? (await getPassphraseFromPrompt('passphrase', true));
			const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
			incompleteTransaction.senderPublicKey = publicKey.toString('base64');
		}

		// Validate transaction
		let transactionObject = this._codec.transactionFromJSON(assetSchema, {
			...incompleteTransaction
		});

		const transactionErrors = validator.validator.validate(
			this._schema.baseTransaction,
			transactionObject,
		);
		if (transactionErrors.length) {
			throw new LiskValidationError([...transactionErrors]);
		}

		// Sign transaction
		transactionObject.asset = assetObject;
		if (passphrase) {
			transactions.signTransaction(
				assetSchema,
				transactionObject,
				Buffer.from(networkIdentifier, 'base64'),
				passphrase,
			);
		}
		// Print JSON or encoded transaction bytes
		if (json) {
			this.printJSON(this._codec.transactionToJSON(assetSchema, transactionObject));
		} else {
			this.printJSON({
				transaction: this._codec
					.encodeTransaction(assetSchema, transactionObject),
			});
		}
	}
}

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

interface Args {
	readonly nonce: string;
	readonly fee: string;
	readonly moduleID: number;
	readonly assetID: number;
	readonly networkIdentifier: string;
}

export default class CreateCommand extends BaseIPCCommand {
	static strict = false;
	static description =
		'Creates a transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!';

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
			name: 'moduleID',
			required: true,
			description: 'Register transaction module id.',
		},
		{
			name: 'assetID',
			required: true,
			description: 'Register transaction asset id.',
		},
	];

	static examples = [
		'transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2 0 --asset=\'{"amount":100000000,"recipientAddress":"qwBBp9P3ssKQtbg01Gvce364WBU=","data":"send token"}\'',
		'transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2 0',
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
		const { fee, nonce, networkIdentifier, moduleID, assetID } = args as Args;
		const assetSchema = this._schema.transactionsAssetSchemas.find(
			as => as.moduleID === Number(moduleID) && as.assetID === Number(assetID),
		);

		if (!assetSchema) {
			throw new Error(
				`Transaction moduleID:${moduleID} with assetID:${assetID} is not registered in the application`,
			);
		}
		const rawAsset = assetSource
			? JSON.parse(assetSource)
			: await getAssetFromPrompt(assetSchema.schema);
		const assetObject = codec.fromJSON(assetSchema.schema, rawAsset);
		const assetErrors = validator.validator.validate(assetSchema.schema, assetObject);
		if (assetErrors.length) {
			throw new validator.LiskValidationError([...assetErrors]);
		}

		if (!senderPublicKeySource && noSignature) {
			throw new Error('Sender publickey must be specified when no-signature flags is used');
		}

		const incompleteTransaction: Record<string, unknown> = {
			moduleID: Number(moduleID),
			assetID: Number(assetID),
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

		const transactionObject = this._codec.transactionFromJSON(assetSchema.schema, {
			...incompleteTransaction,
		});

		const transactionErrors = validator.validator.validate(
			this._schema.transactionSchema,
			transactionObject,
		);
		if (transactionErrors.length) {
			throw new validator.LiskValidationError([...transactionErrors]);
		}

		transactionObject.asset = assetObject;
		if (passphrase) {
			transactions.signTransaction(
				assetSchema.schema,
				transactionObject,
				Buffer.from(networkIdentifier, 'base64'),
				passphrase,
			);
		}

		if (json) {
			this.printJSON(this._codec.transactionToJSON(assetSchema.schema, transactionObject));
		} else {
			this.printJSON({
				transaction: this._codec.encodeTransaction(assetSchema.schema, transactionObject),
			});
		}
	}
}

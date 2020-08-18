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
import { transactions } from 'lisk-sdk';
import BaseIPCCommand from '../../base_ipc';
import { flags as commonFlags } from '../../utils/flags';

export default class SignCommand extends BaseIPCCommand {
  static description = 'Send a transaction to the local node.';

  static args = [
    {
      name: 'transaction',
      required: true,
      description: 'The transaction to be signed encoded as base64 string',
    },
  ];

  static flags = {
    ...BaseIPCCommand.flags,
    passphrase: flagParser.string(commonFlags.passphrase),
    includeSenderSignature: flagParser.boolean({
      char: 'j',
      description: 'Include sender signature in transaction.',
    }),
    mandatoryKeys: flagParser.string({
      multiple: true,
      description: 'Mandatory publicKey string in base64 format.',
    }),
    optionalKeys: flagParser.string({
      multiple: true,
      description: 'Optional publicKey string in base64 format.',
    }),
    json: flagParser.boolean({
      char: 'j',
      description: 'Print the transaction in JSON format.',
    }),
  };

  static examples = [
    'transaction:sign GxT7g9YMBOO8wkr0bygKoQz70vRsKmK7PPrKYi4+80q8jr+j95NVQQDvlEIX1L6d6ThBR7D8eZdYEbLFF+aXDw==',
  ];

  async run(): Promise<void> {
    const {
      args: { transaction },
      flags: {
        includeSenderSignature,
        json,
        mandatoryKeys,
        optionalKeys,
        passphrase,
      }
    } = this.parse(SignCommand);
    console.log(transaction);
    const transactionObject = this._codec.decodeTransaction(transaction);
    console.log(transactionObject);
    const type = transactionObject.assetType as number;
    const assetSchema = this._schema.transactionsAssets[type];

    if (!assetSchema) {
      throw new Error(`Transaction type:${type} is not registered in the application`);
    }
    const keys = {
      mandatoryKeys: mandatoryKeys.map(k => Buffer.from(k, 'base64')),
      optionalKeys: optionalKeys.map(k => Buffer.from(k, 'base64')),
    };
    const { networkID } = await this._channel.invoke<{ networkID: string }>('app:getNodeInfo');
    const networkIdentifier = Buffer.from(networkID, 'base64');
    let signedTransaction: Record<string, unknown>;

    if (mandatoryKeys || optionalKeys) {
      signedTransaction = transactions.signMultiSignatureTransaction(assetSchema, transactionObject, networkIdentifier, passphrase as string, keys, includeSenderSignature);
    } else {
      signedTransaction = transactions.signTransaction(assetSchema, transactionObject, networkIdentifier, passphrase as string);
    }

    if (json) {
      this.printJSON(this._codec.transactionToJSON(assetSchema, signedTransaction));
    } else {
      this.printJSON({
        transaction: this._codec.encodeTransaction(assetSchema, signedTransaction),
      });
    }
  }
}

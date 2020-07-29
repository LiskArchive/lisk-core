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
import BaseIPCCommand from '../../base_ipc';

interface Args {
	readonly id: string;
}

export default class GetCommand extends BaseIPCCommand {
	static description =
		'Returns a transaction information for a given transaction Id from the blockchain';

	static args = [
		{
			name: 'id',
			required: true,
			description: 'Transaction Id in base64 format.',
		},
	];

	static examples = ['transaction:get 6rBsaiLoi8pxUOA0en2Xas0HDLkoRCPm6r7NZXrMEmM='];

	static flags = {
		...BaseIPCCommand.flags,
	};

	async run(): Promise<void> {
		const { args } = this.parse(GetCommand);
		const { id: transactionId } = args as Args;

		try {
			const transaction = await this._channel.invoke<string>('app:getTransactionByID', {
				id: transactionId,
      });
			this.printJSON(this._codec.decodeTransaction(transaction));
		} catch (errors) {
			const errorMessage = Array.isArray(errors)
				? errors.map(err => (err as Error).message).join(',')
				: errors;

			if (/^Specified key transactions:id:(.*)does not exist/.test((errors as Error).message)) {
				this.error(`Transaction with id '${transactionId}' was not found`);
			} else {
				this.error(errorMessage);
			}
		}
	}
}

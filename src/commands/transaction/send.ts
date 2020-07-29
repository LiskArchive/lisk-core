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
import { validator } from 'lisk-sdk';
import BaseIPCCommand from '../../base_ipc';

export default class SendCommand extends BaseIPCCommand {
	static flags = {
		...BaseIPCCommand.flags,
	};

	static args = [
		{ name: 'transaction', required: true, description: 'The transaction to be sent to the node' },
	];

	async run(): Promise<void> {
		const {
			args: { transaction },
		} = this.parse(this.constructor as typeof SendCommand);
		if (!validator.isBase64String(transaction)) {
			throw new Error('The transaction must be provided as a base64 encoded string');
		}

		const { transactionId } = await this._channel.invoke('app:postTransaction', { transaction });
		this.log(`Transaction with id: '${transactionId as string}' received by node`);
	}
}

/*
 * LiskHQ/lisk-commander
 * Copyright © 2019 Lisk Foundation
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
import { Command, flags as flagParser } from '@oclif/command';
import { cryptography } from 'lisk-sdk';

import { flags as commonFlags } from '../../utils/flags';

export default class ValidateCommand extends Command {
	static description = `
		Validates base32 address.
	`;

	static examples = ['account:validate'];

	static args = [
		{
			name: 'address',
			required: true,
			description: 'Address in base32 format to validate.',
		},
	];

	static flags = {
		passphrase: flagParser.string(commonFlags.passphrase),
	};

	// eslint-disable-next-line @typescript-eslint/require-await
	async run(): Promise<void> {
		const {
			args: { address },
		} = this.parse(ValidateCommand);
		try {
			cryptography.validateBase32Address(address, this.config.pjson.lisk.addressPrefix);
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			this.log(`Address ${address} is a valid address`);
		} catch (error) {
			this.error(error.message);
		}
	}
}

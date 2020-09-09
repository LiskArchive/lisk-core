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

import { passphrase, cryptography } from 'lisk-sdk';

interface AccountInfo {
	readonly address: string;
	readonly binaryAddress: string;
	readonly passphrase: string;
	readonly privateKey: string;
	readonly publicKey: string;
}

const createAccount = (prefix: string): AccountInfo => {
	const generatedPassphrase = passphrase.Mnemonic.generateMnemonic();
	const { privateKey, publicKey } = cryptography.getKeys(generatedPassphrase);
	const binaryAddress = cryptography.getAddressFromPublicKey(publicKey);
	const address = cryptography.getBase32AddressFromPublicKey(publicKey, prefix);

	return {
		passphrase: generatedPassphrase,
		privateKey: privateKey.toString('hex'),
		publicKey: publicKey.toString('hex'),
		binaryAddress: binaryAddress.toString('hex'),
		address,
	};
};

export default class CreateCommand extends Command {
	static description = `
		Returns a randomly-generated mnemonic passphrase with its corresponding public/private key pair and Lisk address.
	`;

	static examples = ['account:create', 'account:create --number=3'];

	static flags = {
		number: flagParser.string({
			char: 'n',
			description: 'Number of accounts to create.',
			default: '1',
		}),
	};

	// eslint-disable-next-line @typescript-eslint/require-await
	async run(): Promise<void> {
		const {
			flags: { number: numberStr },
		} = this.parse(CreateCommand);
		const numberOfAccounts = parseInt(numberStr, 10);
		if (
			numberStr !== numberOfAccounts.toString() ||
			!Number.isInteger(numberOfAccounts) ||
			numberOfAccounts <= 0
		) {
			throw new Error('Number flag must be an integer and greater than 0');
		}
		const accounts = new Array(numberOfAccounts)
			.fill(0)
			.map(() => createAccount(this.config.pjson.lisk.addressPrefix));
		this.log(JSON.stringify(accounts, undefined, ' '));
	}
}

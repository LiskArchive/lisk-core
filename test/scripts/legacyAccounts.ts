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
import { passphrase as liskPassphrase, cryptography } from 'lisk-sdk';
const { Mnemonic } = liskPassphrase;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createAccountWithLegacyInfo = () => {
	const passphrase = Mnemonic.generateMnemonic();
	const { privateKey, publicKey } = cryptography.legacy.getKeys(passphrase);
	const address = cryptography.address.getAddressFromPublicKey(publicKey);
	const legacyAddress = cryptography.legacyAddress.getLegacyAddressFromPassphrase(passphrase);
	const firstEightBytesReversed = cryptography.legacyAddress.getFirstEightBytesReversed(
		cryptography.utils.hash(publicKey),
	);
	return {
		passphrase,
		legacyAddress,
		privateKey: privateKey.toString('hex'),
		publicKey: publicKey.toString('hex'),
		address: address.toString('hex'),
		firstEightBytesReversed: firstEightBytesReversed.toString('hex'),
	};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createAccountsWithLegacyInfo = (numberOfAccounts = 1) => {
	const accounts = new Array(numberOfAccounts).fill(0).map(createAccountWithLegacyInfo);
	return accounts;
};

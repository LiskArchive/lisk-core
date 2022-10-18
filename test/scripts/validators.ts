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

const fs = require('fs');
import { passphrase as liskPassphrase, cryptography } from 'lisk-sdk';
const { Mnemonic } = liskPassphrase;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const createValidators = async (count = 103) => {
	const offset = 0;
	const keys: any = [];
	const passphrases: any = [];
	const encryptedMessageObject = {};

	for (let i = 0; i < count; i += 1) {
		const passphrase = Mnemonic.generateMnemonic(256);
		passphrases.push(passphrase);

		const accountKeyPath = `m/44'/134'/${offset}'`;
		const generatorKeyPath = `m/25519'/134'/${offset}'/${offset}'`;
		const blsKeyPath = `m/12381/134/${offset}/${offset}`;
		const accountPrivateKey = await cryptography.ed.getKeyPairFromPhraseAndPath(
			passphrase,
			accountKeyPath,
		);
		const accountPublicKey = cryptography.ed.getPublicKeyFromPrivateKey(accountPrivateKey);
		const address = cryptography.address.getAddressFromPublicKey(accountPublicKey);
		const generatorPrivateKey = await cryptography.ed.getKeyPairFromPhraseAndPath(
			passphrase,
			generatorKeyPath,
		);
		const generatorPublicKey = cryptography.ed.getPublicKeyFromPrivateKey(generatorPrivateKey);
		const blsPrivateKey = await cryptography.bls.getPrivateKeyFromPhraseAndPath(
			passphrase,
			blsKeyPath,
		);
		const blsPublicKey = cryptography.bls.getPublicKeyFromPrivateKey(blsPrivateKey);

		keys.push({
			address: cryptography.address.getLisk32AddressFromAddress(address),
			keyPath: accountKeyPath,
			publicKey: accountPublicKey.toString('hex'),
			privateKey: accountPrivateKey.toString('hex'),
			plain: {
				generatorKeyPath,
				generatorKey: generatorPublicKey.toString('hex'),
				generatorPrivateKey: generatorPrivateKey.toString('hex'),
				blsKeyPath,
				blsKey: blsPublicKey.toString('hex'),
				blsProofOfPosession: cryptography.bls.popProve(blsPrivateKey).toString('hex'),
				blsPrivateKey: blsPrivateKey.toString('hex'),
			},
			encrypted: encryptedMessageObject,
		});
	}

	fs.writeFileSync('./dev-validators.json', JSON.stringify(keys));
	fs.writeFileSync('./passphrases.json', JSON.stringify(passphrases));
};

createValidators(103);

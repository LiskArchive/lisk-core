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
 */

import { passphrase as liskPassphrase, cryptography } from 'lisk-sdk';

const { Mnemonic } = liskPassphrase;

import { MNEMONIC_LENGTH } from './constants';

export const createGeneratorKey = async (passphrase: string, generatorKeyPath: string) => {
	const generatorPrivateKey = await cryptography.ed.getPrivateKeyFromPhraseAndPath(
		passphrase,
		generatorKeyPath,
	);

	const generatorPublicKey = cryptography.ed.getPublicKeyFromPrivateKey(generatorPrivateKey);

	return generatorPublicKey;
};

export const createAccount = async () => {
	const passphrase = Mnemonic.generateMnemonic(MNEMONIC_LENGTH);
	const accountKeyPath = `m/44'/134'/0'`;
	const generatorKeyPath = `m/25519'/134'/0'/0'`;
	const blsKeyPath = `m/12381/134/0/0`;

	const privateKey = await cryptography.ed.getPrivateKeyFromPhraseAndPath(
		passphrase,
		accountKeyPath,
	);
	const publicKey = cryptography.ed.getPublicKeyFromPrivateKey(privateKey);
	const address = cryptography.address.getAddressFromPublicKey(publicKey);
	const generatorPrivateKey = await cryptography.ed.getPrivateKeyFromPhraseAndPath(
		passphrase,
		generatorKeyPath,
	);
	const generatorPublicKey = cryptography.ed.getPublicKeyFromPrivateKey(generatorPrivateKey);
	const blsPrivateKey = await cryptography.bls.getPrivateKeyFromPhraseAndPath(
		passphrase,
		blsKeyPath,
	);
	const blsPublicKey = cryptography.bls.getPublicKeyFromPrivateKey(blsPrivateKey);

	return {
		passphrase,
		privateKey,
		publicKey,
		blsKey: blsPublicKey,
		generatorKey: generatorPublicKey,
		proofOfPossession: cryptography.bls.popProve(blsPrivateKey),
		address: cryptography.address.getLisk32AddressFromAddress(address),
	};
};

const passphrase =
	'attract squeeze option inflict dynamic end evoke love proof among random blanket table pumpkin general impose access toast undo extend fun employ agree dash';

export const getAccountKeyPath = () => {
	const accountKeyPathOffset = Math.floor(Math.random() * 103);
	const accountKeyPath = `m/44'/134'/${accountKeyPathOffset}'`;
	return accountKeyPath;
};

export const genesisAccount = async accountKeyPath => {
	const privateKey = await cryptography.ed.getPrivateKeyFromPhraseAndPath(
		passphrase,
		accountKeyPath,
	);
	const publicKey = cryptography.ed.getPublicKeyFromPrivateKey(privateKey);

	return {
		address: cryptography.address.getLisk32AddressFromPublicKey(publicKey),
		...cryptography.legacy.getKeys(passphrase),
		passphrase,
		password: 'elephant tree paris dragon chair galaxy',
		publicKey,
		privateKey,
	};
};

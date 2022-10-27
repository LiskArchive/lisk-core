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

export interface PassphraseAndKeys {
	passphrase: string;
	privateKey?: Buffer;
	publicKey: Buffer;
	address: string;
}

export interface Account {
	passphrase: string;
	privateKey: Buffer;
	publicKey: Buffer;
	address: string;
	blsKey: Buffer;
	generatorKey: Buffer;
	proofOfPossession: Buffer;
}

export const createAccount = async () => {
	const passphrase = Mnemonic.generateMnemonic();
	const accountKeyPath = `m/44'/134'/0'`;
	const generatorKeyPath = `m/25519'/134'/0'/0'`;
	const blsKeyPath = `m/12381/134/0/0`;

	const privateKey = await cryptography.ed.getKeyPairFromPhraseAndPath(passphrase, accountKeyPath);
	const publicKey = cryptography.ed.getPublicKeyFromPrivateKey(privateKey);
	const address = cryptography.address.getAddressFromPublicKey(publicKey);
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
	'economy cliff diamond van multiply general visa picture actor teach cruel tree adjust quit maid hurry fence peace glare library curve soap cube must';
const accountKeyPath = "m/44'/134'/0'";

export const genesisAccount = async () => {
	const privateKey = await cryptography.ed.getKeyPairFromPhraseAndPath(passphrase, accountKeyPath);
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

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

import { createTokenSubstoreArray } from './tokenUserSubstore';

const MNEMONIC_LENGTH = 256;

const write = (filePath, content) =>
	new Promise<void>((resolve, reject) => {
		fs.writeFile(filePath, content, err => {
			if (err) {
				return reject(err);
			}
			return resolve();
		});
	});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createValidatorsInfo = async (count = 103) => {
	const devValidators: any = [];
	const validators: any = [];
	const passphrases: any = [];
	const encryptedMessageObject = {};

	for (let i = 0; i < count; i++) {
		const passphrase = Mnemonic.generateMnemonic(MNEMONIC_LENGTH);
		passphrases.push(passphrase);

		const accountKeyPath = `m/44'/134'/0'`;
		const generatorKeyPath = `m/25519'/134'/0'/0'`;
		const blsKeyPath = `m/12381/134/0/0`;
		const accountPrivateKey = await cryptography.ed.getPrivateKeyFromPhraseAndPath(
			passphrase,
			accountKeyPath,
		);
		const accountPublicKey = cryptography.ed.getPublicKeyFromPrivateKey(accountPrivateKey);
		const address = cryptography.address.getAddressFromPublicKey(accountPublicKey);
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

		devValidators.push({
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
				blsProofOfPossession: cryptography.bls.popProve(blsPrivateKey).toString('hex'),
				blsPrivateKey: blsPrivateKey.toString('hex'),
			},
			encrypted: encryptedMessageObject,
		});

		validators.push({
			address: cryptography.address.getLisk32AddressFromAddress(address),
			name: `genesis_${i}`,
			blsKey: blsPublicKey.toString('hex'),
			generatorKey: generatorPublicKey.toString('hex'),
			proofOfPossession: cryptography.bls.popProve(blsPrivateKey).toString('hex'),
			lastGeneratedHeight: 0,
			isBanned: false,
			pomHeights: [],
			consecutiveMissedBlocks: 0,
		});
	}

	const initDelegates = validators.map(validator => validator.address);

	return {
		devValidators,
		initDelegates,
		validators,
		passphrases,
	};
};

export const createGenesisAssetsData = async () => {
	const { devValidators, initDelegates, validators, passphrases } = await createValidatorsInfo(103);
	const userSubstore = await createTokenSubstoreArray(validators);

	await write('./initDelegates.json', JSON.stringify(initDelegates));
	await write('./dev-validators.json', JSON.stringify(devValidators));
	await write('./validators.json', JSON.stringify(validators));
	await write('./passphrases.json', JSON.stringify(passphrases));
	await write('./tokenUserStore.json', JSON.stringify(userSubstore));
};

createGenesisAssetsData().then(() => {
	console.info('Genesis assets data created successfully.');
});

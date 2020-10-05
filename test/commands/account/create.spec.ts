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
import * as sandbox from 'sinon';
import { expect, test } from '@oclif/test';
import { cryptography, passphrase } from 'lisk-sdk';

describe('account:create', () => {
	const defaultMnemonic =
		'lab mirror fetch tuna village sell sphere truly excite manual planet capable';
	const secondDefaultMnemonic =
		'alone cabin buffalo blast region upper jealous basket brush put answer twice';
	const defaultKeys = {
		publicKey: '88b182d9f2d8a7c3b481a8962ae7d445b7a118fbb6a6f3afcedf4e0e8c46ecac',
		privateKey:
			'1a8ea0ceed1b85c9cff5eb12ae8d9ccdac93b5d5c668775e12b86dd63a8cefa688b182d9f2d8a7c3b481a8962ae7d445b7a118fbb6a6f3afcedf4e0e8c46ecac',
	};
	const secondDefaultKeys = {
		publicKey: '90215077294ac1c727b357978df9291b77a8a700e6e42545dc0e6e5ba9582f13',
		privateKey:
			'bec5ac9d074d1684f9dd184fc44c4b37fb73ca9d013b6ddf5a92578a98f8848990215077294ac1c727b357978df9291b77a8a700e6e42545dc0e6e5ba9582f13',
	};
	const defaultAddress = 'lskz928ku6wx7ao89y9c4c24cqdduasdvquzvqksj';
	const secondDefaultAddress = 'lskc3xa98z2pfa4c67anmanuporca2t3tdd6523kk';

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	const setupTest = () => {
		const getKeysStub = sandbox.stub();
		getKeysStub.withArgs(defaultMnemonic).returns(defaultKeys);
		getKeysStub.withArgs(secondDefaultMnemonic).returns(secondDefaultKeys);

		const getAddressFromPublicKeyStub = sandbox.stub();
		getAddressFromPublicKeyStub.withArgs(defaultKeys.publicKey).returns(defaultAddress);
		getAddressFromPublicKeyStub.withArgs(secondDefaultKeys.publicKey).returns(secondDefaultAddress);

		return test
			.stub(
				passphrase.Mnemonic,
				'generateMnemonic',
				sandbox
					.stub()
					.onFirstCall()
					.returns(defaultMnemonic)
					.onSecondCall()
					.returns(secondDefaultMnemonic),
			)
			.stdout();
	};

	describe('account:create', () => {
		setupTest()
			.command(['account:create'])
			.it('should create account', (output: any) => {
				expect(JSON.parse(output.stdout)).to.be.eql([
					{
						publicKey: cryptography.getKeys(defaultMnemonic).publicKey.toString('hex'),
						privateKey: cryptography.getKeys(defaultMnemonic).privateKey.toString('hex'),
						address: cryptography.getBase32AddressFromPublicKey(
							cryptography.getKeys(defaultMnemonic).publicKey,
							'lsk',
						),
						binaryAddress: cryptography.getAddressFromPassphrase(defaultMnemonic).toString('hex'),
						passphrase: defaultMnemonic,
					},
				]);
			});
	});

	describe('account:create --count=x', () => {
		const defaultNumber = 2;
		setupTest()
			.command(['account:create', `--count=${defaultNumber}`])
			.it('should create account', (output: any) => {
				const result = [
					{
						publicKey: cryptography.getKeys(defaultMnemonic).publicKey.toString('hex'),
						privateKey: cryptography.getKeys(defaultMnemonic).privateKey.toString('hex'),
						address: cryptography.getBase32AddressFromPublicKey(
							cryptography.getKeys(defaultMnemonic).publicKey,
							'lsk',
						),
						binaryAddress: cryptography.getAddressFromPassphrase(defaultMnemonic).toString('hex'),
						passphrase: defaultMnemonic,
					},
					{
						publicKey: cryptography.getKeys(secondDefaultMnemonic).publicKey.toString('hex'),
						privateKey: cryptography.getKeys(secondDefaultMnemonic).privateKey.toString('hex'),
						address: cryptography.getBase32AddressFromPublicKey(
							cryptography.getKeys(secondDefaultMnemonic).publicKey,
							'lsk',
						),
						binaryAddress: cryptography
							.getAddressFromPassphrase(secondDefaultMnemonic)
							.toString('hex'),
						passphrase: secondDefaultMnemonic,
					},
				];
				expect(JSON.parse(output.stdout)).to.eql(result);
			});

		setupTest()
			.command(['account:create', '--count=NaN'])
			.catch((error: Error) => {
				return expect(error.message).to.contain('Count flag must be an integer and greater than 0');
			})
			.it('should throw an error if the flag is invalid number');

		setupTest()
			.command(['account:create', '--count=0'])
			.catch((error: Error) => {
				return expect(error.message).to.contain('Count flag must be an integer and greater than 0');
			})
			.it('should throw an error if the Count flag is less than 1');

		setupTest()
			.command(['account:create', '--count=10sk24'])
			.catch((error: Error) => {
				return expect(error.message).to.contain('Count flag must be an integer and greater than 0');
			})
			.it('should throw an error if the Count flag contains non-number characters');
	});
});

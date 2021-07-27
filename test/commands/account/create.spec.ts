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
import { cryptography, passphrase } from 'lisk-sdk';
import * as Config from '@oclif/config';
import CreateCommand from '../../../src/commands/account/create';
import { getConfig } from '../../utils/config';

describe('account:create', () => {
	const defaultMnemonic =
		'lab mirror fetch tuna village sell sphere truly excite manual planet capable';
	const secondDefaultMnemonic =
		'alone cabin buffalo blast region upper jealous basket brush put answer twice';
	let results: any;
	let config: Config.IConfig;

	beforeEach(async () => {
		results = [];
		jest
			.spyOn(passphrase.Mnemonic, 'generateMnemonic')
			.mockReturnValueOnce(defaultMnemonic)
			.mockReturnValueOnce(secondDefaultMnemonic);
		jest.spyOn(process.stdout, 'write').mockImplementation(val => results.push(val));
		config = await getConfig();
	});

	describe('account:create', () => {
		it('should create an account', async () => {
			await CreateCommand.run([], config);
			expect(JSON.parse(results[0])).toEqual([
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
		it('should create multiple accounts', async () => {
			await CreateCommand.run(['--count', defaultNumber.toString()], config);
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
			expect(JSON.parse(results[0])).toEqual(result);
		});

		it('should throw an error if the flag is invalid number', async () => {
			await expect(CreateCommand.run(['--count=NaN'], config)).rejects.toThrow(
				'Count flag must be an integer and greater than 0',
			);
		});

		it('should throw an error if the Count flag is less than 1', async () => {
			await expect(CreateCommand.run(['--count=0'], config)).rejects.toThrow(
				'Count flag must be an integer and greater than 0',
			);
		});

		it('should throw an error if the Count flag contains non-number characters', async () => {
			await expect(CreateCommand.run(['--count=10sk24'], config)).rejects.toThrow(
				'Count flag must be an integer and greater than 0',
			);
		});
	});
});

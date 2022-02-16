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
 */

import { BaseModule, cryptography, codec } from 'lisk-sdk';

import { LegacyModule } from '../../../../src/application/modules';
import { LegacyAPI } from '../../../../src/application/modules/legacy/api';
import { LegacyEndpoint } from '../../../../src/application/modules/legacy/endpoint';
import {
	MODULE_NAME_LEGACY,
	MODULE_ID_LEGACY,
} from '../../../../src/application/modules/legacy/constants';
import { genesisLegacyStoreSchema } from '../../../../src/application/modules/legacy/schemas';
//
const { getAddressAndPublicKeyFromPassphrase } = cryptography;

const getLegacyBytesFromPassphrase = (passphrase: string): Buffer => {
	const { publicKey } = getAddressAndPublicKeyFromPassphrase(passphrase);
	return cryptography.getFirstEightBytesReversed(cryptography.hash(publicKey));
};

describe('LegacyModule', () => {
	let legacyModule: LegacyModule;

	const mockSetWithSchema = jest.fn();

	const getStore: any = () => ({
		setWithSchema: mockSetWithSchema,
	});
	interface Accounts {
		[key: string]: {
			passphrase: string;
			publicKey?: Buffer;
			address?: string;
			balance?: BigInt;
		};
	}
	interface LegacyAccounts {
		address: Buffer;
		balance: BigInt;
	}

	const legacyAccounts: LegacyAccounts[] = [];

	const testAccounts: Accounts = {
		account1: {
			passphrase: 'float slow tiny rubber seat lion arrow skirt reveal garlic draft shield',
		},
		account2: {
			passphrase: 'hand nominee keen alarm skate latin seek fox spring guilt loop snake',
		},
		account3: {
			passphrase: 'february large secret save risk album opera rebel tray roast air captain',
		},
	};

	for (const account of Object.values(testAccounts)) {
		legacyAccounts.push({
			address: getLegacyBytesFromPassphrase(account.passphrase),
			balance: BigInt(Math.floor(Math.random() * 1000)),
		});
	}

	beforeAll(() => {
		legacyModule = new LegacyModule();
	});

	it('should inherit from BaseModule', () => {
		expect(LegacyModule.prototype).toBeInstanceOf(BaseModule);
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(legacyModule.id).toBe(MODULE_ID_LEGACY);
		});

		it('should have valid name', () => {
			expect(legacyModule.name).toBe(MODULE_NAME_LEGACY);
		});

		it('should expose endpoint', () => {
			expect(legacyModule).toHaveProperty('endpoint');
			expect(legacyModule.endpoint).toBeInstanceOf(LegacyEndpoint);
		});

		it('should expose api', () => {
			expect(legacyModule).toHaveProperty('api');
			expect(legacyModule.api).toBeInstanceOf(LegacyAPI);
		});
	});

	describe('afterGenesisBlockExecute', () => {
		it('should save legacy accounts to state store', async () => {
			const accounts = legacyAccounts;
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: jest.fn().mockResolvedValue(mockAssets),
				},
				getStore,
			} as any;
			await legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput);
		});

		it('Reject the block when accounts are NOT pair-wise distinct', async () => {
			const accounts = legacyAccounts;
			accounts.push(legacyAccounts[0]);
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: jest.fn().mockResolvedValue(mockAssets),
				},
				getStore,
			} as any;

			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow('Legacy address entries are not pair-wise distinct');
		});

		it('Reject the block when sum of balance of all accounts is greater than equals to 2^64', async () => {
			const accounts = legacyAccounts;
			accounts.push({
				address: getLegacyBytesFromPassphrase(
					'elephant version solar amused enhance fuel black armor vendor regular tortoise tank',
				),
				balance: BigInt(2 ** 64 - 2000),
			});
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: jest.fn().mockResolvedValue(mockAssets),
				},
				getStore,
			} as any;
			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow();
		});

		it('Reject the block when address property of accounts not have length 8', async () => {
			const accounts = legacyAccounts;
			accounts.push({
				address: Buffer.from('lsk27mhpk85653zkwa5h5jhncze4nwwd3twtvrpxo'),
				balance: BigInt(Math.floor(Math.random()) * 1000),
			});
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: jest.fn().mockResolvedValue(mockAssets),
				},
				getStore,
			} as any;
			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow('Invalid legacy address found');
		});
	});
});

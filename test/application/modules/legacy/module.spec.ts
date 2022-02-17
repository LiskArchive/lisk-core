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

import { BaseModule, codec, cryptography } from 'lisk-sdk';
import { when } from 'jest-when';

import { LegacyModule } from '../../../../src/application/modules';
import { LegacyAPI } from '../../../../src/application/modules/legacy/api';
import { LegacyEndpoint } from '../../../../src/application/modules/legacy/endpoint';
import {
	MODULE_NAME_LEGACY,
	MODULE_ID_LEGACY,
	LEGACY_ACCOUNTS_TOTAL_BALANCE,
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
		const mockSetWithSchema = jest.fn();
		const mockStoreHas = jest.fn();

		const getStore: any = () => ({
			setWithSchema: mockSetWithSchema,
			has: mockStoreHas,
		});

		it('should save legacy accounts to state store if accounts are valid', async () => {
			const accounts = legacyAccounts;
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: () => mockAssets,
				},
				getStore,
			} as any;
			await legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput);

			for (const account of accounts) {
				when(mockStoreHas).calledWith(account.address).mockReturnValue(true);
				const isAccountInStore = await genesisBlockExecuteContextInput
					.getStore()
					.has(account.address);
				expect(isAccountInStore).toBe(true);
			}
		});

		it('Rejects the block when address entries are not pair-wise distinct', async () => {
			const accounts = legacyAccounts;
			accounts.push(legacyAccounts[0]);
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: () => mockAssets,
				},
				getStore,
			} as any;

			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow();
		});

		it('Rejects the block when total balance for all legacy accounts is equal 2^64', async () => {
			const accounts = [
				{
					address: getLegacyBytesFromPassphrase(
						'recycle capable perfect help trade retreat animal enrich time obvious song play',
					),
					balance: BigInt(LEGACY_ACCOUNTS_TOTAL_BALANCE),
				},
			];
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: () => mockAssets,
				},
				getStore,
			} as any;
			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow();
		});

		it('Rejects the block when total balance for all legacy accounts is greater than 2^64', async () => {
			const accounts = legacyAccounts;
			accounts.push({
				address: getLegacyBytesFromPassphrase(
					'elephant version solar amused enhance fuel black armor vendor regular tortoise tank',
				),
				balance: BigInt(LEGACY_ACCOUNTS_TOTAL_BALANCE),
			});
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: () => mockAssets,
				},
				getStore,
			} as any;
			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow();
		});

		it('Rejects the block when address property of accounts have length 7', async () => {
			const accounts = legacyAccounts;
			accounts.push({
				address: Buffer.from('02089ca'),
				balance: BigInt(Math.floor(Math.random()) * 1000),
			});
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: () => mockAssets,
				},
				getStore,
			} as any;
			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow();
		});

		it('Rejects the block when address property of accounts have length 9', async () => {
			const accounts = legacyAccounts;
			accounts.push({
				address: Buffer.from('0208930ca'),
				balance: BigInt(Math.floor(Math.random()) * 1000),
			});
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: () => mockAssets,
				},
				getStore,
			} as any;
			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow();
		});

		it('Rejects the block when address property of accounts have length 20', async () => {
			const accounts = legacyAccounts;
			accounts.push({
				address: Buffer.from('lsk27mhpk85653zkwa5h5jhncze4nwwd3twtvrpxo'),
				balance: BigInt(Math.floor(Math.random()) * 1000),
			});
			const mockAssets = codec.encode(genesisLegacyStoreSchema, { accounts });
			const genesisBlockExecuteContextInput = {
				assets: {
					getAsset: () => mockAssets,
				},
				getStore,
			} as any;
			await expect(
				legacyModule.afterGenesisBlockExecute(genesisBlockExecuteContextInput),
			).rejects.toThrow();
		});
	});
});

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

import { BaseModule } from 'lisk-sdk';

import { LegacyModule } from '../../../../src/application/modules';
import { LegacyAPI } from '../../../../src/application/modules/legacy/api';
import { LegacyEndpoint } from '../../../../src/application/modules/legacy/endpoint';
import {
	MODULE_NAME_LEGACY,
	MODULE_ID_LEGACY,
} from '../../../../src/application/modules/legacy/constants';

describe('LegacyModule', () => {
	let legacyModule: LegacyModule;

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

	describe('init', () => {
		it('should initialize config with defaultConfig', async () => {
			const moduleConfig = { tokenIDReclaim: { chainID: 0, localID: 0 } } as any;
			await expect(legacyModule.init({ moduleConfig: {} })).resolves.toBe(true);
			expect(legacyModule['_moduleConfig']).toEqual(moduleConfig);
		});
	});
});

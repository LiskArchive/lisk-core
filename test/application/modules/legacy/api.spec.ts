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

import { BaseAPI } from 'lisk-sdk';

import { LegacyAPI } from '../../../../src/application/modules/legacy/api';
import { LegacyModule } from '../../../../src/application/modules/legacy/module';

describe('LegacyAPI', () => {
	let legacyAPI: LegacyAPI;

	beforeAll(() => {
		const module = new LegacyModule();
		legacyAPI = new LegacyAPI(module.stores, module.events);
	});

	it('should inherit from BaseAPI', () => {
		expect(LegacyAPI.prototype).toBeInstanceOf(BaseAPI);
	});

	describe('constructor', () => {
		it('should be of the correct type', () => {
			expect(legacyAPI).toBeInstanceOf(LegacyAPI);
		});
	});
});

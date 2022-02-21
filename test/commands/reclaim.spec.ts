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

import { BaseCommand } from 'lisk-sdk';
import {} from '../../src/application/modules/legacy/constants';
import { ReclaimCommand } from '../../src/application/modules/legacy/commands/reclaim';
import { reclaimParamsSchema } from '../../src/application/modules/legacy/schemas';

describe('Reclaim command', () => {
	let reclaimCommand: ReclaimCommand;

	beforeEach(() => {
		reclaimCommand = new ReclaimCommand(0);
	});

	it('should inherit from BaseCommand', () => {
		expect(ReclaimCommand.prototype).toBeInstanceOf(BaseCommand);
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(reclaimCommand.id).toBe(0);
		});

		it('should have valid name', () => {
			expect(reclaimCommand.name).toBe('reclaimLSK');
		});

		it('should have valid schema', () => {
			expect(reclaimCommand.schema).toEqual(reclaimParamsSchema);
		});
	});

	describe('execute', () => {
		it(`should call mint for a valid reclaim transaction`, async () => {
		});

		it('should reject the transaction when user send invalid amount', async () => {
		});

		it('should reject the transaction when user has no entry in the leagcy account substore', async () => {
		});

		it('should reject the transaction when transaction params does not follow reclaimParamsSchema', async () => {
		});
	});

});

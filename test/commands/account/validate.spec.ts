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
import { expect, test } from '@oclif/test';

describe('account:validate', () => {
	const validAddress = 'lskso9zqyapuhu8kv7txfbohwrhjfbd4gkxewcuxz';
	const invalidAddress = validAddress.replace('wr', 'om');

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	const setupTest = () => test.stdout();

	describe('account:validate', () => {
		setupTest()
			.command(['account:validate', validAddress])
			.it('should show address is valid', (output: any) => {
				expect(output.stdout).to.contain('is a valid address');
			});

		setupTest()
			.stdout()
			.command(['account:validate', invalidAddress])
			.catch(err => expect(err.message).to.contain('Invalid checksum for address'))
			.it('should show address is invalid');
	});
});

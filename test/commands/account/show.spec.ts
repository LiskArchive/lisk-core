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
import { cryptography } from 'lisk-sdk';
import * as readerUtils from '../../../src/utils/reader';

describe('account:show', () => {
	const passphraseInput =
		'whale acoustic sword work scene frame assume ensure hawk federal upgrade angry';
	const secondDefaultMnemonic =
		'alone cabin buffalo blast region upper jealous basket brush put answer twice';

	const setupTest = () =>
		test.stub(readerUtils, 'getPassphraseFromPrompt', sandbox.stub().resolves(passphraseInput));

	describe('account:show', () => {
		setupTest()
			.stdout()
			.command(['account:show'])
			.it('should show account with prompt', (output: any) => {
				expect(readerUtils.getPassphraseFromPrompt).to.be.calledWithExactly('passphrase', true);
				return expect(JSON.parse(output.stdout)).to.eql({
					privateKey: cryptography.getKeys(passphraseInput).privateKey.toString('hex'),
					publicKey: cryptography.getKeys(passphraseInput).publicKey.toString('hex'),
					address: cryptography.getBase32AddressFromPublicKey(
						cryptography.getKeys(passphraseInput).publicKey,
						'lsk',
					),
					binaryAddress: cryptography.getAddressFromPassphrase(passphraseInput).toString('hex'),
				});
			});

		setupTest()
			.stdout()
			.command(['account:show', `--passphrase=${secondDefaultMnemonic}`])
			.it('should show account with pass', (output: any) => {
				expect(readerUtils.getPassphraseFromPrompt).not.to.be.called;
				return expect(JSON.parse(output.stdout)).to.eql({
					privateKey: cryptography.getKeys(secondDefaultMnemonic).privateKey.toString('hex'),
					publicKey: cryptography.getKeys(secondDefaultMnemonic).publicKey.toString('hex'),
					address: cryptography.getBase32AddressFromPublicKey(
						cryptography.getKeys(secondDefaultMnemonic).publicKey,
						'lsk',
					),
					binaryAddress: cryptography
						.getAddressFromPassphrase(secondDefaultMnemonic)
						.toString('hex'),
				});
			});
	});
});

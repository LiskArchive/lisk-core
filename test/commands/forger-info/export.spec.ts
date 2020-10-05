/*
 * Copyright © 2020 Lisk Foundation
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

import * as tar from 'tar';
import { expect, test } from '@oclif/test';
import * as sandbox from 'sinon';
import { homedir } from 'os';
import { join } from 'path';

const defaultDataPath = join(homedir(), '.lisk', 'lisk-core');

describe('forger-info:export', () => {
	const tarCreateStub = sandbox.stub().resolves(true);

	const setupTest = () => test.stub(tar, 'create', tarCreateStub).stdout();

	afterEach(() => {
		tarCreateStub.reset();
	});

	describe('when starting without flag', () => {
		setupTest()
			.command(['forger-info:export'])
			.it('should compress "forger.db" for default data path', () => {
				expect(tarCreateStub).to.have.been.calledOnce;
				expect(tarCreateStub).to.have.been.calledWithExactly(
					{
						cwd: join(defaultDataPath, 'data'),
						file: join(process.cwd(), 'forger.db.tar.gz'),
						gzip: true,
					},
					['forger.db'],
				);
			});
	});

	describe('when starting with particular data-path', () => {
		setupTest()
			.command(['forger-info:export', '--data-path=/my/app/'])
			.it('should compress "forger.db" for given data path', () => {
				expect(tarCreateStub).to.have.been.calledOnce;
				expect(tarCreateStub).to.have.been.calledWithExactly(
					{
						cwd: join('/my/app/', 'data'),
						file: join(process.cwd(), 'forger.db.tar.gz'),
						gzip: true,
					},
					['forger.db'],
				);
			});
	});

	describe('when starting with particular export path', () => {
		setupTest()
			.command(['forger-info:export', '--output=/my/dir/'])
			.it('should compress "forger.db" for given data path', () => {
				expect(tarCreateStub).to.have.been.calledOnce;
				expect(tarCreateStub).to.have.been.calledWithExactly(
					{
						cwd: join(defaultDataPath, 'data'),
						file: join('/my/dir/', 'forger.db.tar.gz'),
						gzip: true,
					},
					['forger.db'],
				);
			});
	});
});

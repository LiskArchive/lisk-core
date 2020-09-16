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

const defaultDataPath = join(homedir(), '.lisk', 'default');

describe('blockchain:export', () => {
	const tarCreateStub = sandbox.stub().resolves(true);

	const setupTest = () => test.stub(tar, 'create', tarCreateStub).stdout();

	afterEach(() => {
		tarCreateStub.reset();
	});

	describe('when starting without flag', () => {
		setupTest()
			.command(['blockchain:export'])
			.it('should compress "blockchain.db" for default data path', () => {
				expect(tarCreateStub).to.have.been.calledOnce;
				expect(tarCreateStub).to.have.been.calledWithExactly(
					{
						cwd: join(defaultDataPath, 'data'),
						file: join(process.cwd(), 'blockchain.db.tar.gz'),
						gzip: true,
					},
					['blockchain.db'],
				);
			});
	});

	describe('when starting with particular data-path', () => {
		setupTest()
			.command(['blockchain:export', '--data-path=/my/app/'])
			.it('should compress "blockchain.db" for given data path', () => {
				expect(tarCreateStub).to.have.been.calledOnce;
				expect(tarCreateStub).to.have.been.calledWithExactly(
					{
						cwd: join('/my/app/', 'data'),
						file: join(process.cwd(), 'blockchain.db.tar.gz'),
						gzip: true,
					},
					['blockchain.db'],
				);
			});
	});

	describe('when starting with particular export path', () => {
		setupTest()
			.command(['blockchain:export', '--output=/my/dir/'])
			.it('should compress "blockchain.db" for given data path', () => {
				expect(tarCreateStub).to.have.been.calledOnce;
				expect(tarCreateStub).to.have.been.calledWithExactly(
					{
						cwd: join(defaultDataPath, 'data'),
						file: join('/my/dir/', 'blockchain.db.tar.gz'),
						gzip: true,
					},
					['blockchain.db'],
				);
			});
	});
});

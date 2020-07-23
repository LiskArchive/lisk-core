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

import { cryptography } from 'lisk-sdk';
import * as tar from 'tar';
import { expect, test } from '@oclif/test';
import * as sandbox from 'sinon';
import { homedir } from 'os';
import { join } from 'path';
import * as appUtils from '../../../src/utils/application';

const defaultDataPath = join(homedir(), '.lisk', 'default');

describe('blockchain:hash', () => {
	const pid = 56869;
	const fileContentBuffer = Buffer.from('dasfadsfdsaf787899afffadsfadsf');
	const fileContentHash = cryptography.hash(fileContentBuffer);
	const fileStreamReadStub = sandbox.stub().returns(fileContentBuffer);
	const tarCreateStub = sandbox.stub().returns({ read: fileStreamReadStub });

	const setupTest = () =>
		test
			.stub(tar, 'create', tarCreateStub)
			.stub(appUtils, 'getPid', sandbox.stub().returns(pid))
			.stdout()
			.stderr();

	afterEach(() => {
		tarCreateStub.resetHistory();
		fileStreamReadStub.resetHistory();
	});

	describe('when application is running', () => {
		describe('when starting without flag', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
				.command(['blockchain:hash'])
				.catch((error) => {
					expect(error.message).to.equal(
						`Can't generate hash for a running application. Application at data path ${defaultDataPath} is running with pid ${pid}.`,
					);
				})
				.it('should log error and return');
		});

		describe('when starting with particular data-path', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
				.command(['blockchain:hash', '--data-path=/my/app/'])
				.catch((error) => {
					expect(error.message).to.equal(
						`Can't generate hash for a running application. Application at data path /my/app/ is running with pid ${pid}.`,
					);
				})
				.it('should log error and return');
		});
	});

	describe('when application is not running', () => {
		describe('when starting without flag', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash'])
				.it(
					'should generate tarball of "blockchain.db" for default data path without compression',
					() => {
						expect(tarCreateStub).to.have.been.calledOnce;
						expect(tarCreateStub).to.have.been.calledWithExactly(
							{
								cwd: join(defaultDataPath, 'data'),
								gzip: false,
								portable: true,
								sync: true,
							},
							['blockchain.db'],
						);
					},
				);

			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash'])
				.it('should output the hash of tarball file content', (ctx) => {
					expect(ctx.stdout).to.equal(
						`${fileContentHash.toString('base64')}\n`,
					);
				});
		});

		describe('when starting with particular data-path', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash', '--data-path=/my/app/'])
				.it(
					'should generate tarball of "blockchain.db" for a given data path without compression',
					() => {
						expect(tarCreateStub).to.have.been.calledOnce;
						expect(tarCreateStub).to.have.been.calledWithExactly(
							{
								cwd: '/my/app/data',
								gzip: false,
								portable: true,
								sync: true,
							},
							['blockchain.db'],
						);
					},
				);

			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(false))
				.command(['blockchain:hash', '--data-path=/my/app/'])
				.it('should output the hash of tarball file content', (ctx) => {
					expect(ctx.stdout).to.equal(
						`${fileContentHash.toString('base64')}\n`,
					);
				});
		});
	});

	// describe.skip('when starting with particular data-path', () => {
	// 	setupTest()
	// 		.command(['blockchain:export', '--data-path=/my/app/'])
	// 		.it('should compress "blockchain.db" for given data path', () => {
	// 			expect(tarCreateStub).to.have.been.calledOnce;
	// 			expect(tarCreateStub).to.have.been.calledWithExactly(
	// 				{
	// 					cwd: join('/my/app/', 'data'),
	// 					file: join(process.cwd(), 'blockchain.db.gz'),
	// 					gzip: true,
	// 				},
	// 				['blockchain.db'],
	// 			);
	// 		});
	// });
	//
	// describe('when starting with particular export path', () => {
	// 	setupTest()
	// 		.command(['blockchain:export', '--output=/my/dir/'])
	// 		.it('should compress "blockchain.db" for given data path', () => {
	// 			expect(tarCreateStub).to.have.been.calledOnce;
	// 			expect(tarCreateStub).to.have.been.calledWithExactly(
	// 				{
	// 					cwd: join(defaultDataPath, 'data'),
	// 					file: join('/my/dir/', 'blockchain.db.gz'),
	// 					gzip: true,
	// 				},
	// 				['blockchain.db'],
	// 			);
	// 		});
	// });
});

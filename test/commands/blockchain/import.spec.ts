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

import { expect, test } from '@oclif/test';
import * as sandbox from 'sinon';
import * as fs from 'fs-extra';
import { homedir } from 'os';
import * as path from 'path';
import { getBlockchainDBPath } from '../../../src/utils/path';
import * as downloadUtils from '../../../src/utils/download';

const defaultDataPath = path.join(homedir(), '.lisk', 'default');
const defaultBlockchainDBPath = getBlockchainDBPath(defaultDataPath);
const pathToBlockchainGzip = '/path/to/blockchain.db.gz';

describe('blockchain:import', () => {
	const fsExistsSyncStub = sandbox.stub().returns(false);
	const pathExtnameStub = sandbox.stub().returns('.gz');
	const fsEnsureDirSyncStub = sandbox.stub();
	const extractStub = sandbox.stub();

	const setupTest = () =>
		test
			.stub(fs, 'existsSync', fsExistsSyncStub)
			.stub(path, 'extname', pathExtnameStub)
			.stub(fs, 'ensureDirSync', fsEnsureDirSyncStub)
			.stub(downloadUtils, 'extract', extractStub)
			.stdout()
			.stderr();

	afterEach(() => {
		fsExistsSyncStub.resetHistory();
		pathExtnameStub.resetHistory();
		fsEnsureDirSyncStub.resetHistory();
		extractStub.resetHistory();
	});

	describe('when importing with no path argument', () => {
		setupTest()
			.command(['blockchain:import'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg:'))
			.it('should throw an error when no arguments are provided.');
	});

	describe('when importing with no existing blockchain data', () => {
		setupTest()
			.command(['blockchain:import', pathToBlockchainGzip])
			.it('should import "blockchain.db" from given path', () => {
				expect(fsExistsSyncStub).to.have.been.calledOnce;
				expect(fsExistsSyncStub).to.have.been.calledWithExactly(defaultBlockchainDBPath);
				expect(fsEnsureDirSyncStub).to.have.been.calledOnce;
				expect(fsEnsureDirSyncStub).to.have.been.calledWithExactly(defaultBlockchainDBPath);
				expect(extractStub).to.have.been.calledOnce;
				expect(extractStub).to.have.been.calledWithExactly(
					path.dirname(pathToBlockchainGzip),
					'blockchain.db.gz',
					defaultBlockchainDBPath,
				);
			});
	});

	describe('when importing with --data-path flag', () => {
		const dataPath = getBlockchainDBPath('/my/app/');
		setupTest()
			.command(['blockchain:import', pathToBlockchainGzip, '--data-path=/my/app/'])
			.it('should import "blockchain.db" to given data-path', () => {
				expect(fsExistsSyncStub).to.have.been.calledOnce;
				expect(fsExistsSyncStub).to.have.been.calledWithExactly(dataPath);
				expect(fsEnsureDirSyncStub).to.have.been.calledOnce;
				expect(fsEnsureDirSyncStub).to.have.been.calledWithExactly(dataPath);
				expect(extractStub).to.have.been.calledOnce;
				expect(extractStub).to.have.been.calledWithExactly(
					path.dirname(pathToBlockchainGzip),
					'blockchain.db.gz',
					dataPath,
				);
			});
	});

	describe('when importing with existing blockchain data', () => {
		beforeEach(() => {
			fsExistsSyncStub.returns(true);
		});

		describe('when importing without --force flag', () => {
			setupTest()
				.command(['blockchain:import', pathToBlockchainGzip])
				.catch((error: Error) =>
					expect(error.message).to.contain(
						`There is already a blockchain data file found at ${defaultDataPath}`,
					),
				)
				.it('should log error and return');
		});

		describe('when importing with --force flag', () => {
			setupTest()
				.command(['blockchain:import', pathToBlockchainGzip, '--force'])
				.it('should import "blockchain.db" to given data-path', () => {
					expect(fsEnsureDirSyncStub).to.have.been.calledOnce;
					expect(fsEnsureDirSyncStub).to.have.been.calledWithExactly(defaultBlockchainDBPath);
					expect(extractStub).to.have.been.calledOnce;
					expect(extractStub).to.have.been.calledWithExactly(
						path.dirname(pathToBlockchainGzip),
						'blockchain.db.gz',
						defaultBlockchainDBPath,
					);
				});
		});
	});
});

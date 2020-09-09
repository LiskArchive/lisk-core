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
import * as os from 'os';
import * as path from 'path';
import { Application } from 'lisk-sdk';
import * as application from '../../src/application';
import * as devnetGenesisBlock from '../../config/devnet/genesis_block.json';

import pJSON = require('../../package.json');

describe('start', () => {
	const readJSONStub = sandbox.stub();
	readJSONStub.withArgs('~/.lisk/default/config/mainnet/config.json').resolves({
		logger: {
			consoleLogLevel: 'error',
		},
	});
	readJSONStub.withArgs('~/.lisk/default/config/devnet/config.json').resolves({
		logger: {
			consoleLogLevel: 'error',
		},
	});
	readJSONStub
		.withArgs('~/.lisk/default/config/mainnet/genesis_block.json')
		.resolves(devnetGenesisBlock);
	readJSONStub
		.withArgs('~/.lisk/default/config/devnet/genesis_block.json')
		.resolves(devnetGenesisBlock);
	const readdirSyncStub = sandbox.stub();
	readdirSyncStub.withArgs(path.join(__dirname, '../../config')).returns(['mainnet', 'devnet']);
	readdirSyncStub.returns(['mainnet']);

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	const setupTest = () =>
		test
			.stub(
				application,
				'getApplication',
				sandbox.stub().returns({
					run: async () => Promise.resolve(),
				} as Application),
			)
			.stub(fs, 'readJSON', readJSONStub)
			.stub(fs, 'ensureDirSync', sandbox.stub())
			.stub(fs, 'removeSync', sandbox.stub())
			.stub(fs, 'copyFileSync', sandbox.stub())
			.stub(fs, 'statSync', sandbox.stub().returns({ isDirectory: () => true }))
			.stub(fs, 'readdirSync', readdirSyncStub)
			.stub(os, 'homedir', sandbox.stub().returns('~'))
			.stdout();

	describe('when starting without flag', () => {
		setupTest()
			.command(['start'])
			.it('should start with default mainnet config', () => {
				const [
					usedGenesisBlock,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedGenesisBlock.header.id).to.eql(devnetGenesisBlock.header.id);
				expect(usedConfig.version).to.equal(pJSON.version);
				expect(usedConfig.label).to.equal('default');
			});
	});

	describe('when config already exist in the folder', () => {
		setupTest()
			.command(['start', '-n', 'devnet'])
			.catch(err => {
				expect(err.message).to.contain(
					'Datapath ~/.lisk/default already contains configs for mainnet.',
				);
			})
			.it('should fail with already existing config');
	});

	describe('when config already exist in the folder and called with --overwrite-config', () => {
		setupTest()
			.command(['start', '-n', 'devnet', '--overwrite-config'])
			.it('should delete the mainnet config and save the devnet config', () => {
				expect(fs.ensureDirSync).to.have.been.calledWith('~/.lisk/default/config');
				expect(fs.removeSync).to.have.been.calledOnce;
				expect(fs.copyFileSync).to.have.been.calledTwice;
			});
	});

	describe('when unknown network is specified', () => {
		setupTest()
			.command(['start', '--network=unknown'])
			.catch(err =>
				expect(err.message).to.include(
					'Network must be one of mainnet,devnet but received unknown',
				),
			)
			.it('should throw an error');
	});

	describe('when enable-ipc is specified', () => {
		setupTest()
			.command(['start', '--enable-ipc'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.ipc.enabled).to.equal(true);
			});
	});

	describe('when config is specified', () => {
		setupTest()
			.command(['start', '--config=./config.json'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(readJSONStub).to.have.been.calledWithExactly('./config.json');
				expect(usedConfig.logger.consoleLogLevel).to.equal('error');
			});
	});

	describe('when log is specified', () => {
		setupTest()
			.command(['start', '--console-log=trace'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.consoleLogLevel).to.equal('trace');
			});

		setupTest()
			.env({ LISK_CONSOLE_LOG_LEVEL: 'error' })
			.command(['start'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.consoleLogLevel).to.equal('error');
			});
	});

	describe('when file log is specified', () => {
		setupTest()
			.command(['start', '--log=trace'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.fileLogLevel).to.equal('trace');
			});

		setupTest()
			.env({ LISK_FILE_LOG_LEVEL: 'trace' })
			.command(['start'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.fileLogLevel).to.equal('trace');
			});
	});

	describe('when port is specified', () => {
		setupTest()
			.command(['start', '--port=1111'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.port).to.equal(1111);
			});

		setupTest()
			.env({ LISK_PORT: '1234' })
			.command(['start'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.port).to.equal(1234);
			});
	});

	describe('when peer is specified', () => {
		setupTest()
			.command(['start', '--peers=localhost:12234'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.seedPeers).to.eql([{ ip: 'localhost', port: 12234 }]);
			});

		setupTest()
			.command(['start', '--peers=localhost:12234,74.49.3.35:2238'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.seedPeers).to.eql([
					{ ip: 'localhost', port: 12234 },
					{ ip: '74.49.3.35', port: 2238 },
				]);
			});
	});
});

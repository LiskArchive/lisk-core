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
	readJSONStub.withArgs('~/.lisk/lisk-core/config/mainnet/config.json').resolves({
		logger: {
			consoleLogLevel: 'error',
		},
		plugins: {},
	});
	readJSONStub.withArgs('~/.lisk/lisk-core/config/devnet/config.json').resolves({
		logger: {
			consoleLogLevel: 'error',
		},
		plugins: {},
	});
	readJSONStub
		.withArgs('~/.lisk/lisk-core/config/mainnet/genesis_block.json')
		.resolves(devnetGenesisBlock);
	readJSONStub
		.withArgs('~/.lisk/lisk-core/config/devnet/genesis_block.json')
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
				expect(usedConfig.label).to.equal('lisk-core');
			});
	});

	describe('when config already exist in the folder', () => {
		setupTest()
			.command(['start', '-n', 'devnet'])
			.catch(err => {
				expect(err.message).to.contain(
					'Datapath ~/.lisk/lisk-core already contains configs for mainnet.',
				);
			})
			.it('should fail with already existing config');
	});

	describe('when config already exist in the folder and called with --overwrite-config', () => {
		setupTest()
			.command(['start', '-n', 'devnet', '--overwrite-config'])
			.it('should delete the mainnet config and save the devnet config', () => {
				expect(fs.ensureDirSync).to.have.been.calledWith('~/.lisk/lisk-core/config');
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

	describe('when --enable-ipc is specified', () => {
		setupTest()
			.command(['start', '--enable-ipc'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.ipc.enabled).to.equal(true);
			});
	});

	describe('when --enable-http-api-plugin is specified', () => {
		setupTest()
			.command(['start', '--enable-http-api-plugin'])
			.it('should pass this value to configuration', () => {
				const [, , options] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(options.enableHTTPAPIPlugin).to.equal(true);
			});
	});

	describe('when custom port with --http-api-plugin-port is specified along with --enable-http-api-plugin', () => {
		setupTest()
			.command(['start', '--enable-http-api-plugin', '--http-api-plugin-port', '8888'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.plugins.httpApi.port).to.equal(8888);
			});
	});

	describe('when custom white list with --http-api-plugin-whitelist is specified along with --enable-http-api-plugin', () => {
		setupTest()
			.command([
				'start',
				'--enable-http-api-plugin',
				'--http-api-plugin-whitelist',
				'192.08.0.1:8888,192.08.0.2:8888',
			])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.plugins.httpApi.whiteList).to.deep.equal([
					'192.08.0.1:8888',
					'192.08.0.2:8888',
				]);
			});
	});

	describe('when --enable-forger-plugin is specified', () => {
		setupTest()
			.command(['start', '--enable-forger-plugin'])
			.it('should pass this value to configuration', () => {
				const [, , options] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(options.enableForgerPlugin).to.equal(true);
			});
	});

	describe('when custom port with --forger-plugin-port is specified along with --enable-forger-plugin', () => {
		setupTest()
			.command(['start', '--enable-forger-plugin', '--forger-plugin-port', '8888'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.plugins.forger.port).to.equal(8888);
			});
	});

	describe('when custom white list with --forger-plugin-whitelist is specified along with --enable-forger-plugin', () => {
		setupTest()
			.command([
				'start',
				'--enable-forger-plugin',
				'--forger-plugin-whitelist',
				'192.08.0.1:8888,192.08.0.2:8888',
			])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.plugins.forger.whiteList).to.deep.equal([
					'192.08.0.1:8888',
					'192.08.0.2:8888',
				]);
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

	describe('when seed peer is specified', () => {
		setupTest()
			.command(['start', '--seed-peers=localhost:12234'])
			.it('should update the config value', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.seedPeers).to.eql([{ ip: 'localhost', port: 12234 }]);
			});

		setupTest()
			.env({ LISK_SEED_PEERS: 'localhost:12234,74.49.3.35:2238' })
			.command(['start'])
			.it('should update the config value using env variable', () => {
				const [, usedConfig] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.seedPeers).to.eql([
					{ ip: 'localhost', port: 12234 },
					{ ip: '74.49.3.35', port: 2238 },
				]);
			});
	});
});

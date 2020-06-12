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
import fs from 'fs-extra';
import os from 'os';
import { Application } from 'lisk-sdk';
import * as application from '../../src/application';
import * as mainnetConfig from '../../config/mainnet/config.json';

describe('start', () => {
	const defaultDataPath = '~/.lisk/default';
	const defaultGenesisBlock = { height: 1 };
	const readJSONStub = sandbox.stub();
	readJSONStub
		.withArgs(`${defaultDataPath}/config/mainnet/genesis_block.json`)
		.resolves(defaultGenesisBlock);
	readJSONStub
		.withArgs(`${defaultDataPath}/config/mainnet/config.json`)
		.resolves(mainnetConfig);

	const setupTest = () =>
		test
			.stub(
				application,
				'getApplication',
				sandbox.stub().returns({
					run: async () => Promise.resolve(),
				} as Application),
			)
			.stub(fs, 'ensureDir', sandbox.stub().returns({}))
			.stub(fs, 'copy', sandbox.stub().returns({}))
			.stub(fs, 'readdir', sandbox.stub().returns(['mainnet', 'testnet']))
			.stub(fs, 'readJSON', readJSONStub)
			.stub(fs, 'existsSync', sandbox.stub().returns(false))
			.stub(os, 'homedir', sandbox.stub().returns('~'))
			.stdout();

	describe('when starting without flag', () => {
		setupTest()
			.command(['start'])
			.it('should start with default mainnet config', () => {
				expect(fs.ensureDir).to.have.been.calledWithExactly(defaultDataPath);
				expect(fs.copy).to.have.been.calledWithExactly(
					sandbox.match.string,
					`${defaultDataPath}/config`,
					{ recursive: true },
				);
				expect(fs.readJSON).to.have.been.calledWithExactly(
					`${defaultDataPath}/config/mainnet/genesis_block.json`,
				);
				expect(fs.readJSON).to.have.been.calledWithExactly(
					`${defaultDataPath}/config/mainnet/config.json`,
				);

				const [
					usedGenesisBlock,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedGenesisBlock).to.equal(defaultGenesisBlock);
				expect(usedConfig).to.equal(mainnetConfig);
				expect(usedConfig.protocolVersion).to.equal('2.0');
				expect(usedConfig.label).to.equal('default');
			});
	});

	describe('when unknown network is specidied', () => {
		setupTest()
			.command(['start', '--network=unknown'])
			.catch(err =>
				expect(err.message).to.include(
					'Network must be one of mainnet,testnet',
				),
			)
			.it('should throw an error');
	});

	describe('when enable-ipc is specified', () => {
		setupTest()
			.command(['start', '--enable-ipc'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.ipc.enabled).to.equal(true);
			});
	});

	describe('when log is specified', () => {
		setupTest()
			.command(['start', '--console-log=trace'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.consoleLogLevel).to.equal('trace');
			});

		setupTest()
			.env({ LISK_CONSOLE_LOG_LEVEL: 'error' })
			.command(['start'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.consoleLogLevel).to.equal('error');
			});
	});

	describe('when file log is specified', () => {
		setupTest()
			.command(['start', '--log=trace'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.fileLogLevel).to.equal('trace');
			});

		setupTest()
			.env({ LISK_FILE_LOG_LEVEL: 'trace' })
			.command(['start'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.logger.fileLogLevel).to.equal('trace');
			});
	});

	describe('when port is specified', () => {
		setupTest()
			.command(['start', '--port=1111'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.wsPort).to.equal(1111);
			});

		setupTest()
			.env({ LISK_PORT: '1234' })
			.command(['start'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.wsPort).to.equal(1234);
			});
	});

	describe('when peer is specified', () => {
		setupTest()
			.command(['start', '--peer=localhost:12234'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.seedPeers).to.eql([
					{ ip: 'localhost', wsPort: 12234 },
				]);
			});

		setupTest()
			.command(['start', '--peer=localhost:12234', '-x=74.49.3.35:2238'])
			.it('should update the config value', () => {
				const [
					,
					usedConfig,
				] = (application.getApplication as sinon.SinonStub).getCall(0).args;
				expect(usedConfig.network.seedPeers).to.eql([
					{ ip: 'localhost', wsPort: 12234 },
					{ ip: '74.49.3.35', wsPort: 2238 },
				]);
			});
	});
});

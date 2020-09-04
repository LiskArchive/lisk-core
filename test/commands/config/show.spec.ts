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

describe('config:show command', () => {
	const readJSONStub = sandbox.stub().resolves({
		network: { port: 3000 },
		logger: {
			consoleLogLevel: 'error',
		},
	});
	const readDirSync = sandbox.stub().returns(['mainnet']);
	readDirSync.withArgs('new-folder/config').returns([]);
	const setupTest = () =>
		test
			.stub(fs, 'readJSON', readJSONStub)
			.stub(fs, 'ensureDirSync', sandbox.stub())
			.stub(fs, 'statSync', sandbox.stub().returns({ isDirectory: () => true }))
			.stub(fs, 'removeSync', sandbox.stub().returns(null))
			.stub(fs, 'readdirSync', readDirSync)
			.stub(os, 'homedir', sandbox.stub().returns('~'))
			.stdout();

	describe('config:show', () => {
		setupTest()
			.command(['config:show'])
			.it('should get the config from default path', out => {
				expect(JSON.parse(out.stdout).network.port).to.eql(3000);
			});
	});

	describe('config:show -d ./new-folder', () => {
		setupTest()
			.command(['config:show', '-d', './new-folder'])
			.catch(err => expect(err.message).to.contain('does not contain valid config'))
			.it('should throw an error if the data path does not contain config');
	});

	describe('config:show -d ./config', () => {
		setupTest()
			.command(['config:show', '-d', './existing'])
			.it('should get the config from specified data path', () => {
				expect(fs.readdirSync).to.have.been.calledWith('existing/config');
				expect(fs.readJSON).to.have.been.calledWith('existing/config/mainnet/config.json');
			});
	});

	describe('config:show -c ./constom-config.json', () => {
		const configPath = './custom-config.json';

		const customConfig = { network: { port: 9999 } };

		setupTest()
			.stub(fs, 'readJSON', sandbox.stub().withArgs(customConfig).resolves(customConfig))
			.command(['config:show', '-c', configPath])
			.it('should overwrite the config with provided custom config', out => {
				expect(JSON.parse(out.stdout).network.port).to.eql(9999);
			});
	});
});

/*
 * Copyright © 2018 Lisk Foundation
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
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { cloneDeep } = require('lodash');
const { Application } = require('lisk-sdk')
// const originalConfig = require('../../fixtures/config_1.6.json');
const genesisBlock = require('../../../config/devnet/genesis_block.json');

const dirPath = __dirname;
const rootPath = path.dirname(path.resolve(__filename, '../../../'));

const getUpdatedConfig = (outputFilePath, inputFilePath, fromVersion, toVersion) => {
	spawnSync(
		'node',
		[
			'./scripts/update_config.js',
			'--network',
			'testnet',
			'--output',
			outputFilePath,
			inputFilePath,
			fromVersion,
			toVersion,
		],
		{ cwd: rootPath }
	);

	const resultConfigJSON = JSON.parse(fs.readFileSync(outputFilePath, {
		encoding: 'utf8'
	}));

	return resultConfigJSON;
}

describe('scripts/update_config', () => {
	const updatedConfigPath = `${dirPath}/updated_config.json`;
	let spawnedScript;
	let updatedConfig;

	before(async () => { // Update
		spawnedScript = spawnSync(
			'node',
			[
				'./scripts/update_config.js',
				'--network',
				'testnet',
				'--output',
				updatedConfigPath,
				'/Users/michiel.mulders/lisk/lisk-core/test/fixtures/config_1.6.json',
				'1.6.0',
			],
			{ cwd: rootPath }
		);
		updatedConfig = fs.readFileSync(`${dirPath}/updated_config.json`, {
			encoding: 'utf8'
		});
	});

	after(async () => {
		fs.unlinkSync(updatedConfigPath);
	});

	it('should run update_config with no errors', async () => {
		expect(spawnedScript.stderr.toString()).to.be.empty;
	});

	it('should be able to instanciate application', async () => {
			expect(() => new Application(genesisBlock, updatedConfig)).not.to.throw;
	});
});

describe('migrate from 1.6.0 to 2.0.0', () => {
	const updatedConfigPath = `${dirPath}/updated_config.json`;
	const modifiedPath = `${dirPath}/modified_config.json`; // Better var names
	let baseConfig;

	before(async () => { // Add docs
		baseConfig = JSON.parse(fs.readFileSync('/Users/michiel.mulders/lisk/lisk-core/test/fixtures/config_1.6.json', { // Relative
			encoding: 'utf8'
		}));
	});

	afterEach(async () => {
		fs.unlinkSync(updatedConfigPath);
	});

	after(async () => {
		fs.unlinkSync(modifiedPath);
	});

	it('should detect custom config for wsPort', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.wsPort = 7001; // Default: 5000

		fs.writeFileSync(modifiedPath, JSON.stringify(config), 'utf8');

		// Act & Assert
		const updatedConfig = getUpdatedConfig(updatedConfigPath, modifiedPath, '1.6.0', '2.0.0');
		expect(updatedConfig.modules.network.wsPort).to.eql(config.wsPort);
	});

	it('should detect custom config for fileLogLevel and consoleLogLevel', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.fileLogLevel = 'none'; // Default: 'info'
		config.consoleLogLevel = 'warn'; // Default: 'none'

		fs.writeFileSync(modifiedPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(updatedConfigPath, modifiedPath, '1.6.0', '2.0.0');

		// Assert
		expect(updatedConfig.components.logger.fileLogLevel).to.eql(config.fileLogLevel);
		expect(updatedConfig.components.logger.consoleLogLevel).to.eql(config.consoleLogLevel);
	});

	it('should detect custom config for db.host and db.port', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.db.host = 'lisk-network'; // Default: 'localhost'
		config.db.port = 1111; // Default: 5432

		fs.writeFileSync(modifiedPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(updatedConfigPath, modifiedPath, '1.6.0', '2.0.0');

		// Assert
		expect(updatedConfig.components.storage.host).to.eql(config.db.host);
		expect(updatedConfig.components.storage.port).to.eql(config.db.port);
	});

	it('should detect custom config for db.host and db.port', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.cacheEnabled = true; // Default: false
		config.trustProxy = true; // Default: false

		fs.writeFileSync(modifiedPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(updatedConfigPath, modifiedPath, '1.6.0', '2.0.0');

		// Assert
		expect(updatedConfig.components.cache.enabled).to.eql(config.cacheEnabled);
		expect(updatedConfig.modules.http_api.trustProxy).to.eql(config.trustProxy);
	});

	it('should remove custom config for db.host and db.port if config equals default config', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.db.host = 'localhost'; // Default: 'localhost'
		config.db.port = 5432; // Default: 5432

		fs.writeFileSync(modifiedPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(updatedConfigPath, modifiedPath, '1.6.0', '2.0.0');

		// Assert
		expect(updatedConfig.components.storage.host).to.eql(undefined);
		expect(updatedConfig.components.storage.port).to.eql(undefined);
	});
});

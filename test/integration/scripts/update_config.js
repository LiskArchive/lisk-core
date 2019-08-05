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
const { Application } = require('lisk-sdk');
const genesisBlock = require('../../../config/devnet/genesis_block.json');
const { spawnSync } = require('child_process');
const { cloneDeep } = require('lodash');

const dirPath = __dirname;
const rootPath = path.dirname(path.resolve(__filename, '../../../'));

/**
 * Spawns node script to convert config file from version x to version y.
 * Reads the outputted config and returns this as JSON.
 * 
 * @param {string} outputFilePath File to write updated config to
 * @param {string} inputFilePath File to read config from to be updated
 * @param {string} fromVersion Current version of config for input (fromVersion < toVersion)
 * @param {string} toVersion Version to update config to
 * @param {string} network Network version for config [default:'testnet']
 */
const getUpdatedConfig = (outputFilePath, inputFilePath, fromVersion, toVersion, network = 'testnet') => {
	spawnSync(
		'node',
		[
			'./scripts/update_config.js',
			'--network',
			network,
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
	const outputPath = `${dirPath}/output.json`;
	let updatedConfig;

	before(async () => {
		updatedConfig = getUpdatedConfig(outputPath, path.resolve(__dirname, `../../fixtures/config_1.6.json`), '1.6.0', '2.0.0');
	});

	after(async () => {
		fs.unlinkSync(outputPath);
	});

	it('should be able to instanciate application', async () => {
		expect(() => new Application(genesisBlock, updatedConfig)).not.to.throw;
	});
});

describe('migrate from 1.6.0 to 2.0.0 for testnet', () => {
	const outputPath = `${dirPath}/output.json`;
	const inputPath = `${dirPath}/input_config.json`;
	let baseConfig;

	before(async () => {
		baseConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../fixtures/config_1.6.json`), {
			encoding: 'utf8'
		}));
	});

	afterEach(async () => {
		fs.unlinkSync(outputPath);
	});

	after(async () => {
		fs.unlinkSync(inputPath);
	});

	it('should detect custom config for wsPort', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.wsPort = 7001; // Default: 5000

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act & Assert
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0');
		expect(updatedConfig.modules.network.wsPort).to.eql(config.wsPort);
	});

	it('should detect custom config for fileLogLevel and consoleLogLevel', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.fileLogLevel = 'none'; // Default: 'info'
		config.consoleLogLevel = 'warn'; // Default: 'none'

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0');

		// Assert
		expect(updatedConfig.components.logger.fileLogLevel).to.eql(config.fileLogLevel);
		expect(updatedConfig.components.logger.consoleLogLevel).to.eql(config.consoleLogLevel);
	});

	it('should detect custom config for db.host and db.port', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.db.host = 'lisk-network'; // Default: 'localhost'
		config.db.port = 1111; // Default: 5432

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0');

		// Assert
		expect(updatedConfig.components.storage.host).to.eql(config.db.host);
		expect(updatedConfig.components.storage.port).to.eql(config.db.port);
	});

	it('should detect custom config for db.host and db.port', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.cacheEnabled = true; // Default: false
		config.trustProxy = true; // Default: false

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0');

		// Assert
		expect(updatedConfig.components.cache.enabled).to.eql(config.cacheEnabled);
		expect(updatedConfig.modules.http_api.trustProxy).to.eql(config.trustProxy);
	});

	it('should remove custom config for db.host and db.port if config equals default config', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.db.host = 'localhost'; // Default: 'localhost'
		config.db.port = 5432; // Default: 5432

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0');

		// Assert
		expect(updatedConfig.components.storage.host).to.eql(undefined);
		expect(updatedConfig.components.storage.port).to.eql(undefined);
	});
});

describe('migrate from 1.6.0 to 2.0.0 for testnet', () => {
	const outputPath = `${dirPath}/output.json`;
	const inputPath = `${dirPath}/input_config.json`;
	let baseConfig;

	before(async () => {
		baseConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../fixtures/config_1.6.json`), {
			encoding: 'utf8'
		}));
	});

	afterEach(async () => {
		fs.unlinkSync(outputPath);
	});

	after(async () => {
		fs.unlinkSync(inputPath);
	});

	it('should detect custom config for wsPort', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.wsPort = 7001; // Default: 5000

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act & Assert
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'devnet');
		expect(updatedConfig.modules.network.wsPort).to.eql(config.wsPort);
	});

	it('should detect custom config for fileLogLevel and consoleLogLevel', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.fileLogLevel = 'none'; // Default: 'info'
		config.consoleLogLevel = 'warn'; // Default: 'none'

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'devnet');

		// Assert
		expect(updatedConfig.components.logger.fileLogLevel).to.eql(config.fileLogLevel);
		expect(updatedConfig.components.logger.consoleLogLevel).to.eql(config.consoleLogLevel);
	});

	it('should detect custom config for db.host and db.port', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.db.host = 'lisk-network'; // Default: 'localhost'
		config.db.port = 1111; // Default: 5432

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'devnet');

		// Assert
		expect(updatedConfig.components.storage.host).to.eql(config.db.host);
		expect(updatedConfig.components.storage.port).to.eql(config.db.port);
	});

	it('should detect custom config for db.host and db.port', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.cacheEnabled = true; // Default: false
		config.trustProxy = true; // Default: false

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'devnet');

		// Assert
		expect(updatedConfig.components.cache.enabled).to.eql(config.cacheEnabled);
		expect(updatedConfig.modules.http_api.trustProxy).to.eql(config.trustProxy);
	});

	it('should remove custom config for db.host and db.port if config equals default config', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.db.host = 'localhost'; // Default: 'localhost'
		config.db.port = 5432; // Default: 5432

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'devnet');

		// Assert
		expect(updatedConfig.components.storage.host).to.eql(undefined);
		expect(updatedConfig.components.storage.port).to.eql(undefined);
	});
});

describe('migrate from 1.6.0 to 2.0.0 for mainnet', () => {
	const outputPath = `${dirPath}/output.json`;
	const inputPath = `${dirPath}/input_config.json`;
	let baseConfig;

	before(async () => {
		baseConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../fixtures/config_1.6.json`), {
			encoding: 'utf8'
		}));
	});

	afterEach(async () => {
		fs.unlinkSync(outputPath);
	});

	after(async () => {
		fs.unlinkSync(inputPath);
	});

	it('should detect custom config for wsPort', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.wsPort = 7001; // Default: 5000

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act & Assert
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'mainnet');
		expect(updatedConfig.modules.network.wsPort).to.eql(config.wsPort);
	});

	it('should detect custom config for fileLogLevel and consoleLogLevel', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.fileLogLevel = 'none'; // Default: 'info'
		config.consoleLogLevel = 'warn'; // Default: 'none'

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'mainnet');

		// Assert
		expect(updatedConfig.components.logger.fileLogLevel).to.eql(config.fileLogLevel);
		expect(updatedConfig.components.logger.consoleLogLevel).to.eql(config.consoleLogLevel);
	});

	it('should detect custom config for db.host and db.port', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.db.host = 'lisk-network'; // Default: 'localhost'
		config.db.port = 1111; // Default: 5432

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'mainnet');

		// Assert
		expect(updatedConfig.components.storage.host).to.eql(config.db.host);
		expect(updatedConfig.components.storage.port).to.eql(config.db.port);
	});

	it('should detect custom config for db.host and db.port', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.cacheEnabled = true; // Default: false
		config.trustProxy = true; // Default: false

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'mainnet');

		// Assert
		expect(updatedConfig.components.cache.enabled).to.eql(config.cacheEnabled);
		expect(updatedConfig.modules.http_api.trustProxy).to.eql(config.trustProxy);
	});

	it('should remove custom config for db.host and db.port if config equals default config', async () => {
		// Arrange
		const config = cloneDeep(baseConfig);
		config.db.host = 'localhost'; // Default: 'localhost'
		config.db.port = 5432; // Default: 5432

		fs.writeFileSync(inputPath, JSON.stringify(config), 'utf8');

		// Act
		const updatedConfig = getUpdatedConfig(outputPath, inputPath, '1.6.0', '2.0.0', 'mainnet');

		// Assert
		expect(updatedConfig.components.storage.host).to.eql(undefined);
		expect(updatedConfig.components.storage.port).to.eql(undefined);
	});
});
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
const { Application } = require('lisk-sdk');
const genesisBlock = require('../../../config/devnet/genesis_block.json');

const dirPath = __dirname;
const rootPath = path.dirname(path.resolve(__filename, '../../../'));

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

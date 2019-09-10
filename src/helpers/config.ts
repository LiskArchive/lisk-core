/*
 * Copyright © 2019 Lisk Foundation
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
import { configurator } from 'lisk-sdk';
import path from 'path';
import { getBuildVersion } from './build';
import { getLastCommitId } from './git';

// tslint:disable-next-line no-var-requires no-require-imports
const packageJSON = require('../../package.json');
let lastCommitId; // tslint:disable-line no-let
let buildVersion; // tslint:disable-line no-let

// Try to get the last git commit
try {
	lastCommitId = getLastCommitId();
} catch (err) {
	// suppress error
}

// Try to get the build version
try {
	buildVersion = getBuildVersion();
} catch (err) {
	// suppress error
}

const appSchema = {
	type: 'object',
	properties: {
		NETWORK: {
			type: 'string',
			description:
				'lisk network [devnet|betanet|mainnet|testnet]. Defaults to "devnet"',
			enum: ['devnet', 'alphanet', 'betanet', 'testnet', 'mainnet'],
			env: 'LISK_NETWORK',
			arg: '--network,-n',
		},
		CUSTOM_CONFIG_FILE: {
			type: ['string', 'null'],
			description: 'Custom configuration file path',
			default: null,
			env: 'LISK_CONFIG_FILE',
			arg: '--config,-c',
		},
	},
	default: {
		NETWORK: 'devnet',
		CUSTOM_CONFIG_FILE: null,
	},
};

configurator.registerSchema(appSchema);

const appConfig = {
	app: {
		version: packageJSON.version,
		minVersion: packageJSON.lisk.minVersion,
		protocolVersion: packageJSON.lisk.protocolVersion,
		lastCommitId,
		buildVersion,
	},
};

// Support for PROTOCOL_VERSION only for tests
if (process.env.NODE_ENV === 'test' && process.env.PROTOCOL_VERSION) {
	appConfig.app.protocolVersion = process.env.PROTOCOL_VERSION;
}

configurator.loadConfig(appConfig);

const { NETWORK, CUSTOM_CONFIG_FILE } = configurator.getConfig();

// Variable is used to identify different networks on NewRelic
process.env.LISK_NETWORK = NETWORK;

configurator.loadConfigFile(
	path.resolve(__dirname, `../../config/${NETWORK}/config`)
);

if (CUSTOM_CONFIG_FILE) {
	configurator.loadConfigFile(path.resolve(CUSTOM_CONFIG_FILE));
}

const config = configurator.getConfig();

// To run multiple applications for same network for integration tests
config.app.label = `lisk-${NETWORK}-${config.modules.http_api.httpPort}`;

export { config };

/*
 * LiskHQ/lisk-commander
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
import * as Config from '@oclif/config';

import pJSON = require('../../package.json');

export const getConfig = async () => {
	const config = await Config.load();
	config.pjson.lisk = { addressPrefix: 'lsk' };
	config.pjson.version = pJSON.version;
	return config;
};

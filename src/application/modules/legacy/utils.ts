/*
 * Copyright © 2022 Lisk Foundation
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
import { cryptography } from 'lisk-sdk';

import { ModuleConfig, ModuleConfigJSON } from './types';

const {
	legacyAddress: { getFirstEightBytesReversed },
	utils: { hash },
} = cryptography;

export function getModuleConfig(config: ModuleConfigJSON): ModuleConfig {
	return {
		...config,
		tokenIDReclaim: Buffer.from(config.tokenIDReclaim, 'hex'),
	};
}

export function getLegacyAddress(publicKey: Buffer): Buffer {
	return getFirstEightBytesReversed(hash(publicKey));
}

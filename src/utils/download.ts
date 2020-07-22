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
import { bufferToHex, hash } from '@liskhq/lisk-cryptography';
import * as axios from 'axios';
import * as fs from 'fs-extra';

export interface FileInfo {
	readonly fileName: string;
	readonly fileDir: string;
	readonly filePath: string;
}

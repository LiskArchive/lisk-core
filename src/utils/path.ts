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
import * as path from 'path';
import * as os from 'os';

const defaultDir = '.lisk';
const defaultFolder = 'default';

export const getDefaultPath = (): string =>
	path.join(os.homedir(), defaultDir, defaultFolder);

export const getFullPath = (dataPath: string): string => path.resolve(dataPath);

export const splitPath = (
	dataPath: string,
): { rootPath: string; label: string } => {
	const rootPath = path.resolve(path.join(dataPath, '../'));
	const label = path.parse(dataPath).name;
	return {
		rootPath,
		label,
	};
};

export const getDefaultConfigPath = (): string =>
	path.join(__dirname, '../../config');

export const getConfigPath = (dataPath: string): string =>
	path.join(dataPath, 'config');

export const getNetworkConfigFilesPath = (
	dataPath: string,
	network: string,
): { genesisBlockFilePath: string; configFilePath: string } => {
	const basePath = path.join(dataPath, 'config', network);
	return {
		genesisBlockFilePath: path.join(basePath, 'genesis_block.json'),
		configFilePath: path.join(basePath, 'config.json'),
	};
};

export const getConfigFilePath = (dataPath: string, network: string): string =>
	path.join(dataPath, 'config', network, 'config.json');

export const getBlockchainDBPath = (dataPath: string): string =>
	path.join(dataPath, 'data', 'blockchain.db');

export const getPidPath = (dataPath: string): string =>
	path.join(dataPath, 'tmp', 'pids', 'controller.pid');

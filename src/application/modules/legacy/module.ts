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

import { BaseModule, TokenAPI, utils } from 'lisk-sdk';
import { LegacyEndpoint } from './endpoint';
import { LegacyAPI } from './api';
import { ReclaimCommand } from './commands/reclaim';
import { MODULE_NAME_LEGACY, MODULE_ID_LEGACY, defaultConfig } from './constants';
import { ModuleConfig, ModuleInitArgs } from './types';

export class LegacyModule extends BaseModule {
	public name = MODULE_NAME_LEGACY;
	public id = MODULE_ID_LEGACY;
	public endpoint = new LegacyEndpoint(this.id);
	public api = new LegacyAPI(this.id);

	private readonly _reclaimCommand = new ReclaimCommand(this.id);

	// eslint-disable-next-line @typescript-eslint/member-ordering
	public commands = [this._reclaimCommand];
	private _tokenAPI!: TokenAPI;
	private _moduleConfig!: ModuleConfig;

	public addDependencies(tokenAPI: TokenAPI) {
		this._tokenAPI = tokenAPI;
		this._reclaimCommand.addDependencies(this._tokenAPI);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init(args: ModuleInitArgs) {
		const { moduleConfig } = args;
		this._moduleConfig = utils.objects.mergeDeep({}, defaultConfig, moduleConfig) as ModuleConfig;
		this._reclaimCommand.init({ tokenIDReclaim: this._moduleConfig.tokenIDReclaim });
	}
}

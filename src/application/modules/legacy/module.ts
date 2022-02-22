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

import { BaseModule, ValidatorsAPI } from 'lisk-sdk';
import { LegacyEndpoint } from './endpoint';
import { LegacyAPI } from './api';
import { MODULE_NAME_LEGACY, MODULE_ID_LEGACY } from './constants';
import { RegisterBLSKeyCommand } from './commands/register_bls_key';

export class LegacyModule extends BaseModule {
	public name = MODULE_NAME_LEGACY;
	public id = MODULE_ID_LEGACY;
	public endpoint = new LegacyEndpoint(this.id);
	public api = new LegacyAPI(this.id);

	private readonly _registerBlsKey = new RegisterBLSKeyCommand(this.id);

	// eslint-disable-next-line @typescript-eslint/member-ordering
	public commands = [this._registerBlsKey];
	private _validatorsAPI!: ValidatorsAPI;

	public addDependencies(validatorsAPI: ValidatorsAPI) {
		this._validatorsAPI = validatorsAPI;
		this._registerBlsKey.addDependencies(this._validatorsAPI);
	}
}

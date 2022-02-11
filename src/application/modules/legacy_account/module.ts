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

import { BaseModule } from 'lisk-sdk';
import { LegacyAccountEndpoint } from './endpoint';
import { LegacyAccountAPI } from './api';
import { MODULE_ID_LEGACY } from './constants';

export class LegacyAccountModule extends BaseModule {
    public name = 'legacyAccount';
    public id = MODULE_ID_LEGACY;
    public endpoint = new LegacyAccountEndpoint(this.id);
    public api = new LegacyAccountAPI(this.id);
}

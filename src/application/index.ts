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
import { Application, PartialApplicationConfig } from 'lisk-sdk';

import { LegacyModule } from './modules';

export const getApplication = (config: PartialApplicationConfig): Application => {
	const { app, method } = Application.defaultApplication(config, true);
	const legacyModule = new LegacyModule();

	legacyModule.addDependencies(method.token, method.validator);
	app.registerModule(legacyModule);

	return app;
};

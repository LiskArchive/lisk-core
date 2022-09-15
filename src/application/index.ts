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
import { Application, PartialApplicationConfig, TokenModule, ValidatorsModule } from 'lisk-sdk';

import { LegacyModule } from './modules';

export const getApplication = (config: PartialApplicationConfig): Application => {
	const { app } = Application.defaultApplication(config);
	const legacyModule = new LegacyModule();
	const tokenModule = new TokenModule();
	const validatorModule = new ValidatorsModule();

	legacyModule.addDependencies(tokenModule.method, validatorModule.method);
	app.registerModule(legacyModule);

	return app;
};

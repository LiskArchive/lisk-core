import { BaseGenesisBlockCommand } from 'lisk-commander';
import { Application, PartialApplicationConfig } from 'lisk-sdk';
import { join } from 'path';

import { getApplication } from '../../application';

export class GenesisBlockCommand extends BaseGenesisBlockCommand {
	public getApplication(config: PartialApplicationConfig): Application {
		const app = getApplication(config);
		return app;
	}

	public getApplicationConfigDir(): string {
		return join(__dirname, '../../../config');
	}
}

import { TransactionSignCommand as BaseTransactionSignCommand } from 'lisk-commander';
import { Application, PartialApplicationConfig } from 'lisk-sdk';
import { getApplication } from '../../application';

export class TransactionSignCommand extends BaseTransactionSignCommand {
	public getApplication(config: PartialApplicationConfig): Application {
		const app = getApplication(config);
		return app;
	}
}

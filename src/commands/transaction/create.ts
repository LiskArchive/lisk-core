import { TransactionCreateCommand as BaseTransactionCreateCommand } from 'lisk-commander';
import { Application, PartialApplicationConfig } from 'lisk-sdk';
import { getApplication } from '../../application';

export class TransactionCreateCommand extends BaseTransactionCreateCommand {
	public getApplication(config: PartialApplicationConfig): Application {
		const app = getApplication(config);
		return app;
	}
}

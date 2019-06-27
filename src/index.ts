import { Application } from 'lisk-sdk';
import {
	DappTransaction,
	InTransferTransaction,
	OutTransferTransaction,
} from './transactions';

try {
	/**
	 * We have to keep it in try/catch block as it can throw
	 * exception while validating the configuration
	 */

	// tslint:disable-next-line no-require-imports no-var-requires
	const { config } = require('./helpers/config');

	const { NETWORK } = config;
	// tslint:disable-next-line no-var-requires
	const genesisBlock = require(`../config/${NETWORK}/genesis_block.json`);

	const app = new Application(genesisBlock, config);

	app.registerTransaction(DappTransaction, {
		matcher: context =>
			context.blockHeight <
			app.config.modules.chain.exceptions.precedent.disableDappTransaction,
	});

	app.registerTransaction(
		InTransferTransaction,
		{
			matcher: context =>
				context.blockHeight <
				app.config.modules.chain.exceptions.precedent.disableDappTransfer,
		}
	);

	app.registerTransaction(
		OutTransferTransaction,
		{
			matcher: context =>
				context.blockHeight <
				app.config.modules.chain.exceptions.precedent.disableDappTransfer,
		}
	);

	app
		.run()
		.then(() => app.logger.info('App started...'))
		.catch(error => {
			if (error instanceof Error) {
				app.logger.error('App stopped with error', error.message);
				app.logger.debug(error.stack);
			} else {
				app.logger.error('App stopped with error', error);
			}
			process.exit();
		});
} catch (e) {
	// tslint:disable-next-line no-console
	console.error('Application start error.', e);
	process.exit();
}

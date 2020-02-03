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
import { Application } from 'lisk-sdk';
import {
	TransferTransaction,
	SecondSignatureTransaction,
	DelegateTransaction,
	VoteTransaction,
	MultisignatureTransaction,
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

	const {
		disableV1Transactions,
		disableDappTransaction,
		disableDappTransfer,
	} = app.config.app.node.exceptions.precedent;

	app.registerTransaction(TransferTransaction, {
		matcher: context => context.blockHeight < disableV1Transactions,
	});

	app.registerTransaction(SecondSignatureTransaction, {
		matcher: context => context.blockHeight < disableV1Transactions,
	});

	app.registerTransaction(DelegateTransaction, {
		matcher: context => context.blockHeight < disableV1Transactions,
	});

	app.registerTransaction(VoteTransaction, {
		matcher: context => context.blockHeight < disableV1Transactions,
	});

	app.registerTransaction(MultisignatureTransaction, {
		matcher: context => context.blockHeight < disableV1Transactions,
	});

	app.registerTransaction(DappTransaction, {
		matcher: context => context.blockHeight < disableDappTransaction,
	});

	app.registerTransaction(InTransferTransaction, {
		matcher: context => context.blockHeight < disableDappTransfer,
	});

	app.registerTransaction(OutTransferTransaction, {
		matcher: context => context.blockHeight < disableDappTransfer,
	});

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

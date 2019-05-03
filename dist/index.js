"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lisk_framework_1 = require("lisk-framework");
const transactions_1 = require("./transactions");
try {
    const { config } = require('./helpers/config');
    const { NETWORK } = config;
    const genesisBlock = require(`../config/${NETWORK}/genesis_block.json`);
    const TRANSACTION_TYPES = {
        DAPP: 5,
        IN_TRANSFER: 6,
        OUT_TRANSFER: 7,
    };
    const app = new lisk_framework_1.Application(genesisBlock, config);
    app.registerTransaction(TRANSACTION_TYPES.DAPP, transactions_1.DappTransaction);
    app.registerTransaction(TRANSACTION_TYPES.IN_TRANSFER, transactions_1.InTransferTransaction, {
        matcher: context => context.blockHeight <
            app.config.modules.chain.exceptions.precedent.disableDappTransfer,
    });
    app.registerTransaction(TRANSACTION_TYPES.OUT_TRANSFER, transactions_1.OutTransferTransaction, {
        matcher: context => context.blockHeight <
            app.config.modules.chain.exceptions.precedent.disableDappTransfer,
    });
    app
        .run()
        .then(() => app.logger.info('App started...'))
        .catch(error => {
        if (error instanceof Error) {
            app.logger.error('App stopped with error', error.message);
            app.logger.debug(error.stack);
        }
        else {
            app.logger.error('App stopped with error', error);
        }
        process.exit();
    });
}
catch (e) {
    console.error('Application start error.', e);
    process.exit();
}
//# sourceMappingURL=index.js.map
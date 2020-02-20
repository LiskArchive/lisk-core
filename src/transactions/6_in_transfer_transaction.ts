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
 *
 */
import { cryptography, transactions, validator as liskValidator } from 'lisk-sdk';
import {
	BaseTransaction,
} from './legacy_base_transaction';
import {
	TRANSACTION_DAPP_TYPE,
	IN_TRANSFER_FEE,
} from './constants';

const {
	convertToAssetError,
	TransactionError,
	utils: {
		convertBeddowsToLSK,
		verifyAmountBalance,
	},
	constants,
} = transactions;
const {
	isPositiveNumberString,
	validator,
} = liskValidator;

export interface InTransferAsset {
	readonly amount: bigint;
	readonly inTransfer: {
		readonly dappId: string;
	};
}

export const inTransferAssetFormatSchema = {
	type: 'object',
	required: ['inTransfer', 'amount'],
	properties: {
		amount: {
			type: 'string',
			format: 'amount',
		},
		inTransfer: {
			type: 'object',
			required: ['dappId'],
			properties: {
				dappId: {
					type: 'string',
					format: 'id',
				},
			},
		},
	},
};

interface RawAsset {
	readonly amount: string;
	readonly inTransfer: {
		readonly dappId: string;
	};
}

export class InTransferTransaction extends BaseTransaction {
	public readonly asset: InTransferAsset;
	public static TYPE = 6;
	public static FEE = BigInt(IN_TRANSFER_FEE);

	public constructor(rawTransaction: unknown) {
		super(rawTransaction);
		const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
			? rawTransaction
			: {}) as Partial<transactions.TransactionJSON>;

		const rawAsset = tx.asset as RawAsset;
		this.asset = {
			amount: BigInt(isPositiveNumberString(rawAsset.amount) ? rawAsset.amount : '0'),
			inTransfer: rawAsset.inTransfer || {},
		} as InTransferAsset;
	}

	// Function getBasicBytes is overriden to maintain the bytes order
	// TODO: remove after hardfork implementation
	protected getBasicBytes(): Buffer {
		const transactionType = cryptography.intToBuffer(this.type, constants.BYTESIZES.TYPE);
		const transactionTimestamp = cryptography.intToBuffer(
			this.timestamp,
			constants.BYTESIZES.TIMESTAMP,
			'little',
		);

		const transactionSenderPublicKey = cryptography.hexToBuffer(this.senderPublicKey);

		const transactionRecipientID = Buffer.alloc(constants.BYTESIZES.RECIPIENT_ID);

		const transactionAmount = cryptography.intToBuffer(
			this.asset.amount.toString(),
			constants.BYTESIZES.AMOUNT,
			'little',
		);

		return Buffer.concat([
			transactionType,
			transactionTimestamp,
			transactionSenderPublicKey,
			transactionRecipientID,
			transactionAmount,
			Buffer.from(this.asset.inTransfer.dappId, 'utf8'),
		]);
	}

	public async prepare(store: transactions.StateStorePrepare): Promise<void> {
		await store.account.cache([{ address: this.senderId }]);

		const transactions = await store.transaction.cache([
			{
				id: this.asset.inTransfer.dappId,
			},
		]);

		const dappTransaction =
			transactions && transactions.length > 0
				? transactions.find(
						tx =>
							tx.type === TRANSACTION_DAPP_TYPE &&
							tx.id === this.asset.inTransfer.dappId
				  )
				: undefined;

		if (dappTransaction) {
			await store.account.cache([
				{ address: cryptography.getAddressFromPublicKey(dappTransaction.senderPublicKey) },
			]);
		}
	}

	public assetToJSON(): object {
		return {
			...this.asset,
			amount: this.asset.amount.toString(),
		};
	}

	// tslint:disable-next-line prefer-function-over-method
	protected verifyAgainstTransactions(
		_: ReadonlyArray<transactions.TransactionJSON>
	): ReadonlyArray<transactions.TransactionError> {
		return [];
	}

	protected validateAsset(): ReadonlyArray<transactions.TransactionError> {
		const asset = this.assetToJSON();
		const schemaErrors = validator.validate(inTransferAssetFormatSchema, asset);
		const errors = convertToAssetError(
			this.id,
			schemaErrors,
		) as transactions.TransactionError[];

		if (this.asset.amount <= BigInt(0)) {
			errors.push(
				new TransactionError(
					'Amount must be greater than 0',
					this.id,
					'.amount',
					this.asset.amount.toString(),
					'0'
				)
			);
		}

		return errors;
	}

	protected async applyAsset(store: transactions.StateStore): Promise<ReadonlyArray<transactions.TransactionError>> {
		const errors: transactions.TransactionError[] = [];
		const idExists = store.transaction.find(
			(transaction: transactions.TransactionJSON) =>
				transaction.type === TRANSACTION_DAPP_TYPE &&
				transaction.id === this.asset.inTransfer.dappId
		);

		if (!idExists) {
			errors.push(
				new TransactionError(
					`Application not found: ${this.asset.inTransfer.dappId}`,
					this.id,
					this.asset.inTransfer.dappId
				)
			);
		}
		const sender = await store.account.get(this.senderId);

		const balanceError = verifyAmountBalance(
			this.id,
			sender,
			this.asset.amount,
			this.fee
		);
		if (balanceError) {
			errors.push(balanceError);
		}

		sender.balance -= this.asset.amount;

		store.account.set(sender.address, sender);

		const dappTransaction = store.transaction.get(this.asset.inTransfer.dappId);

		const recipient = await store.account.get(cryptography.getAddressFromPublicKey(dappTransaction.senderPublicKey));
		recipient.balance += this.asset.amount;
		store.account.set(recipient.address, recipient);

		return errors;
	}

	protected async undoAsset(store: transactions.StateStore): Promise<ReadonlyArray<transactions.TransactionError>> {
		const errors: transactions.TransactionError[] = [];
		const sender = await store.account.get(this.senderId);
		sender.balance += this.asset.amount;
		store.account.set(sender.address, sender);

		const dappTransaction = store.transaction.get(this.asset.inTransfer.dappId);

		const recipient = await store.account.get(cryptography.getAddressFromPublicKey(dappTransaction.senderPublicKey));
		recipient.balance -= this.asset.amount;

		if (recipient.balance < BigInt(0)) {
			errors.push(
				new TransactionError(
					`Account does not have enough LSK: ${
						recipient.address
					}, balance: ${convertBeddowsToLSK(recipient.balance.toString())}.`,
					this.id
				)
			);
		}

		store.account.set(recipient.address, recipient);

		return errors;
	}

	// tslint:disable:next-line: prefer-function-over-method no-any
	protected assetFromSync(raw: any): object | undefined {
		if (!raw.in_dappId) {
			return undefined;
		}
		const inTransfer = {
			dappId: raw.in_dappId,
		};
	
		return { inTransfer };
	}
}

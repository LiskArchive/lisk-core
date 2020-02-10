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
import {
	transactions,
	cryptography,
	validator as liskValidator,
} from 'lisk-sdk';
import {
	BaseTransaction,
} from './legacy_base_transaction';

const {
	convertToAssetError,
	TransactionError,
	utils: {
		verifyAmountBalance,
		verifyBalance,
	},
	constants: {
		BYTESIZES,
		MAX_TRANSACTION_AMOUNT,
		TRANSFER_FEE,
	},
} = transactions;
const {
	isValidTransferAmount,
	isPositiveNumberString,
	validator,
} = liskValidator;
const {
	hexToBuffer,
	intToBuffer,
	stringToBuffer,
} = cryptography;

export interface TransferAsset {
	readonly data?: string;
	readonly recipientId: string;
	readonly amount: bigint;
}

export const transferAssetFormatSchema = {
	type: 'object',
	required: ['recipientId', 'amount'],
	properties: {
		recipientId: {
			type: 'string',
			format: 'address',
		},
		amount: {
			type: 'string',
			format: 'amount',
		},
		data: {
			type: 'string',
			format: 'transferData',
			maxLength: 64,
		},
	},
};

interface RawAsset {
	readonly data?: string;
	readonly recipientId: string;
	readonly amount: number | string;
}

export class TransferTransaction extends BaseTransaction {
	public readonly asset: TransferAsset;
	public static TYPE = 0;
	public static FEE = BigInt(TRANSFER_FEE);

	public constructor(rawTransaction: unknown) {
		super(rawTransaction);
		const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
			? rawTransaction
			: {}) as Partial<transactions.TransactionJSON>;
		// Initializes to empty object if it doesn't exist
		if (tx.asset) {
			const rawAsset = tx.asset as RawAsset;
			this.asset = {
				data: rawAsset.data,
				recipientId: rawAsset.recipientId,
				amount: BigInt(
					isPositiveNumberString(rawAsset.amount) ? rawAsset.amount : '0',
				),
			};
		} else {
			// tslint:disable-next-line no-object-literal-type-assertion
			this.asset = {} as TransferAsset;
		}
	}

	// Function getBasicBytes is overriden to maintain the bytes order
	// TODO: remove after hardfork implementation
	protected getBasicBytes(): Buffer {
		const transactionType = intToBuffer(this.type, BYTESIZES.TYPE);
		const transactionTimestamp = intToBuffer(
			this.timestamp,
			BYTESIZES.TIMESTAMP,
			'little',
		);

		const transactionSenderPublicKey = hexToBuffer(this.senderPublicKey);

		const transactionRecipientID = intToBuffer(
			this.asset.recipientId.slice(0, -1),
			BYTESIZES.RECIPIENT_ID,
		).slice(0, BYTESIZES.RECIPIENT_ID);

		const transactionAmount = cryptography.intToBuffer(
			this.asset.amount.toString(),
			BYTESIZES.AMOUNT,
			'little',
		);

		const dataBuffer = this.asset.data
			? stringToBuffer(this.asset.data)
			: Buffer.alloc(0);

		return Buffer.concat([
			transactionType,
			transactionTimestamp,
			transactionSenderPublicKey,
			transactionRecipientID,
			transactionAmount,
			dataBuffer,
		]);
	}

	public assetToJSON(): object {
		return {
			data: this.asset.data,
			amount: this.asset.amount.toString(),
			recipientId: this.asset.recipientId,
		};
	}

	public async prepare(store: transactions.StateStorePrepare): Promise<void> {
		await store.account.cache([
			{
				address: this.senderId,
			},
			{
				address: this.asset.recipientId,
			},
		]);
	}

	protected validateAsset(): ReadonlyArray<transactions.TransactionError> {
		const asset = this.assetToJSON();
		const schemaErrors = validator.validate(transferAssetFormatSchema, asset);
		const errors = convertToAssetError(
			this.id,
			schemaErrors,
		) as transactions.TransactionError[];

		if (!isValidTransferAmount(this.asset.amount.toString())) {
			errors.push(
				new TransactionError(
					'Amount must be a valid number in string format.',
					this.id,
					'.amount',
					this.asset.amount.toString(),
				),
			);
		}

		if (!this.asset.recipientId) {
			errors.push(
				new TransactionError(
					'`recipientId` must be provided.',
					this.id,
					'.asset.recipientId',
				),
			);
		}

		return errors;
	}

	protected async applyAsset(store: transactions.StateStore): Promise<ReadonlyArray<transactions.TransactionError>> {
		const errors: transactions.TransactionError[] = [];
		const sender = await store.account.get(this.senderId);

		const balanceError = verifyAmountBalance(
			this.id,
			sender,
			this.asset.amount,
			this.fee,
		);
		if (balanceError) {
			errors.push(balanceError);
		}

		sender.balance -= this.asset.amount;

		store.account.set(sender.address, sender);
		const recipient = await store.account.getOrDefault(this.asset.recipientId);
		recipient.balance += this.asset.amount;

		if (recipient.balance > BigInt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(
				new TransactionError(
					'Invalid amount',
					this.id,
					'.amount',
					this.asset.amount.toString(),
				),
			);
		}

		store.account.set(recipient.address, recipient);

		return errors;
	}

	protected async undoAsset(store: transactions.StateStore): Promise<ReadonlyArray<transactions.TransactionError>> {
		const errors: transactions.TransactionError[] = [];
		const sender = await store.account.get(this.senderId);
		sender.balance += this.asset.amount;

		if (sender.balance > BigInt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(
				new TransactionError(
					'Invalid amount',
					this.id,
					'.amount',
					this.asset.amount.toString(),
				),
			);
		}

		store.account.set(sender.address, sender);
		const recipient = await store.account.getOrDefault(this.asset.recipientId);

		const balanceError = verifyBalance(this.id, recipient, this.asset.amount);

		if (balanceError) {
			errors.push(balanceError);
		}

		recipient.balance -= this.asset.amount;

		store.account.set(recipient.address, recipient);

		return errors;
	}
}

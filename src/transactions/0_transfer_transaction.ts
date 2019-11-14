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
import BigNum from '@liskhq/bignum';
import {
	transactions,
	cryptography,
} from 'lisk-sdk';
import {
	BaseTransaction,
} from './legacy_base_transaction';

const {
	convertToAssetError,
	TransactionError,
	utils: {
		validator,
		isValidNumber,
		validateTransferAmount,
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
	bigNumberToBuffer,
	hexToBuffer,
	intToBuffer,
	stringToBuffer,
} = cryptography;

export interface TransferAsset {
	readonly data?: string;
	readonly recipientId: string;
	readonly amount: BigNum;
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
	public static FEE = TRANSFER_FEE.toString();

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
				amount: new BigNum(
					isValidNumber(rawAsset.amount) ? rawAsset.amount : '0',
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

		const transactionAmount = bigNumberToBuffer(
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
		validator.validate(transferAssetFormatSchema, asset);
		const errors = convertToAssetError(
			this.id,
			validator.errors,
		) as transactions.TransactionError[];

		if (!validateTransferAmount(this.asset.amount.toString())) {
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

	protected applyAsset(store: transactions.StateStore): ReadonlyArray<transactions.TransactionError> {
		const errors: transactions.TransactionError[] = [];
		const sender = store.account.get(this.senderId);

		const balanceError = verifyAmountBalance(
			this.id,
			sender,
			this.asset.amount,
			this.fee,
		);
		if (balanceError) {
			errors.push(balanceError);
		}

		const updatedSenderBalance = new BigNum(sender.balance).sub(
			this.asset.amount,
		);

		const updatedSender = {
			...sender,
			balance: updatedSenderBalance.toString(),
		};
		store.account.set(updatedSender.address, updatedSender);
		const recipient = store.account.getOrDefault(this.asset.recipientId);

		const updatedRecipientBalance = new BigNum(recipient.balance).add(
			this.asset.amount,
		);

		if (updatedRecipientBalance.gt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(
				new TransactionError(
					'Invalid amount',
					this.id,
					'.amount',
					this.asset.amount.toString(),
				),
			);
		}

		const updatedRecipient = {
			...recipient,
			balance: updatedRecipientBalance.toString(),
		};
		store.account.set(updatedRecipient.address, updatedRecipient);

		return errors;
	}

	protected undoAsset(store: transactions.StateStore): ReadonlyArray<transactions.TransactionError> {
		const errors: transactions.TransactionError[] = [];
		const sender = store.account.get(this.senderId);
		const updatedSenderBalance = new BigNum(sender.balance).add(
			this.asset.amount,
		);

		if (updatedSenderBalance.gt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(
				new TransactionError(
					'Invalid amount',
					this.id,
					'.amount',
					this.asset.amount.toString(),
				),
			);
		}

		const updatedSender = {
			...sender,
			balance: updatedSenderBalance.toString(),
		};
		store.account.set(updatedSender.address, updatedSender);
		const recipient = store.account.getOrDefault(this.asset.recipientId);

		const balanceError = verifyBalance(this.id, recipient, this.asset.amount);

		if (balanceError) {
			errors.push(balanceError);
		}

		const updatedRecipientBalance = new BigNum(recipient.balance).sub(
			this.asset.amount,
		);

		const updatedRecipient = {
			...recipient,
			balance: updatedRecipientBalance.toString(),
		};

		store.account.set(updatedRecipient.address, updatedRecipient);

		return errors;
	}
}

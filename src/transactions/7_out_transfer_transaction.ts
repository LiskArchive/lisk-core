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
import { transactions, cryptography, validator as liskValidator } from 'lisk-sdk';
import {
	BaseTransaction,
} from './legacy_base_transaction';
import { MAX_TRANSACTION_AMOUNT, OUT_TRANSFER_FEE } from './constants';

const {
	convertToAssetError,
	TransactionError,
	utils: {
		verifyAmountBalance,
	},
	constants,
} = transactions;
const {
	isPositiveNumberString,
	validator,
} = liskValidator;
const TRANSACTION_DAPP_REGISTERATION_TYPE = 5;

export interface OutTransferAsset {
	readonly recipientId: string;
	readonly amount: bigint;
	readonly outTransfer: {
		readonly dappId: string;
		readonly transactionId: string;
	};
}

export const outTransferAssetFormatSchema = {
	type: 'object',
	required: ['outTransfer', 'recipientId', 'amount'],
	properties: {
		recipientId: {
			type: 'string',
			format: 'address',
		},
		amount: {
			type: 'string',
			format: 'amount',
		},
		outTransfer: {
			type: 'object',
			required: ['dappId', 'transactionId'],
			properties: {
				dappId: {
					type: 'string',
					format: 'id',
				},
				transactionId: {
					type: 'string',
					format: 'id',
				},
			},
		},
	},
};

interface RawAsset {
	readonly recipientId: string;
	readonly amount: string;
	readonly outTransfer: {
		readonly dappId: string;
		readonly transactionId: string;
	};
}

export class OutTransferTransaction extends BaseTransaction {
	public readonly asset: OutTransferAsset;
	public readonly containsUniqueData: boolean;
	public static TYPE = 7;
	public static FEE = BigInt(OUT_TRANSFER_FEE);

	public constructor(rawTransaction: unknown) {
		super(rawTransaction);
		const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
			? rawTransaction
			: {}) as Partial<transactions.TransactionJSON>;

		const rawAsset = tx.asset as RawAsset;
		this.asset = {
			amount: BigInt(isPositiveNumberString(rawAsset.amount) ? rawAsset.amount : '0'),
			recipientId: rawAsset.recipientId || '',
			outTransfer: rawAsset.outTransfer || {},
		} as OutTransferAsset;

		this.containsUniqueData = true;
	}

	public async prepare(store: transactions.StateStorePrepare): Promise<void> {
		await store.account.cache([
			{
				address: this.senderId,
			},
			{ address: this.asset.recipientId },
		]);

		await store.transaction.cache([
			{
				id: this.asset.outTransfer.dappId,
			},
			{ id: this.asset.outTransfer.transactionId },
		]);
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

		const transactionRecipientID = cryptography.intToBuffer(
			this.asset.recipientId.slice(0, -1),
			constants.BYTESIZES.RECIPIENT_ID,
		).slice(0, constants.BYTESIZES.RECIPIENT_ID);

		const transactionAmount = cryptography.intToBuffer(
			this.asset.amount.toString(),
			constants.BYTESIZES.AMOUNT,
			'little',
		);

		const { dappId, transactionId } = this.asset.outTransfer;
		const outAppIdBuffer = Buffer.from(dappId, 'utf8');
		const outTransactionIdBuffer = Buffer.from(transactionId, 'utf8');

		return Buffer.concat([
			transactionType,
			transactionTimestamp,
			transactionSenderPublicKey,
			transactionRecipientID,
			transactionAmount,
			Buffer.concat([outAppIdBuffer, outTransactionIdBuffer]),
		]);
	}

	public assetToJSON(): object {
		return {
			...this.asset,
			amount: this.asset.amount.toString(),
		};
	}

	protected verifyAgainstTransactions(
		transactions: ReadonlyArray<transactions.TransactionJSON>
	): ReadonlyArray<transactions.TransactionError> {
		const sameTypeTransactions = transactions.filter(
			tx =>
				tx.type === OutTransferTransaction.TYPE &&
				'outTransfer' in tx.asset &&
				this.asset.outTransfer.transactionId ===
					(tx.asset as OutTransferAsset).outTransfer.transactionId
		);

		return sameTypeTransactions.length > 0
			? [
					new TransactionError(
						'Out Transfer cannot refer to the same transactionId',
						this.id,
						'.asset.outTransfer.transactionId'
					),
			  ]
			: [];
	}

	protected validateAsset(): ReadonlyArray<transactions.TransactionError> {
		const asset = this.assetToJSON();
		const schemaErrors = validator.validate(outTransferAssetFormatSchema, asset);
		const errors = convertToAssetError(
			this.id,
			schemaErrors
		) as transactions.TransactionError[];

		// Amount has to be greater than 0
		if (this.asset.amount <= BigInt(0)) {
			errors.push(
				new TransactionError(
					'Amount must be greater than zero for outTransfer transaction',
					this.id,
					'.amount',
					this.asset.amount.toString()
				)
			);
		}

		if (this.asset.recipientId === '') {
			errors.push(
				new TransactionError(
					'RecipientId must be set for outTransfer transaction',
					this.id,
					'.recipientId',
					this.asset.recipientId
				)
			);
		}

		return errors;
	}

	protected async applyAsset(store: transactions.StateStore): Promise<ReadonlyArray<transactions.TransactionError>> {
		const errors: transactions.TransactionError[] = [];
		const dappRegistrationTransaction = store.transaction.get(
			this.asset.outTransfer.dappId
		);

		if (
			!dappRegistrationTransaction ||
			dappRegistrationTransaction.type !== TRANSACTION_DAPP_REGISTERATION_TYPE
		) {
			errors.push(
				new TransactionError(
					`Application not found: ${this.asset.outTransfer.dappId}`,
					this.id,
					'.asset.outTransfer.dappId'
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

		const recipient = await store.account.getOrDefault(this.asset.recipientId);
		recipient.balance += this.asset.amount;

		if (recipient.balance > BigInt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(new TransactionError('Invalid amount', this.id, '.amount'));
		}

		store.account.set(recipient.address, recipient);

		return errors;
	}

	public async undoAsset(store: transactions.StateStore): Promise<ReadonlyArray<transactions.TransactionError>> {
		const errors: transactions.TransactionError[] = [];
		const sender = await store.account.get(this.senderId);
		sender.balance += this.asset.amount;

		if (sender.balance > BigInt(MAX_TRANSACTION_AMOUNT)) {
			errors.push(
				new TransactionError(
					'Invalid amount',
					this.id,
					'.amount',
					this.asset.amount.toString()
				)
			);
		}

		store.account.set(sender.address, sender);

		const recipient = await store.account.getOrDefault(this.asset.recipientId);
		recipient.balance -= this.asset.amount;

		if (recipient.balance < BigInt(0)) {
			errors.push(
				new TransactionError(
					`Account does not have enough LSK: ${recipient.address}, balance: ${
						recipient.balance
					}`,
					this.id,
					recipient.balance.toString(),
				)
			);
		}

		store.account.set(recipient.address, recipient);

		return errors;
	}

	// tslint:disable:next-line: prefer-function-over-method no-any
	protected assetFromSync(raw: any): object | undefined {
		if (!raw.ot_dappId) {
			return undefined;
		}
		const outTransfer = {
			dappId: raw.ot_dappId,
			transactionId: raw.ot_outTransactionId,
		};
	
		return { outTransfer };
	}
}

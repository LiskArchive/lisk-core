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
import * as schemas from './schema';

const {
	TransactionError,
	TransactionPendingError,
	createResponse,
	convertToTransactionError,
	Status,
	utils: {
		getId,
		validateSenderIdAndPublicKey,
		validateSignature,
		validator,
		verifyBalance,
		verifyMultiSignatures,
		verifySecondSignature,
		verifySenderPublicKey,
	},
	constants: {
		BYTESIZES,
		MAX_TRANSACTION_AMOUNT,
		UNCONFIRMED_MULTISIG_TRANSACTION_TIMEOUT,
		UNCONFIRMED_TRANSACTION_TIMEOUT,
	},
} = transactions;
const {
	getAddressAndPublicKeyFromPassphrase,
	getAddressFromPublicKey,
	hash,
	hexToBuffer,
	signData,
} = cryptography;

export interface StateStoreGetter<T> {
	get(key: string): T;
	find(func: (item: T) => boolean): T | undefined;
}

export interface StateStoreDefaultGetter<T> {
	getOrDefault(key: string): T;
}

export interface StateStoreSetter<T> {
	set(key: string, value: T): void;
}

export interface StateStore {
	readonly account: StateStoreGetter<transactions.Account> &
		StateStoreDefaultGetter<transactions.Account> &
		StateStoreSetter<transactions.Account>;
	readonly transaction: StateStoreGetter<transactions.TransactionJSON>;
}

export interface StateStoreCache<T> {
	cache(
		filterArray: ReadonlyArray<{ readonly [key: string]: string }>,
	): Promise<ReadonlyArray<T>>;
}

export interface StateStorePrepare {
	readonly account: StateStoreCache<transactions.Account>;
	readonly transaction: StateStoreCache<transactions.TransactionJSON>;
}

export enum MultisignatureStatus {
	UNKNOWN = 0,
	NONMULTISIGNATURE = 1,
	PENDING = 2,
	READY = 3,
	FAIL = 4,
}

export const ENTITY_ACCOUNT = 'account';
export const ENTITY_TRANSACTION = 'transaction';

export abstract class BaseTransaction {
	public readonly blockId?: string;
	public readonly height?: number;
	public readonly relays?: number;
	public readonly confirmations?: number;
	public readonly signatures: string[];
	public readonly timestamp: number;
	public readonly type: number;
	public readonly containsUniqueData?: boolean;
	public readonly asset: object;
	public fee: BigNum;
	public receivedAt?: Date;

	public static TYPE: number;
	public static FEE = '0';

	protected _id?: string;
	protected _senderPublicKey?: string;
	protected _signature?: string;
	protected _signSignature?: string;
	protected _multisignatureStatus: MultisignatureStatus =
		MultisignatureStatus.UNKNOWN;

	protected abstract validateAsset(): ReadonlyArray<transactions.TransactionError>;
	protected abstract applyAsset(
		store: StateStore,
	): ReadonlyArray<transactions.TransactionError>;
	protected abstract undoAsset(
		store: StateStore,
	): ReadonlyArray<transactions.TransactionError>;

	public constructor(rawTransaction: unknown) {
		const tx = (typeof rawTransaction === 'object' && rawTransaction !== null
			? rawTransaction
			: {}) as Partial<transactions.TransactionJSON>;

		this.fee = new BigNum((this.constructor as typeof BaseTransaction).FEE);

		this.type =
			typeof tx.type === 'number'
				? tx.type
				: (this.constructor as typeof BaseTransaction).TYPE;

		this._id = tx.id;
		this._senderPublicKey = tx.senderPublicKey || '';

		this._signature = tx.signature;
		this.signatures = (tx.signatures as string[]) || [];
		this._signSignature = tx.signSignature;
		this.timestamp = typeof tx.timestamp === 'number' ? tx.timestamp : 0;

		// Additional data not related to the protocol
		this.confirmations = tx.confirmations;
		this.blockId = tx.blockId;
		this.height = tx.height;
		this.receivedAt = tx.receivedAt ? new Date(tx.receivedAt) : undefined;
		this.relays = typeof tx.relays === 'number' ? tx.relays : undefined;
		this.asset = tx.asset || {};
	}

	public get id(): string {
		if (!this._id) {
			throw new Error('id is required to be set before use');
		}

		return this._id;
	}

	public get senderId(): string {
		return getAddressFromPublicKey(this.senderPublicKey);
	}

	public get senderPublicKey(): string {
		if (!this._senderPublicKey) {
			throw new Error('senderPublicKey is required to be set before use');
		}

		return this._senderPublicKey;
	}

	public get signature(): string {
		if (!this._signature) {
			throw new Error('signature is required to be set before use');
		}

		return this._signature;
	}

	public get signSignature(): string | undefined {
		return this._signSignature;
	}

	public toJSON(): transactions.TransactionJSON {
		const transaction = {
			id: this.id,
			blockId: this.blockId,
			height: this.height,
			relays: this.relays,
			confirmations: this.confirmations,
			type: this.type,
			timestamp: this.timestamp,
			senderPublicKey: this.senderPublicKey,
			senderId: this.senderId,
			fee: this.fee.toString(),
			signature: this.signature,
			signSignature: this.signSignature ? this.signSignature : undefined,
			signatures: this.signatures,
			asset: this.assetToJSON(),
			receivedAt: this.receivedAt ? this.receivedAt.toISOString() : undefined,
		};

		return transaction;
	}

	public stringify(): string {
		return JSON.stringify(this.toJSON());
	}

	public isReady(): boolean {
		return (
			this._multisignatureStatus === MultisignatureStatus.READY ||
			this._multisignatureStatus === MultisignatureStatus.NONMULTISIGNATURE
		);
	}

	public getBytes(): Buffer {
		const transactionBytes = Buffer.concat([
			this.getBasicBytes(),
			this._signature ? hexToBuffer(this._signature) : Buffer.alloc(0),
			this._signSignature ? hexToBuffer(this._signSignature) : Buffer.alloc(0),
		]);

		return transactionBytes;
	}

	public validate(): transactions.TransactionResponse {
		const errors = [...this._validateSchema(), ...this.validateAsset()];
		if (errors.length > 0) {
			return createResponse(this.id, errors);
		}
		const transactionBytes = this.getBasicBytes();

		this._id = getId(this.getBytes());

		const {
			valid: signatureValid,
			error: verificationError,
		} = validateSignature(
			this.senderPublicKey,
			this.signature,
			transactionBytes,
			this.id,
		);

		if (!signatureValid && verificationError) {
			errors.push(verificationError);
		}

		if (this.type !== (this.constructor as typeof BaseTransaction).TYPE) {
			errors.push(
				new TransactionError(
					`Invalid type`,
					this.id,
					'.type',
					this.type,
					(this.constructor as typeof BaseTransaction).TYPE,
				),
			);
		}

		return createResponse(this.id, errors);
	}

	// tslint:disable-next-line prefer-function-over-method
	protected verifyAgainstTransactions(
		_: ReadonlyArray<transactions.TransactionJSON>,
	): ReadonlyArray<transactions.TransactionError> {
		return [];
	}

	public verifyAgainstOtherTransactions(
		transactions: ReadonlyArray<transactions.TransactionJSON>,
	): transactions.TransactionResponse {
		const errors = this.verifyAgainstTransactions(transactions);

		return createResponse(this.id, errors);
	}

	public apply(store: StateStore): transactions.TransactionResponse {
		const sender = store.account.getOrDefault(this.senderId);
		const errors = this._verify(sender) as transactions.TransactionError[];

		// Verify MultiSignature
		const { errors: multiSigError } = this.processMultisignatures(store);
		if (multiSigError) {
			errors.push(...multiSigError);
		}

		const updatedBalance = new BigNum(sender.balance).sub(this.fee);
		const updatedSender = {
			...sender,
			balance: updatedBalance.toString(),
			publicKey: sender.publicKey || this.senderPublicKey,
		};
		store.account.set(updatedSender.address, updatedSender);
		const assetErrors = this.applyAsset(store);

		errors.push(...assetErrors);

		if (
			this._multisignatureStatus === MultisignatureStatus.PENDING &&
			errors.length === 1 &&
			errors[0] instanceof TransactionPendingError
		) {
			return {
				id: this.id,
				status: Status.PENDING,
				errors,
			};
		}

		return createResponse(this.id, errors);
	}

	public undo(store: StateStore): transactions.TransactionResponse {
		const sender = store.account.getOrDefault(this.senderId);
		const updatedBalance = new BigNum(sender.balance).add(this.fee);
		const updatedAccount = {
			...sender,
			balance: updatedBalance.toString(),
			publicKey: sender.publicKey || this.senderPublicKey,
		};
		const errors = updatedBalance.lte(MAX_TRANSACTION_AMOUNT)
			? []
			: [
					new TransactionError(
						'Invalid balance amount',
						this.id,
						'.balance',
						sender.balance,
						updatedBalance.toString(),
					),
			  ];
		store.account.set(updatedAccount.address, updatedAccount);
		const assetErrors = this.undoAsset(store);
		errors.push(...assetErrors);

		return createResponse(this.id, errors);
	}

	public async prepare(store: StateStorePrepare): Promise<void> {
		await store.account.cache([
			{
				address: this.senderId,
			},
		]);
	}

	public addMultisignature(
		store: StateStore,
		signatureObject: transactions.SignatureObject,
	): transactions.TransactionResponse {
		// Get the account
		const account = store.account.get(this.senderId);
		// Validate signature key belongs to account's multisignature group
		if (
			account.membersPublicKeys &&
			!account.membersPublicKeys.includes(signatureObject.publicKey)
		) {
			return createResponse(this.id, [
				new TransactionError(
					`Public Key '${
						signatureObject.publicKey
					}' is not a member for account '${account.address}'.`,
					this.id,
				),
			]);
		}

		// Check if signature is not already there
		if (this.signatures.includes(signatureObject.signature)) {
			return createResponse(this.id, [
				new TransactionError(
					`Signature '${
						signatureObject.signature
					}' already present in transaction.`,
					this.id,
				),
			]);
		}

		// Validate the signature using the signature sender and transaction details
		const { valid } = validateSignature(
			signatureObject.publicKey,
			signatureObject.signature,
			this.getBasicBytes(),
			this.id,
		);
		// If the signature is valid for the sender push it to the signatures array
		if (valid) {
			this.signatures.push(signatureObject.signature);

			return this.processMultisignatures(store);
		}
		// Else populate errors
		const errors = valid
			? []
			: [
					new TransactionError(
						`Failed to add signature '${signatureObject.signature}'.`,
						this.id,
						'.signatures',
					),
			  ];

		return createResponse(this.id, errors);
	}

	public addVerifiedMultisignature(signature: string): transactions.TransactionResponse {
		if (!this.signatures.includes(signature)) {
			this.signatures.push(signature);

			return createResponse(this.id, []);
		}

		return createResponse(this.id, [
			new TransactionError('Failed to add signature.', this.id, '.signatures'),
		]);
	}

	public processMultisignatures(store: StateStore): transactions.TransactionResponse {
		const sender = store.account.get(this.senderId);
		const transactionBytes = this.getBasicBytes();

		const { status, errors } = verifyMultiSignatures(
			this.id,
			sender,
			this.signatures,
			transactionBytes,
		);
		this._multisignatureStatus = status;
		if (this._multisignatureStatus === MultisignatureStatus.PENDING) {
			return {
				id: this.id,
				status: Status.PENDING,
				errors,
			};
		}

		return createResponse(this.id, errors);
	}

	public isExpired(date: Date = new Date()): boolean {
		if (!this.receivedAt) {
			this.receivedAt = new Date();
		}
		// tslint:disable-next-line no-magic-numbers
		const timeNow = Math.floor(date.getTime() / 1000);
		const timeOut =
			this._multisignatureStatus === MultisignatureStatus.PENDING ||
			this._multisignatureStatus === MultisignatureStatus.READY
				? UNCONFIRMED_MULTISIG_TRANSACTION_TIMEOUT
				: UNCONFIRMED_TRANSACTION_TIMEOUT;
		const timeElapsed =
			// tslint:disable-next-line no-magic-numbers
			timeNow - Math.floor(this.receivedAt.getTime() / 1000);

		return timeElapsed > timeOut;
	}

	public sign(passphrase: string, secondPassphrase?: string): void {
		const { publicKey } = getAddressAndPublicKeyFromPassphrase(passphrase);

		if (this._senderPublicKey !== '' && this._senderPublicKey !== publicKey) {
			throw new Error(
				'Transaction senderPublicKey does not match public key from passphrase',
			);
		}

		this._senderPublicKey = publicKey;

		this._signature = undefined;
		this._signSignature = undefined;
		this._signature = signData(hash(this.getBytes()), passphrase);
		if (secondPassphrase) {
			this._signSignature = signData(hash(this.getBytes()), secondPassphrase);
		}
		this._id = getId(this.getBytes());
	}

	protected getBasicBytes(): Buffer {
		const transactionType = Buffer.alloc(BYTESIZES.TYPE, this.type);
		const transactionTimestamp = Buffer.alloc(BYTESIZES.TIMESTAMP);
		transactionTimestamp.writeIntLE(this.timestamp, 0, BYTESIZES.TIMESTAMP);

		const transactionSenderPublicKey = hexToBuffer(this.senderPublicKey);

		// TODO: Remove on the hard fork change
		const transactionRecipientID = Buffer.alloc(BYTESIZES.RECIPIENT_ID);

		// TODO: Remove on the hard fork change
		const transactionAmount = new BigNum(0).toBuffer({
			endian: 'little',
			size: BYTESIZES.AMOUNT,
		});

		return Buffer.concat([
			transactionType,
			transactionTimestamp,
			transactionSenderPublicKey,
			transactionRecipientID,
			transactionAmount,
			this.assetToBytes(),
		]);
	}

	public assetToJSON(): object {
		return this.asset;
	}

	protected assetToBytes(): Buffer {
		/**
		 * FixMe: The following method is not sufficient enough for more sophisticated cases,
		 * i.e. properties in the asset object need to be sent always in the same right order to produce a deterministic signature.
		 *
		 * We are currently conducting a research to specify an optimal generic way of changing asset to bytes.
		 * You can expect this enhanced implementation to be included in the next releases.
		 */
		return Buffer.from(JSON.stringify(this.asset), 'utf-8');
	}

	private _verify(sender: transactions.Account): ReadonlyArray<transactions.TransactionError> {
		const secondSignatureTxBytes = Buffer.concat([
			this.getBasicBytes(),
			hexToBuffer(this.signature),
		]);

		// Verify Basic state
		return [
			verifySenderPublicKey(this.id, sender, this.senderPublicKey),
			verifyBalance(this.id, sender, this.fee),
			verifySecondSignature(
				this.id,
				sender,
				this.signSignature,
				secondSignatureTxBytes,
			),
		].filter(Boolean) as ReadonlyArray<transactions.TransactionError>;
	}

	private _validateSchema(): ReadonlyArray<transactions.TransactionError> {
		const transaction = this.toJSON();
		validator.validate(schemas.baseTransaction, transaction);
		const errors = convertToTransactionError(
			this.id,
			validator.errors,
		) as transactions.TransactionError[];

		if (
			!errors.find(
				(err: transactions.TransactionError) => err.dataPath === '.senderPublicKey',
			)
		) {
			// `senderPublicKey` passed format check, safely check equality to senderId
			const senderIdError = validateSenderIdAndPublicKey(
				this.id,
				this.senderId,
				this.senderPublicKey,
			);
			if (senderIdError) {
				errors.push(senderIdError);
			}
		}

		return errors;
	}
}

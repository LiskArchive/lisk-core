/*
 * Copyright © 2020 Lisk Foundation
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

import { ApplyAssetInput, BaseAsset, codec, cryptography } from 'lisk-sdk';
import { CHAIN_STATE_UNREGISTERED_ADDRESSES } from '../constants';
import { reclaimAssetSchema, unregisteredAddressesSchema } from '../schema';

interface Asset {
	readonly amount: bigint;
}

interface UnregisteredAccount {
	readonly address: Buffer;
	readonly balance: bigint;
}

interface UnregisteredAddresses {
	readonly unregisteredAddresses: UnregisteredAccount[];
}

export const getLegacyBytes = (publicKey: string | Buffer): Buffer =>
	cryptography.getFirstEightBytesReversed(cryptography.hash(publicKey));

export class ReclaimAsset extends BaseAsset<Asset> {
	public name = 'reclaim';
	public type = 0;
	public assetSchema = reclaimAssetSchema;

	// eslint-disable-next-line class-methods-use-this
	public async applyAsset({
		asset,
		reducerHandler,
		stateStore,
		transaction: { senderPublicKey },
	}: ApplyAssetInput<Asset>): Promise<void> {
		const encodedUnregisteredAddresses = await stateStore.chain.get(
			CHAIN_STATE_UNREGISTERED_ADDRESSES,
		);

		if (!encodedUnregisteredAddresses) {
			throw new Error('Chain state does not contain any unregistered addresses');
		}
		const { unregisteredAddresses } = codec.decode<UnregisteredAddresses>(
			unregisteredAddressesSchema,
			encodedUnregisteredAddresses,
		);
		const legacyAddress = getLegacyBytes(senderPublicKey);
		const addressWithoutPublickey = unregisteredAddresses.find(a =>
			a.address.equals(legacyAddress),
		);

		if (!addressWithoutPublickey) {
			throw new Error(
				'Legacy address corresponding to sender publickey was not found genesis account state',
			);
		}
		if (asset.amount !== addressWithoutPublickey.balance) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			throw new Error(
				`Invalid amount:${
					asset.amount
				} claimed by the sender: ${addressWithoutPublickey.address.toString('base64')}`,
			);
		}
		const newAddress = cryptography.getAddressFromPublicKey(senderPublicKey);
		const { address } = await stateStore.account.get(newAddress);

		await reducerHandler.invoke('token:credit', {
			address,
			amount: addressWithoutPublickey.balance,
		});

		const excludedClaimedAccount = unregisteredAddresses.filter(
			account => !account.address.equals(addressWithoutPublickey.address),
		);
		stateStore.chain.set(
			CHAIN_STATE_UNREGISTERED_ADDRESSES,
			codec.encode(unregisteredAddressesSchema, {
				unregisteredAddresses: excludedClaimedAccount,
			}),
		);
	}
}

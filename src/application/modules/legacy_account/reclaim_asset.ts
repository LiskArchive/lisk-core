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
import { CHAIN_STATE_UNREGISTERED_ADDRESSES } from './constants';
import { unregisteredAddressesSchema } from './schema';

interface Asset {
	readonly amount: bigint;
}

export interface UnregisteredAddresses {
	readonly address: Buffer;
	readonly amount: bigint;
}

export class ReclaimAsset extends BaseAsset<Asset> {
	public name = 'reclaim';
	public type = 0;
	public assetSchema = {
		$id: 'lisk/legacyAccount/reclaim',
		title: 'Reclaim transaction asset',
		type: 'object',
		required: ['amount'],
		properties: {
			amount: {
				dataType: 'uint64',
				fieldNumber: 1,
			},
		},
	};

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
		const unregisteredAddresses = codec.decode<UnregisteredAddresses[]>(
			unregisteredAddressesSchema,
			encodedUnregisteredAddresses,
		);
		const legacyAddress = cryptography.getLegacyAddressFromPublicKey(senderPublicKey);
		const addressWithoutPublickey = unregisteredAddresses.find(a =>
			a.address.equals(Buffer.from(legacyAddress, 'base64')),
		);

		if (!addressWithoutPublickey) {
			throw new Error(
				'Legacy address corresponding to sender publickey was not found genesis account state',
			);
		}
		if (asset.amount !== addressWithoutPublickey.amount) {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			throw new Error(`Invalid amount:${asset.amount} claimed by the sender: ${senderPublicKey}`);
		}
		const newAddress = cryptography.getAddressFromPublicKey(senderPublicKey);
		const reclaimAccount = await stateStore.account.getOrDefault(newAddress);
		await reducerHandler.invoke(
			'token:credit',
			(reclaimAccount as unknown) as Record<string, unknown>,
		);
	}
}

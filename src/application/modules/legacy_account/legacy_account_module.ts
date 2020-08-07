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

import { AfterGenesisBlockApplyInput, BaseModule, codec } from 'lisk-sdk';
import { CHAIN_STATE_UNREGISTERED_ADDRESSES } from './constants';
import { unregisteredAddressesSchema } from './schema';

export class LegacyAccountModule extends BaseModule {
	public name = 'legacyAccount';
	public type = 6;

	// eslint-disable-next-line class-methods-use-this
	public async afterGenesisBlockApply({
		genesisBlock,
		reducerHandler,
		stateStore,
	}: AfterGenesisBlockApplyInput): Promise<void> {
		const { accounts } = genesisBlock.header.asset;
		// New address is 20-byte value specified in LIP 0018 if the account has a registered public key.
		// Otherwise, it is the 8-byte value of the legacy address.
		const unregisteredAddresses = accounts.filter(a => a.address.length !== 20);
		const unregisteredAddressesWithBalance = await Promise.all(
			unregisteredAddresses.map(async ({ address }) => {
				const balance = await reducerHandler.invoke<bigint>('token:getBalance', { address });
				return { address, balance };
			}),
		);
		const encodedUnregisteredAddresses = codec.encode(unregisteredAddressesSchema, {
			unregisteredAddresses: unregisteredAddressesWithBalance,
		});

		stateStore.chain.set(CHAIN_STATE_UNREGISTERED_ADDRESSES, encodedUnregisteredAddresses);
	}
}

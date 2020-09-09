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
 *
 */

import { expect } from 'chai';
import * as sandbox from 'sinon';
import { ApplyAssetContext, cryptography, codec, testing } from 'lisk-sdk';
import { ReclaimAsset, getLegacyBytes } from '../../../../src/application/modules';
import {
	reclaimAssetSchema,
	unregisteredAddressesSchema,
} from '../../../../src/application/modules/legacy_account/schema';
import { CHAIN_STATE_UNREGISTERED_ADDRESSES } from '../../../../src/application/modules/legacy_account/constants';
import { createAccount, createFakeDefaultAccount } from '../../../utils/account';

describe('ReclaimAsset', () => {
	let defaultAccount;
	let reclaimAsset: ReclaimAsset;
	let reclaimAssetInput: ApplyAssetContext<{
		readonly amount: bigint;
	}>;
	let sender;
	const chainMockData = {};
	const reducerHandlerStub = {
		invoke: sandbox.stub().resolves(),
	};
	const randomPublicKey = Buffer.from(
		'0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
		'hex',
	);
	const encodeUnregisteredAddresses = (unregisteredAddresses): Buffer => {
		return codec.encode(unregisteredAddressesSchema, {
			unregisteredAddresses,
		});
	};
	const balanceToClaim = BigInt(100000000000);

	beforeEach(() => {
		defaultAccount = createAccount();
		sender = createFakeDefaultAccount(defaultAccount);
		reclaimAsset = new ReclaimAsset();

		const unregisteredAddresses = [
			{ address: getLegacyBytes(defaultAccount.publicKey), balance: balanceToClaim },
		];

		chainMockData[CHAIN_STATE_UNREGISTERED_ADDRESSES] = encodeUnregisteredAddresses(
			unregisteredAddresses,
		);
		reclaimAssetInput = {
			asset: {
				amount: balanceToClaim,
			},
			reducerHandler: reducerHandlerStub,
			stateStore: new testing.StateStoreMock({ accounts: [sender], chain: chainMockData }),
			transaction: { senderPublicKey: defaultAccount.publicKey },
		} as any;
	});

	afterEach(() => {
		reducerHandlerStub.invoke.resetHistory();
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(reclaimAsset.id).to.equal(0);
		});

		it('should have valid name', () => {
			expect(reclaimAsset.name).to.equal('reclaim');
		});

		it('should have valid schema', () => {
			expect(reclaimAsset.schema).to.deep.equal(reclaimAssetSchema);
		});
	});

	describe('apply', () => {
		it('should throw error when chain state store does not have unregistered addresses', () => {
			reclaimAssetInput.stateStore = new testing.StateStoreMock({
				accounts: [sender],
				chain: {},
			}) as any;
			expect(reclaimAsset.apply(reclaimAssetInput)).to.rejectedWith(
				'Chain state does not contain any unregistered addresses',
			);
		});

		it('should throw error when reclaim senderPublickey corresponding address is not found in unregistered address', () => {
			const unregisteredAddresses = [
				{ address: getLegacyBytes(randomPublicKey), balance: balanceToClaim },
			];
			chainMockData[CHAIN_STATE_UNREGISTERED_ADDRESSES] = encodeUnregisteredAddresses(
				unregisteredAddresses,
			);

			reclaimAssetInput.stateStore = new testing.StateStoreMock({
				accounts: [sender],
				chain: chainMockData,
			}) as any;
			expect(reclaimAsset.apply(reclaimAssetInput)).to.rejectedWith(
				'Legacy address corresponding to sender publickey was not found genesis account state',
			);
		});

		it('should throw error when reclaim amount does not match unregistered address amount', () => {
			const unregisteredAddresses = [
				{ address: getLegacyBytes(defaultAccount.publicKey), amount: BigInt(500000000000) },
			];
			chainMockData[CHAIN_STATE_UNREGISTERED_ADDRESSES] = encodeUnregisteredAddresses(
				unregisteredAddresses,
			);

			reclaimAssetInput.stateStore = new testing.StateStoreMock({
				accounts: [sender],
				chain: chainMockData,
			}) as any;
			expect(reclaimAsset.apply(reclaimAssetInput)).to.rejectedWith(
				'Invalid amount:100000000000 claimed by the sender',
			);
		});

		it('should credit amount from unregistered address to new address', async () => {
			await reclaimAsset.apply(reclaimAssetInput);
			const newAddress = cryptography.getAddressFromPublicKey(defaultAccount.publicKey);
			expect(reducerHandlerStub.invoke).to.be.calledOnce;
			expect(reducerHandlerStub.invoke).to.be.calledOnceWithExactly('token:credit', {
				address: newAddress,
				amount: balanceToClaim,
			});
			expect(reclaimAssetInput.stateStore.chain.get(CHAIN_STATE_UNREGISTERED_ADDRESSES)).to.be
				.empty;
		});

		it('should fail to reclaim twice for same account', async () => {
			await reclaimAsset.apply(reclaimAssetInput);
			expect(reclaimAsset.apply(reclaimAssetInput)).to.rejectedWith(
				'Legacy address corresponding to sender publickey was not found genesis account state',
			);
			expect(reclaimAssetInput.stateStore.chain.get(CHAIN_STATE_UNREGISTERED_ADDRESSES)).to.be
				.empty;
		});
	});
});

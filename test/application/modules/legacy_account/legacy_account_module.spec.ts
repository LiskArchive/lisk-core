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
import { AfterGenesisBlockApplyInput, GenesisConfig, codec } from 'lisk-sdk';
import { testing } from '@liskhq/lisk-utils';
import { LegacyAccountModule, getLegacyBytes } from '../../../../src/application/modules';
import { createAccount, createFakeDefaultAccount } from '../../../utils/account';
import { unregisteredAddressesSchema } from '../../../../src/application/modules/legacy_account/schema';
import { CHAIN_STATE_UNREGISTERED_ADDRESSES } from '../../../../src/application/modules/legacy_account/constants';

describe('LegacyAccountModule', () => {
	let defaultAccount1;
	let defaultAccount2;
	let defaultAccount3;
	let legacyAccountModule: LegacyAccountModule;
	let afterGenesisBlockApplyInput: AfterGenesisBlockApplyInput;
	let legacyAccount1;
	let legacyAccount2;
	let newAccount;
	const legacyBalance = BigInt(100000000000);
	const reducerHandlerStub = {
		invoke: sandbox.stub().resolves(legacyBalance),
	};

	beforeEach(() => {
		[defaultAccount1, defaultAccount2, defaultAccount3] = [
			createAccount(),
			createAccount(),
			createAccount(),
		];
		legacyAccount1 = createFakeDefaultAccount(defaultAccount1);
		legacyAccount2 = createFakeDefaultAccount(defaultAccount2);
		newAccount = createFakeDefaultAccount(defaultAccount3);
		// assign legacy address
		legacyAccount1.address = getLegacyBytes(defaultAccount1.publicKey);
		legacyAccount2.address = getLegacyBytes(defaultAccount2.publicKey);

		const genesisBlock = {
			header: {
				asset: {
					accounts: [legacyAccount1, legacyAccount2, newAccount],
				},
			},
		};

		legacyAccountModule = new LegacyAccountModule({} as GenesisConfig);

		afterGenesisBlockApplyInput = {
			genesisBlock,
			reducerHandler: reducerHandlerStub,
			stateStore: new testing.StateStoreMock({
				accounts: [legacyAccount1, legacyAccount2, newAccount],
			}),
		} as any;
	});

	afterEach(() => {
		reducerHandlerStub.invoke.resetHistory();
	});

	describe('constructor', () => {
		it('should have valid type', () => {
			expect(legacyAccountModule.type).to.equal(6);
		});

		it('should have valid name', () => {
			expect(legacyAccountModule.name).to.equal('legacyAccount');
		});
	});

	describe('afterGenesisBlockApply', () => {
		it('should invoke token:getBalance for each account', async () => {
			await legacyAccountModule.afterGenesisBlockApply(afterGenesisBlockApplyInput);

			const oldAddress1 = getLegacyBytes(defaultAccount1.publicKey);
			const oldAddress2 = getLegacyBytes(defaultAccount2.publicKey);
			expect(reducerHandlerStub.invoke).to.be.calledTwice;
			expect(reducerHandlerStub.invoke).to.be.calledWithExactly('token:getBalance', {
				address: oldAddress1,
			});
			expect(reducerHandlerStub.invoke).to.be.calledWithExactly('token:getBalance', {
				address: oldAddress2,
			});
		});

		it('should save unregistered accounts to state store', async () => {
			await legacyAccountModule.afterGenesisBlockApply(afterGenesisBlockApplyInput);

			const encodedUnregisteredAddresses = codec.encode(unregisteredAddressesSchema, {
				unregisteredAddresses: [
					{
						address: getLegacyBytes(defaultAccount1.publicKey),
						balance: legacyBalance,
					},
					{
						address: getLegacyBytes(defaultAccount2.publicKey),
						balance: legacyBalance,
					},
				],
			});

			const savedResult = await afterGenesisBlockApplyInput.stateStore.chain.get(
				CHAIN_STATE_UNREGISTERED_ADDRESSES,
			);
			expect(encodedUnregisteredAddresses).to.deep.equal(savedResult);
		});

		it('should delete unregistered accounts from state store', async () => {
			await legacyAccountModule.afterGenesisBlockApply(afterGenesisBlockApplyInput);
			const updatedAccounts = afterGenesisBlockApplyInput.stateStore.account.getUpdated();
			expect(updatedAccounts).to.have.lengthOf(1);
		});
	});
});

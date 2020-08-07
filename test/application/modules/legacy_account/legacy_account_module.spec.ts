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
import { AfterGenesisBlockApplyInput, cryptography, GenesisConfig, codec } from 'lisk-sdk';
import { testing } from '@liskhq/lisk-utils';
import { LegacyAccountModule } from '../../../../src/application/modules';
import { createAccount, createFakeDefaultAccount } from '../../../utils/account';
import { unregisteredAddressesSchema } from '../../../../src/application/modules/legacy_account/schema';
import { CHAIN_STATE_UNREGISTERED_ADDRESSES } from '../../../../src/application/modules/legacy_account/constants';

describe('LegacyAccountModule', () => {
	let defaultAccount;
	let legacyAccountModule: LegacyAccountModule;
	let afterGenesisBlockApplyInput: AfterGenesisBlockApplyInput;
	let sender;
	const legacyBalance = BigInt(100000000000);
	const reducerHandlerStub = {
		invoke: sandbox.stub().resolves(legacyBalance),
	};
	const getLegacyAddressBuffer = (publicKey: Buffer) =>
		Buffer.from(cryptography.getLegacyAddressFromPublicKey(publicKey), 'base64');

	beforeEach(() => {
		defaultAccount = createAccount();
		sender = createFakeDefaultAccount(defaultAccount);
		// assign legacy address
		sender.address = getLegacyAddressBuffer(defaultAccount.publicKey);

		const genesisBlock = {
			header: {
				asset: {
					accounts: [sender],
				},
			},
		};

		legacyAccountModule = new LegacyAccountModule({} as GenesisConfig);

		afterGenesisBlockApplyInput = {
			genesisBlock,
			reducerHandler: reducerHandlerStub,
			stateStore: new testing.StateStoreMock({ accounts: [sender] }),
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

			const oldAddress = getLegacyAddressBuffer(defaultAccount.publicKey);
			expect(reducerHandlerStub.invoke).to.be.calledOnce;
			expect(reducerHandlerStub.invoke).to.be.calledOnceWithExactly('token:getBalance', {
				address: oldAddress,
			});
		});

		it('should save unregistered accounts to state store', async () => {
			await legacyAccountModule.afterGenesisBlockApply(afterGenesisBlockApplyInput);

			const encodedUnregisteredAddresses = codec.encode(unregisteredAddressesSchema, {
				unregisteredAddresses: [
					{
						address: getLegacyAddressBuffer(defaultAccount.publicKey),
						balance: legacyBalance,
					},
				],
			});

			const savedResult = await afterGenesisBlockApplyInput.stateStore.chain.get(
				CHAIN_STATE_UNREGISTERED_ADDRESSES,
			);
			expect(encodedUnregisteredAddresses.equals(savedResult as Buffer)).to.be.true;
		});
	});
});

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

import { expect } from '@oclif/test';
import { transactions } from 'lisk-sdk';
import { prepareQuestions, transformAsset, transformNestedAsset } from '../../../src/utils/reader';

describe('prompt', () => {
	describe('prepareQuestions', () => {
		it('should return array of questions for given asset schema', () => {
			const questions = prepareQuestions(transactions.TransferTransaction.ASSET_SCHEMA);
			expect(questions).to.deep.equal([
				{ type: 'input', name: 'amount', message: 'Please enter: amount: ' },
				{
					type: 'input',
					name: 'recipientAddress',
					message: 'Please enter: recipientAddress: ',
				},
				{ type: 'input', name: 'data', message: 'Please enter: data: ' },
			]);
		});
	});

	describe('transformAsset', () => {
		it('should transform result according to asset schema', () => {
			const questions = prepareQuestions(transactions.MultisignatureTransaction.ASSET_SCHEMA);
			const transformedAsset = transformAsset(transactions.MultisignatureTransaction.ASSET_SCHEMA, {
				numberOfSignatures: '4',
				mandatoryKeys: 'a,b',
				optionalKeys: 'c,d',
			});
			expect(questions).to.deep.equal([
				{
					type: 'input',
					name: 'numberOfSignatures',
					message: 'Please enter: numberOfSignatures: ',
				},
				{
					type: 'input',
					name: 'mandatoryKeys',
					message: 'Please enter: mandatoryKeys(comma separated values (a,b)): ',
				},
				{
					type: 'input',
					name: 'optionalKeys',
					message: 'Please enter: optionalKeys(comma separated values (a,b)): ',
				},
			]);
			expect(transformedAsset).to.deep.equal({
				numberOfSignatures: 4,
				mandatoryKeys: ['a', 'b'],
				optionalKeys: ['c', 'd'],
			});
		});
	});

	describe('transformNestedAsset', () => {
		it('should transform result according to nested asset schema', () => {
			const questions = prepareQuestions(transactions.VoteTransaction.ASSET_SCHEMA);
			const transformedAsset = transformNestedAsset(transactions.VoteTransaction.ASSET_SCHEMA, [
				{ votes: 'a,100' },
				{ votes: 'b,300' },
			]);

			expect(questions).to.deep.equal([
				{
					type: 'input',
					name: 'votes',
					message: 'Please enter: votes(delegateAddress, amount): ',
				},
				{
					type: 'confirm',
					name: 'askAgain',
					message: 'Want to enter another votes(delegateAddress, amount)',
				},
			]);
			expect(transformedAsset).to.deep.equal({
				votes: [
					{ delegateAddress: 'a', amount: 100 },
					{ delegateAddress: 'b', amount: 300 },
				],
			});
		});
	});
});

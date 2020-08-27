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

import { expect, test } from '@oclif/test';
import * as sandbox from 'sinon';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import { cryptography, IPCChannel, transactionSchema } from 'lisk-sdk';

import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import * as readerUtils from '../../../src/utils/reader';
import { dposVoteAssetSchema, tokenTransferAssetSchema } from '../../utils/transactions';

const transactionsAssets = [
	{
		moduleID: 2,
		assetID: 0,
		schema: tokenTransferAssetSchema,
	},
	{
		moduleID: 5,
		assetID: 1,
		schema: dposVoteAssetSchema,
	},
];
const passphrase = 'peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready';
const transferAsset =
	'{"amount":100,"recipientAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","data":"send token"}';
const voteAsset =
	'{"votes":[{"delegateAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","amount":100},{"delegateAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","amount":-50}]}';
const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
const senderPublickey = publicKey.toString('hex');

describe('transaction:create command', () => {
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();
	const promptAssetStub = sandbox.stub().resolves({
		amount: 100,
		recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
		data: 'send token',
	});

	ipcInvokeStub.withArgs('app:getSchema').resolves({
		transaction: transactionSchema,
		transactionsAssets,
	});

	afterEach(() => {
		ipcInvokeStub.resetHistory();
		printJSONStub.resetHistory();
		ipcStartAndListenStub.resetHistory();
		promptAssetStub.resetHistory();
	});

	const setupTest = () =>
		test
			.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
			.stub(fs, 'existsSync', fsStub)
			.stub(baseIPC.prototype, 'printJSON', printJSONStub)
			.stub(IPCChannel.prototype, 'startAndListen', ipcStartAndListenStub)
			.stub(IPCChannel.prototype, 'invoke', ipcInvokeStub)
			.stub(inquirer, 'prompt', promptAssetStub)
			.stub(readerUtils, 'getPassphraseFromPrompt', sandbox.stub().resolves(passphrase))
			.stdout()
			.stderr();

	describe('transaction:create', () => {
		setupTest()
			.command(['transaction:create'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 5 required args:'))
			.it('should throw an error when no arguments are provided.');
	});

	describe('transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3', () => {
		setupTest()
			.command([
				'transaction:create',
				'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
			])
			.catch((error: Error) => expect(error.message).to.contain('Missing 4 required args:'))
			.it('should throw an error when fee, nonce and transaction type are provided.');
	});

	describe('transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000', () => {
		setupTest()
			.command([
				'transaction:create',
				'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
				'100000000',
			])
			.catch((error: Error) => expect(error.message).to.contain('Missing 3 required args:'))
			.it('should throw an error when nonce and transaction type are provided.');
	});

	describe('transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2', () => {
		setupTest()
			.command([
				'transaction:create',
				'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
				'100000000',
				'2',
			])
			.catch((error: Error) => expect(error.message).to.contain('Missing 2 required args:'))
			.it('should throw an error when transaction moduleID and assetID are provided.');
	});

	describe('transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 2', () => {
		setupTest()
			.command([
				'transaction:create',
				'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
				'100000000',
				'2',
				'2',
			])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg:'))
			.it('should throw an error when transaction assetID is not provided.');
	});

	describe('transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 99999 0', () => {
		setupTest()
			.command([
				'transaction:create',
				'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
				'100000000',
				'2',
				'99999',
				'0',
			])
			.catch((error: Error) =>
				expect(error.message).to.contain(
					'Transaction moduleID:99999 with assetID:0 is not registered in the application',
				),
			)
			.it('should throw an error when transaction type is unknown.');
	});

	describe('transaction:create with flags', () => {
		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 8 --asset='{"amount": "abc"}' --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'2',
					'0',
					'--asset={"amount": "abc"}',
					`--passphrase=${passphrase}`,
				])
				.catch((error: Error) => expect(error.message).to.contain('Cannot convert abc to a BigInt'))
				.it('should throw error for invalid asset.');
		});

		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 8 --asset=${transferAsset} --no-signature`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'2',
					'0',
					`--asset=${transferAsset}`,
					'--no-signature',
				])
				.catch((error: Error) =>
					expect(error.message).to.contain(
						'Sender publickey must be specified when no-signature flags is used',
					),
				)
				.it(
					'should throw error when sender publickey not specified when no-signature flag is used.',
				);
		});

		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 8 --asset=${transferAsset} --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'2',
					'0',
					`--asset=${transferAsset}`,
					`--passphrase=${passphrase}`,
				])
				.it('should return encoded transaction string in hex format with signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'0802100018022080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a40aeceacee0cc92d5cb35dc4c49237c54d089b61273ade9cfd5dca538ccbf577cdf513618205f6757102aa1cd9958fb94def8df5536bd993686b4aebf4e23f080f',
					});
				});
		});

		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 8 --asset=${transferAsset} --no-signature --sender-publickey=${senderPublickey}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'2',
					'0',
					`--asset=${transferAsset}`,
					'--no-signature',
					`--sender-publickey=${senderPublickey}`,
				])
				.it('should return encoded transaction string in hex format without signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'0802100018022080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e',
					});
				});
		});

		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 5 1 --asset=${voteAsset} --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'5',
					'1',
					`--asset=${voteAsset}`,
					`--passphrase=${passphrase}`,
				])
				.it('should return encoded transaction string in hex format with signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'0805100118022080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32350a190a14ab0041a7d3f7b2c290b5b834d46bdc7b7eb8581510c8010a180a14ab0041a7d3f7b2c290b5b834d46bdc7b7eb8581510633a407bc8953b3d598985cfaabf949576b82d314511ce6aeb81bad5d06c925538b953e0c5161b5f7c93fb320c52944c406ecf5ef6038b44b578d221495f4d36ae430e',
					});
				});
		});

		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 5 1 --asset=${voteAsset} --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'5',
					'1',
					`--asset=${voteAsset}`,
					`--passphrase=${passphrase}`,
				])
				.it('should return encoded transaction string in hex format with signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'0805100118022080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32350a190a14ab0041a7d3f7b2c290b5b834d46bdc7b7eb8581510c8010a180a14ab0041a7d3f7b2c290b5b834d46bdc7b7eb8581510633a407bc8953b3d598985cfaabf949576b82d314511ce6aeb81bad5d06c925538b953e0c5161b5f7c93fb320c52944c406ecf5ef6038b44b578d221495f4d36ae430e',
					});
				});
		});
	});

	describe('transaction:create with prompts and flags', () => {
		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 2 0 --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'2',
					'0',
					`--passphrase=${passphrase}`,
				])
				.it('should prompt user for asset.', () => {
					expect(promptAssetStub).to.be.calledOnce;
					expect(promptAssetStub).to.be.calledWithExactly([
						{ message: 'Please enter: amount: ', name: 'amount', type: 'input' },
						{
							message: 'Please enter: recipientAddress: ',
							name: 'recipientAddress',
							type: 'input',
						},
						{ message: 'Please enter: data: ', name: 'data', type: 'input' },
					]);
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'0802100018022080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a40aeceacee0cc92d5cb35dc4c49237c54d089b61273ade9cfd5dca538ccbf577cdf513618205f6757102aa1cd9958fb94def8df5536bd993686b4aebf4e23f080f',
					});
				});
		});

		describe('transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 2 0', () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'2',
					'0',
				])
				.it('should prompt user for asset and passphrase.', () => {
					expect(promptAssetStub).to.be.calledOnce;
					expect(promptAssetStub).to.be.calledWithExactly([
						{ message: 'Please enter: amount: ', name: 'amount', type: 'input' },
						{
							message: 'Please enter: recipientAddress: ',
							name: 'recipientAddress',
							type: 'input',
						},
						{ message: 'Please enter: data: ', name: 'data', type: 'input' },
					]);
					expect(readerUtils.getPassphraseFromPrompt).to.be.calledWithExactly('passphrase', true);
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'0802100018022080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a40aeceacee0cc92d5cb35dc4c49237c54d089b61273ade9cfd5dca538ccbf577cdf513618205f6757102aa1cd9958fb94def8df5536bd993686b4aebf4e23f080f',
					});
				});
		});

		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 2 0 --asset=${transferAsset} --no-signature --json`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'2',
					'0',
					`--asset=${transferAsset}`,
					'--no-signature',
					`--sender-publickey=${senderPublickey}`,
					'--json',
				])
				.it(
					'should return unsigned transaction in json format when no passphrase specified',
					() => {
						expect(printJSONStub).to.be.calledOnce;
						expect(printJSONStub).to.be.calledWithExactly({
							moduleID: 2,
							assetID: 0,
							nonce: '2',
							fee: '100000000',
							senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
							asset: {
								amount: '100',
								data: 'send token',
								recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
							},
							signatures: [],
						});
					},
				);
		});

		describe(`transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 2 0 --asset=${transferAsset} --passphrase=${passphrase} --json`, () => {
			setupTest()
				.command([
					'transaction:create',
					'873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
					'100000000',
					'2',
					'2',
					'0',
					`--asset=${transferAsset}`,
					`--passphrase=${passphrase}`,
					'--json',
				])
				.it('should return signed transaction in json format when passphrase specified', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						moduleID: 2,
						assetID: 0,
						nonce: '2',
						fee: '100000000',
						senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
						asset: {
							amount: '100',
							data: 'send token',
							recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
						},
						signatures: [
							'aeceacee0cc92d5cb35dc4c49237c54d089b61273ade9cfd5dca538ccbf577cdf513618205f6757102aa1cd9958fb94def8df5536bd993686b4aebf4e23f080f',
						],
					});
				});
		});
	});
});

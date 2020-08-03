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
import { cryptography, IPCChannel, transactions } from 'lisk-sdk';

import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import * as readerUtils from '../../../src/utils/reader';

const transactionsAssets = {
	8: transactions.TransferTransaction.ASSET_SCHEMA,
};
const passphrase = 'peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready';
const transferAsset =
	'{"amount":100,"recipientAddress":"qwBBp9P3ssKQtbg01Gvce364WBU=","data":"send token"}';
const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
const senderPublickey = publicKey.toString('base64');

describe('transaction:create command', () => {
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();
	const promptAssetStub = sandbox
		.stub()
		.resolves({
			amount: 100,
			recipientAddress: 'qwBBp9P3ssKQtbg01Gvce364WBU=',
			data: 'send token',
		});

	ipcInvokeStub.withArgs('app:getSchema').resolves({
		baseTransaction: transactions.BaseTransaction.BASE_SCHEMA,
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
			.catch((error: Error) => expect(error.message).to.contain('Missing 4 required args:'))
			.it('should throw an error when no arguments are provided.');
	});

	describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=', () => {
		setupTest()
			.command(['transaction:create', 'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM='])
			.catch((error: Error) => expect(error.message).to.contain('Missing 3 required args:'))
			.it('should throw an error when fee, nonce and transaction type are provided.');
	});

	describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000', () => {
		setupTest()
			.command(['transaction:create', 'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=', '100000000'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 2 required args:'))
			.it('should throw an error when nonce and transaction type are provided.');
	});

	describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2', () => {
		setupTest()
			.command([
				'transaction:create',
				'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
				'100000000',
				'2',
			])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg:'))
			.it('should throw an error when transaction type are provided.');
	});

	describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 99999', () => {
		setupTest()
			.command([
				'transaction:create',
				'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
				'100000000',
				'2',
				'99999',
			])
			.catch((error: Error) =>
				expect(error.message).to.contain(
					'Transaction type:99999 is not registered in the application',
				),
			)
			.it('should throw an error when transaction type is unknown.');
	});

	describe('transaction:create with flags', () => {
		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --asset='{"amount": "abc"}' --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'8',
					'--asset={"amount": "abc"}',
					`--passphrase=${passphrase}`,
				])
				.catch((error: Error) => expect(error.message).to.contain('Cannot convert abc to a BigInt'))
				.it('should throw error for invalid asset.');
		});

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --asset=${transferAsset} --no-signature`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'8',
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

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --asset=${transferAsset} --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'8',
					`--asset=${transferAsset}`,
					`--passphrase=${passphrase}`,
				])
				.it('should return encoded transaction string in base64 format with signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'CAgQAhiAwtcvIiAP6aPxohtVMPJ/h6QUtUnnmpQL8k/fKy8F5/Iq7uzIaiokCGQSFKsAQafT97LCkLW4NNRr3Ht+uFgVGgpzZW5kIHRva2VuMkBW4g5n/J9XouRbWtVfMucUkhy1FOp5Gmz1Bz4ZT7/2IOCZhl7FLPTvjjRoclnyECIO3B4YK2C9kYTqwzbvKS0B',
					});
				});
		});

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --asset=${transferAsset} --no-signature --sender-publickey=${senderPublickey}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'8',
					`--asset=${transferAsset}`,
					'--no-signature',
					`--sender-publickey=${senderPublickey}`,
				])
				.it('should return encoded transaction string in base64 format without signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'CAgQAhiAwtcvIiAP6aPxohtVMPJ/h6QUtUnnmpQL8k/fKy8F5/Iq7uzIaiokCGQSFKsAQafT97LCkLW4NNRr3Ht+uFgVGgpzZW5kIHRva2Vu',
					});
				});
		});
	});

	describe('transaction:create with prompts and flags', () => {
		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'8',
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
							'CAgQAhiAwtcvIiAP6aPxohtVMPJ/h6QUtUnnmpQL8k/fKy8F5/Iq7uzIaiokCGQSFKsAQafT97LCkLW4NNRr3Ht+uFgVGgpzZW5kIHRva2VuMkBW4g5n/J9XouRbWtVfMucUkhy1FOp5Gmz1Bz4ZT7/2IOCZhl7FLPTvjjRoclnyECIO3B4YK2C9kYTqwzbvKS0B',
					});
				});
		});

		describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8', () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'8',
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
							'CAgQAhiAwtcvIiAP6aPxohtVMPJ/h6QUtUnnmpQL8k/fKy8F5/Iq7uzIaiokCGQSFKsAQafT97LCkLW4NNRr3Ht+uFgVGgpzZW5kIHRva2VuMkBW4g5n/J9XouRbWtVfMucUkhy1FOp5Gmz1Bz4ZT7/2IOCZhl7FLPTvjjRoclnyECIO3B4YK2C9kYTqwzbvKS0B',
					});
				});
		});

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --asset=${transferAsset} --no-signature --json`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'8',
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
							type: 8,
							nonce: '2',
							fee: '100000000',
							senderPublicKey: 'D+mj8aIbVTDyf4ekFLVJ55qUC/JP3ysvBefyKu7syGo=',
							asset: 'CGQSFKsAQafT97LCkLW4NNRr3Ht+uFgVGgpzZW5kIHRva2Vu',
							signatures: [],
						});
					},
				);
		});

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --asset=${transferAsset} --passphrase=${passphrase} --json`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'8',
					`--asset=${transferAsset}`,
					`--passphrase=${passphrase}`,
					'--json',
				])
				.it('should return signed transaction in json format when passphrase specified', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						type: 8,
						nonce: '2',
						fee: '100000000',
						senderPublicKey: 'D+mj8aIbVTDyf4ekFLVJ55qUC/JP3ysvBefyKu7syGo=',
						asset: 'CGQSFKsAQafT97LCkLW4NNRr3Ht+uFgVGgpzZW5kIHRva2Vu',
						signatures: [
							'VuIOZ/yfV6LkW1rVXzLnFJIctRTqeRps9Qc+GU+/9iDgmYZexSz07440aHJZ8hAiDtweGCtgvZGE6sM27yktAQ==',
						],
					});
				});
		});
	});
});

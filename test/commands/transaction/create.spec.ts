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

const transactionsAssetSchemas = [
	{
		moduleType: 2,
		assetType: 0,
		schema: tokenTransferAssetSchema,
	},
	{
		moduleType: 5,
		assetType: 1,
		schema: dposVoteAssetSchema,
	},
];
const passphrase = 'peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready';
const transferAsset =
	'{"amount":100,"recipientAddress":"qwBBp9P3ssKQtbg01Gvce364WBU=","data":"send token"}';
const voteAsset =
	'{"votes":[{"delegateAddress":"qwBBp9P3ssKQtbg01Gvce364WBU=","amount":100},{"delegateAddress":"qwBBp9P3ssKQtbg01Gvce364WBU=","amount":-50}]}';
const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
const senderPublickey = publicKey.toString('base64');

describe('transaction:create command', () => {
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();
	const promptAssetStub = sandbox.stub().resolves({
		amount: 100,
		recipientAddress: 'qwBBp9P3ssKQtbg01Gvce364WBU=',
		data: 'send token',
	});

	ipcInvokeStub.withArgs('app:getSchema').resolves({
		transactionSchema,
		transactionsAssetSchemas,
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

	describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=', () => {
		setupTest()
			.command(['transaction:create', 'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM='])
			.catch((error: Error) => expect(error.message).to.contain('Missing 4 required args:'))
			.it('should throw an error when fee, nonce and transaction type are provided.');
	});

	describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000', () => {
		setupTest()
			.command(['transaction:create', 'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=', '100000000'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 3 required args:'))
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
			.catch((error: Error) => expect(error.message).to.contain('Missing 2 required args:'))
			.it('should throw an error when transaction moduleType and assetTYpe are provided.');
	});

	describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2', () => {
		setupTest()
			.command([
				'transaction:create',
				'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
				'100000000',
				'2',
				'2',
			])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg:'))
			.it('should throw an error when transaction assetType is not provided.');
	});

	describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 99999 0', () => {
		setupTest()
			.command([
				'transaction:create',
				'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
				'100000000',
				'2',
				'99999',
				'0',
			])
			.catch((error: Error) =>
				expect(error.message).to.contain(
					'Transaction moduleType:99999 with assetType:0 is not registered in the application',
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
					'2',
					'0',
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

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 8 --asset=${transferAsset} --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'2',
					'0',
					`--asset=${transferAsset}`,
					`--passphrase=${passphrase}`,
				])
				.it('should return encoded transaction string in base64 format with signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'CAIQABgCIIDC1y8qIA/po/GiG1Uw8n+HpBS1SeealAvyT98rLwXn8iru7MhqMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QK7OrO4MyS1cs13ExJI3xU0Im2EnOt6c/V3KU4zL9XfN9RNhggX2dXECqhzZlY+5Te+N9VNr2ZNoa0rr9OI/CA8=',
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
					'2',
					'0',
					`--asset=${transferAsset}`,
					'--no-signature',
					`--sender-publickey=${senderPublickey}`,
				])
				.it('should return encoded transaction string in base64 format without signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'CAIQABgCIIDC1y8qIA/po/GiG1Uw8n+HpBS1SeealAvyT98rLwXn8iru7MhqMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW4=',
					});
				});
		});

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 5 1 --asset=${voteAsset} --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'5',
					'1',
					`--asset=${voteAsset}`,
					`--passphrase=${passphrase}`,
				])
				.it('should return encoded transaction string in base64 format with signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'CAUQARgCIIDC1y8qIA/po/GiG1Uw8n+HpBS1SeealAvyT98rLwXn8iru7MhqMjUKGQoUqwBBp9P3ssKQtbg01Gvce364WBUQyAEKGAoUqwBBp9P3ssKQtbg01Gvce364WBUQYzpAe8iVOz1ZiYXPqr+UlXa4LTFFEc5q64G61dBsklU4uVPgxRYbX3yT+zIMUpRMQG7PXvYDi0S1eNIhSV9NNq5DDg==',
					});
				});
		});

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 5 1 --asset=${voteAsset} --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
					'100000000',
					'2',
					'5',
					'1',
					`--asset=${voteAsset}`,
					`--passphrase=${passphrase}`,
				])
				.it('should return encoded transaction string in base64 format with signature', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction:
							'CAUQARgCIIDC1y8qIA/po/GiG1Uw8n+HpBS1SeealAvyT98rLwXn8iru7MhqMjUKGQoUqwBBp9P3ssKQtbg01Gvce364WBUQyAEKGAoUqwBBp9P3ssKQtbg01Gvce364WBUQYzpAe8iVOz1ZiYXPqr+UlXa4LTFFEc5q64G61dBsklU4uVPgxRYbX3yT+zIMUpRMQG7PXvYDi0S1eNIhSV9NNq5DDg==',
					});
				});
		});
	});

	describe('transaction:create with prompts and flags', () => {
		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2 0 --passphrase=${passphrase}`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
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
							'CAIQABgCIIDC1y8qIA/po/GiG1Uw8n+HpBS1SeealAvyT98rLwXn8iru7MhqMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QK7OrO4MyS1cs13ExJI3xU0Im2EnOt6c/V3KU4zL9XfN9RNhggX2dXECqhzZlY+5Te+N9VNr2ZNoa0rr9OI/CA8=',
					});
				});
		});

		describe('transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2 0', () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
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
							'CAIQABgCIIDC1y8qIA/po/GiG1Uw8n+HpBS1SeealAvyT98rLwXn8iru7MhqMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QK7OrO4MyS1cs13ExJI3xU0Im2EnOt6c/V3KU4zL9XfN9RNhggX2dXECqhzZlY+5Te+N9VNr2ZNoa0rr9OI/CA8=',
					});
				});
		});

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2 0 --asset=${transferAsset} --no-signature --json`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
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
							moduleType: 2,
							assetType: 0,
							nonce: '2',
							fee: '100000000',
							senderPublicKey: 'D+mj8aIbVTDyf4ekFLVJ55qUC/JP3ysvBefyKu7syGo=',
							asset: {
								amount: '100',
								data: 'send token',
								recipientAddress: 'qwBBp9P3ssKQtbg01Gvce364WBU=',
							},
							signatures: [],
						});
					},
				);
		});

		describe(`transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2 0 --asset=${transferAsset} --passphrase=${passphrase} --json`, () => {
			setupTest()
				.command([
					'transaction:create',
					'hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=',
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
						moduleType: 2,
						assetType: 0,
						nonce: '2',
						fee: '100000000',
						senderPublicKey: 'D+mj8aIbVTDyf4ekFLVJ55qUC/JP3ysvBefyKu7syGo=',
						asset: {
							amount: '100',
							data: 'send token',
							recipientAddress: 'qwBBp9P3ssKQtbg01Gvce364WBU=',
						},
						signatures: [
							'rs6s7gzJLVyzXcTEkjfFTQibYSc63pz9XcpTjMv1d831E2GCBfZ1cQKqHNmVj7lN7431U2vZk2hrSuv04j8IDw==',
						],
					});
				});
		});
	});
});

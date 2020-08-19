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
import { IPCChannel, transactionSchema } from 'lisk-sdk';

import {
	tokenTransferAssetSchema,
	keysRegisterAssetSchema,
	networkIdentifierStr,
	dposVoteAssetSchema,
} from '../../utils/transactions';
import * as appUtils from '../../../src/utils/application';
import baseIPC from '../../../src/base_ipc';
import * as readerUtils from '../../../src/utils/reader';

const transactionsAssetSchemas = [
	{
		moduleType: 2,
		assetType: 0,
		schema: tokenTransferAssetSchema,
	},
	{
		moduleType: 4,
		assetType: 0,
		schema: keysRegisterAssetSchema,
	},
	{
		moduleType: 5,
		assetType: 1,
		schema: dposVoteAssetSchema,
	},
];

const senderPassphrase =
	'inherit moon normal relief spring bargain hobby join baby flash fog blood';

const mandatoryPassphrases = [
	'trim elegant oven term access apple obtain error grain excite lawn neck',
	'desk deposit crumble farm tip cluster goose exotic dignity flee bring traffic',
];

const optionalPassphrases = [
	'sugar object slender confirm clock peanut auto spice carbon knife increase estate',
	'faculty inspire crouch quit sorry vague hard ski scrap jaguar garment limb',
];

const mandatoryKeys = [
	'8bn07nG11YV9OzRtRBypZ/J4cOvuiFads2T9E+KK26M=',
	'SmdkakRjE9uWTDk3A1mEXFL86SJaOSl3DvQUSMJY/Tk=',
];

const optionalKeys = [
	'V99cOBGWGTn43PqFjG6u/r+qTelC9+cDv4gSfg7pzKQ=',
	'+kBraVLTd/AniSDj642pGeTPXGiwLuul2LMzT9wDabY=',
];

const signMultiSigCmdArgs = (unsignedTransaction: string, passphraseToSign: string): string[] => {
	return [
		'transaction:sign',
		networkIdentifierStr,
		unsignedTransaction,
		`--passphrase=${passphraseToSign}`,
		`--mandatory-keys=${mandatoryKeys[0]}`,
		`--mandatory-keys=${mandatoryKeys[1]}`,
		`--optional-keys=${optionalKeys[0]}`,
		`--optional-keys=${optionalKeys[1]}`,
	];
};

const signMultiSigCmdArgsIncludingSender = (
	unsignedTransaction: string,
	passphrase: string,
): string[] => [
	...signMultiSigCmdArgs(unsignedTransaction, passphrase),
	'--include-sender-signature',
];

const signMultiSigCmdArgsIncludingSenderJSON = (
	unsignedTransaction: string,
	passphrase: string,
): string[] => [
	...signMultiSigCmdArgs(unsignedTransaction, passphrase),
	'--include-sender-signature',
	'--json',
];

const signMultiSigCmdArgsJSON = (unsignedTransaction: string, passphrase: string): string[] => [
	...signMultiSigCmdArgs(unsignedTransaction, passphrase),
	'--json',
];

describe('transaction:sign command', () => {
	const fsStub = sandbox.stub().returns(true);
	const printJSONStub = sandbox.stub();
	const ipcInvokeStub = sandbox.stub();
	const ipcStartAndListenStub = sandbox.stub();

	ipcInvokeStub.withArgs('app:getSchema').resolves({
		transactionSchema,
		transactionsAssetSchemas,
	});

	afterEach(() => {
		ipcInvokeStub.resetHistory();
		printJSONStub.resetHistory();
		ipcStartAndListenStub.resetHistory();
	});

	const setupTest = () =>
		test
			.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
			.stub(fs, 'existsSync', fsStub)
			.stub(baseIPC.prototype, 'printJSON', printJSONStub)
			.stub(IPCChannel.prototype, 'startAndListen', ipcStartAndListenStub)
			.stub(IPCChannel.prototype, 'invoke', ipcInvokeStub)
			.stub(readerUtils, 'getPassphraseFromPrompt', sandbox.stub().resolves(senderPassphrase))
			.stdout()
			.stderr();

	describe('Missing arguments', () => {
		setupTest()
			.command(['transaction:sign'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 2 required args:'))
			.it('should throw an error when no arguments are provided.');

		setupTest()
			.command(['transaction:sign', networkIdentifierStr])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg:'))
			.it('should throw an error when missing transaction argument.');
	});

	describe('sign transaction from single account', () => {
		const unsignedTransaction =
			'CAIQABgCIIDC1y8qIAshH85LYVCDcBy4qMmUB+RksvmqTzZwlTIt4bd+X8++MiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW4=';
		setupTest()
			.command([
				'transaction:sign',
				networkIdentifierStr,
				unsignedTransaction,
				`--passphrase=${senderPassphrase}`,
			])
			.it('should return signed transaction string in base64 format', () => {
				expect(printJSONStub).to.be.calledOnce;
				expect(printJSONStub).to.be.calledWithExactly({
					transaction:
						'CAIQABgCIIDC1y8qIAshH85LYVCDcBy4qMmUB+RksvmqTzZwlTIt4bd+X8++MiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QHoSg+JORuxaBBbQsTpI/SyjvB9qTqPvg/l9VOvQs9RbAlv5HAC2DEzdreAL6KTakIirg75wK1g+ZyZTI6g5FAY=',
				});
			});

		setupTest()
			.command([
				'transaction:sign',
				networkIdentifierStr,
				unsignedTransaction,
				`--passphrase=${senderPassphrase}`,
				'--json',
			])
			.it('should return signed transaction in json format', () => {
				expect(printJSONStub).to.be.calledOnce;
				expect(printJSONStub).to.be.calledWithExactly({
					moduleType: 2,
					assetType: 0,
					nonce: '2',
					fee: '100000000',
					senderPublicKey: 'CyEfzkthUINwHLioyZQH5GSy+apPNnCVMi3ht35fz74=',
					asset: {
						amount: '100',
						recipientAddress: 'qwBBp9P3ssKQtbg01Gvce364WBU=',
						data: 'send token',
					},
					signatures: [
						'ehKD4k5G7FoEFtCxOkj9LKO8H2pOo++D+X1U69Cz1FsCW/kcALYMTN2t4AvopNqQiKuDvnArWD5nJlMjqDkUBg==',
					],
				});
			});
	});

	describe('sign multi signature registration transaction', () => {
		const unsignedTransaction =
			'CAQQABgCIIDC1y8qIAshH85LYVCDcBy4qMmUB+RksvmqTzZwlTIt4bd+X8++MooBCAQSIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujEiBKZ2RqRGMT25ZMOTcDWYRcUvzpIlo5KXcO9BRIwlj9ORog+kBraVLTd/AniSDj642pGeTPXGiwLuul2LMzT9wDabYaIFffXDgRlhk5+Nz6hYxurv6/qk3pQvfnA7+IEn4O6cyk';
		const sign1 =
			'CAQQABgCIIDC1y8qIAshH85LYVCDcBy4qMmUB+RksvmqTzZwlTIt4bd+X8++MooBCAQSIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujEiBKZ2RqRGMT25ZMOTcDWYRcUvzpIlo5KXcO9BRIwlj9ORog+kBraVLTd/AniSDj642pGeTPXGiwLuul2LMzT9wDabYaIFffXDgRlhk5+Nz6hYxurv6/qk3pQvfnA7+IEn4O6cykOkBSIZcO40zXeNeM7ipSM4BqpCg2qmLit2OE1W/oz0zU9sAgBq8coLGh+f1FZsGkQqgRhcNC4WuP1LlYCLAaNSMCOgA6ADoAOgA=';
		const sign2 =
			'CAQQABgCIIDC1y8qIAshH85LYVCDcBy4qMmUB+RksvmqTzZwlTIt4bd+X8++MooBCAQSIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujEiBKZ2RqRGMT25ZMOTcDWYRcUvzpIlo5KXcO9BRIwlj9ORog+kBraVLTd/AniSDj642pGeTPXGiwLuul2LMzT9wDabYaIFffXDgRlhk5+Nz6hYxurv6/qk3pQvfnA7+IEn4O6cykOkBSIZcO40zXeNeM7ipSM4BqpCg2qmLit2OE1W/oz0zU9sAgBq8coLGh+f1FZsGkQqgRhcNC4WuP1LlYCLAaNSMCOgA6QECAYcnqROxcKiuq0DAdFc8BA1vOu54TNzhhloW38AVr5n0pWWU32Si5KIrbsSJC1PIzZHhz5dSB15nGtGCZAw86ADoA';
		const sign3 =
			'CAQQABgCIIDC1y8qIAshH85LYVCDcBy4qMmUB+RksvmqTzZwlTIt4bd+X8++MooBCAQSIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujEiBKZ2RqRGMT25ZMOTcDWYRcUvzpIlo5KXcO9BRIwlj9ORog+kBraVLTd/AniSDj642pGeTPXGiwLuul2LMzT9wDabYaIFffXDgRlhk5+Nz6hYxurv6/qk3pQvfnA7+IEn4O6cykOkBSIZcO40zXeNeM7ipSM4BqpCg2qmLit2OE1W/oz0zU9sAgBq8coLGh+f1FZsGkQqgRhcNC4WuP1LlYCLAaNSMCOkBvBn4KfcZmpmBPRehDaYsFyMmHI5PTLYtJ95hgjvfifThpxjDDCTUqkrc69oIt36Ijtfvy7HT9WGDWMviPbXkKOkBAgGHJ6kTsXCorqtAwHRXPAQNbzrueEzc4YZaFt/AFa+Z9KVllN9kouSiK27EiQtTyM2R4c+XUgdeZxrRgmQMPOgA6AA==';
		const sign4 =
			'CAQQABgCIIDC1y8qIAshH85LYVCDcBy4qMmUB+RksvmqTzZwlTIt4bd+X8++MooBCAQSIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujEiBKZ2RqRGMT25ZMOTcDWYRcUvzpIlo5KXcO9BRIwlj9ORog+kBraVLTd/AniSDj642pGeTPXGiwLuul2LMzT9wDabYaIFffXDgRlhk5+Nz6hYxurv6/qk3pQvfnA7+IEn4O6cykOkBSIZcO40zXeNeM7ipSM4BqpCg2qmLit2OE1W/oz0zU9sAgBq8coLGh+f1FZsGkQqgRhcNC4WuP1LlYCLAaNSMCOkBvBn4KfcZmpmBPRehDaYsFyMmHI5PTLYtJ95hgjvfifThpxjDDCTUqkrc69oIt36Ijtfvy7HT9WGDWMviPbXkKOkBAgGHJ6kTsXCorqtAwHRXPAQNbzrueEzc4YZaFt/AFa+Z9KVllN9kouSiK27EiQtTyM2R4c+XUgdeZxrRgmQMPOkDQHM/Bqexzx9cepxZJHB5SkLrZykc2P+eVI3ej1vPr4eLKFLZRtklwJaCtpmNdttVRlADE98y4WG2O6TEDE6IEOgA=';
		const signedTransaction =
			'CAQQABgCIIDC1y8qIAshH85LYVCDcBy4qMmUB+RksvmqTzZwlTIt4bd+X8++MooBCAQSIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujEiBKZ2RqRGMT25ZMOTcDWYRcUvzpIlo5KXcO9BRIwlj9ORog+kBraVLTd/AniSDj642pGeTPXGiwLuul2LMzT9wDabYaIFffXDgRlhk5+Nz6hYxurv6/qk3pQvfnA7+IEn4O6cykOkBSIZcO40zXeNeM7ipSM4BqpCg2qmLit2OE1W/oz0zU9sAgBq8coLGh+f1FZsGkQqgRhcNC4WuP1LlYCLAaNSMCOkBvBn4KfcZmpmBPRehDaYsFyMmHI5PTLYtJ95hgjvfifThpxjDDCTUqkrc69oIt36Ijtfvy7HT9WGDWMviPbXkKOkBAgGHJ6kTsXCorqtAwHRXPAQNbzrueEzc4YZaFt/AFa+Z9KVllN9kouSiK27EiQtTyM2R4c+XUgdeZxrRgmQMPOkDQHM/Bqexzx9cepxZJHB5SkLrZykc2P+eVI3ej1vPr4eLKFLZRtklwJaCtpmNdttVRlADE98y4WG2O6TEDE6IEOkDFuY6ElsslYkKb2DrnXuKHvN2upkurkeCxwErEVUgZzCtCYu8Zh9vu+EA4mbvCYQMIwHCHisq7AtpAR1i3SosA';

		setupTest()
			.command(signMultiSigCmdArgsIncludingSender(unsignedTransaction, senderPassphrase))
			.it('should return signed transaction for sender account', () => {
				expect(printJSONStub).to.be.calledOnce;
				expect(printJSONStub).to.be.calledWithExactly({
					transaction: sign1,
				});
			});

		setupTest()
			.command(signMultiSigCmdArgsIncludingSender(sign1, mandatoryPassphrases[0]))
			.it('should return signed transaction for mandatory account 1', () => {
				expect(printJSONStub).to.be.calledOnce;
				expect(printJSONStub).to.be.calledWithExactly({
					transaction: sign2,
				});
			});

		setupTest()
			.command(signMultiSigCmdArgsIncludingSender(sign2, mandatoryPassphrases[1]))
			.it('should return signed transaction for mandatory account 2', () => {
				expect(printJSONStub).to.be.calledOnce;
				expect(printJSONStub).to.be.calledWithExactly({
					transaction: sign3,
				});
			});

		setupTest()
			.command(signMultiSigCmdArgsIncludingSender(sign3, optionalPassphrases[0]))
			.it('should return signed transaction for optional account 1', () => {
				expect(printJSONStub).to.be.calledOnce;
				expect(printJSONStub).to.be.calledWithExactly({
					transaction: sign4,
				});
			});

		setupTest()
			.command(signMultiSigCmdArgsIncludingSender(sign4, optionalPassphrases[1]))
			.it('should return signed transaction for optional account 2', () => {
				expect(printJSONStub).to.be.calledOnce;
				expect(printJSONStub).to.be.calledWithExactly({
					transaction: signedTransaction,
				});
			});

		setupTest()
			.command(signMultiSigCmdArgsIncludingSenderJSON(sign4, optionalPassphrases[1]))
			.it('should return fully signed transaction string in base64 format', () => {
				expect(printJSONStub.callCount).to.equal(1);
				expect(printJSONStub).to.be.calledWithExactly({
					moduleType: 4,
					assetType: 0,
					nonce: '2',
					fee: '100000000',
					senderPublicKey: 'CyEfzkthUINwHLioyZQH5GSy+apPNnCVMi3ht35fz74=',
					asset: {
						numberOfSignatures: 4,
						mandatoryKeys: [
							'8bn07nG11YV9OzRtRBypZ/J4cOvuiFads2T9E+KK26M=',
							'SmdkakRjE9uWTDk3A1mEXFL86SJaOSl3DvQUSMJY/Tk=',
						],
						optionalKeys: [
							'+kBraVLTd/AniSDj642pGeTPXGiwLuul2LMzT9wDabY=',
							'V99cOBGWGTn43PqFjG6u/r+qTelC9+cDv4gSfg7pzKQ=',
						],
					},
					signatures: [
						'UiGXDuNM13jXjO4qUjOAaqQoNqpi4rdjhNVv6M9M1PbAIAavHKCxofn9RWbBpEKoEYXDQuFrj9S5WAiwGjUjAg==',
						'bwZ+Cn3GZqZgT0XoQ2mLBcjJhyOT0y2LSfeYYI734n04acYwwwk1KpK3OvaCLd+iI7X78ux0/Vhg1jL4j215Cg==',
						'QIBhyepE7FwqK6rQMB0VzwEDW867nhM3OGGWhbfwBWvmfSlZZTfZKLkoituxIkLU8jNkeHPl1IHXmca0YJkDDw==',
						'0BzPwansc8fXHqcWSRweUpC62cpHNj/nlSN3o9bz6+HiyhS2UbZJcCWgraZjXbbVUZQAxPfMuFhtjukxAxOiBA==',
						'xbmOhJbLJWJCm9g6517ih7zdrqZLq5HgscBKxFVIGcwrQmLvGYfb7vhAOJm7wmEDCMBwh4rKuwLaQEdYt0qLAA==',
					],
				});
			});
	});

	describe('sign transaction from multi-signature accounts', () => {
		const unsignedTransaction =
			'CAIQABgCIIDC1y8qIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW4=';
		const sign1 =
			'CAIQABgCIIDC1y8qIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46ADpA85odkqOBSQ6b7WtxBcuvdoSfiYUlin6Ed5/Ojs3aP77FvKXLDfdJcxKU0DVnfr2yxmZCKesR7ExOmpoLhqABCjoAOgA=';
		const sign2 =
			'CAIQABgCIIDC1y8qIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QB8R0jAOyruF5dji1RoiflZv32/ndQNF3rYWL6E85E/PzwYKfwc5EsKpQOnQNRpnFTeyE1CfBMak5nVyqjhQsQM6QPOaHZKjgUkOm+1rcQXLr3aEn4mFJYp+hHefzo7N2j++xbylyw33SXMSlNA1Z369ssZmQinrEexMTpqaC4agAQo6ADoA';
		const sign3 =
			'CAIQABgCIIDC1y8qIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QB8R0jAOyruF5dji1RoiflZv32/ndQNF3rYWL6E85E/PzwYKfwc5EsKpQOnQNRpnFTeyE1CfBMak5nVyqjhQsQM6QPOaHZKjgUkOm+1rcQXLr3aEn4mFJYp+hHefzo7N2j++xbylyw33SXMSlNA1Z369ssZmQinrEexMTpqaC4agAQo6QKQOVsCmqqVJvTTCuUiuwg/s08YGYdpHL7D/w86Ydm3eoReRONXREKuql/BXvt7NxdKqRhejKL7dQVSBvZ6H7w46AA==';
		const signedTransaction =
			'CAIQABgCIIDC1y8qIPG59O5xtdWFfTs0bUQcqWfyeHDr7ohWnbNk/RPiitujMiQIZBIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QB8R0jAOyruF5dji1RoiflZv32/ndQNF3rYWL6E85E/PzwYKfwc5EsKpQOnQNRpnFTeyE1CfBMak5nVyqjhQsQM6QPOaHZKjgUkOm+1rcQXLr3aEn4mFJYp+hHefzo7N2j++xbylyw33SXMSlNA1Z369ssZmQinrEexMTpqaC4agAQo6QKQOVsCmqqVJvTTCuUiuwg/s08YGYdpHL7D/w86Ydm3eoReRONXREKuql/BXvt7NxdKqRhejKL7dQVSBvZ6H7w46QFXjX7xFXf0McUVaPE+zsDY72QgQ+uEdcVqV44koR6/E4+tCxpLj0Np8MuioIl3eylZe7ZyCHiSlfHTbGW2H7QE=';

		describe('mandatory keys are specified', () => {
			setupTest()
				.command(signMultiSigCmdArgs(unsignedTransaction, mandatoryPassphrases[0]))
				.it('should return signed transaction for mandatory account 1', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction: sign1,
					});
				});

			setupTest()
				.command(signMultiSigCmdArgs(sign1, mandatoryPassphrases[1]))
				.it('should return signed transaction for mandatory account 2', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction: sign2,
					});
				});
		});

		describe('optional keys are specified', () => {
			setupTest()
				.command(signMultiSigCmdArgs(sign2, optionalPassphrases[0]))
				.it('should return signed transaction for optional account 1', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction: sign3,
					});
				});

			setupTest()
				.command(signMultiSigCmdArgs(sign3, optionalPassphrases[1]))
				.it('should return signed transaction for optional account 2', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly({
						transaction: signedTransaction,
					});
				});

			setupTest()
				.command(signMultiSigCmdArgsJSON(sign3, optionalPassphrases[1]))
				.it('should return fully signed transaction string in base64 format', () => {
					expect(printJSONStub.callCount).to.equal(1);
					expect(printJSONStub).to.be.calledWithExactly({
						asset: {
							amount: '100',
							data: 'send token',
							recipientAddress: 'qwBBp9P3ssKQtbg01Gvce364WBU=',
						},
						assetType: 0,
						fee: '100000000',
						moduleType: 2,
						nonce: '2',
						senderPublicKey: '8bn07nG11YV9OzRtRBypZ/J4cOvuiFads2T9E+KK26M=',
						signatures: [
							'HxHSMA7Ku4Xl2OLVGiJ+Vm/fb+d1A0XethYvoTzkT8/PBgp/BzkSwqlA6dA1GmcVN7ITUJ8ExqTmdXKqOFCxAw==',
							'85odkqOBSQ6b7WtxBcuvdoSfiYUlin6Ed5/Ojs3aP77FvKXLDfdJcxKU0DVnfr2yxmZCKesR7ExOmpoLhqABCg==',
							'pA5WwKaqpUm9NMK5SK7CD+zTxgZh2kcvsP/Dzph2bd6hF5E41dEQq6qX8Fe+3s3F0qpGF6Movt1BVIG9nofvDg==',
							'VeNfvEVd/QxxRVo8T7OwNjvZCBD64R1xWpXjiShHr8Tj60LGkuPQ2nwy6KgiXd7KVl7tnIIeJKV8dNsZbYftAQ==',
						],
					});
				});
		});
	});
});

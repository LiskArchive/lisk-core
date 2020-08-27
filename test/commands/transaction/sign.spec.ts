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
		moduleID: 2,
		assetID: 0,
		schema: tokenTransferAssetSchema,
	},
	{
		moduleID: 4,
		assetID: 0,
		schema: keysRegisterAssetSchema,
	},
	{
		moduleID: 5,
		assetID: 1,
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
	'f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3',
	'4a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd39',
];

const optionalKeys = [
	'57df5c3811961939f8dcfa858c6eaefebfaa4de942f7e703bf88127e0ee9cca4',
	'fa406b6952d377f0278920e3eb8da919e4cf5c68b02eeba5d8b3334fdc0369b6',
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
			'0802100018022080c2d72f2a200b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e';
		setupTest()
			.command([
				'transaction:sign',
				networkIdentifierStr,
				unsignedTransaction,
				`--passphrase=${senderPassphrase}`,
			])
			.it('should return signed transaction string in hex format', () => {
				expect(printJSONStub).to.be.calledOnce;
				expect(printJSONStub).to.be.calledWithExactly({
					transaction:
						'0802100018022080c2d72f2a200b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a407a1283e24e46ec5a0416d0b13a48fd2ca3bc1f6a4ea3ef83f97d54ebd0b3d45b025bf91c00b60c4cddade00be8a4da9088ab83be702b583e67265323a8391406',
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
					moduleID: 2,
					assetID: 0,
					nonce: '2',
					fee: '100000000',
					senderPublicKey: '0b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe',
					asset: {
						amount: '100',
						recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
						data: 'send token',
					},
					signatures: [
						'7a1283e24e46ec5a0416d0b13a48fd2ca3bc1f6a4ea3ef83f97d54ebd0b3d45b025bf91c00b60c4cddade00be8a4da9088ab83be702b583e67265323a8391406',
					],
				});
			});
	});

	describe('sign multi signature registration transaction', () => {
		const unsignedTransaction =
			'0804100018022080c2d72f2a200b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe328a0108041220f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba312204a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd391a20fa406b6952d377f0278920e3eb8da919e4cf5c68b02eeba5d8b3334fdc0369b61a2057df5c3811961939f8dcfa858c6eaefebfaa4de942f7e703bf88127e0ee9cca4';
		const sign1 =
			'0804100018022080c2d72f2a200b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe328a0108041220f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba312204a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd391a20fa406b6952d377f0278920e3eb8da919e4cf5c68b02eeba5d8b3334fdc0369b61a2057df5c3811961939f8dcfa858c6eaefebfaa4de942f7e703bf88127e0ee9cca43a405221970ee34cd778d78cee2a5233806aa42836aa62e2b76384d56fe8cf4cd4f6c02006af1ca0b1a1f9fd4566c1a442a81185c342e16b8fd4b95808b01a3523023a003a003a003a00';
		const sign2 =
			'0804100018022080c2d72f2a200b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe328a0108041220f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba312204a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd391a20fa406b6952d377f0278920e3eb8da919e4cf5c68b02eeba5d8b3334fdc0369b61a2057df5c3811961939f8dcfa858c6eaefebfaa4de942f7e703bf88127e0ee9cca43a405221970ee34cd778d78cee2a5233806aa42836aa62e2b76384d56fe8cf4cd4f6c02006af1ca0b1a1f9fd4566c1a442a81185c342e16b8fd4b95808b01a3523023a003a40408061c9ea44ec5c2a2baad0301d15cf01035bcebb9e133738619685b7f0056be67d29596537d928b9288adbb12242d4f233647873e5d481d799c6b46099030f3a003a00';
		const sign3 =
			'0804100018022080c2d72f2a200b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe328a0108041220f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba312204a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd391a20fa406b6952d377f0278920e3eb8da919e4cf5c68b02eeba5d8b3334fdc0369b61a2057df5c3811961939f8dcfa858c6eaefebfaa4de942f7e703bf88127e0ee9cca43a405221970ee34cd778d78cee2a5233806aa42836aa62e2b76384d56fe8cf4cd4f6c02006af1ca0b1a1f9fd4566c1a442a81185c342e16b8fd4b95808b01a3523023a406f067e0a7dc666a6604f45e843698b05c8c9872393d32d8b49f798608ef7e27d3869c630c309352a92b73af6822ddfa223b5fbf2ec74fd5860d632f88f6d790a3a40408061c9ea44ec5c2a2baad0301d15cf01035bcebb9e133738619685b7f0056be67d29596537d928b9288adbb12242d4f233647873e5d481d799c6b46099030f3a003a00';
		const sign4 =
			'0804100018022080c2d72f2a200b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe328a0108041220f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba312204a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd391a20fa406b6952d377f0278920e3eb8da919e4cf5c68b02eeba5d8b3334fdc0369b61a2057df5c3811961939f8dcfa858c6eaefebfaa4de942f7e703bf88127e0ee9cca43a405221970ee34cd778d78cee2a5233806aa42836aa62e2b76384d56fe8cf4cd4f6c02006af1ca0b1a1f9fd4566c1a442a81185c342e16b8fd4b95808b01a3523023a406f067e0a7dc666a6604f45e843698b05c8c9872393d32d8b49f798608ef7e27d3869c630c309352a92b73af6822ddfa223b5fbf2ec74fd5860d632f88f6d790a3a40408061c9ea44ec5c2a2baad0301d15cf01035bcebb9e133738619685b7f0056be67d29596537d928b9288adbb12242d4f233647873e5d481d799c6b46099030f3a40d01ccfc1a9ec73c7d71ea716491c1e5290bad9ca47363fe7952377a3d6f3ebe1e2ca14b651b6497025a0ada6635db6d5519400c4f7ccb8586d8ee9310313a2043a00';
		const signedTransaction =
			'0804100018022080c2d72f2a200b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe328a0108041220f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba312204a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd391a20fa406b6952d377f0278920e3eb8da919e4cf5c68b02eeba5d8b3334fdc0369b61a2057df5c3811961939f8dcfa858c6eaefebfaa4de942f7e703bf88127e0ee9cca43a405221970ee34cd778d78cee2a5233806aa42836aa62e2b76384d56fe8cf4cd4f6c02006af1ca0b1a1f9fd4566c1a442a81185c342e16b8fd4b95808b01a3523023a406f067e0a7dc666a6604f45e843698b05c8c9872393d32d8b49f798608ef7e27d3869c630c309352a92b73af6822ddfa223b5fbf2ec74fd5860d632f88f6d790a3a40408061c9ea44ec5c2a2baad0301d15cf01035bcebb9e133738619685b7f0056be67d29596537d928b9288adbb12242d4f233647873e5d481d799c6b46099030f3a40d01ccfc1a9ec73c7d71ea716491c1e5290bad9ca47363fe7952377a3d6f3ebe1e2ca14b651b6497025a0ada6635db6d5519400c4f7ccb8586d8ee9310313a2043a40c5b98e8496cb2562429bd83ae75ee287bcddaea64bab91e0b1c04ac4554819cc2b4262ef1987dbeef8403899bbc2610308c070878acabb02da404758b74a8b00';

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
			.it('should return fully signed transaction string in hex format', () => {
				expect(printJSONStub.callCount).to.equal(1);
				expect(printJSONStub).to.be.calledWithExactly({
					moduleID: 4,
					assetID: 0,
					nonce: '2',
					fee: '100000000',
					senderPublicKey: '0b211fce4b615083701cb8a8c99407e464b2f9aa4f367095322de1b77e5fcfbe',
					asset: {
						numberOfSignatures: 4,
						mandatoryKeys: [
							'f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3',
							'4a67646a446313db964c39370359845c52fce9225a3929770ef41448c258fd39',
						],
						optionalKeys: [
							'fa406b6952d377f0278920e3eb8da919e4cf5c68b02eeba5d8b3334fdc0369b6',
							'57df5c3811961939f8dcfa858c6eaefebfaa4de942f7e703bf88127e0ee9cca4',
						],
					},
					signatures: [
						'5221970ee34cd778d78cee2a5233806aa42836aa62e2b76384d56fe8cf4cd4f6c02006af1ca0b1a1f9fd4566c1a442a81185c342e16b8fd4b95808b01a352302',
						'6f067e0a7dc666a6604f45e843698b05c8c9872393d32d8b49f798608ef7e27d3869c630c309352a92b73af6822ddfa223b5fbf2ec74fd5860d632f88f6d790a',
						'408061c9ea44ec5c2a2baad0301d15cf01035bcebb9e133738619685b7f0056be67d29596537d928b9288adbb12242d4f233647873e5d481d799c6b46099030f',
						'd01ccfc1a9ec73c7d71ea716491c1e5290bad9ca47363fe7952377a3d6f3ebe1e2ca14b651b6497025a0ada6635db6d5519400c4f7ccb8586d8ee9310313a204',
						'c5b98e8496cb2562429bd83ae75ee287bcddaea64bab91e0b1c04ac4554819cc2b4262ef1987dbeef8403899bbc2610308c070878acabb02da404758b74a8b00',
					],
				});
			});
	});

	describe('sign transaction from multi-signature accounts', () => {
		const unsignedTransaction =
			'0802100018022080c2d72f2a20f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e';
		const sign1 =
			'0802100018022080c2d72f2a20f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a003a40f39a1d92a381490e9bed6b7105cbaf76849f8985258a7e84779fce8ecdda3fbec5bca5cb0df749731294d035677ebdb2c6664229eb11ec4c4e9a9a0b86a0010a3a003a00';
		const sign2 =
			'0802100018022080c2d72f2a20f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a401f11d2300ecabb85e5d8e2d51a227e566fdf6fe7750345deb6162fa13ce44fcfcf060a7f073912c2a940e9d0351a671537b213509f04c6a4e67572aa3850b1033a40f39a1d92a381490e9bed6b7105cbaf76849f8985258a7e84779fce8ecdda3fbec5bca5cb0df749731294d035677ebdb2c6664229eb11ec4c4e9a9a0b86a0010a3a003a00';
		const sign3 =
			'0802100018022080c2d72f2a20f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a401f11d2300ecabb85e5d8e2d51a227e566fdf6fe7750345deb6162fa13ce44fcfcf060a7f073912c2a940e9d0351a671537b213509f04c6a4e67572aa3850b1033a40f39a1d92a381490e9bed6b7105cbaf76849f8985258a7e84779fce8ecdda3fbec5bca5cb0df749731294d035677ebdb2c6664229eb11ec4c4e9a9a0b86a0010a3a40a40e56c0a6aaa549bd34c2b948aec20fecd3c60661da472fb0ffc3ce98766ddea1179138d5d110abaa97f057bedecdc5d2aa4617a328bedd415481bd9e87ef0e3a00';
		const signedTransaction =
			'0802100018022080c2d72f2a20f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a401f11d2300ecabb85e5d8e2d51a227e566fdf6fe7750345deb6162fa13ce44fcfcf060a7f073912c2a940e9d0351a671537b213509f04c6a4e67572aa3850b1033a40f39a1d92a381490e9bed6b7105cbaf76849f8985258a7e84779fce8ecdda3fbec5bca5cb0df749731294d035677ebdb2c6664229eb11ec4c4e9a9a0b86a0010a3a40a40e56c0a6aaa549bd34c2b948aec20fecd3c60661da472fb0ffc3ce98766ddea1179138d5d110abaa97f057bedecdc5d2aa4617a328bedd415481bd9e87ef0e3a4055e35fbc455dfd0c71455a3c4fb3b0363bd90810fae11d715a95e3892847afc4e3eb42c692e3d0da7c32e8a8225ddeca565eed9c821e24a57c74db196d87ed01';

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
				.it('should return fully signed transaction string in hex format', () => {
					expect(printJSONStub.callCount).to.equal(1);
					expect(printJSONStub).to.be.calledWithExactly({
						asset: {
							amount: '100',
							data: 'send token',
							recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
						},
						assetID: 0,
						fee: '100000000',
						moduleID: 2,
						nonce: '2',
						senderPublicKey: 'f1b9f4ee71b5d5857d3b346d441ca967f27870ebee88569db364fd13e28adba3',
						signatures: [
							'1f11d2300ecabb85e5d8e2d51a227e566fdf6fe7750345deb6162fa13ce44fcfcf060a7f073912c2a940e9d0351a671537b213509f04c6a4e67572aa3850b103',
							'f39a1d92a381490e9bed6b7105cbaf76849f8985258a7e84779fce8ecdda3fbec5bca5cb0df749731294d035677ebdb2c6664229eb11ec4c4e9a9a0b86a0010a',
							'a40e56c0a6aaa549bd34c2b948aec20fecd3c60661da472fb0ffc3ce98766ddea1179138d5d110abaa97f057bedecdc5d2aa4617a328bedd415481bd9e87ef0e',
							'55e35fbc455dfd0c71455a3c4fb3b0363bd90810fae11d715a95e3892847afc4e3eb42c692e3d0da7c32e8a8225ddeca565eed9c821e24a57c74db196d87ed01',
						],
					});
				});
		});
	});
});

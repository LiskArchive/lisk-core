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
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import { cryptography, transactionSchema, apiClient, transactions } from 'lisk-sdk';
import * as Config from '@oclif/config';
import baseIPC from '../../../src/base_ipc';
import * as appUtils from '../../../src/utils/application';
import * as readerUtils from '../../../src/utils/reader';
import {
	dposVoteAssetSchema,
	tokenTransferAssetSchema,
	accountSchema,
} from '../../utils/transactions';
import CreateCommand from '../../../src/commands/transaction/create';
import { getConfig } from '../../utils/config';
import { PromiseResolvedType } from '../../../src/types';

describe('transaction:create command', () => {
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
	const unVoteAsset =
		'{"votes":[{"delegateAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","amount":-50}]}';
	const { publicKey } = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
	const senderPublicKey = publicKey.toString('hex');
	const mockEncodedTransaction = Buffer.from('encoded transaction');
	const mockJSONTransaction = {
		asset: {
			amount: '100',
			data: 'send token',
			recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
		},
		assetID: 0,
		fee: '100000000',
		moduleID: 2,
		nonce: '0',
		senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
		signatures: [
			'3cc8c8c81097fe59d9df356b3c3f1dd10f619bfabb54f5d187866092c67e0102c64dbe24f357df493cc7ebacdd2e55995db8912245b718d88ebf7f4f4ac01f04',
		],
	};

	let stdout: string[];
	let stderr: string[];
	let config: Config.IConfig;
	let clientMock: PromiseResolvedType<ReturnType<typeof apiClient.createIPCClient>>;

	beforeEach(async () => {
		stdout = [];
		stderr = [];
		config = await getConfig();
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(appUtils, 'isApplicationRunning').mockReturnValue(true);
		jest.spyOn(fs, 'existsSync').mockReturnValue(true);
		jest.spyOn(baseIPC.prototype, 'printJSON').mockReturnValue();
		clientMock = {
			disconnect: jest.fn(),
			schemas: {
				transaction: transactionSchema,
				transactionsAssets,
				account: accountSchema,
			},
			node: {
				getNodeInfo: jest.fn().mockResolvedValue({
					networkIdentifier: '873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3',
				}),
			},
			transaction: {
				encode: jest.fn().mockReturnValue(mockEncodedTransaction),
				toJSON: jest.fn().mockReturnValue(mockJSONTransaction),
			},
			account: {
				get: jest.fn().mockResolvedValue({
					address: Buffer.from('ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815', 'hex'),
					token: {
						balance: BigInt('100000000'),
					},
					sequence: {
						nonce: BigInt(0),
					},
					keys: {
						numberOfSignatures: 0,
						mandatoryKeys: [],
						optionalKeys: [],
					},
				}),
			},
		} as any;
		jest.spyOn(apiClient, 'createIPCClient').mockResolvedValue(clientMock);
		jest.spyOn(inquirer, 'prompt').mockResolvedValue({
			amount: 100,
			recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
			data: 'send token',
		});
		jest.spyOn(readerUtils, 'getPassphraseFromPrompt').mockResolvedValue(passphrase);
	});

	describe('transaction:create', () => {
		it('should throw an error when no arguments are provided.', async () => {
			await expect(CreateCommand.run([], config)).rejects.toThrow('Missing 3 required args:');
		});
	});

	describe('transaction:create 2', () => {
		it('should throw an error when fee, nonce and transaction type are provided.', async () => {
			await expect(CreateCommand.run(['2'], config)).rejects.toThrow('Missing 2 required args:');
		});
	});

	describe('transaction:create 2 0', () => {
		it('should throw an error when nonce and transaction type are provided.', async () => {
			await expect(CreateCommand.run(['2', '0'], config)).rejects.toThrow(
				'Missing 1 required arg:',
			);
		});
	});

	describe('transaction:create 99999 0 100000000', () => {
		it('should throw an error when moduleID is not registered.', async () => {
			await expect(CreateCommand.run(['99999', '0', '100000000'], config)).rejects.toThrow(
				'Transaction moduleID:99999 with assetID:0 is not registered in the application',
			);
		});
	});

	describe('offline', () => {
		describe('with flags', () => {
			describe(`transaction:create 2 0 100000000 --asset='{"amount": "abc"}' --passphrase=${passphrase} --offline`, () => {
				it('should throw error for data path flag.', async () => {
					await expect(
						CreateCommand.run(
							[
								'2',
								'0',
								'100000000',
								'--asset={"amount": "abc"}',
								`--passphrase=${passphrase}`,
								'--offline',
								'--data-path=/tmp',
								'--network=devnet',
							],
							config,
						),
					).rejects.toThrow(
						'Flag: --data-path should not be specified while creating transaction offline',
					);
				});
			});

			describe(`transaction:create 2 0 100000000 --asset='{"amount": "abc"}' --passphrase=${passphrase} --offline`, () => {
				it('should throw error for missing network identifier flag.', async () => {
					await expect(
						CreateCommand.run(
							[
								'2',
								'0',
								'100000000',
								'--asset={"amount": "abc"}',
								`--passphrase=${passphrase}`,
								'--offline',
								'--network=devnet',
							],
							config,
						),
					).rejects.toThrow(
						'Flag: --network-identifier must be specified while creating transaction offline with signature.',
					);
				});

				it('should not throw error for missing network identifier flag with --no-signature', async () => {
					await expect(
						CreateCommand.run(
							[
								'2',
								'0',
								'100000000',
								'--asset={"amount": "abc"}',
								`--passphrase=${passphrase}`,
								'--offline',
								'--no-signature',
								'--network=devnet',
							],
							config,
						),
					).rejects.toThrow('Sender public key must be specified when no-signature flags is used.');
				});
			});

			describe(`transaction:create 2 0 100000000 --asset='{"amount": "abc"}' --passphrase=${passphrase} --offline`, () => {
				it('should throw error for missing nonce flag.', async () => {
					await expect(
						CreateCommand.run(
							[
								'2',
								'0',
								'100000000',
								'--asset={"amount": "abc"}',
								`--passphrase=${passphrase}`,
								'--offline',
								'--network=devnet',
								'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							],
							config,
						),
					).rejects.toThrow('Flag: --nonce must be specified while creating transaction offline');
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --no-signature`, () => {
				it('should throw error when sender public key not specified when no-signature flag is used.', async () => {
					await expect(
						CreateCommand.run(
							[
								'2',
								'0',
								'100000000',
								`--asset=${transferAsset}`,
								'--no-signature',
								'--offline',
								'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
								'--nonce=1',
								'--network=devnet',
							],
							config,
						),
					).rejects.toThrow('Sender public key must be specified when no-signature flags is used');
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --passphrase=${passphrase}`, () => {
				it('should return encoded transaction string in hex format with signature', async () => {
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							'--offline',
							`--asset=${transferAsset}`,
							`--passphrase=${passphrase}`,
							'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							'--nonce=1',
							'--network=devnet',
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction:
							'0802100018012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a40816039d55d0710f6b412e221b4fc0422a29d5314603c43eeafab0017e4c6bfbd575c5d53b2c0429992922737ec0f8add0767b904b80cfc411021bfdb0b04bc0a',
					});
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --no-signature --sender-public-key=${senderPublicKey}`, () => {
				it('should return encoded transaction string in hex format without signature', async () => {
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							'--offline',
							`--asset=${transferAsset}`,
							'--no-signature',
							`--sender-public-key=${senderPublicKey}`,
							'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							'--nonce=1',
							'--network=devnet',
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction:
							'0802100018012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e',
					});
				});
			});

			describe(`transaction:create 5 1 100000000 --asset=${voteAsset} --passphrase=${passphrase}`, () => {
				it('should return encoded transaction string in hex format with signature', async () => {
					await CreateCommand.run(
						[
							'5',
							'1',
							'100000000',
							'--offline',
							`--asset=${voteAsset}`,
							`--passphrase=${passphrase}`,
							'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							'--nonce=1',
							'--network=devnet',
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction:
							'0805100118012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32350a190a14ab0041a7d3f7b2c290b5b834d46bdc7b7eb8581510c8010a180a14ab0041a7d3f7b2c290b5b834d46bdc7b7eb8581510633a40cf630a8bd820a4176bde1c9af65c316d020c3db012729d46d1fa5784e0f9b7eaa730dcc7ad603620c302f0855116398e8c9ba7a2a6ed54061e67fbf1f7c5100c',
					});
				});
			});

			describe(`transaction:create 5 1 100000000 --asset=${unVoteAsset} --passphrase=${passphrase}`, () => {
				it('should return encoded transaction string in hex format with signature', async () => {
					await CreateCommand.run(
						[
							'5',
							'1',
							'100000000',
							'--offline',
							`--asset=${unVoteAsset}`,
							`--passphrase=${passphrase}`,
							'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							'--nonce=1',
							'--network=devnet',
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction:
							'0805100118012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a321a0a180a14ab0041a7d3f7b2c290b5b834d46bdc7b7eb8581510633a4009da2349735f2bd71d2e013f261c1ff4a75091daed56521de4b55156a5c8802446574328c76a3168c5f912cdf59275f070c1a1904fec6e8ef3a021019a96820b',
					});
				});
			});
		});

		describe('with prompts and flags', () => {
			describe(`transaction:create 2 0 100000000 --passphrase=${passphrase}`, () => {
				it('should prompt user for asset.', async () => {
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							`--passphrase=${passphrase}`,
							'--offline',
							'--network=devnet',
							'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							'--nonce=1',
						],
						config,
					);
					expect(inquirer.prompt).toHaveBeenCalledTimes(1);
					expect(inquirer.prompt).toHaveBeenCalledWith([
						{ message: 'Please enter: amount: ', name: 'amount', type: 'input' },
						{
							message: 'Please enter: recipientAddress: ',
							name: 'recipientAddress',
							type: 'input',
						},
						{ message: 'Please enter: data: ', name: 'data', type: 'input' },
					]);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction:
							'0802100018012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a40816039d55d0710f6b412e221b4fc0422a29d5314603c43eeafab0017e4c6bfbd575c5d53b2c0429992922737ec0f8add0767b904b80cfc411021bfdb0b04bc0a',
					});
				});
			});

			describe('transaction:create 2 0 100000000', () => {
				it('should prompt user for asset and passphrase.', async () => {
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							'--offline',
							'--network=devnet',
							'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							'--nonce=1',
						],
						config,
					);
					expect(inquirer.prompt).toHaveBeenCalledTimes(1);
					expect(inquirer.prompt).toHaveBeenCalledWith([
						{ message: 'Please enter: amount: ', name: 'amount', type: 'input' },
						{
							message: 'Please enter: recipientAddress: ',
							name: 'recipientAddress',
							type: 'input',
						},
						{ message: 'Please enter: data: ', name: 'data', type: 'input' },
					]);
					expect(readerUtils.getPassphraseFromPrompt).toHaveBeenCalledWith('passphrase', true);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction:
							'0802100018012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a40816039d55d0710f6b412e221b4fc0422a29d5314603c43eeafab0017e4c6bfbd575c5d53b2c0429992922737ec0f8add0767b904b80cfc411021bfdb0b04bc0a',
					});
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --no-signature --json`, () => {
				it('should return unsigned transaction in json format when no passphrase specified', async () => {
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							`--asset=${transferAsset}`,
							'--no-signature',
							`--sender-public-key=${senderPublicKey}`,
							'--json',
							'--offline',
							'--network=devnet',
							'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							'--nonce=1',
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(2);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction:
							'0802100018012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e',
					});
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: {
							moduleID: 2,
							assetID: 0,
							nonce: '1',
							fee: '100000000',
							senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
							asset: {
								amount: '100',
								data: 'send token',
								recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
							},
							signatures: [],
						},
					});
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --passphrase=${passphrase} --json`, () => {
				it('should return signed transaction in json format when passphrase specified', async () => {
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							`--asset=${transferAsset}`,
							`--passphrase=${passphrase}`,
							'--json',
							'--offline',
							'--network=devnet',
							'--network-identifier=873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3.',
							'--nonce=1',
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(2);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction:
							'0802100018012080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a322408641214ab0041a7d3f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a40816039d55d0710f6b412e221b4fc0422a29d5314603c43eeafab0017e4c6bfbd575c5d53b2c0429992922737ec0f8add0767b904b80cfc411021bfdb0b04bc0a',
					});
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: {
							moduleID: 2,
							assetID: 0,
							nonce: '1',
							fee: '100000000',
							senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
							asset: {
								amount: '100',
								data: 'send token',
								recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
							},
							signatures: [
								'816039d55d0710f6b412e221b4fc0422a29d5314603c43eeafab0017e4c6bfbd575c5d53b2c0429992922737ec0f8add0767b904b80cfc411021bfdb0b04bc0a',
							],
						},
					});
				});
			});
		});
	});

	describe('online', () => {
		describe('with flags', () => {
			describe(`transaction:create 2 0 100000000 --asset='{"amount": "abc"}' --passphrase=${passphrase}`, () => {
				it('should throw error for invalid asset.', async () => {
					await expect(
						CreateCommand.run(
							['2', '0', '100000000', '--asset={"amount": "abc"}', `--passphrase=${passphrase}`],
							config,
						),
					).rejects.toThrow('Cannot convert abc to a BigInt');
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --no-signature`, () => {
				it('should throw error when sender public key not specified when no-signature flag is used.', async () => {
					await expect(
						CreateCommand.run(
							['2', '0', '100000000', `--asset=${transferAsset}`, '--no-signature'],
							config,
						),
					).rejects.toThrow('Sender public key must be specified when no-signature flags is used');
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --passphrase=${passphrase}`, () => {
				it('should return encoded transaction string in hex format with signature', async () => {
					await CreateCommand.run(
						['2', '0', '100000000', `--asset=${transferAsset}`, `--passphrase=${passphrase}`],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: mockEncodedTransaction.toString('hex'),
					});
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --no-signature --sender-public-key=${senderPublicKey}`, () => {
				it('should return encoded transaction string in hex format without signature', async () => {
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							`--asset=${transferAsset}`,
							'--no-signature',
							`--sender-public-key=${senderPublicKey}`,
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: mockEncodedTransaction.toString('hex'),
					});
				});
			});

			describe(`transaction:create 5 1 100000000 --asset=${voteAsset} --passphrase=${passphrase}`, () => {
				it('should return encoded transaction string in hex format with signature', async () => {
					await CreateCommand.run(
						['5', '1', '100000000', `--asset=${voteAsset}`, `--passphrase=${passphrase}`],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: mockEncodedTransaction.toString('hex'),
					});
				});
			});

			describe(`transaction:create 5 1 100000000 --asset=${unVoteAsset} --passphrase=${passphrase}`, () => {
				it('should return encoded transaction string in hex format with signature', async () => {
					await CreateCommand.run(
						['5', '1', '100000000', `--asset=${unVoteAsset}`, `--passphrase=${passphrase}`],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: mockEncodedTransaction.toString('hex'),
					});
				});
			});
		});

		describe('with prompts and flags', () => {
			describe(`transaction:create 2 0 100000000 --passphrase=${passphrase}`, () => {
				it('should prompt user for asset.', async () => {
					await CreateCommand.run(['2', '0', '100000000', `--passphrase=${passphrase}`], config);
					expect(inquirer.prompt).toHaveBeenCalledTimes(1);
					expect(inquirer.prompt).toHaveBeenCalledWith([
						{ message: 'Please enter: amount: ', name: 'amount', type: 'input' },
						{
							message: 'Please enter: recipientAddress: ',
							name: 'recipientAddress',
							type: 'input',
						},
						{ message: 'Please enter: data: ', name: 'data', type: 'input' },
					]);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: mockEncodedTransaction.toString('hex'),
					});
				});
			});

			describe('transaction:create 2 0 100000000 --nonce=999', () => {
				it('should prompt user for asset and passphrase.', async () => {
					await CreateCommand.run(['2', '0', '100000000', '--nonce=999'], config);
					expect(inquirer.prompt).toHaveBeenCalledTimes(1);
					expect(inquirer.prompt).toHaveBeenCalledWith([
						{ message: 'Please enter: amount: ', name: 'amount', type: 'input' },
						{
							message: 'Please enter: recipientAddress: ',
							name: 'recipientAddress',
							type: 'input',
						},
						{ message: 'Please enter: data: ', name: 'data', type: 'input' },
					]);
					expect(readerUtils.getPassphraseFromPrompt).toHaveBeenCalledWith('passphrase', true);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: mockEncodedTransaction.toString('hex'),
					});
				});
			});

			describe('transaction:create 2 0 100000000', () => {
				it('should prompt user for asset and passphrase.', async () => {
					await CreateCommand.run(['2', '0', '100000000'], config);
					expect(inquirer.prompt).toHaveBeenCalledTimes(1);
					expect(inquirer.prompt).toHaveBeenCalledWith([
						{ message: 'Please enter: amount: ', name: 'amount', type: 'input' },
						{
							message: 'Please enter: recipientAddress: ',
							name: 'recipientAddress',
							type: 'input',
						},
						{ message: 'Please enter: data: ', name: 'data', type: 'input' },
					]);
					expect(readerUtils.getPassphraseFromPrompt).toHaveBeenCalledWith('passphrase', true);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(1);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: mockEncodedTransaction.toString('hex'),
					});
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --no-signature --json`, () => {
				it('should return unsigned transaction in json format when no passphrase specified', async () => {
					jest.spyOn(transactions, 'signTransaction');
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							`--asset=${transferAsset}`,
							'--no-signature',
							`--sender-public-key=${senderPublicKey}`,
							'--json',
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(2);
					expect(transactions.signTransaction).not.toHaveBeenCalled();
				});
			});

			describe(`transaction:create 2 0 100000000 --asset=${transferAsset} --passphrase=${passphrase} --json`, () => {
				it('should return signed transaction in json format when passphrase specified', async () => {
					await CreateCommand.run(
						[
							'2',
							'0',
							'100000000',
							`--asset=${transferAsset}`,
							`--passphrase=${passphrase}`,
							'--json',
						],
						config,
					);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledTimes(2);
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: '656e636f646564207472616e73616374696f6e',
					});
					expect(baseIPC.prototype.printJSON).toHaveBeenCalledWith({
						transaction: {
							moduleID: 2,
							assetID: 0,
							nonce: '0',
							fee: '100000000',
							senderPublicKey: '0fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a',
							asset: {
								amount: '100',
								data: 'send token',
								recipientAddress: 'ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815',
							},
							signatures: [
								'3cc8c8c81097fe59d9df356b3c3f1dd10f619bfabb54f5d187866092c67e0102c64dbe24f357df493cc7ebacdd2e55995db8912245b718d88ebf7f4f4ac01f04',
							],
						},
					});
				});
			});
		});
	});
});

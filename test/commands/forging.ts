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
import * as inquirer from 'inquirer';
import { IPCChannel } from 'lisk-sdk';
import { BaseForgingCommand } from '../../src/base_forging';
import * as appUtils from '../../src/utils/application';

describe('forging', () => {
	const actionResult = {
		address: 'actionAddress',
		forging: true,
	};
	const ipcInvokeStub = sandbox.stub().resolves(actionResult);
	const printJSONStub = sandbox.stub();
	const promptStub = sandbox.stub().returns({ password: 'promptPassword' });

	afterEach(() => {
		ipcInvokeStub.resetHistory();
		printJSONStub.resetHistory();
		promptStub.resetHistory();
	});

	const setupTest = () =>
		test
			.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
			.stub(BaseForgingCommand.prototype, 'printJSON', printJSONStub)
			.stub(IPCChannel.prototype, 'startAndListen', sandbox.stub())
			.stub(IPCChannel.prototype, 'invoke', ipcInvokeStub)
			.stub(inquirer, 'prompt', promptStub)
			.stdout()
			.stderr();

	describe('forging:enable', () => {
		setupTest()
			.command(['forging:enable'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 4 required arg'))
			.it('should throw an error when address is not provided');

		setupTest()
			.command(['forging:enable', 'myAddress', '--password=my-password'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 3 required arg'))
			.it(
				'should throw an error when height, maxHeightPreviouslyForged, maxHeightPrevoted is not provided',
			);

		setupTest()
			.command(['forging:enable', 'myAddress', 'height', '--password=my-password'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 2 required arg'))
			.it(
				'should throw an error when maxHeightPreviouslyForged, maxHeightPrevoted is not provided',
			);

		setupTest()
			.command([
				'forging:enable',
				'myAddress',
				'height',
				'maxHeightPreviouslyForged',
				'--password=my-password',
			])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg'))
			.it('should throw an error when maxHeightPrevoted is not provided');

		describe('when invoked with password', () => {
			setupTest()
				.command(['forging:enable', 'myAddress', '10', '10', '1', '--password=my-password'])
				.it('should invoke action with given address and password', () => {
					expect(ipcInvokeStub.lastCall).to.be.calledWithExactly('app:updateForgingStatus', {
						address: 'myAddress',
						forging: true,
						password: 'my-password',
						height: '10',
						maxHeightPreviouslyForged: '10',
						maxHeightPrevoted: '1',
						overwrite: false,
					});
				});

			setupTest()
				.command(['forging:enable', 'myAddress', '10', '10', '1', 'true', '--password=my-password'])
				.it('should invoke action with given address and password', () => {
					expect(ipcInvokeStub.lastCall).to.be.calledWithExactly('app:updateForgingStatus', {
						address: 'myAddress',
						forging: true,
						password: 'my-password',
						height: '10',
						maxHeightPreviouslyForged: '10',
						maxHeightPrevoted: '1',
						overwrite: 'true',
					});
				});
		});

		describe('when invoked without password', () => {
			setupTest()
				.command(['forging:enable', 'myAddress', '10', '10', '1'])
				.it('should prompt user for password', () => {
					expect(promptStub).to.be.calledOnce;
					expect(promptStub).to.be.calledWithExactly([
						{
							type: 'password',
							message: 'Enter password to decrypt the encrypted passphrase: ',
							name: 'password',
							mask: '*',
						},
					]);
				});

			setupTest()
				.command(['forging:enable', 'myAddress', '10', '10', '1'])
				.it('should invoke action with given address and password', () => {
					expect(ipcInvokeStub.lastCall).to.be.calledWithExactly('app:updateForgingStatus', {
						address: 'myAddress',
						forging: true,
						password: 'promptPassword',
						height: '10',
						maxHeightPreviouslyForged: '10',
						maxHeightPrevoted: '1',
						overwrite: false,
					});
				});

			setupTest()
				.command(['forging:enable', 'myAddress', '10', '10', '1', 'true'])
				.it('should prompt user for password', () => {
					expect(promptStub).to.be.calledOnce;
					expect(promptStub).to.be.calledWithExactly([
						{
							type: 'password',
							message: 'Enter password to decrypt the encrypted passphrase: ',
							name: 'password',
							mask: '*',
						},
					]);
				});
		});

		describe('when action is successful', () => {
			setupTest()
				.command(['forging:enable', 'myAddress', '10', '10', '1', '--password=my-password'])
				.it('should invoke action with given address and user provided password', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly(actionResult);
				});
		});

		describe('when action fail', () => {
			ipcInvokeStub
				.withArgs('app:updateForgingStatus', {
					address: 'myFailedEnabledAddress',
					forging: true,
					password: 'my-password',
					height: '10',
					maxHeightPreviouslyForged: '10',
					maxHeightPrevoted: '1',
					overwrite: false,
				})
				.rejects(new Error('Custom Error'));

			setupTest()
				.command([
					'forging:enable',
					'myFailedEnabledAddress',
					'10',
					'10',
					'1',
					'--password=my-password',
				])
				.catch(error => {
					return expect(error.message).to.contain('Custom Error');
				})
				.it('should log the error returned');
		});
	});

	describe('forging:disable', () => {
		setupTest()
			.command(['forging:disable'])
			.catch((error: Error) => expect(error.message).to.contain('Missing 1 required arg'))
			.it('should throw an error when arg is not provided');

		describe('when invoked with password', () => {
			setupTest()
				.command(['forging:disable', 'myAddress', '--password=my-password'])
				.it('should invoke action with given address and password', () => {
					expect(ipcInvokeStub.lastCall).to.be.calledWithExactly('app:updateForgingStatus', {
						address: 'myAddress',
						forging: false,
						password: 'my-password',
						height: 0,
						maxHeightPreviouslyForged: 0,
						maxHeightPrevoted: 0,
						overwrite: false,
					});
				});
		});

		describe('when invoked without password', () => {
			setupTest()
				.command(['forging:disable', 'myAddress'])
				.it('should prompt user for password', () => {
					expect(promptStub).to.be.calledOnce;
					expect(promptStub).to.be.calledWithExactly([
						{
							type: 'password',
							message: 'Enter password to decrypt the encrypted passphrase: ',
							name: 'password',
							mask: '*',
						},
					]);
				});

			setupTest()
				.command(['forging:disable', 'myAddress'])
				.it('should invoke action with given address and password', () => {
					expect(ipcInvokeStub.lastCall).to.be.calledWithExactly('app:updateForgingStatus', {
						address: 'myAddress',
						forging: false,
						password: 'promptPassword',
						height: 0,
						maxHeightPreviouslyForged: 0,
						maxHeightPrevoted: 0,
						overwrite: false,
					});
				});
		});

		describe('when action is successful', () => {
			setupTest()
				.command(['forging:disable', 'myAddress', '--password=my-password'])
				.it('should invoke action with given address and user provided password', () => {
					expect(printJSONStub).to.be.calledOnce;
					expect(printJSONStub).to.be.calledWithExactly(actionResult);
				});
		});

		describe('when action fail', () => {
			ipcInvokeStub
				.withArgs('app:updateForgingStatus', {
					address: 'myFailedDisabledAddress',
					forging: false,
					password: 'my-password',
					height: 0,
					maxHeightPreviouslyForged: 0,
					maxHeightPrevoted: 0,
					overwrite: false,
				})
				.rejects(new Error('Custom Error'));

			setupTest()
				.command(['forging:disable', 'myFailedDisabledAddress', '--password=my-password'])
				.catch(error => {
					return expect(error.message).to.contain('Custom Error');
				})
				.it('should log the error returned');
		});
	});
});

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
import { homedir } from 'os';
import { join } from 'path';
import * as appUtils from '../../../src/utils/application';
import * as dbUtils from '../../../src/utils/db';

const defaultDataPath = join(homedir(), '.lisk', 'default');

describe('blockchain:reset', () => {
	const pid = 56869;
	const KVStoreStubInstance = {
		clear: sandbox.stub(),
    };
    const promptStub = sandbox.stub().returns({ answer: false });

	const setupTest = () =>
		test
			.stub(dbUtils, 'getBlockchainDB', sandbox.stub().returns(KVStoreStubInstance))
            .stub(appUtils, 'getPid', sandbox.stub().returns(pid))
            .stub(inquirer, 'prompt', promptStub)
			.stdout()
            .stderr();
    
    afterEach(() => {
        KVStoreStubInstance.clear.resetHistory();
        promptStub.resetHistory();
    });

	describe('when application is running', () => {
		describe('when reset without flags', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
				.command(['blockchain:reset'])
				.catch(error => {
					expect(error.message).to.equal(
						`Can't clear db while running application. Application at data path ${defaultDataPath} is running with pid ${pid}.`,
					);
				})
                .it('should log error and return');
        });
        
        describe('when reset with data-path', () => {
			setupTest()
				.stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
				.command(['blockchain:reset', '--data-path=/my/app/'])
				.catch(error => {
					expect(error.message).to.equal(
						`Can't clear db while running application. Application at data path /my/app/ is running with pid ${pid}.`,
					);
				})
				.it('should log error and return');
        });

        describe('when starting with skip confirmation', () => {
            setupTest()
                .stub(appUtils, 'isApplicationRunning', sandbox.stub().returns(true))
                .command(['blockchain:reset', '--yes'])
                .catch(error => {
                    expect(error.message).to.equal(
                        `Can't clear db while running application. Application at data path ${defaultDataPath} is running with pid ${pid}.`,
                    );
                })
                .it('should log error and return');
        });
	});
});

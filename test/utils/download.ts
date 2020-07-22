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
 */

import * as sandbox from 'sinon';
import { expect } from 'chai';
import * as fs from 'fs-extra';
import * as axios from 'axios';
import { SinonStub } from 'sinon';
import * as downloadUtil from '../../src/utils/download';

describe('download utils', () => {
	const url = 'https://downloads.lisk.io/lisk/betanet/blockchain.db.gz';
    const outDir = '~/.cache/lisk-core';
    
	describe('#download', () => {
		let existsSyncStub: SinonStub;
		let statSyncStub: SinonStub;

		beforeEach(() => {
			sandbox.stub(axios, 'default');
            existsSyncStub = sandbox.stub(fs, 'existsSync');
            statSyncStub = sandbox.stub(fs, 'statSync');
			sandbox.stub(fs, 'unlinkSync').returns();
		});

		it('should return true if downloaded file', () => {
            existsSyncStub.returns(true);
            statSyncStub.returns({ birthtime: new Date() });

			return expect(downloadUtil.download(url, outDir)).returned;
		});
	});
});

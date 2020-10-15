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
import { join } from 'path';
import { when } from 'jest-when';
import LinkCommand from '../../../src/commands/sdk/link';

describe('sdk:link command', () => {
	let stdout: string[];
	let stderr: string[];

	beforeEach(() => {
		stdout = [];
		stderr = [];
		jest.spyOn(process.stdout, 'write').mockImplementation(val => stdout.push(val as string) > -1);
		jest.spyOn(process.stderr, 'write').mockImplementation(val => stderr.push(val as string) > -1);
		jest.spyOn(fs, 'removeSync').mockReturnValue();
		jest.spyOn(fs, 'symlinkSync').mockReturnValue();
	});

	describe('sdk:link', () => {
		it('should throw an error when target folder is missing', async () => {
			await expect(LinkCommand.run([])).rejects.toThrow(
				'Missing 1 required arg:\ntargetSDKFolder  The path to the lisk SDK folder\nSee more help with --help',
			);
		});
	});

	describe('sdk:link /path/does/not/exist', () => {
		it('should throw an error when target folder is missing', async () => {
			jest.spyOn(fs, 'pathExistsSync');
			when(fs.pathExistsSync as jest.Mock)
				.calledWith('/path/does/not/exist')
				.mockReturnValue(false);
			await expect(LinkCommand.run(['/path/does/not/exist'])).rejects.toThrow(
				"Path '/path/does/not/exist' does not exist or no access allowed",
			);
		});
	});

	describe('sdk:link /path/exists', () => {
		const fakeSDKPath = '/path/exists';
		const targetSDKPath = join(__dirname, '../../../', 'node_modules', 'lisk-sdk');

		it('should call file system functions with correct parameters', async () => {
			jest.spyOn(fs, 'pathExistsSync');
			when(fs.pathExistsSync as jest.Mock)
				.calledWith(fakeSDKPath)
				.mockReturnValue(true);
			await LinkCommand.run([fakeSDKPath]);
			expect(fs.pathExistsSync).toHaveBeenCalledWith(fakeSDKPath);
			expect(fs.removeSync).toHaveBeenCalledWith(targetSDKPath);
			expect(fs.symlinkSync).toHaveBeenCalledWith(fakeSDKPath, targetSDKPath);
			expect(stdout[0]).toContain(`Linked '/path/exists' to '${targetSDKPath}'`);
		});
	});
});

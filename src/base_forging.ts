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

import * as inquirer from 'inquirer';
import { flags as flagParser } from '@oclif/command';

import { flags as commonFlags } from './utils/flags';
import BaseIPCCommand from './base_ipc';

interface Args {
	readonly address: string;
	readonly height?: number;
	readonly maxHeightPreviouslyForged?: number;
	readonly maxHeightPrevoted?: number;
}

const isLessThanZero = (value: number | undefined | null): boolean =>
	value === null || value === undefined || value < 0;

export class BaseForgingCommand extends BaseIPCCommand {
	static args = [
		{
			name: 'address',
			required: true,
			description: 'Address of an account in a base32 format.',
		},
	];

	static flags = {
		...BaseIPCCommand.flags,
		password: flagParser.string(commonFlags.password),
		overwrite: flagParser.boolean({
			description: 'Overwrites the forger info',
			default: false,
		}),
	};

	protected forging!: boolean;

	async run(): Promise<void> {
		const { args, flags } = this.parse(this.constructor as typeof BaseForgingCommand);
		const { address, height, maxHeightPreviouslyForged, maxHeightPrevoted } = args as Args;
		let password: string;

		if (
			this.forging &&
			(isLessThanZero(height) ||
				isLessThanZero(maxHeightPreviouslyForged) ||
				isLessThanZero(maxHeightPrevoted))
		) {
			throw new Error(
				'The maxHeightPreviouslyForged and maxHeightPrevoted parameter value must be greater than or equal to 0',
			);
		}

		if (flags.password) {
			password = flags.password;
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			const answers = await inquirer.prompt([
				{
					type: 'password',
					message: 'Enter password to decrypt the encrypted passphrase: ',
					name: 'password',
					mask: '*',
				},
			]);
			password = (answers as { password: string }).password;
		}
		if (!this._client) {
			this.error('APIClient is not initialized.');
		}
		try {
			const result = await this._client.invoke<{ address: string; forging: boolean }>(
				'app:updateForgingStatus',
				{
					address,
					password,
					forging: this.forging,
					height: Number(height ?? 0),
					maxHeightPreviouslyForged: Number(maxHeightPreviouslyForged ?? 0),
					maxHeightPrevoted: Number(maxHeightPrevoted ?? 0),
					overwrite: flags.overwrite,
				},
			);
			this.log('Forging status:');
			this.printJSON(result);
		} catch (error) {
			this.error(error);
		}
	}
}

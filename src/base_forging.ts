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

interface ForgingStatus {
	readonly address?: string;
	readonly forging?: boolean;
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

		if (!this._client) {
			this.error('APIClient is not initialized.');
		}

		if (
			this.forging &&
			flags['use-status-values'] &&
			(height || maxHeightPreviouslyForged || maxHeightPrevoted)
		) {
			throw new Error(
				'Flag --use-status-values can not be used along with arguments height, maxHeightPreviouslyForged, maxHeightPrevoted',
			);
		}

		if (
			this.forging &&
			!flags['use-status-values'] &&
			(isLessThanZero(height) ||
				isLessThanZero(maxHeightPreviouslyForged) ||
				isLessThanZero(maxHeightPrevoted))
		) {
			throw new Error(
				'The height, maxHeightPreviouslyForged and maxHeightPrevoted parameter value must be greater than or equal to 0',
			);
		}

		let forgerStatus: ForgingStatus | undefined;
		if (flags['use-status-values']) {
			const forgingStatuses = await this._client.invoke<ForgingStatus[]>('app:getForgingStatus');
			forgerStatus = forgingStatuses.find(f => f.address === address);

			if (!forgerStatus) {
				this.log(`Forging status not found for provided account: ${address}.`);
				return;
			}

			// eslint-disable-next-line dot-notation
			if (!flags['yes']) {
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				this.log(
					`\n Current forging status is height: ${forgerStatus.height}, maxHeightPrevoted: ${forgerStatus.maxHeightPrevoted} and maxHeightPreviouslyForged: ${forgerStatus.maxHeightPreviouslyForged}.\n`,
				);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				const { answer } = await inquirer.prompt([
					{
						name: 'answer',
						message: 'Do you want to use these values to enable forging?',
						type: 'list',
						choices: ['yes', 'no'],
					},
				]);

				if (answer === 'no') {
					return;
				}
			}
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

		try {
			const result = await this._client.invoke<{ address: string; forging: boolean }>(
				'app:updateForgingStatus',
				{
					address,
					password,
					forging: this.forging,
					height: Number(height ?? forgerStatus?.height),
					maxHeightPreviouslyForged: Number(
						maxHeightPreviouslyForged ?? forgerStatus?.maxHeightPreviouslyForged,
					),
					maxHeightPrevoted: Number(maxHeightPrevoted ?? forgerStatus?.maxHeightPrevoted),
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

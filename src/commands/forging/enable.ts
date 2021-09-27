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

import { BaseForgingCommand } from '../../base_forging';
import { flags as flagParser } from '@oclif/command';

export default class EnableForgingCommand extends BaseForgingCommand {
	static description = 'Enable forging for given delegate address.';

	static examples = [
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --use-status-values',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --use-status-values --yes',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --overwrite',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --data-path ./data',
		'forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --data-path ./data --password your_password',
	];

	static flags = {
		...BaseForgingCommand.flags,
		'use-status-values': flagParser.boolean({
			description: 'Use delegates forging status values',
		}),
		yes: flagParser.boolean({
			char: 'y',
			description: 'Do you want to use these values to enable forging',
			default: false,
		}),
	};

	static args = [
		...BaseForgingCommand.args,
		{
			name: 'height',
			description: 'Last forged block height.',
		},
		{
			name: 'maxHeightPreviouslyForged',
			description: 'Delegates largest previously forged height.',
		},
		{
			name: 'maxHeightPrevoted',
			description: 'Delegates largest prevoted height for a block.',
		},
	];

	async init(): Promise<void> {
		await super.init();
		this.forging = true;
	}
}

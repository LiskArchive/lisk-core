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
import BaseIPCCommand from '../../base_ipc';

export default class StatusCommand extends BaseIPCCommand {
	static description = 'Get forging information for the locally running node.';

	static examples = ['forging:status', 'forging:status --data-path ./sample --pretty'];

	static flags = {
		...BaseIPCCommand.flags,
	};

	async run(): Promise<void> {
		if (!this._client) {
			this.error('APIClient is not initialized.');
		}
		const info = await this._client.invoke('app:getForgingStatus');
		this.printJSON(info);
	}
}

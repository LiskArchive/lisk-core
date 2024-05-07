/*
 * Copyright © 2024 Lisk Foundation
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

import { BasePlugin, PluginInitContext, apiClient } from 'lisk-sdk';

export class ShutdownNodePlugin extends BasePlugin<void> {
	private _shutdownHeight!: number;
	private _roundLength!: number;
	private _currentChainApiClient!: apiClient.APIClient;

	public get nodeModulePath(): string {
		return __filename;
	}

	public async init(context: PluginInitContext): Promise<void> {
		await super.init(context);
	}

	public async load(): Promise<void> {
		this._shutdownHeight = this.appConfig.system.backup.height;

		// No activity needs to be performed when snapshot isn't enabled
		if (this._shutdownHeight === 0) return;

		this._currentChainApiClient = this.apiClient;
		const posConstants = await this._currentChainApiClient.invoke<{
			numberActiveValidators: number;
			numberStandbyValidators: number;
		}>('pos_getConstants');
		this._roundLength = posConstants.numberActiveValidators + posConstants.numberStandbyValidators;

		// Register the callback for the newBlock events
		this._currentChainApiClient.subscribe('network_newBlock', async () => this._newBlockHandler());
		this._currentChainApiClient.subscribe('chain_newBlock', async () => this._newBlockHandler());
	}

	public async unload(): Promise<void> {
		if (this._currentChainApiClient) {
			await this._currentChainApiClient.disconnect();
		}
	}

	private async _newBlockHandler() {
		const nodeInfo = await this._currentChainApiClient.invoke<{
			height: number;
			finalizedHeight: number;
		}>('system_getNodeInfo');

		const bufferLength = this._roundLength;
		if (nodeInfo.finalizedHeight >= this._shutdownHeight + bufferLength) {
			const errorMsg = `Triggering node shutdown from Shutdown plugin: current height: ${nodeInfo.height}; reason: `.concat(
				nodeInfo.finalizedHeight === this._shutdownHeight + bufferLength
					? `finalized height ${nodeInfo.finalizedHeight} is equal to the given shutdown height ${nodeInfo.finalizedHeight}`
					: `finalized height ${
							nodeInfo.finalizedHeight
					  } is greater than the given shutdown height ${this._shutdownHeight + bufferLength}`,
			);

			throw new Error(
				`${errorMsg}`.concat(
					bufferLength
						? ` (snapshot height: ${this._shutdownHeight} + buffer: ${bufferLength})`
						: '',
				),
			);
		}
	}
}

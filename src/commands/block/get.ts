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
import { flags as flagParser } from '@oclif/command';
import BaseIPCCommand from '../../base_ipc';

export default class GetCommand extends BaseIPCCommand {
  static description = 'Gets block information for a given block id or height from the blockchain';

  static examples = [
    'block:get --id 4ILnnQEBZjLEUcnfknbkhst/Rg3Hk/9bENj3HuzsKLQ=',
  ];

  static flags = {
    ...BaseIPCCommand.flags,
    'id': flagParser.string({
      description: 'Block id in base64 format',
    }),
    'height': flagParser.string({
      description: 'Height of the block in integer',
    }),
	};

  async run(): Promise<void> {
    const { flags } = this.parse(GetCommand);
    const { id: blockId, height } = flags;

    if (!blockId && !height) {
      throw new Error('Please provide id or height of the block to be fetched');
    }
    let block;
    try {
      if (blockId) {
        block = await this._channel.invoke<string>('app:getBlockByID', { id: blockId });

      } else if (height) {
        block = await this._channel.invoke<string>('app:getBlockByHeight', { height: parseInt(height as string, 10) });

      }
      this.printJSON(this._codec.decodeBlock(block));
    } catch (errors) {
      const errorMessage = Array.isArray(errors)
        ? errors.map(err => (err as Error).message).join(',')
        : errors;

      if (/^Specified key block:id:(.*)does not exist/.test((errors as Error).message)) {
        this.error(`Block with id '${blockId}' was not found`);
      } else {
        this.error(errorMessage);
      }
    }
  }
}

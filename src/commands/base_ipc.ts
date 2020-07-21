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

import { Command, flags as flagParser } from '@oclif/command';
import { IPCChannel } from 'lisk-sdk';
import { splitPath, getDefaultPath, getSocketsPath } from '../utils/path';

interface BaseIPCFlags {
  readonly 'data-path'?: string;
}

export default abstract class BaseIPCCommand extends Command {
  static flags = {
    'data-path': flagParser.string({
      char: 'd',
      description: 'Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH" can also be used.',
      env: 'LISK_DATA_PATH',
    }),
  };

  public channel!: IPCChannel;
  public baseIPCFlags: BaseIPCFlags = {};

  // eslint-disable-next-line @typescript-eslint/require-await
  async finally(error?: Error | string): Promise<void> {
    if (error) {
      this.error(error instanceof Error ? error.message : error);
    }
    this.channel.cleanup();
  }

  async init(): Promise<void> {
    // Typing problem where constructor is not allow as Input<any> but it requires to be the type
    const { flags } = this.parse(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.constructor as unknown) as flagParser.Input<any>,
    );
    this.baseIPCFlags = flags as BaseIPCFlags;

    const dataPath = this.baseIPCFlags['data-path'] ? this.baseIPCFlags['data-path'] : getDefaultPath();

    await this._createIPCChannel(dataPath);
  }

  private async _createIPCChannel(dataPath: string): Promise<void> {
    const { rootPath, label } = splitPath(dataPath);

    this.channel = new IPCChannel('CoreCLI', [], {}, {
      socketsPath: getSocketsPath(rootPath, label),
    });

    await this.channel.startAndListen();
  }
}

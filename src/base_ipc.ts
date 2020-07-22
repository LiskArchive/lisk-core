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
import { codec, Schema } from '@liskhq/lisk-codec';
import { hash } from '@liskhq/lisk-cryptography';
import { IPCChannel } from 'lisk-sdk';
import { splitPath, getDefaultPath, getSocketsPath } from './utils/path';

interface BaseIPCFlags {
  readonly 'data-path'?: string;
}

interface CodecSchema {
  account: Schema;
  blockSchema: Schema;
  blockHeaderSchema: Schema;
  blockHeadersAssets: {
    [key: number]: Schema;
  };
  baseTransaction: Schema;
  transactionsAssets: {
    [key: number]: Schema;
  };
}

interface Codec {
  decodeAccount: (data: Buffer | string) => object;
  decodeBlock: (data: Buffer | string) => object;
  decodeTransaction: (data: Buffer | string) => object;
}

const convertStrToBuffer = (data: Buffer | string) => Buffer.isBuffer(data) ? data : Buffer.from(data, 'base64');

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
  public schema!: CodecSchema;
  public codec!: Codec;

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
    await this._setAppSchema();
    this._setCodec();
  }

  private async _createIPCChannel(dataPath: string): Promise<void> {
    const { rootPath, label } = splitPath(dataPath);

    this.channel = new IPCChannel('CoreCLI', [], {}, {
      socketsPath: getSocketsPath(rootPath, label),
    });

    await this.channel.startAndListen();
  }

  private async _setAppSchema(): Promise<void> {
    this.schema = await this.channel.invoke('app:getSchema');
  }

  private _setCodec(): void {
    this.codec = {
      decodeAccount: (data: Buffer | string) => codec.decodeJSON(this.schema.account, convertStrToBuffer(data)),
      decodeBlock: (data: Buffer | string) => {
        const blockBuffer: Buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'base64');
        const {
          blockSchema,
          blockHeaderSchema,
          blockHeadersAssets,
        } = this.schema;
        const { header, payload }: {
          header: Buffer;
          payload: ReadonlyArray<Buffer>;
        } = codec.decodeJSON(blockSchema, blockBuffer);

        const baseHeaderJSON: { asset: string, version: string } = codec.decodeJSON(blockHeaderSchema, header);
        const blockAssetJSON: object = codec.decodeJSON(
          blockHeadersAssets[baseHeaderJSON.version],
          Buffer.from(baseHeaderJSON.asset, 'base64'),
        );
        const payloadJSON = payload.map(transactionBuffer =>
          this.codec.decodeTransaction(transactionBuffer),
        );

        const blockId = hash(header);

        return {
          header: { ...baseHeaderJSON, asset: { ...blockAssetJSON }, id: blockId.toString('base64') },
          payload: payloadJSON,
        };
      },
      decodeTransaction: (data: Buffer | string) => {
        const transactionBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'base64');
        const baseTransaction: { type: number; asset: string } = codec.decodeJSON(this.schema.baseTransaction, transactionBuffer);
        const transactionTypeAssetSchema = this.schema.transactionsAssets[baseTransaction.type];
        const transactionAsset = codec.decodeJSON<object>(
          transactionTypeAssetSchema,
          Buffer.from(baseTransaction.asset, 'base64'),
        );

        return {
          ...baseTransaction,
          id: hash(transactionBuffer).toString('base64'),
          asset: transactionAsset,
        };
      },
    }
  }
}

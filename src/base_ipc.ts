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
import { codec, cryptography, IPCChannel } from 'lisk-sdk';
import { getDefaultPath, getSocketsPath, splitPath } from './utils/path';
import { flags as commonFlags } from './utils/flags';

interface BaseIPCFlags {
  readonly pretty?: boolean;
  readonly 'data-path'?: string;
}

interface Schema {
  readonly $id: string;
  readonly type: string;
  readonly properties: object;
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

const prettyDescription =
  'Prints JSON in pretty format rather than condensed.';

const convertStrToBuffer = (data: Buffer | string) => Buffer.isBuffer(data) ? data : Buffer.from(data, 'base64');

export default abstract class BaseIPCCommand extends Command {
  static flags = {
    pretty: flagParser.boolean({
      description: prettyDescription,
      allowNo: true,
    }),
    'data-path': flagParser.string({
      ...commonFlags.dataPath,
      env: 'LISK_DATA_PATH',
    }),
  };

  public baseIPCFlags: BaseIPCFlags = {};
  protected _codec!: Codec;
  protected _channel!: IPCChannel;
  protected _schema!: CodecSchema;

  // eslint-disable-next-line @typescript-eslint/require-await
  async finally(error?: Error | string): Promise<void> {
    if (error) {
      if (/^IPC Socket client connection timeout./.test((error as Error).message)) {
        this.error('Please ensure the core server is up and running before using the command!');
      }
      this.error(error instanceof Error ? error.message : error);
    }
    this._channel.cleanup();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  printJSON(message?: string | object): void {
    if (this.baseIPCFlags.pretty) {
      this.log(JSON.stringify(message, undefined, '  '));
    } else {
      this.log(JSON.stringify(message));
    }
  }

  private async _createIPCChannel(dataPath: string): Promise<void> {
    const { rootPath, label } = splitPath(dataPath);

    this._channel = new IPCChannel('CoreCLI', [], {}, {
      socketsPath: getSocketsPath(rootPath, label),
    });

    await this._channel.startAndListen();
  }

  private async _setAppSchema(): Promise<void> {
    this._schema = await this._channel.invoke('app:getSchema');
  }

  private _setCodec(): void {
    this._codec = {
      decodeAccount: (data: Buffer | string) => codec.decodeJSON(this._schema.account, convertStrToBuffer(data)),
      decodeBlock: (data: Buffer | string) => {
        const blockBuffer: Buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'base64');
        const {
          blockSchema,
          blockHeaderSchema,
          blockHeadersAssets,
        } = this._schema;
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
          this._codec.decodeTransaction(transactionBuffer),
        );

        const blockId = cryptography.hash(header);

        return {
          header: { ...baseHeaderJSON, asset: { ...blockAssetJSON }, id: blockId.toString('base64') },
          payload: payloadJSON,
        };
      },
      decodeTransaction: (data: Buffer | string) => {
        const transactionBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'base64');
        const baseTransaction: { type: number; asset: string } = codec.decodeJSON(this._schema.baseTransaction, transactionBuffer);
        const transactionTypeAssetSchema = this._schema.transactionsAssets[baseTransaction.type];
        const transactionAsset = codec.decodeJSON<object>(
          transactionTypeAssetSchema,
          Buffer.from(baseTransaction.asset, 'base64'),
        );

        return {
          ...baseTransaction,
          id: cryptography.hash(transactionBuffer).toString('base64'),
          asset: transactionAsset,
        };
      },
    }
  }
}

`lisk-core node`
================

Commands relating to Lisk Core node.

* [`lisk-core node:info`](#lisk-core-nodeinfo)
* [`lisk-core node:metadata`](#lisk-core-nodemetadata)

## `lisk-core node:info`

Get node information from a running application.

```
USAGE
  $ lisk-core node:info

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  system:node-info
  system:node-info --data-path ./lisk
```

_See code: [dist/commands/node/info.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-alpha.14/dist/commands/node/info.ts)_

## `lisk-core node:metadata`

Get node metadata from a running application.

```
USAGE
  $ lisk-core node:metadata

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  system:metadata
  system:metadata --data-path ./lisk
```

_See code: [dist/commands/node/metadata.ts](https://github.com/LiskHQ/lisk-core/blob/v4.0.0-alpha.14/dist/commands/node/metadata.ts)_

# `lisk-core block`

Commands relating to Lisk Core blocks.

- [`lisk-core block:get ARG`](#lisk-core-blockget-arg)

## `lisk-core block:get ARG`

Gets block information for a given block id or height from the blockchain

```
USAGE
  $ lisk-core block:get ARG

ARGUMENTS
  ARG  Height in number or block id in hex format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  block:get e082e79d01016632c451c9df9276e486cb7f460dc793ff5b10d8f71eecec28b4
  block:get 2
```

_See code: [dist/commands/block/get.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/block/get.ts)_

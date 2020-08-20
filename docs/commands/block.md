# `core block`

Gets block information for a given block id or height from the blockchain

- [`core block:get ARG`](#core-blockget-arg)

## `core block:get ARG`

Gets block information for a given block id or height from the blockchain

```
USAGE
  $ core block:get ARG

ARGUMENTS
  ARG  Height in number or block id in base64 format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  block:get 4ILnnQEBZjLEUcnfknbkhst/Rg3Hk/9bENj3HuzsKLQ=
  block:get 2
```

_See code: [dist/commands/block/get.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/block/get.ts)_

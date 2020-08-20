# `core account`

Gets account information for a given address from the blockchain

- [`core account:get ADDRESS`](#core-accountget-address)

## `core account:get ADDRESS`

Gets account information for a given address from the blockchain

```
USAGE
  $ core account:get ADDRESS

ARGUMENTS
  ADDRESS  Address of an account in a base32 format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLE
  account:get qwBBp9P3ssKQtbg01Gvce364WBU=
```

_See code: [dist/commands/account/get.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/account/get.ts)_

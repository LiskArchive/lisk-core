# `lisk-core account`

Gets account information for a given address from the blockchain

- [`lisk-core account:get ADDRESS`](#lisk-core-accountget-address)

## `lisk-core account:get ADDRESS`

Gets account information for a given address from the blockchain

```
USAGE
  $ lisk-core account:get ADDRESS

ARGUMENTS
  ADDRESS  Address of an account in a hex format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLE
  account:get ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815
```

_See code: [dist/commands/account/get.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/account/get.ts)_

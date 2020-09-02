# `lisk-core forging`

Disable forging for given delegate address

- [`lisk-core forging:disable ADDRESS`](#lisk-core-forgingdisable-address)
- [`lisk-core forging:enable ADDRESS`](#lisk-core-forgingenable-address)

## `lisk-core forging:disable ADDRESS`

Disable forging for given delegate address

```
USAGE
  $ lisk-core forging:disable ADDRESS

ARGUMENTS
  ADDRESS  Address of an account in a base32 format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -w, --password=password    Specifies a source for your secret password. Command will prompt you for input if this
                             option is not set.
                             Examples:
                             - --password=pass:password123 (should only be used where security is not important)

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  forging:disable address
  forging:disable address --data-path ./data
  forging:disable address --data-path ./data --password your_password
```

_See code: [dist/commands/forging/disable.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/forging/disable.ts)_

## `lisk-core forging:enable ADDRESS`

Enable forging for given delegate address

```
USAGE
  $ lisk-core forging:enable ADDRESS

ARGUMENTS
  ADDRESS  Address of an account in a base32 format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -w, --password=password    Specifies a source for your secret password. Command will prompt you for input if this
                             option is not set.
                             Examples:
                             - --password=pass:password123 (should only be used where security is not important)

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  forging:enable address
  forging:enable address --data-path ./data
  forging:enable address --data-path ./data --password your_password
```

_See code: [dist/commands/forging/enable.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/forging/enable.ts)_

# `lisk-core forging`

Commands relating to Lisk Core forging.

- [`lisk-core forging:disable ADDRESS`](#lisk-core-forgingdisable-address)
- [`lisk-core forging:enable ADDRESS HEIGHT MAXHEIGHTPREVIOUSLYFORGED MAXHEIGHTPREVOTED`](#lisk-core-forgingenable-address-height-maxheightpreviouslyforged-maxheightprevoted)

## `lisk-core forging:disable ADDRESS`

Disable forging for given delegate address.

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

  --overwrite                Overwrites the forger info

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815
  forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --data-path ./data
  forging:disable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 --data-path ./data --password your_password
```

_See code: [dist/commands/forging/disable.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-beta.2.5/dist/commands/forging/disable.ts)_

## `lisk-core forging:enable ADDRESS HEIGHT MAXHEIGHTPREVIOUSLYFORGED MAXHEIGHTPREVOTED`

Enable forging for given delegate address.

```
USAGE
  $ lisk-core forging:enable ADDRESS HEIGHT MAXHEIGHTPREVIOUSLYFORGED MAXHEIGHTPREVOTED

ARGUMENTS
  ADDRESS                    Address of an account in a base32 format.
  HEIGHT                     Last forged block height.
  MAXHEIGHTPREVIOUSLYFORGED  Delegates largest previously forged height.
  MAXHEIGHTPREVOTED          Delegates largest prevoted height for a block.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -w, --password=password    Specifies a source for your secret password. Command will prompt you for input if this
                             option is not set.
                             Examples:
                             - --password=pass:password123 (should only be used where security is not important)

  --overwrite                Overwrites the forger info

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10
  forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --overwrite
  forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --data-path ./data
  forging:enable ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815 100 100 10 --data-path ./data --password your_password
```

_See code: [dist/commands/forging/enable.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-beta.2.5/dist/commands/forging/enable.ts)_

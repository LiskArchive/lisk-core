# `lisk-core account`

Commands relating to Lisk Core accounts.

- [`lisk-core account:create`](#lisk-core-accountcreate)
- [`lisk-core account:get ADDRESS`](#lisk-core-accountget-address)
- [`lisk-core account:show`](#lisk-core-accountshow)
- [`lisk-core account:validate ADDRESS`](#lisk-core-accountvalidate-address)

## `lisk-core account:create`

Returns a randomly-generated mnemonic passphrase with its corresponding public/private key pair and Lisk address.

```
USAGE
  $ lisk-core account:create

OPTIONS
  -n, --number=number  [default: 1] Number of accounts to create.

DESCRIPTION
  Returns a randomly-generated mnemonic passphrase with its corresponding public/private key pair and Lisk address.

EXAMPLES
  account:create
  account:create --number=3
```

_See code: [dist/commands/account/create.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/account/create.ts)_

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

## `lisk-core account:show`

Shows account information for a given passphrase.

```
USAGE
  $ lisk-core account:show

OPTIONS
  -p, --passphrase=passphrase  Specifies a source for your secret passphrase. Command will prompt you for input if this
                               option is not set.
                               Examples:
                               - --passphrase='my secret passphrase' (should only be used where security is not
                               important)

DESCRIPTION
  Shows account information for a given passphrase.

EXAMPLE
  account:show
```

_See code: [dist/commands/account/show.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/account/show.ts)_

## `lisk-core account:validate ADDRESS`

Validates base32 address.

```
USAGE
  $ lisk-core account:validate ADDRESS

ARGUMENTS
  ADDRESS  Address in base32 format to validate.

OPTIONS
  -p, --passphrase=passphrase  Specifies a source for your secret passphrase. Command will prompt you for input if this
                               option is not set.
                               Examples:
                               - --passphrase='my secret passphrase' (should only be used where security is not
                               important)

DESCRIPTION
  Validates base32 address.

EXAMPLE
  account:validate
```

_See code: [dist/commands/account/validate.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/account/validate.ts)_

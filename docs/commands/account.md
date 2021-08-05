# `lisk-core account`

Commands relating to Lisk Core accounts.

- [`lisk-core account:create`](#lisk-core-accountcreate)
- [`lisk-core account:get ADDRESS`](#lisk-core-accountget-address)
- [`lisk-core account:show`](#lisk-core-accountshow)
- [`lisk-core account:validate ADDRESS`](#lisk-core-accountvalidate-address)

## `lisk-core account:create`

Return randomly-generated mnemonic passphrase with its corresponding public/private key pair and Lisk address.

```
USAGE
  $ lisk-core account:create

OPTIONS
  -c, --count=count  [default: 1] Number of accounts to create.

EXAMPLES
  account:create
  account:create --count=3
```

_See code: [dist/commands/account/create.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/account/create.ts)_

## `lisk-core account:get ADDRESS`

Get account information for a given address.

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

_See code: [dist/commands/account/get.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/account/get.ts)_

## `lisk-core account:show`

Show account information for a given passphrase.

```
USAGE
  $ lisk-core account:show

OPTIONS
  -p, --passphrase=passphrase  Specifies a source for your secret passphrase. Command will prompt you for input if this
                               option is not set.
                               Examples:
                               - --passphrase='my secret passphrase' (should only be used where security is not
                               important)

EXAMPLE
  account:show
```

_See code: [dist/commands/account/show.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/account/show.ts)_

## `lisk-core account:validate ADDRESS`

Validate base32 address.

```
USAGE
  $ lisk-core account:validate ADDRESS

ARGUMENTS
  ADDRESS  Address in base32 format to validate.

EXAMPLE
  account:validate lskoaknq582o6fw7sp82bm2hnj7pzp47mpmbmux2g
```

_See code: [dist/commands/account/validate.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/account/validate.ts)_

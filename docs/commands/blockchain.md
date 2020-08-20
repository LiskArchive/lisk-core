# `core blockchain`

Download blockchain data from a provided snapshot.

- [`core blockchain:download`](#core-blockchaindownload)
- [`core blockchain:export`](#core-blockchainexport)
- [`core blockchain:hash`](#core-blockchainhash)
- [`core blockchain:import FILEPATH`](#core-blockchainimport-filepath)
- [`core blockchain:reset`](#core-blockchainreset)

## `core blockchain:download`

Download blockchain data from a provided snapshot.

```
USAGE
  $ core blockchain:download

OPTIONS
  -n, --network=network  [default: mainnet] Default network config to use. Environment variable "LISK_NETWORK" can also
                         be used.

  -o, --output=output    Directory path to specify where snapshot is downloaded. Environment variable "LISK_DATA_PATH"
                         can also be used.

  -u, --url=url          The url to the snapshot.

EXAMPLES
  download
  download --network betanet
  download --url https://downloads.lisk.io/lisk/mainnet/blockchain.db.gz --output ./downloads
```

_See code: [dist/commands/blockchain/download.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/blockchain/download.ts)_

## `core blockchain:export`

Export blockchain data for given data path

```
USAGE
  $ core blockchain:export

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -o, --output=output        The output directory. Default will set to current working directory.

EXAMPLES
  blockchain:export
  blockchain:export --data-path ./data --output ./my/path/
```

_See code: [dist/commands/blockchain/export.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/blockchain/export.ts)_

## `core blockchain:hash`

Generate hash for blockchain data for given data path

```
USAGE
  $ core blockchain:hash

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

EXAMPLES
  blockchain:hash
  blockchain:hash --data-path ./data
```

_See code: [dist/commands/blockchain/hash.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/blockchain/hash.ts)_

## `core blockchain:import FILEPATH`

Import blockchain data for given data path

```
USAGE
  $ core blockchain:import FILEPATH

ARGUMENTS
  FILEPATH  Path to the gzipped blockchain data.

OPTIONS
  -d, --data-path=data-path  Specifies which data path the application should use. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -f, --force                Delete and overwrite existing blockchain data

EXAMPLES
  blockchain:import ./path/to/blockchain.db.gz
  blockchain:import ./path/to/blockchain.db.gz --data-path ./lisk/
```

_See code: [dist/commands/blockchain/import.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/blockchain/import.ts)_

## `core blockchain:reset`

Resets the blockchain data.

```
USAGE
  $ core blockchain:reset

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -y, --yes                  Skip confirmation prompt.

EXAMPLES
  blockchain:reset
  blockchain:reset --data-path ./lisk
  blockchain:reset --yes
```

_See code: [dist/commands/blockchain/reset.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/blockchain/reset.ts)_

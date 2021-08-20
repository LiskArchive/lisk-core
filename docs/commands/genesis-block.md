# `lisk-core genesis-block`

Download genesis block.

- [`lisk-core genesis-block:download`](#lisk-core-genesis-blockdownload)

## `lisk-core genesis-block:download`

Download genesis block.

```
USAGE
  $ lisk-core genesis-block:download

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -f, --force                Delete and overwrite existing blockchain data

  -n, --network=network      Default network config to use. Environment variable "LISK_NETWORK" can also be used.

  -u, --url=url              The url to the genesis block.

EXAMPLES
  genesis-block:download --network mainnet -f
  genesis-block:download --network --data-path ./lisk/
  genesis-block:download --url http://mydomain.com/genesis_block.json.gz --data-path ./lisk/ --force
```

_See code: [dist/commands/genesis-block/download.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/genesis-block/download.ts)_

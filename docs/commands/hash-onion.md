# `core hash-onion`

Creates hash onion output to be used by forger.

- [`core hash-onion`](#core-hash-onion)

## `core hash-onion`

Creates hash onion output to be used by forger.

```
USAGE
  $ core hash-onion

OPTIONS
  -c, --count=count        [default: 1000000] Total number of hashes to produce
  -d, --distance=distance  [default: 1000] Distance between each hashes
  -o, --output=output      Output file path

DESCRIPTION
  Creates hash onion output to be used by forger.

EXAMPLE
  hash-onion --count=1000000 --distance=2000
```

_See code: [dist/commands/hash-onion.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/hash-onion.ts)_

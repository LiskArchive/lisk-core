# `lisk-core transaction`

Creates a transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!

- [`lisk-core transaction:create NETWORKIDENTIFIER FEE NONCE MODULEID ASSETID`](#lisk-core-transactioncreate-networkidentifier-fee-nonce-moduleid-assetid)
- [`lisk-core transaction:get ID`](#lisk-core-transactionget-id)
- [`lisk-core transaction:send TRANSACTION`](#lisk-core-transactionsend-transaction)
- [`lisk-core transaction:sign NETWORKIDENTIFIER TRANSACTION`](#lisk-core-transactionsign-networkidentifier-transaction)

## `lisk-core transaction:create NETWORKIDENTIFIER FEE NONCE MODULEID ASSETID`

Creates a transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!

```
USAGE
  $ lisk-core transaction:create NETWORKIDENTIFIER FEE NONCE MODULEID ASSETID

ARGUMENTS
  NETWORKIDENTIFIER  Network identifier defined for the network or main | test for the Lisk Network.
  FEE                Transaction fee in Beddows.
  NONCE              Nonce of the transaction.
  MODULEID           Register transaction module id.
  ASSETID            Register transaction asset id.

OPTIONS
  -a, --asset=asset                        Creates transaction with specific asset information

  -d, --data-path=data-path                Directory path to specify where node data is stored. Environment variable
                                           "LISK_DATA_PATH" can also be used.

  -j, --json                               Print the transaction in JSON format

  -p, --passphrase=passphrase              Specifies a source for your secret passphrase. Command will prompt you for
                                           input if this option is not set.
                                           Examples:
                                           - --passphrase='my secret passphrase' (should only be used where security is
                                           not important)

  -s, --sender-publickey=sender-publickey  Creates the transaction with provided sender publickey, when passphrase is
                                           not provided

  --no-signature                           Creates the transaction without a signature. Your passphrase will therefore
                                           not be required

  --pretty                                 Prints JSON in pretty format rather than condensed.

EXAMPLES
  transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 2 0
  --asset='{"amount":100000000,"recipientAddress":"ab0041a7d3f7b2c290b5b834d46bdc7b7eb85815","data":"send token"}'
  transaction:create 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3 100000000 2 2 0
```

_See code: [dist/commands/transaction/create.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/transaction/create.ts)_

## `lisk-core transaction:get ID`

Returns a transaction information for a given transaction ID from the blockchain

```
USAGE
  $ lisk-core transaction:get ID

ARGUMENTS
  ID  Transaction ID in hex format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLE
  transaction:get eab06c6a22e88bca7150e0347a7d976acd070cb9284423e6eabecd657acc1263
```

_See code: [dist/commands/transaction/get.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/transaction/get.ts)_

## `lisk-core transaction:send TRANSACTION`

Send a transaction to the local node.

```
USAGE
  $ lisk-core transaction:send TRANSACTION

ARGUMENTS
  TRANSACTION  A transaction to be sent to the node encoded as hex string

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLE
  transaction:send
  080810011880cab5ee012220fd061b9146691f3c56504be051175d5b76d1b1d0179c5c4370e18534c58821222a2408641214ab0041a7d3f7b2c290
  b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e324028edd3601cdc35a41bb23415a0d9f3c3e9cf188d9971adf18742cea39d58aa84809a
  a87bcfe6feaac46211c80472ad9297fd87727709f5d7e7b4134caf106b02
```

_See code: [dist/commands/transaction/send.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/transaction/send.ts)_

## `lisk-core transaction:sign NETWORKIDENTIFIER TRANSACTION`

Sign an encoded transaction.

```
USAGE
  $ lisk-core transaction:sign NETWORKIDENTIFIER TRANSACTION

ARGUMENTS
  NETWORKIDENTIFIER  Network identifier defined for a network(mainnet | testnet).
  TRANSACTION        The transaction to be signed encoded as hex string

OPTIONS
  -d, --data-path=data-path        Directory path to specify where node data is stored. Environment variable
                                   "LISK_DATA_PATH" can also be used.

  -j, --json                       Print the transaction in JSON format.

  -p, --passphrase=passphrase      Specifies a source for your secret passphrase. Command will prompt you for input if
                                   this option is not set.
                                   Examples:
                                   - --passphrase='my secret passphrase' (should only be used where security is not
                                   important)

  --include-sender-signature       Include sender signature in transaction.

  --mandatory-keys=mandatory-keys  Mandatory publicKey string in hex format.

  --optional-keys=optional-keys    Optional publicKey string in hex format.

  --pretty                         Prints JSON in pretty format rather than condensed.

EXAMPLE
  transaction:sign 873da85a2cee70da631d90b0f17fada8c3ac9b83b2613f4ca5fddd374d1034b3
  0802100018022080c2d72f2a200fe9a3f1a21b5530f27f87a414b549e79a940bf24fdf2b2f05e7f22aeeecc86a32270880c2d72f1214ab0041a7d3
  f7b2c290b5b834d46bdc7b7eb858151a0a73656e6420746f6b656e3a406b600b635b0d85c3bff1e59b1620e1083807fde4cd26545a5d18d2a81fce
  f7a07bf5ec079d090630bb8ba347d5d82bf426cbffaaa8b5404f1190a7676c8bd406
```

_See code: [dist/commands/transaction/sign.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.2/dist/commands/transaction/sign.ts)_

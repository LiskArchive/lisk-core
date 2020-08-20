# `core transaction`

Creates a transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!

- [`core transaction:create NETWORKIDENTIFIER FEE NONCE MODULEID ASSETID`](#core-transactioncreate-networkidentifier-fee-nonce-moduleid-assetid)
- [`core transaction:get ID`](#core-transactionget-id)
- [`core transaction:send TRANSACTION`](#core-transactionsend-transaction)
- [`core transaction:sign NETWORKIDENTIFIER TRANSACTION`](#core-transactionsign-networkidentifier-transaction)

## `core transaction:create NETWORKIDENTIFIER FEE NONCE MODULEID ASSETID`

Creates a transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!

```
USAGE
  $ core transaction:create NETWORKIDENTIFIER FEE NONCE MODULEID ASSETID

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
  transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2 0
  --asset='{"amount":100000000,"recipientAddress":"qwBBp9P3ssKQtbg01Gvce364WBU=","data":"send token"}'
  transaction:create hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM= 100000000 2 2 0
```

_See code: [dist/commands/transaction/create.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/transaction/create.ts)_

## `core transaction:get ID`

Returns a transaction information for a given transaction Id from the blockchain

```
USAGE
  $ core transaction:get ID

ARGUMENTS
  ID  Transaction Id in base64 format.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLE
  transaction:get 6rBsaiLoi8pxUOA0en2Xas0HDLkoRCPm6r7NZXrMEmM=
```

_See code: [dist/commands/transaction/get.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/transaction/get.ts)_

## `core transaction:send TRANSACTION`

Send a transaction to the local node.

```
USAGE
  $ core transaction:send TRANSACTION

ARGUMENTS
  TRANSACTION  The transaction to be sent to the node encoded as base64 string

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLE
  transaction:send
  CAgQARiAyrXuASIg/QYbkUZpHzxWUEvgURddW3bRsdAXnFxDcOGFNMWIISIqJAhkEhSrAEGn0/eywpC1uDTUa9x7frhYFRoKc2VuZCB0b2tlbjJAKO3TYB
  zcNaQbsjQVoNnzw+nPGI2Zca3xh0LOo51YqoSAmqh7z+b+qsRiEcgEcq2Sl/2HcncJ9dfntBNMrxBrAg==
```

_See code: [dist/commands/transaction/send.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/transaction/send.ts)_

## `core transaction:sign NETWORKIDENTIFIER TRANSACTION`

Sign an encoded transaction.

```
USAGE
  $ core transaction:sign NETWORKIDENTIFIER TRANSACTION

ARGUMENTS
  NETWORKIDENTIFIER  Network identifier defined for a network(mainnet | testnet).
  TRANSACTION        The transaction to be signed encoded as base64 string

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

  --mandatory-keys=mandatory-keys  Mandatory publicKey string in base64 format.

  --optional-keys=optional-keys    Optional publicKey string in base64 format.

  --pretty                         Prints JSON in pretty format rather than condensed.

EXAMPLE
  transaction:sign hz2oWizucNpjHZCw8X+tqMOsm4OyYT9Mpf3dN00QNLM=
  CAIQABgCIIDC1y8qIA/po/GiG1Uw8n+HpBS1SeealAvyT98rLwXn8iru7MhqMicIgMLXLxIUqwBBp9P3ssKQtbg01Gvce364WBUaCnNlbmQgdG9rZW46QG
  tgC2NbDYXDv/HlmxYg4Qg4B/3kzSZUWl0Y0qgfzvege/XsB50JBjC7i6NH1dgr9CbL/6qotUBPEZCnZ2yL1AY=
```

_See code: [dist/commands/transaction/sign.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0-debug.0/dist/commands/transaction/sign.ts)_

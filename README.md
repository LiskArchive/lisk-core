![Logo](./docs/assets/banner_core.png)

# Lisk Core

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/liskHQ/lisk-core)
![GitHub repo size](https://img.shields.io/github/repo-size/liskhq/lisk-core)
[![DeepScan grade](https://deepscan.io/api/teams/6759/projects/8870/branches/113510/badge/grade.svg)](https://deepscan.io/dashboard/#view=project&tid=6759&pid=8870&bid=113510)
![GitHub issues](https://img.shields.io/github/issues-raw/liskhq/lisk-core)
![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/liskhq/lisk-core)

Lisk is a next-generation crypto-currency and decentralized application platform, written entirely in JavaScript. The official documentation about the whole ecosystem can be found in https://lisk.io/documentation.

[Lisk Core](https://lisk.io/documentation/lisk-core) is the program that implements the [Lisk Protocol](https://lisk.io/documentation/lisk-protocol). In other words, Lisk Core is what every machine needs to set-up to run a node that allows for participation in the network.

This document details how to install Lisk Core from source and from npm registry, but there are two other ways to participate in the network: [binaries](https://lisk.io/documentation/lisk-core/setup/pre-install/binary) and [Docker images](https://lisk.io/documentation/lisk-core/setup/pre-install/docker).
If you have satisfied the requirements from the Pre-Installation section, you can jump directly to the next section [Installation Steps](#installation).

## Index

- [Installation](#installation)
- [Managing Lisk Node](#managing-lisk-node)
- [Configuring Lisk Node](#configuring-lisk-node)
- [Tests](#tests)
- [License](#license)

## Installation

### Dependencies

The following dependencies need to be installed in order to run applications created with the Lisk SDK:

| Dependencies | Version |
| ------------ | ------- |
| NodeJS       | 12.18.3 |

You can find further details on installing these dependencies in our [pre-installation setup guide](https://lisk.io/documentation/lisk-core/setup/source#pre-install).
Clone the Lisk Core repository using Git and initialize the modules.

## From Source

```bash
git clone https://github.com/LiskHQ/lisk-core.git
cd lisk-core
git checkout master
npm ci
npm run build
./bin/run --help
```

## From NPM

<!-- usage -->

```sh-session
$ npm install -g lisk-core
$ lisk-core COMMAND
running command...
$ lisk-core (-v|--version|version)
lisk-core/3.0.0-debug.2 darwin-x64 node-v12.18.3
$ lisk-core --help [COMMAND]
USAGE
  $ lisk-core COMMAND
...
```

<!-- usagestop -->

<!-- commands -->

## Command Topics

- [`lisk-core account`](docs/commands/account.md) - Gets account information for a given address from the blockchain
- [`lisk-core block`](docs/commands/block.md) - Gets block information for a given block id or height from the blockchain
- [`lisk-core blockchain`](docs/commands/blockchain.md) - Download blockchain data from a provided snapshot.
- [`lisk-core copyright`](docs/commands/copyright.md) - Displays copyright notice.
- [`lisk-core forger-info`](docs/commands/forger-info.md) - Export forger data to a given data path
- [`lisk-core forging`](docs/commands/forging.md) - Disable forging for given delegate address
- [`lisk-core hash-onion`](docs/commands/hash-onion.md) - Creates hash onion output to be used by forger.
- [`lisk-core help`](docs/commands/help.md) - display help for lisk-core
- [`lisk-core node`](docs/commands/node.md) - Gets node information from a running application
- [`lisk-core passphrase`](docs/commands/passphrase.md) - Decrypts your secret passphrase using the password which was provided at the time of encryption.
- [`lisk-core sdk`](docs/commands/sdk.md) - Link an specific SDK folder given the parameter
- [`lisk-core start`](docs/commands/start.md) - Start Lisk Core Node with given config parameters
- [`lisk-core transaction`](docs/commands/transaction.md) - Creates a transaction which can be broadcasted to the network. Note: fee and amount should be in Beddows!!
- [`lisk-core warranty`](docs/commands/warranty.md) - Displays warranty notice.

<!-- commandsstop -->

## Managing Lisk Node

In order to start a Lisk Core node in a background process, we recommend to use process management tool, such as [PM2](https://pm2.keymetrics.io/).

### Example using PM2

```
npm i -g pm2
pm2 start "lisk-core start" --name lisk-mainnet
pm2 status
pm2 logs lisk-mainnet
```

For a more advanced options refer to [PM2 documentation](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/).

## Configuring Lisk Node

[`lisk-core start`](docs/commands/start.md) supports flag and environment variable options to configure a node.

Also, custom configuration through JSON file is available through the `--config, -c` flag.

### Example

With custom config file `./custom-config.json` below

```
{
  "network": {
    "port": 5000,
  },
  "transactionPool": {
    "maxTransactions": 8096,
    "maxTransactionsPerAccount": 1024,
  },
  "forging": {
    "delegates": [{
      "encryptedPassphrase": "iterations=10&cipherText=0dbd21ac5c154dbb72ce90a4e252a64b692203a4f8e25f8bfa1b1993e2ba7a9bd9e1ef1896d8d584a62daf17a8ccf12b99f29521b92cc98b74434ff501374f7e1c6d8371a6ce4e2d083489&iv=98a89678d1ccd054b85e3b3c&salt=c9cb4e7783cacca6c0e1c210cb9252e1&tag=5c66c5e75a6241538695fb16d8f0cdc9&version=1",
      "hashOnion": {
        "count": 10000,
        "distance": 1000,
        "hashes": [
          "aaf012545a584890a169cf57d8f7e688",
          "f7a3fb976e50d882c709edb63bde4d9c",
          "1bd121882cb1dee1107699001c2676fb",
          "c4ad7d98da02c94ef8bda2f80d35290a",
          "096f0e77f963face5e99b9db460ce45f",
          "de3d0c34bdcbdcfa2b7b1871c99d4948",
          "5deb5e369a98510932835d74768cf86c",
          "c0cd6ce3f75256149c8fe5d0bffdc99a",
          "1a32706893f1523db0c7bb81be5e55ac",
          "7e8f1ea4aa317993152e1a6b55b16f25",
          "5e5100bbd2c2d5e00197d4ec19102dd6"
        ]
      },
      "address": "9cabee3d27426676b852ce6b804cb2fdff7cd0b5"
    }],
  },
  "plugins": {
    "httpApi": {
      "port": 7000,
    },
  },
}
```

Running a command will overwrite the default config and use the specified options.

```bash
lisk-core start -n devnet -c ./custom-config.json
```

For a more detailed understanding of configuration read this [online documentation](https://lisk.io/documentation/lisk-core/user-guide/configuration).

## Tests

### Automated tests

All automated tests will run with the below command.

```
npm test
```

### Running a local development node

In order to run a node for a local test, in a root folder of lisk-core, run below command.

```
./bin/run start -n devnet --data-path ./devnet-data --port 3333 --enable-ipc --enable-http-api --http-api-port 3334 --enable-forger --forger-port 3335
```

This command will start a lisk-core node using data path `./devent-data` with HTTPAPI and Forger Plugins.
Data on the node can be obtained by commands like

```
./bin/run node:info --data-path ./devnet-data
./bin/run block:get 3 --data-path ./devnet-data
```

## Contributors

https://github.com/LiskHQ/lisk-core/graphs/contributors

## License

Copyright 2016-2020 Lisk Foundation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

Copyright © 2016-2020 Lisk Foundation

Copyright © 2015 Crypti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[lisk documentation site]: https://lisk.io/documentation
[lisk sdk github]: https://github.com/LiskHQ/lisk-sdk

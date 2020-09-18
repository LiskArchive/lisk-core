# `lisk-core start`

Start Lisk Core Node.

- [`lisk-core start`](#lisk-core-start)

## `lisk-core start`

Start Lisk Core Node.

```
USAGE
  $ lisk-core start

OPTIONS
  -c, --config=config                                    File path to a custom config. Environment variable
                                                         "LISK_CONFIG_FILE" can also be used.

  -d, --data-path=data-path                              Directory path to specify where node data is stored.
                                                         Environment variable "LISK_DATA_PATH" can also be used.

  -l, --log=trace|debug|info|warn|error|fatal            File log level. Environment variable "LISK_FILE_LOG_LEVEL" can
                                                         also be used.

  -n, --network=network                                  [default: mainnet] Default network config to use. Environment
                                                         variable "LISK_NETWORK" can also be used.

  -p, --port=port                                        Open port for the peer to peer incoming connections.
                                                         Environment variable "LISK_PORT" can also be used.

  --console-log=trace|debug|info|warn|error|fatal        Console log level. Environment variable
                                                         "LISK_CONSOLE_LOG_LEVEL" can also be used.

  --enable-forger-plugin                                 Enable Forger Plugin. Environment variable
                                                         "LISK_ENABLE_FORGER_PLUGIN" can also be used.

  --enable-http-api-plugin                               Enable HTTP API Plugin. Environment variable
                                                         "LISK_ENABLE_HTTP_API_PLUGIN" can also be used.

  --enable-ipc                                           Enable IPC communication.

  --forger-plugin-port=forger-plugin-port                Port to be used for Forger Plugin. Environment variable
                                                         "LISK_FORGER_PLUGIN_PORT" can also be used.

  --forger-plugin-whitelist=forger-plugin-whitelist      List of IPs in comma separated value to allow the connection.
                                                         Environment variable "LISK_FORGER_PLUGIN_WHITELIST" can also be
                                                         used.

  --http-api-plugin-port=http-api-plugin-port            Port to be used for HTTP API Plugin. Environment variable
                                                         "LISK_HTTP_API_PLUGIN_PORT" can also be used.

  --http-api-plugin-whitelist=http-api-plugin-whitelist  List of IPs in comma separated value to allow the connection.
                                                         Environment variable "LISK_HTTP_API_PLUGIN_WHITELIST" can also
                                                         be used.

  --overwrite-config                                     Overwrite network configs if they exist already

  --seed-peers=seed-peers                                Seed peers to initially connect to in format of comma separated
                                                         "ip:port". IP can be DNS name or IPV4 format. Environment
                                                         variable "LISK_SEED_PEERS" can also be used.

EXAMPLES
  start
  start --network dev --data-path ./data --log debug
```

# `lisk-core config`

Commands relating to Lisk Core node configuration.

- [`lisk-core config:show`](#lisk-core-configshow)

## `lisk-core config:show`

Show application config.

```
USAGE
  $ lisk-core config:show

OPTIONS
  -c, --config=config        File path to a custom config. Environment variable "LISK_CONFIG_FILE" can also be used.

  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  --pretty                   Prints JSON in pretty format rather than condensed.

EXAMPLES
  config:show
  config:show --pretty
  config:show --config ./custom-config.json --data-path ./data
```

_See code: [dist/commands/config/show.ts](https://github.com/LiskHQ/lisk-core/blob/v3.0.0/dist/commands/config/show.ts)_

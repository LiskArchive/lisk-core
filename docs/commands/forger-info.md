# `lisk-core forger-info`

Commands relating to Lisk Core forger-info data.

- [`lisk-core forger-info:export`](#lisk-core-forger-infoexport)
- [`lisk-core forger-info:import SOURCEPATH`](#lisk-core-forger-infoimport-sourcepath)

## `lisk-core forger-info:export`

Export to <FILE>.

```
USAGE
  $ lisk-core forger-info:export

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -o, --output=output        The output directory. Default will set to current working directory.

EXAMPLES
  forger-info:export
  forger-info:export --data-path ./data --output ./my/path/
```

## `lisk-core forger-info:import SOURCEPATH`

Import from <FILE>.

```
USAGE
  $ lisk-core forger-info:import SOURCEPATH

ARGUMENTS
  SOURCEPATH  Path to the forger-info zip file that you want to import.

OPTIONS
  -d, --data-path=data-path  Directory path to specify where node data is stored. Environment variable "LISK_DATA_PATH"
                             can also be used.

  -f, --force                To overwrite the existing data if present.

EXAMPLES
  forger-info:import ./my/path
  forger-info:import --data-path ./data --force
```

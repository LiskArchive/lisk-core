#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

cd "$( cd -P -- "$( dirname -- "$0" )" && pwd -P )" || exit 2
# shellcheck source=env.sh
source "$( pwd )/env.sh"  # jq, node, pg_dump

OUTPUT_DIRECTORY="${OUTPUT_DIRECTORY:-$PWD/backups}"
SOURCE_DATABASE=$( node scripts/generate_config.js |jq --raw-output '.components.storage.database' )

mkdir -p "$OUTPUT_DIRECTORY"

function cleanup() {
	rm -f "$TEMP_FILE"
}

TEMP_FILE=$( mktemp --tmpdir="$OUTPUT_DIRECTORY" )
trap cleanup INT QUIT TERM EXIT

OUTPUT_FILE="${OUTPUT_DIRECTORY}/forger_info-$( date +%s ).sql"

pg_dump --no-owner --clean --table=forger_info --file="$TEMP_FILE" "$SOURCE_DATABASE"
mv "$TEMP_FILE" "$OUTPUT_FILE"
echo "Created $OUTPUT_FILE"

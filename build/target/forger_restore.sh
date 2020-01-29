#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

cd "$( cd -P -- "$( dirname -- "$0" )" && pwd -P )" || exit 2
# shellcheck source=env.sh
source "$( pwd )/env.sh"  # jq, node, psql

function usage() {
	echo "Usage: $0 <FILE>"
	exit 1
}

BACKUP_FILE=${1:-}
[ -f "$BACKUP_FILE" ] || usage

TARGET_DATABASE=$( node scripts/generate_config.js |jq --raw-output '.components.storage.database' )

psql --dbname="$TARGET_DATABASE" --file="$BACKUP_FILE" >/dev/null
echo "Restored $BACKUP_FILE"

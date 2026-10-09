#!/usr/bin/env sh
set -eu

if [ "$#" -lt 3 ]; then
  echo "usage: $0 <work-item> <label> <command> [args...]" >&2
  exit 2
fi

work_item="$1"
label="$2"
shift 2

case "$label" in
  *[!a-zA-Z0-9._-]*|"")
    echo "invalid label: use letters, numbers, dot, underscore, or hyphen" >&2
    exit 2
    ;;
esac

dir=".agents/handoffs/$work_item/evidence/command-output"
mkdir -p "$dir"

stamp="$(date '+%Y%m%d-%H%M%S')"
out="$dir/$stamp-$label.txt"

{
  echo "# Command Evidence"
  echo
  echo "Work item: $work_item"
  echo "Label: $label"
  echo "Started: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "Command: $*"
  echo
  echo "## Output"
  echo
} > "$out"

set +e
"$@" >> "$out" 2>&1
status="$?"
set -e

{
  echo
  echo "## Exit status"
  echo "$status"
  echo
  echo "Finished: $(date '+%Y-%m-%d %H:%M:%S %Z')"
} >> "$out"

echo "$out"
exit "$status"


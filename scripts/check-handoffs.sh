#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "usage: $0 <work-item> [full|fast|triage]" >&2
  exit 2
fi

dir=".agents/handoffs/$1"
mode="${2:-full}"
missing=0

case "$mode" in
  full)
    required="01-test-spec.md 02-test-architecture.md 03-automation-implementation.md 04-code-review.md 05-error-analysis.md 06-final-report.md"
    ;;
  fast)
    required="01-test-spec.md 03-automation-implementation.md 04-code-review.md 06-final-report.md"
    ;;
  triage)
    required="05-error-analysis.md 03-automation-implementation.md 04-code-review.md 06-final-report.md"
    ;;
  *)
    echo "invalid mode: $mode" >&2
    exit 2
    ;;
esac

for file in $required; do
  path="$dir/$file"
  if [ ! -s "$path" ]; then
    echo "miss $path"
    missing=1
  elif grep -q "Status: NOT STARTED" "$path"; then
    echo "todo $path"
    missing=1
  else
    echo "ok  $path"
  fi
done

exit "$missing"

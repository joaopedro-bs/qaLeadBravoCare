#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "usage: $0 <work-item> [full|fast|triage]" >&2
  exit 2
fi

work_item="$1"
mode="${2:-full}"
failed=0

run_check() {
  label="$1"
  shift
  echo
  echo "== $label =="
  if "$@"; then
    :
  else
    failed=1
  fi
}

run_check "handoffs" rtk scripts/check-handoffs.sh "$work_item" "$mode"
run_check "review" rtk scripts/check-review.sh "$work_item"
run_check "report" rtk scripts/check-report.sh "$work_item"
run_check "secrets" rtk scripts/check-no-secrets.sh

exit "$failed"


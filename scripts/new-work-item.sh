#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <work-item>" >&2
  exit 2
fi

slug="$1"
case "$slug" in
  *[!a-zA-Z0-9._-]*|"")
    echo "invalid work-item slug: use letters, numbers, dot, underscore, or hyphen" >&2
    exit 2
    ;;
esac

dir=".agents/handoffs/$slug"
mkdir -p "$dir"
mkdir -p \
  "$dir/evidence/command-output" \
  "$dir/evidence/screenshots" \
  "$dir/evidence/api-responses" \
  "$dir/evidence/traces" \
  "$dir/evidence/jmeter" \
  "$dir/evidence/ci" \
  "$dir/evidence/notes"

create_if_missing() {
  file="$1"
  title="$2"
  if [ ! -f "$file" ]; then
    {
      echo "# $title - $slug"
      echo
      echo "Status: NOT STARTED"
      echo
      echo "## Notes"
    } > "$file"
  fi
}

create_if_missing "$dir/01-test-spec.md" "Test Specification"
create_if_missing "$dir/02-test-architecture.md" "Test Architecture"
create_if_missing "$dir/03-automation-implementation.md" "Automation Implementation"
create_if_missing "$dir/04-code-review.md" "Automation Code Review"
create_if_missing "$dir/05-error-analysis.md" "Error Analysis"
create_if_missing "$dir/06-final-report.md" "QA Final Report"

if [ ! -f "$dir/run-log.md" ]; then
  {
    echo "# Workflow Run Log - $slug"
    echo
    echo "## Events"
  } > "$dir/run-log.md"
fi

echo "$dir"

#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <work-item>" >&2
  exit 2
fi

report=".agents/handoffs/$1/06-final-report.md"
failed=0

require_text() {
  pattern="$1"
  label="$2"
  if grep -Eiq "$pattern" "$report"; then
    echo "ok  $label"
  else
    echo "miss $label"
    failed=1
  fi
}

if [ ! -s "$report" ]; then
  echo "miss $report"
  exit 1
fi

require_text "scope|escopo" "scope"
require_text "evidence|evidencia|evidência|validation|validacao|validação" "evidence or validation"
require_text "result|resultado|status" "results"
require_text "risk|risco|limitation|limitacao|limitação" "risks or limitations"
require_text "AI|Claude|Codex|agent" "AI usage disclosure"
require_text "not run|nao execut|não execut|not performed|nao realizado|não realizado" "validation not run"
require_text "PASS|FAIL|INCOMPLETE|RISKS|APROV|REPROV" "final status"

exit "$failed"


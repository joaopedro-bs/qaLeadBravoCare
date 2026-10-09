#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <work-item>" >&2
  exit 2
fi

review=".agents/handoffs/$1/04-code-review.md"
failed=0

require_text() {
  pattern="$1"
  label="$2"
  if grep -Eiq "$pattern" "$review"; then
    echo "ok  $label"
  else
    echo "miss $label"
    failed=1
  fi
}

if [ ! -s "$review" ]; then
  echo "miss $review"
  exit 1
fi

require_text "finding|achado|issue|problema|no issue|sem achado" "findings"
require_text "severity|critical|high|medium|low|P0|P1|P2|P3|severidade" "severity"
require_text "recommend|recomend|fix|corrig" "recommendation"
require_text "APPROVE|CHANGES REQUESTED|BLOCKED|APROV|MUDANC|MUDANÇ|BLOQUE" "verdict"

exit "$failed"


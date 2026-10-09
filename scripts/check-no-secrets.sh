#!/usr/bin/env sh
set -eu

failed=0
targets="."

patterns="(api[_-]?key|secret|password|passwd|pwd|token|authorization|private[_-]?key|aws_access_key_id|aws_secret_access_key)[[:space:]]*[:=][[:space:]]*[\"']?[A-Za-z0-9_./+=-]{12,}|authorization:[[:space:]]*bearer[[:space:]]+[A-Za-z0-9_./+=-]{12,}|BEGIN[[:space:]]+(RSA[[:space:]]+|OPENSSH[[:space:]]+|EC[[:space:]]+|DSA[[:space:]]+)?PRIVATE[[:space:]]+KEY"

if rg -n -i "$patterns" $targets \
  -g '!/.git/**' \
  -g '!node_modules/**' \
  -g '!dist/**' \
  -g '!build/**' \
  -g '!coverage/**' \
  -g '!*.png' \
  -g '!*.jpg' \
  -g '!*.jpeg' \
  -g '!*.gif' \
  -g '!*.pdf'
then
  echo "Potential secret-like content found. Inspect before sharing or committing." >&2
  failed=1
else
  echo "ok  no common secret patterns found"
fi

exit "$failed"

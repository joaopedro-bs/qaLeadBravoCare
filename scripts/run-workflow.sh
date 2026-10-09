#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "usage: $0 <work-item> [full|fast|triage]" >&2
  exit 2
fi

work_item="$1"
mode="${2:-full}"

case "$mode" in
  full|fast|triage) ;;
  *)
    echo "invalid mode: $mode" >&2
    exit 2
    ;;
esac

dir=".agents/handoffs/$work_item"
if [ ! -d "$dir" ]; then
  rtk scripts/new-work-item.sh "$work_item" >/dev/null
fi

log="$dir/run-log.md"
timestamp="$(date '+%Y-%m-%d %H:%M:%S %Z')"

{
  echo
  echo "### $timestamp"
  echo
  echo "- Mode: $mode"
  echo "- Work item: $work_item"
  echo "- Guardrails: .agents/GUARDRAILS.md"
  echo "- Loops: .agents/LOOPS.md"
} >> "$log"

print_prompt() {
  agent="$1"
  text="$2"
  echo
  echo "[$agent]"
  echo "$text"
}

echo "Workflow initialized: $dir"
echo "Run log: $log"
echo
echo "Next prompts:"

case "$mode" in
  full)
    print_prompt "test-specifier" "Use the test-specifier agent for $work_item. Read the assignment and repository, follow .agents/GUARDRAILS.md and .agents/LOOPS.md, then write .agents/handoffs/$work_item/01-test-spec.md."
    print_prompt "test-architect" "Use the test-architect agent for $work_item. Consume 01-test-spec.md, inspect the repo structure, then write .agents/handoffs/$work_item/02-test-architecture.md."
    print_prompt "test-automation-writer" "Use the test-automation-writer agent for $work_item. Consume 01-test-spec.md and 02-test-architecture.md, implement the approved tests, run targeted validation, store evidence, and write .agents/handoffs/$work_item/03-automation-implementation.md."
    print_prompt "automation-reviewer" "Use the automation-reviewer agent for $work_item. Review the diff and handoffs, do not change code, and write .agents/handoffs/$work_item/04-code-review.md."
    print_prompt "error-analyst" "Use the error-analyst agent for $work_item. Analyze execution evidence, classify failures, and write .agents/handoffs/$work_item/05-error-analysis.md."
    print_prompt "qa-report-writer" "Use the qa-report-writer agent for $work_item. Consume all handoffs and evidence, disclose AI usage, and write .agents/handoffs/$work_item/06-final-report.md."
    ;;
  fast)
    print_prompt "test-specifier" "Use the test-specifier agent for $work_item. Create a compact spec and write .agents/handoffs/$work_item/01-test-spec.md."
    print_prompt "test-automation-writer" "Use the test-automation-writer agent for $work_item. Implement the highest-priority scenarios, run targeted validation, store evidence, and write .agents/handoffs/$work_item/03-automation-implementation.md."
    print_prompt "automation-reviewer" "Use the automation-reviewer agent for $work_item. Review the diff quickly for correctness, flakiness, data safety, and missing critical coverage. Write .agents/handoffs/$work_item/04-code-review.md."
    print_prompt "qa-report-writer" "Use the qa-report-writer agent for $work_item. Consume available handoffs and evidence, explicitly list skipped architecture/RCA work, and write .agents/handoffs/$work_item/06-final-report.md."
    ;;
  triage)
    print_prompt "error-analyst" "Use the error-analyst agent for $work_item. Analyze supplied logs/output/screenshots/traces, classify failures, and write .agents/handoffs/$work_item/05-error-analysis.md."
    print_prompt "test-automation-writer" "Use the test-automation-writer agent for $work_item. Consume 05-error-analysis.md, apply the smallest fix when classification points to test/data/setup, validate, store evidence, and write .agents/handoffs/$work_item/03-automation-implementation.md."
    print_prompt "automation-reviewer" "Use the automation-reviewer agent for $work_item. Review the fix and handoffs, then write .agents/handoffs/$work_item/04-code-review.md."
    print_prompt "qa-report-writer" "Use the qa-report-writer agent for $work_item. Summarize RCA, fix, validation, risks, and write .agents/handoffs/$work_item/06-final-report.md."
    ;;
esac


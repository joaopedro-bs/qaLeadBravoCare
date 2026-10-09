# Harness Scripts

The scripts in `scripts/` provide a lightweight operational harness.

## Scripts

- `new-work-item.sh`: creates handoff and evidence folders.
- `run-workflow.sh`: records a workflow run and prints the next agent prompts.
- `check-handoffs.sh`: validates required handoffs for `full`, `fast`, or `triage` mode.
- `check-report.sh`: checks final report completeness.
- `check-review.sh`: checks review completeness.
- `check-no-secrets.sh`: scans local files for common secret patterns.
- `collect-evidence.sh`: runs a command and stores its output under evidence.
- `qa-gate.sh`: runs the local guardrail checks together.

These scripts do not replace agent judgment. They make missing evidence and incomplete handoffs visible.


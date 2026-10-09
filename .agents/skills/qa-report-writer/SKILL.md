---
name: qa-report-writer
description: Produce the final stakeholder-ready QA report from specifications, architecture, implementation, review, and error-analysis handoffs.
---

# QA Report Writer

You write the final concise report for an interviewer, hiring panel, or engineering stakeholder.

## Inputs

- All available handoffs in `.agents/handoffs/<work-item>/`
- Test output, screenshots, API evidence, CI results, review findings, and RCA notes.

## Workflow

1. Read `AGENTS.md`, `.agents/GUARDRAILS.md`, `.agents/AI_OPERATING_MODEL.md`, `.agents/LOOPS.md`, `.agents/WORKFLOW.md`, and all available handoffs.
2. Distill scope, approach, evidence, results, defects, risks, and next steps.
3. Make skipped stages explicit.
4. Use leadership language: tradeoffs, quality gates, risk, ownership, and follow-up.
5. Write `.agents/handoffs/<work-item>/06-final-report.md`.

## Output Contract

```md
# QA Final Report - <work item>

## Executive summary
## Scope tested
## Approach
## Automation delivered
## Validation evidence
## Results
## Defects or risks
## RCA summary
## CI/CD and maintainability notes
## AI-assisted QA usage
## Recommended next steps
## Final status
PASS / PASS WITH RISKS / FAIL / INCOMPLETE
```

Keep the report factual, concise, and ready to paste into the technical test submission.
Apply the reporting loop in `.agents/LOOPS.md`; do not mark `PASS` if validation evidence is missing or blocking review/RCA findings remain open.

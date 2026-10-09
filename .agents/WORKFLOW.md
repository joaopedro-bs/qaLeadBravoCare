# QA Interview Agent Workflow

This workflow coordinates the six specialist agents for a timed QA Lead technical test.

Every agent must read:

- `AGENTS.md`
- `CLAUDE.md` when running in Claude Code
- `.agents/GUARDRAILS.md`
- `.agents/AI_OPERATING_MODEL.md`
- `.agents/LOOPS.md`
- its own `.agents/skills/<agent>/SKILL.md`

## Canonical Order

1. `test-specifier`
2. `test-architect`
3. `test-automation-writer`
4. `automation-reviewer`
5. `error-analyst`
6. `qa-report-writer`

Use one work-item directory per assignment:

```text
.agents/handoffs/<work-item>/
```

## Handoff Files

```text
01-test-spec.md
02-test-architecture.md
03-automation-implementation.md
04-code-review.md
05-error-analysis.md
06-final-report.md
run-log.md
evidence/
```

## Full Flow

Use this when there is enough time to show leadership and architecture depth.

```text
Prompt/task
  -> test-specifier
  -> test-architect
  -> test-automation-writer
  -> automation-reviewer
  -> error-analyst
  -> qa-report-writer
```

## Fast Implementation Flow

Use this when the assignment is mostly coding and time is short.

```text
Prompt/task
  -> test-specifier
  -> test-automation-writer
  -> automation-reviewer
  -> qa-report-writer
```

The report must state that architecture and deep RCA were reduced due to time constraints.

## Failure Triage Flow

Use this when tests or CI already fail.

```text
Evidence/logs
  -> error-analyst
  -> test-automation-writer
  -> automation-reviewer
  -> qa-report-writer
```

## Agent Invocation Examples

```text
Use the test-specifier agent for <work-item>. Read the assignment and repository,
then write .agents/handoffs/<work-item>/01-test-spec.md.
```

```text
Use the test-architect agent for <work-item>. Consume 01-test-spec.md, inspect
the repo structure, and write 02-test-architecture.md.
```

```text
Use the test-automation-writer agent for <work-item>. Consume 01-test-spec.md
and 02-test-architecture.md, implement the approved tests, run targeted
validation, and write 03-automation-implementation.md.
```

```text
Use the automation-reviewer agent for <work-item>. Review the diff and handoffs,
do not change code, and write 04-code-review.md.
```

```text
Use the error-analyst agent for <work-item>. Analyze the supplied execution
evidence and write 05-error-analysis.md.
```

```text
Use the qa-report-writer agent for <work-item>. Consume all available handoffs
and write 06-final-report.md for a technical interviewer/stakeholder.
```

## Automation

Initialize a work item:

```bash
rtk scripts/new-work-item.sh <work-item>
```

Check handoff readiness:

```bash
rtk scripts/check-handoffs.sh <work-item> [full|fast|triage]
```

Start and log a workflow run:

```bash
rtk scripts/run-workflow.sh <work-item> [full|fast|triage]
```

Capture command output:

```bash
rtk scripts/collect-evidence.sh <work-item> <label> <command> [args...]
```

Run guardrail gates:

```bash
rtk scripts/qa-gate.sh <work-item> [full|fast|triage]
```

## Stop Rules

- Stop and ask the user when the assignment statement contradicts code behavior in a way that changes test scope.
- Stop before using real credentials, real payment data, production systems, or destructive API actions.
- Stop when the only way to proceed is to guess business rules that should be explicit in the test.

## Loop Control

Use `.agents/LOOPS.md` as the routing authority when work needs another pass:

- spec ambiguity returns to `test-specifier`;
- layer, data, or CI uncertainty returns to `test-architect`;
- test code, fixture, or setup defects return to `test-automation-writer`;
- unresolved diff quality issues return to `automation-reviewer`;
- failing execution evidence returns to `error-analyst`;
- stakeholder submission gaps return to `qa-report-writer`.

After two loops with the same unresolved blocker, stop and ask the user.

# Agent Loops

Loops keep Codex and Claude aligned when the work is iterative.

## Loop Principles

- Every loop has one owner, one input, one output, and one stop condition.
- Loops must reduce uncertainty. If a loop repeats the same uncertainty twice, stop and ask the user.
- Do not loop endlessly on formatting or style while functional blockers remain.
- Prefer evidence-producing diagnostics over speculative rewrites.

## Specification Loop

Owner: `test-specifier`

Input:

- assignment prompt,
- current repo,
- acceptance criteria,
- API/UI examples.

Loop:

```text
inspect sources -> draft scenarios -> identify blockers -> refine scenarios
```

Stop conditions:

- `READY FOR ARCHITECTURE`
- `READY FOR IMPLEMENTATION`
- `BLOCKED`

Escalate when:

- expected behavior is ambiguous,
- user data or real systems are required,
- the prompt contradicts repo behavior.

## Architecture Loop

Owner: `test-architect`

Input:

- `01-test-spec.md`,
- repo structure,
- package scripts,
- CI/config files.

Loop:

```text
map scenario to layer -> define data strategy -> define validation gate -> check feasibility
```

Stop conditions:

- `READY FOR IMPLEMENTATION`
- `BLOCKED`

Escalate when:

- the required framework does not exist and bootstrapping would dominate the timed test,
- the assignment requires a stack decision not supported by the repo.

## Implementation Loop

Owner: `test-automation-writer`

Input:

- spec,
- architecture,
- current source,
- review findings when returning from review.

Loop:

```text
small change -> narrow validation -> inspect output -> update implementation handoff
```

Stop conditions:

- `READY FOR REVIEW`
- `BLOCKED`

Return to implementation when:

- `automation-reviewer` verdict is `CHANGES REQUESTED`,
- `error-analyst` classification is `test bug`,
- validation failure points to automation code or test data setup.

## Review Loop

Owner: `automation-reviewer`

Input:

- diff,
- implementation handoff,
- spec and architecture.

Loop:

```text
compare to spec -> inspect changed code -> classify findings -> issue verdict
```

Stop conditions:

- `APPROVE`
- `APPROVE WITH NOTES`
- `CHANGES REQUESTED`
- `BLOCKED`

Return to writer when:

- correctness, data safety, flakiness, or missing critical coverage is blocking.

## Error Analysis Loop

Owner: `error-analyst`

Input:

- command output,
- logs,
- screenshots,
- traces,
- API responses,
- CI output,
- JMeter/Newman output.

Loop:

```text
collect evidence -> classify failure -> test hypothesis -> recommend fix or diagnostic
```

Stop conditions:

- `READY FOR REPORT`
- `NEEDS FIX`
- `BLOCKED`

Return to writer when:

- classification is `test bug`, `data issue`, or deterministic setup problem.

Ask for more evidence when:

- classification is `unknown`,
- the only available evidence is a summarized failure message,
- logs are truncated before the failing action.

## Reporting Loop

Owner: `qa-report-writer`

Input:

- all available handoffs,
- evidence,
- final validation output.

Loop:

```text
summarize scope -> cite evidence -> list risks -> disclose AI usage -> assign final status
```

Stop conditions:

- `PASS`
- `PASS WITH RISKS`
- `FAIL`
- `INCOMPLETE`

Block `PASS` when:

- review has unresolved blocking findings,
- RCA is `unknown` for a critical failure,
- no validation evidence exists,
- validation not run is omitted.

## Cross-Agent Routing Table

```text
missing expected behavior -> test-specifier
layering/data/CI uncertainty -> test-architect
test code or fixtures broken -> test-automation-writer
diff quality concern -> automation-reviewer
test or CI failure -> error-analyst
submission summary needed -> qa-report-writer
```


---
name: test-specifier
description: Convert a QA technical test prompt, user story, API contract, UI behavior, or bug report into an executable test specification.
---

# Test Specifier

You create the first handoff for the work item.

## Inputs

- Assignment prompt, acceptance criteria, user story, API examples, screenshots, logs, or current repository behavior.
- Existing tests, page objects, API clients, Postman collections, GraphQL operations, fixtures, and CI config.

## Workflow

1. Read `AGENTS.md`, `.agents/GUARDRAILS.md`, `.agents/AI_OPERATING_MODEL.md`, `.agents/LOOPS.md`, and `.agents/WORKFLOW.md`.
2. Inspect the assignment and relevant local files before writing.
3. Identify business-critical flows, risks, edge cases, negative cases, and data needs.
4. Separate UI, REST, GraphQL, performance, and exploratory coverage when relevant.
5. Prefer concrete scenarios over generic test ideas.
6. Mark missing information as assumptions or blockers.
7. Write `.agents/handoffs/<work-item>/01-test-spec.md`.

## Output Contract

```md
# Test Specification - <work item>

## Objective
## Sources inspected
## In scope
## Out of scope
## Assumptions
## Blockers or open questions
## Test scenarios
| ID | Layer | Priority | Scenario | Expected result | Data needs |
## BDD candidates
## API contract checks
## GraphQL checks
## Performance checks
## Automation notes
## Handoff status
READY FOR ARCHITECTURE / READY FOR IMPLEMENTATION / BLOCKED
```

Do not invent product rules. State the gap.
Apply the specification loop in `.agents/LOOPS.md` when scope or expected behavior is unclear.

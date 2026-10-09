# Automation Review Checklist - <work item>

## Scope

## Correctness

- [ ] Matches the test specification.
- [ ] Assertions prove business outcomes.
- [ ] Negative cases are meaningful.
- [ ] API checks validate contract and business fields.
- [ ] GraphQL checks validate data and errors.

## Reliability

- [ ] Uses stable selectors.
- [ ] Uses observable waits.
- [ ] Avoids arbitrary sleeps.
- [ ] Test data is isolated.
- [ ] Cleanup is explicit where possible.

## Cypress (when applicable)

- [ ] Cypress commands are chained correctly, without `await` or synchronous reads of yielded values.
- [ ] Retryable assertions have no side effects; no arbitrary sleeps mask synchronization issues.
- [ ] Intercepts are registered before actions; real and stubbed coverage are identified.
- [ ] Direct API tests use `cy.request()` correctly, including expected HTTP errors and GraphQL errors.
- [ ] Tests are isolated and any reused session is validated.
- [ ] Targeted headless execution and available artifacts are documented.

## Maintainability

- [ ] Clear naming.
- [ ] Reuses existing helpers.
- [ ] Avoids unnecessary abstraction.
- [ ] Keeps specs readable.
- [ ] Keeps page/client helpers focused.

## Safety

- [ ] No secrets committed.
- [ ] No real customer or payment data.
- [ ] No destructive remote actions without approval.

## CI/CD

- [ ] Narrow validation command identified.
- [ ] Artifacts are stored or described.
- [ ] Failure output is actionable.

## Findings

| Severity | Area | Finding | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

## Verdict

APPROVE / APPROVE WITH NOTES / CHANGES REQUESTED / BLOCKED

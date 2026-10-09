# Evidence Convention

Each work item stores evidence under:

```text
.agents/handoffs/<work-item>/evidence/
  command-output/
  screenshots/
  api-responses/
  traces/
  jmeter/
  ci/
  notes/
```

## Naming

Use lowercase, timestamped, descriptive names:

```text
20260713-110500-cypress-login-output.txt
20260713-111200-booking-api-response.json
20260713-111900-jmeter-summary.csv
```

## Minimum Evidence by Claim

- Test passed: command output or CI output.
- Cypress execution: command/spec/browser summary and output; include screenshots, videos, and reports when generated. Store videos under `traces/` and reports under `command-output/` or `ci/`; redact artifacts before storing them.
- UI bug: screenshot, trace, or reproducible command output.
- API bug: request summary and response body/status.
- GraphQL bug: operation, variables if safe, response, and errors.
- Performance bottleneck: JMeter summary with latency percentiles, error rate, and load profile.
- RCA: failure evidence plus a hypothesis/fix validation.

## Redaction

Before storing evidence, redact:

- tokens,
- passwords,
- session cookies,
- authorization headers,
- personal data,
- payment data,
- proprietary customer identifiers.

If redaction changes diagnostic value, state what was redacted in the related handoff.

# Automation Implementation - qa-lead-take-home

Status: READY FOR REVIEW. Execution outcome: FAIL / CORE INCOMPLETE (7 passed, 2 failed).

## Upstream handoffs consumed

- Canonical AGENTS.md, RTK.md, GUARDRAILS, AI_OPERATING_MODEL, LOOPS, WORKFLOW, EVIDENCE and test-automation-writer role contract.
- Full 01-test-spec.md, 02-test-architecture.md, DECISIONS.md and prior run-log.md.
- Referenced read-only HTML/API evidence, frontend selector/endpoint notes, admin bundle note, observed API contracts and redacted discovery transcripts/scripts.
- Latest user approval of the nine-test core and mandatory revisions is authoritative. Existing 01/02 remain historical; request-rewriting fallback, ID-only deletion, automatic reset/concurrency classification, iOS UA spoofing and unverified latest compiler choice were superseded in DECISIONS and this handoff.

## Files changed

All deliverable code is self-contained in `delivery/part1-test-suite/`:

- package.json / package-lock.json, tsconfig.json, .gitignore, cypress.config.ts.
- Five specs under `cypress/e2e/smoke`, `hotfix`, `daily` (nine implemented tests).
- Typed support: api-types, data/date-window selection, reservation selectors/calendar driver, browser creation witness, Node auth/identity registry/cleanup, global evidence hooks.
- `tests/cleanup.test.mjs`: eight local safety proofs using mocked HTTP, never live writes.
- English README.md, revised DECISIONS.md, `.github/workflows/e2e.yml`.
- This handoff, run-log and actual execution evidence under this work item.

Preserved prior commits and changes. The unrelated workspace-root package-lock.json was not modified, staged or reverted by implementation. No commit was made by this specialist; coordinator owns authorized staged inspections and local commits.

## Scenario-to-code mapping

| Scenario | Code | Final local daily result |
|---|---|---|
| S-01 | smoke/api-contracts.cy.ts | PASS, first attempt: live room contract/types |
| S-03 | same | PASS, first attempt: anonymous 401/error contract |
| S-07 | smoke/home.cy.ts | PASS, first attempt: room-specific reservation URL plus API type/description/price, 1280x800 |
| S-08 | same | PASS, first attempt: same at 390x844 desktop engine |
| S-09 | smoke/reservation-page.cy.ts | PASS, first attempt: API-sourced room and visible form after Reserve Now; no submission/date-change claim |
| S-10 | hotfix/guest-booking.cy.ts | FAIL on both attempts; desktop calendar pointer target hidden |
| S-11 | same | FAIL on both attempts; one real 201 submitted URL-initialized dates rather than selected target; required assertion failed |
| S-31 (S-12,S-15) | daily/booking-api.cy.ts | PASS, first attempt: anonymous 201, deliberate identical overlap 409, own admin GET/list identity, report, owned delete 202 and GET404 |
| S-14 | same | PASS, first attempt: invalid fields400 and observed validation rules |

The roomName display oracle in 02 did not match inspected behavior: cards show room type. The revised assertion preserves room identity through its own reservation href and verifies rendered public fields. Original failed assumptions remain in execution history. S-09 retains its approved form-load scope; calendar-change proof is required by S-10/S-11 and remains incomplete.

## Design decisions

- Accepted D-010, D-011, D-013, D-014 and D-016. Revised D-006..D-009, D-012, D-015 and D-017 before acceptance. D-018 (narrow React hydration handling) is proposed and a reviewer focus.
- Pins: Cypress15.5.0, TypeScript5.9.3, Node24.11.1 LTS, @types/node24.10.0. Registry Cypress engines support Node24. A local Node dev dependency keeps npm scripts on the CI runtime without changing host Node26; adds binary install size.
- Initial Node24.10.0 install failed (missing Darwin ARM architecture package); targeted registry inspection confirmed24.11.1. Clean `npm ci` later passed. TypeScript7/latest-only selection was not used.
- Cumulative folder-glob tiers; built-in JUnit; no grep/reporter/BDD service layer. API lifecycle uses small Node tasks for privacy-sensitive operations while ordinary read-only contracts use cy.request.
- CI configuration is GitHub Actions PR smoke, scheduled daily and dispatch tiers, with shared-demo serialization and narrow artifact paths. It is nested in the self-contained deliverable and cannot trigger until that directory is a repository root. CI was not executed; Xray import and real-device validation are unverified.

## UI inspection and bounded implementation loop

1. Initial smoke: two API passes, three UI failures on both attempts with application React#418. Exact underlying cause remains unknown.
2. Narrow handling now records each exact React#418 occurrence and continues functional assertions; other uncaught errors fail. Final run recorded nine occurrences, associated with tests/attempts. No clean application-runtime claim.
3. Rendered reservation DOM showed Today/Back/Next, a month calendar and Reserve Now; inputs appear only after opening the form. Public bundle inspection confirmed onSelectSlot start/end with >1 slots and the success heading `Booking Confirmed`, date text and `Return home` link.
4. The URL initializes a Selected event; the calendar remains at the current month. Actual navigation/drag was attempted with observable labels and hit testing. Fixed navbar/event coverage and body hit-testing blocked attempts. A different initial URL window was used so the final request must prove a real calendar change. No force clicks, DOM state mutation, stubs or intercepted request rewrites were used.
5. Final targeted and daily UI execution reached a real201 in one mobile attempt, but request dates stayed at the initial URL window. Full E2E is therefore incomplete; visible success assertions exist but were not successfully reached/proven. Calendar diagnostics stopped at the cut line. No stretch tests were implemented.

Final daily observed mobile request: target `2029-02-12..2029-02-14`, submitted `2029-01-29..2029-01-31`,201 ID6. Stored identity uses the actual submitted fields plus this execution's expected unique marker; the record was verified and deleted. This is evidence of a failed date-change assertion, not a successful full journey. Driver failure is a hypothesis; the underlying cause remains unknown pending independent investigation.

## Data and cleanup behavior

- Anonymous guest UI/API creation; admin token retained only in a Node closure for later verification/cleanup. Assignment demo credentials extracted directly to child-process environment, never persisted or printed. No credential/token/cookie reaches browser config or artifacts.
- Per-attempt alphabetic marker, synthetic contacts, API-sourced room, report-checked future date window with one-day buffer and up to20 in-memory candidates. No seed/count oracle or room/branding write.
- Persistent registry stores returned ID plus exact marker, room, names, dates and deposit flag before assertions. Browser witness is also drained in afterEach if an application error interrupts cy.wait after submission; successful responses without an ID/missing responses leave explicit obligations.
- Before deletion, admin GET must match the stored identifying fields. Mismatch/unverified identity means no delete and retained obligation. Already-absent records resolve as absent, with cause unknown. DELETE202 must be followed by GET404.
- Cleanup HTTP failures return separately, preserve original test results and retain entries. A separate outcome journal and after-run summary expose failures; unresolved cleanup makes the run unsuccessful. Registry writes use temporary-file rename. No old-run/pattern sweeps.
- Actual new implementation execution: targeted API lifecycle created/deleted one booking; targeted UI created/deleted one; final daily created/deleted two. Four accepted creates total across these runs, all verified deleted/absent; reused numeric IDs are not assumed evidence of a reset. No remaining cleanup obligation.
- Read-before-delete is not atomic; no conditional-delete contract was observed. Abrupt process termination can still interrupt response/registry transfer; missing-response witnesses retain uncertainty when the hook runs. Keep interrupted-run registry files for accountable manual recovery.

## Validation commands run and inspected results

Commands were invoked through RTK; credential values were supplied only through env and excluded from logged command arguments.

| Command | Result / evidence (relative to evidence/command-output) |
|---|---|
| npm install --no-audit --no-fund | First Node24.10.0 architecture package failed; corrected24.11.1 install completed. Recorded in run-log; no claim first install passed. |
| npm run typecheck | Initial small typing failures fixed, later metadata typing failure fixed; final exit0 in `20261009-0004-final-summary-typecheck.txt` |
| npm run smoke -- --spec cypress/e2e/smoke/api-contracts.cy.ts |2/2 passed first attempt; compatibility proof `20261008-2331-api-compatibility.txt` |
| npm run smoke and narrow S-09 diagnostics | Earlier failures/retries retained; read run matrix below and JUnit manifest before associating cumulative reports |
| npm run daily -- --spec cypress/e2e/daily/booking-api.cy.ts |2/2 passed first attempt; `20261008-2340-api-lifecycle.txt`, matching attempt summary/cleanup |
| npm run hotfix -- --spec cypress/e2e/hotfix/guest-booking.cy.ts |0/2 passed, both retries failed; `20261008-2354-real-guest-booking.txt`, matching summary and exact single XML |
| npm ci --no-audit --no-fund |exit0,178 packages; `20261008-2357-npm-ci.txt` |
| npm run daily -- --reporter-options mochaFile=results/junit/final-daily/results-[hash].xml |exit2,9tests,7passed,2failed,0pending/skipped; `20261009-0000-final-daily.txt` |
| npm run test:cleanup |Final8/8 local mocked safety proofs passed; `20261009-0004-final-summary-proofs.txt` |

The final Node ID equality/positive-safe-integer guard and primary summary status were tightened **after** the final live run. They passed final typecheck and eight local safety proofs, including mismatched returned ID/no delete and FAIL primary outcome with resolved cleanup. No further live run was performed. Exact final source is not claimed fully live-validated.

## Evidence map and assessment

- Final run ID `cdd7962f-e251-4728-afc3-7d68f9a419d8`: final-daily command log, attempt summary, cleanup JSONL, empty registry and exactly five `20261009-0000-final-daily-results-*.xml` files. The isolated `results/junit/final-daily/` folder contains only this run.
- Seven first-attempt passes; four failed UI attempts (two scenarios with one retry each); no retry passes. Nine React#418 occurrences. API ID4 and UI ID6 deleted202 then absent404; unresolved cleanup0.
- Original captured final summary's status string predates the primary FAIL-status correction. It must be read with CLI exit2/JUnit failures; overall outcome is **FAIL / CORE INCOMPLETE**, not PASS WITH RISKS. New status handling is locally proven; the original capture is preserved unchanged.
- Early `2335`, `2340`, `2345`, `2352` report-copy groups contain cumulative XML from prior runs. Their prefixes alone do not identify which run a report belongs to. Use the manifest note and XML scenario/timestamps. Original histories were preserved; later targeted/final captures use isolated report folders.
- Evidence filenames were preassigned stage labels and are not precise execution-start timestamps; Cypress logs/JUnit timestamps and run IDs are authoritative. Do not use these labels to compute human working time.

## Validation not run

Independent automation review, formal RCA and final QA report are deliberately not started. No CI execution, Xray import, real-device Safari/iOS validation, WebKit, Firefox matrix, performance, room/global setting writes, contact-message stretch or admin-UI stretch execution. No push, split, publication or upload.

## Known limitations

Full UI booking remains incomplete at both viewports; confirmation assertions are unproven. Desktop pointer-target hit testing and mobile date-change behavior need independent investigation. React hydration handling narrows diagnostic behavior and qualifies otherwise passing UI checks. Shared-demo races persist. Node transport status0 intentionally withholds sensitive details and has unknown cause. Mocked safety proofs establish local logic, not live race/reset coverage. Minor Node module-type warning and local macOS certificate/tty/Mocha-version warnings were present; targeted APIs still executed successfully, without disabling TLS verification.

Human working time is NOT YET PROVIDED. Agent wall-clock is recorded separately; remaining six-hour human budget cannot be computed from it. No stretch work was started.

## Reviewer focus areas

1. Investigate real calendar pointer/selection state; do not rewrite intercepted dates or weaken target-date/success assertions to make green.
2. Review D-018 narrow React#418 handling and nine observed events; decide whether functional checks may continue with risks.
3. Inspect ID+full-identity guard, witness registration before assertions, persistent unresolved obligations, original-failure preservation, post-run summary FAIL priority and interruption limitations.
4. Check Node-only credential/token transport and all JUnit/task failure paths. Confirm upload paths exclude registry/raw API/browser media.
5. Confirm CI reference configuration vs unexecuted CI/Xray/real-device claims and exact final-source/live-validation distinction.

## Handoff status

READY FOR REVIEW with blocking execution gaps S-10/S-11. Overall core execution is FAIL / INCOMPLETE; seven passes do not justify the hotfix gate or release. Stop here for Claude's independent automation review. Do not publish or start downstream stages automatically.

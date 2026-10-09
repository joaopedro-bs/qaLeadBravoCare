# Automation Code Review - qa-lead-take-home

## Re-review (stage 7, 2026-10-09)

Reviewer: automation-reviewer (independent, read-only), stage 8. I changed no code, config or docs, ran no Cypress, made no HTTP calls, installed nothing and committed nothing. The only local commands I ran were `npm run typecheck` (tsc emitted no errors) and `npm run test:cleanup` (9 tests, 9 pass, 0 fail).

### Scope

- Source: HEAD `57494c0`. The delivery code under test is `0225278`. `git diff --stat 0225278 HEAD -- :/delivery` shows only `README.md`, with 3 lines added and 3 removed.
- Files read in full or in the relevant part:
  - `cypress/e2e/hotfix/guest-booking.cy.ts` (full)
  - `cypress/support/pages/reservation.ts`, `support/e2e.ts`, `support/cleanup.ts`, `support/node-tasks.ts:55-70,95-173`
  - `cypress/e2e/smoke/home.cy.ts`, `reservation-page.cy.ts`
  - `tests/cleanup.test.mjs` (count of tests only)
  - `DECISIONS.md` D-017 to D-020
  - the README diff
  - 03 "Stage 7"; 05 status and "Stage 6"; the initial review below
- Evidence: the stage 7 files in `evidence/command-output/`, which are the two run summaries, the JUnit files, the cleanup outcomes and registries, the CLI text, and the typecheck and proof reruns from 01:22.

### Claims verification (a-e)

| # | Claim | Status | Evidence |
|---|---|---|---|
| a | The reduced S-10/S-11 passed on the first attempt in run bc081863 and in daily run 92ae02d0 | CONFIRMED | **Run bc081863:** `20261009-stage7-s10-s11-run-summary.json` has `.totals` = {tests 2, passed 2, failed 0, pending 0, skipped 0}, and `.specs[].tests[].attempts` = `["passed"]` for both S-10 and S-11, with `finalSymptom` null. The JUnit file has 0 `<failure>` elements. The CLI text shows Passing 2 / Failing 0 at lines 120-121. **Run 92ae02d0:** `20261009-stage7-daily-run-summary.json` shows S-10 and S-11 with attempts `["passed"]`. In both runs, `.bookingObservations[].attempt` is 0. |
| b | Each test accepted exactly one React #418 | CONFIRMED | Each summary's `.allowedAppErrors` has exactly 2 entries, one for S-10 and one for S-11. Every entry has `attempt` 0, `load` 1, `messageMatched` true, `stackSourceMatched` **true**, `firstChunkFrame` `/_next/static/chunks/174b7k13ybrt2.js` and `allowed` true. No rejected entries were recorded. The CLI lines are `stage7-s10-s11.txt:111,113` and `stage7-daily.txt:132,134`. |
| c | The full suite finished 6 passed and 3 failed, and S-07, S-08 and S-09 failed on the initial attempt and the retry | CONFIRMED (they are FAILED, not skipped or passed) | Daily `.totals` = {tests 9, passed 6, failed 3, pending 0, skipped 0} and `.status` = `"FAIL: CORE INCOMPLETE"`. S-07, S-08 and S-09 each have attempts `["failed","failed"]` and `finalSymptom` `react-hydration-418`. The JUnit files `results-ade6f761...xml` and `results-ae52b304...xml` contain 2 and 1 `<failure>` elements. The CLI shows Failing 2 at `stage7-daily.txt:179-180` and Failing 1 at `:198-199`. S-31, S-14, S-01 and S-03 have attempts `["passed"]`. |
| d | Bookings 4, 5, 6, 7 and 8 were identity-checked, deleted with 202 and verified absent; the registries are `[]` and unresolved cleanup is 0 | CONFIRMED | **Run bc081863:** `.cleanup` records ids 4 and 5 as `deleted-and-absent` with status 202. **Run 92ae02d0:** `.cleanup` records ids 6, 7 and 8 the same way. The `*-cleanup-outcomes.jsonl` files carry the matching run ids. Both `*-cleanup-registry.json` files are `[]`. In both summaries `.unresolvedCleanup` = 0 and `.cleanupStatus` = `RESOLVED`. The identity check is established by the code path, not by a separate artifact: `deleted-and-absent` is reachable only after the identity GET matches (initial review, section 3), and the cleanup code is unchanged. Ids 4, 5, 7 and 8 are UI bookings (`.bookingObservations`); id 6 is the API lifecycle booking (S-31). |
| e | The tested source matches the current implementation | CONFIRMED, with one part NOT VERIFIABLE | The diff from `0225278` to HEAD under `delivery/` touches only `README.md`. `cypress/`, `package.json`, the configs and `tests/` are unchanged. The README change came in `93f7c6a` and is documentation only: the "pending execution" markers became results, and line 65 was relabelled "Earlier". `63e0b5c` and `57494c0` change handoffs only. The runs started at 01:24:15 and 01:25:01, after `0225278` was committed at 01:23:46. NOT VERIFIABLE from the artifacts: that the working tree was clean at execution time. `run-summary.json` records no source SHA (`.run`/keys; F-04), so this rests on 03's statement. The current uncommitted files are `run-log.md` and the root `package-lock.json`, and neither is under `delivery/`. |

### Focus 1: #418 allowance when no chunk frame is identified

- **Code.** At `guest-booking.cy.ts:28`, `stackSourceMatched = frames.length ? stack.includes(ALLOWED_STACK_SOURCE) : null`. At `:29`, `allowed = messageMatched && stackSourceMatched !== false && matchesThisLoad === 0`. If `err.stack` contains no `/_next/static/chunks/` frame, any error whose message contains the #418 text is accepted on the first occurrence in a page load.
- **Assessment.** The literal authorization was "match the exact observed message and stack source where available". The phrase "where available" makes null acceptance defensible as an interpretation. Even so, the stack source is the only check on origin. Treating "no identifiable origin" as allowed widens acceptance from "this Next.js chunk" to "anything that throws this text": an inline script, a third-party script, a stack-less re-throw, or a wrapped error whose stack was lost. That is the masking direction D-019 itself warns about. The safe default for an allowance is fail-closed.
- **Evidence.** The null path was **never exercised**. All 4 `allowedAppErrors` entries across both runs have `stackSourceMatched: true`, so the evidence already collected does not depend on it.
- **Minimum correction** (one line, `guest-booking.cy.ts:29`): replace `stackSourceMatched !== false` with `stackSourceMatched === true`. Then update the D-019 bullet "any application chunk frame in the stack is ..." to "the stack must contain the `/_next/static/chunks/174b7k13ybrt2.js` frame".
- **Optional tightening.** `stack.includes(...)` accepts the allowed chunk anywhere in the stack, even when the first chunk frame is a different chunk. `frames[0] === ALLOWED_STACK_SOURCE` would match the observed signature exactly. This is not required.
- **Severity:** Medium. It does not block the evidence already collected. I recommend the fix before the allowance is relied on again (R-01).

### Focus 2: what is verified before submission, and what at each later stage

What the code actually verifies at each stage:

| Stage | Verified | Evidence |
|---|---|---|
| (i) Before submit | Stay length (2 nights) and price/total only. Any 2-night window priced the same would pass. The exact dates are **not** verified. | `reservation.ts:21-28` (`assertPriceSummary`) and `guest-booking.cy.ts:55-56,71` |
| (ii) Submitted request | Exact dates | `guest-booking.cy.ts:94`, label `'URL-preselected submitted dates'` |
| (iii) 201 response echo | Exact dates | `:103`, label `'real echoed dates'` |
| (iv) Confirmation UI | Exact date range text | `:105` |

Wording review:
- **Accurate:** the test titles, the assertion labels at `:94` and `:103`, README:38 ("pre-submit price summary"), README:73 ("requires the booking card to show `£{roomPrice} x 2 nights` and a Total ...; ... dates equal to the target" on the request), and 03:15.
- **Overclaims** (R-02):
  - `DECISIONS.md:275`, "Before submitting, they verify what the page displays for those dates: ..."
    - Change it to: "Before submitting, they verify only the stay length and price the page displays: "£{price} x 2 nights" and the total, computed from the room's API price. This does not identify which dates are selected."
  - `DECISIONS.md:285`, "Before submitting, the dates themselves are checked only indirectly, through the nights count and totals."
    - Change it to: "Before submitting, the exact dates are not checked; the nights count and total establish only duration and price. The exact dates are asserted on the submitted request, the 201 response echo and the confirmation card."
  - `cypress/support/pages/reservation.ts:19`, code comment "Pre-submit proof that the booking card priced the URL dates:".
    - Change it to: "Pre-submit check of stay length and price only (not the exact dates):".

### Other checks

- **Reduced scope labelling.** Nothing claims calendar-selection coverage or Safari/iOS validation. README:39 and D-020 mark calendar interaction as DEFERRED. README:75, D-007 and 03:73 state that 390x844 is desktop-engine coverage only and not Safari/iOS. The calendar wording at 03:131 sits in the superseded section. **Stale wording (R-03):** README:3 still says "The two booking UI scenarios remain incomplete after execution", which contradicts README:38/73.
- **Allowance scope.** The allowance is registered only in `guest-booking.cy.ts:19-37`, test-scoped through `cy.on` and called at `:68` inside each `it`.
  - `support/e2e.ts:3` has no global handler, and a grep of `cypress/` for `uncaught` or `Cypress.on(` finds no other handler.
  - `smoke/home.cy.ts` and `smoke/reservation-page.cy.ts` have none either. The daily run proves this: S-07, S-08 and S-09 failed on #418.
  - Extending the allowance to smoke needs a separate user decision.
  - The ceiling is one match per page load, with `window:before:load` resetting the counter (`:22`).
  - Every uncaught error is recorded (`:31`), and the records are flushed in the spec's `afterEach` (`:41-45`).
- **Observation-only intercept.** At `:57-67` there are no `req.body` writes, no `reply`, no stub and no `force`. The witness is created in the intercept (`cleanup.ts:8-12`) and drained in the global `afterEach` (`e2e.ts:4-8`). Intact.
- **Register before assert.** At `:79-84`, `registerBooking` runs for any 2xx response or numeric id before any `expect`, and the observation is recorded before the assertions (`:85-89`). Intact.
- **Identity-checked cleanup.** `node-tasks.ts` is unchanged since `0225278`, and the claim-d outcomes are consistent with it. Intact.

### Earlier findings: status

| ID | Status | Evidence |
|---|---|---|
| F-01 (P0 booking never passed) | PARTIALLY RESOLVED | S-10/S-11 passed on the first attempt in two live runs, with the 201 and the "Booking Confirmed" card asserted (claim a). The scope is **reduced**: dates are URL-preselected, calendar selection is deferred, and the run depended on the temporary #418 allowance. The verdict is PASS WITH RISKS, not full journey coverage. |
| F-02 (non-discriminating Selected check) | SUPERSEDED | The calendar driver and the `.rbc-event` Selected check were removed (`reservation.ts:1-35`). Calendar coverage is DEFERRED (D-020). |
| F-03 (committed source never executed live) | RESOLVED for delivery code | `0225278` was executed in bc081863 and 92ae02d0, and only README changed afterwards (claim e). The clean-tree caveat depends on F-04. |
| F-04 (no source SHA in run-summary) | OPEN | The run-summary keys are `allowedAppErrors, bookingObservations, cleanup, cleanupStatus, cypress, node, run, specs, status, totals, unresolvedCleanup`, with no SHA (`node-tasks.ts:170-173`). |
| F-05 (global, uncapped, invisible tolerance) | SUPERSEDED by D-019 | Test-scoped, booking-only, capped at one per load, printed in the CLI (`node-tasks.ts:108`) and shown as `PASS WITH RISKS` in the run-summary. Residual: JUnit and the exit code still look like a clean pass (R-04). |
| F-06 (observation not attributable) | RESOLVED | `guest-booking.cy.ts:85-86` adds `test` and `attempt`, and both appear in `.bookingObservations`. |
| F-07 (DOM dump in a gate test; README "initial URL dates") | OPEN | The dump is still at `smoke/reservation-page.cy.ts:9-20`. README:37 still says "initial URL dates", but S-09 has no date assertion. |
| F-08 (dedup creates a spurious null obligation) | OPEN | `node-tasks.ts:62` is unchanged. Not observed in the evidence; it fails safe. |
| F-09 (CI fail-fast relies on a `CI` env var) | OPEN | `data.ts:38` is unchanged. |
| F-10 (body-targeted drag events) | SUPERSEDED | The drag driver was removed. |
| F-11 (root `package-lock.json` modified) | OPEN | It is still uncommitted (`git status`). It is not in any delivery commit. |
| D-018 section (accept with changes 1-5) | SUPERSEDED by the D-018 rejection and D-019 | Change 1 (source-bound): done, except the null path (R-01). Change 2 (scope): done, narrower than proposed (booking spec only). Change 3 (ceiling): done (1 per load). Change 4 (CI visibility): partial, in the CLI and run-summary but not in JUnit or the exit code (R-04). Change 5 (expiry): a removal condition is documented, but D-019 states there is no ticket or owner. |

### Remaining findings (ordered by severity)

| ID | Severity | Category | File:line | Evidence | Minimum correction |
|---|---|---|---|---|---|
| R-06 | High | INCOMPLETE COVERAGE (not a code defect) | `smoke/home.cy.ts`, `smoke/reservation-page.cy.ts` | The daily core is 6/9. S-07, S-08 and S-09 failed on both attempts with `react-hydration-418` (claim c). Smoke UI coverage, which includes the PR gate, is red. | No code change without a user decision. Either keep reporting it as FAIL, or the user separately decides whether to extend a D-019-style allowance to smoke. |
| R-01 | Medium | INCOMPLETE COVERAGE (origin guard; not blocking for collected evidence) | `cypress/e2e/hotfix/guest-booking.cy.ts:28-29` | `stackSourceMatched === null` (no chunk frames) is accepted. The path was never exercised: all 4 entries have `true`. | `:29` `stackSourceMatched !== false` → `stackSourceMatched === true`, plus the D-019 bullet wording. |
| R-02 | Low | OPTIONAL IMPROVEMENT (documentation accuracy) | `DECISIONS.md:275,285`; `cypress/support/pages/reservation.ts:19` | The text implies the dates are verified, directly or indirectly, before submission. The check covers duration and price only. | Replace the text as quoted in Focus 2. |
| R-03 | Low | OPTIONAL IMPROVEMENT (documentation accuracy) | `README.md:3` | "The two booking UI scenarios remain incomplete after execution" is stale and contradicts README:38/73. | Replace it with: "The two booking UI scenarios pass in a reduced, URL-preselected journey under a temporary React #418 allowance (PASS WITH RISKS); calendar selection is deferred, and the smoke UI scenarios fail on React #418." |
| R-04 | Low | OPTIONAL IMPROVEMENT (CI visibility) | `cypress/support/node-tasks.ts:108,166-173` | Run bc081863 exited 0 and its JUnit has 0 failures and no marker. `PASS WITH RISKS` is visible only in the CLI line and `run-summary.json`. | Document that CI must read `run-summary.json .status`, or add a JUnit property later. Not required now. |
| R-05 | Low | OPTIONAL IMPROVEMENT | `cypress/support/node-tasks.ts:108` with `guest-booking.cy.ts:31` | Every uncaught error is recorded, including non-#418 errors, but the CLI line always prints "React #418". A rejected non-#418 error would be mislabelled. The test still fails correctly. Not observed. | Print `messageMatched` in the line, or label it "app error". |
| F-04, F-07, F-08, F-09, F-11 | Medium/Low as originally rated | as before | see table above | Unchanged | As in the initial review |

### Outcomes (kept separate)

- **Reduced journey (S-10/S-11): PASS WITH RISKS.** Both tests passed on the first attempt in two runs, with real 201 responses, exact dates in the request, the echo and the confirmation, and cleanup resolved. The risks are:
  - one allowed #418 per test;
  - the null-stack acceptance gap (R-01, not exercised);
  - the exact dates are not verified before submit;
  - calendar selection is DEFERRED.
- **Full core suite: FAIL, 6/9.** S-07, S-08 and S-09 failed on #418 on the initial attempt and the retry (`92ae02d0`, status `FAIL: CORE INCOMPLETE`).
- **NOT VERIFIED:** CI (Jenkins, Bitbucket and GitHub Actions), Xray import, and real devices, Safari or iOS. 390x844 is desktop-engine coverage only.

### Verdict

**APPROVE WITH NOTES** for the stage 7 change set and its reporting. This is not a release approval: the daily core is FAIL.

Justification:
- Claims a-e are confirmed against the artifacts. The only unverifiable part is the clean tree at execution, because no SHA is recorded.
- The allowance is test-scoped, booking-only, capped and reported, and every business assertion, the register-before-assert order and the identity-checked cleanup are intact.
- README and 03 report the 6/9 FAIL and the reduced scope honestly.
- No finding blocks the evidence already collected. R-01 is a real fail-open in the origin guard, but the collected runs never used it, and it is within a literal reading of "where available".
- If the user reads "stack source where available" as requiring a match, R-01 becomes a change request before any further run.

### Minimal corrections (non-blocking; recommended before the final report or the next run)

1. R-01: `guest-booking.cy.ts:29` `stackSourceMatched !== false` → `stackSourceMatched === true`. Align the D-019 bullet. Then run `typecheck` and `test:cleanup`. A live rerun is needed only if the evidence is to cover the corrected source.
2. R-02 and R-03: apply the three wording replacements in Focus 2 and the README:3 replacement. These are documentation and a comment only.

There are no feature additions. Smoke #418 handling (R-06) awaits a user decision.

---

## Initial review (superseded where noted)

Reviewer: automation-reviewer (independent, read-only). Date: 2026-10-09.
Constraints honoured: no code/config/doc changes, no Cypress execution, no HTTP, no install, no commit.

## Review scope

- Source reviewed (HEAD `96c7ebe`; delivery code identical to `bcd8002`, because `git diff bcd8002 HEAD -- delivery/part1-test-suite` touches only `.github/workflows/e2e.yml`, `DECISIONS.md` and `README.md`):
  - `delivery/part1-test-suite/{package.json,cypress.config.ts,tsconfig.json,.gitignore,.github/workflows/e2e.yml,README.md,DECISIONS.md}`
  - `cypress/support/{e2e.ts,cleanup.ts,node-tasks.ts,data.ts,api-types.ts,pages/reservation.ts}`
  - `cypress/e2e/{smoke/api-contracts,smoke/home,smoke/reservation-page,hotfix/guest-booking,daily/booking-api}.cy.ts`, `tests/cleanup.test.mjs`
- Handoffs: 01 (scenario IDs), 02, 03, run-log Stage 3.
- Evidence (all under `.agents/handoffs/qa-lead-take-home/evidence/`): execution manifest; final daily CLI/attempts/cleanup/registry/5 XML; calendar-query/scroll/hit-point diagnostics; real-guest-booking; API lifecycle; hydration diagnostic; post-run typecheck/proof outputs; privacy inspection; npm ci.
- Not reviewed in depth: 01 scenario prose and the 2331 compatibility output (the D-015 "2/2" claim is taken from the decision log, not verified by me).

## Claims verification (a-e)

| # | Claim | Status | Evidence |
|---|---|---|---|
| a | Nine tests executed in the final run | CONFIRMED | `evidence/notes/20261009-0004-execution-manifest.md:3,15`; `command-output/20261009-0000-final-daily-attempts.json` `.specs[].tests` = 2+2+2+1+2 = 9; five final XML `tests=` 2,1,2,2,2. Run ID `cdd7962f-e251-4728-afc3-7d68f9a419d8` (attempts.json `.run`, cleanup.jsonl). |
| b | Seven passed on their first attempt | CONFIRMED | attempts.json: S-31, S-14, S-01, S-03, S-07, S-08, S-09 each have `attempts` of length 1 with `state: "passed"`. All four non-UI-booking XML files have `failures="0"`. |
| c | S-10 and S-11 failed on both attempts | CONFIRMED | attempts.json `hotfix/guest-booking.cy.ts` tests: two `attempts`, both `failed`, for each. XML `...-65f56ae2...xml` `failures="2"`; final messages at XML:7 (S-10, `cy.trigger()` "center of this element is hidden from view: <body>") and XML:39 (S-11, `real calendar submitted dates: expected {...} to deeply equal {...}`). |
| d | Four created bookings across all live executions were identity-checked and deleted (202, then 404) | CONFIRMED, with qualifications | `20261008-2340-cleanup-outcomes.jsonl` (id 4, marker qakskqbajf); `20261008-2354-real-guest-booking-cleanup.jsonl` (id 6, qalzcskoix); `20261009-0000-final-daily-cleanup.jsonl` (id 4, qagpyddhlq; id 6, qaovndgcjy). All `outcome: "deleted-and-absent"`, `status: 202`. Calendar diagnostics ran only the smoke spec S-09 (CLI `Command:` lines), and their attempts have `"cleanup": []`, so no creates there. Qualifications: (1) the 404 is not logged. It is inferred from source, because `deleted-and-absent` is only recorded after the verify GET returns 404 (`node-tasks.ts:91-94`). (2) Those runs executed pre-commit source (see section 5), so the semantics are inferred from the closest committed code plus 03:85. (3) Upstream D-003 contract discovery created a booking and a message outside the suite; that is not counted here. |
| e | Zero unresolved cleanup obligations | CONFIRMED | `20261009-0000-final-cleanup-registry.json` = `[]`; attempts.json `.unresolvedCleanup: 0`; `20261008-2340-cleanup-registry.json` = `[]`; real-guest attempts `.unresolvedCleanup: 0`; calendar diagnostics `.unresolvedCleanup: 0`. |

## Findings (ordered by severity)

| ID | Severity | Category | File:line | Evidence | Minimum fix |
|---|---|---|---|---|---|
| F-01 | High | INCOMPLETE COVERAGE | `cypress/e2e/hotfix/guest-booking.cy.ts:9-60` | The P0 guest booking journey (S-10/S-11) has never passed. It failed in the final run (claim c) and in real-guest run 2354 (XML `20261008-2354-results-d9b0...xml:7,39`). The hotfix and daily tiers therefore cannot go green, and "Booking Confirmed" was never observed. | Send to error-analyst for RCA (handoff below). Do not weaken the date, 201 or confirmation assertions. Re-review after the fix. |
| F-02 | Medium | INCOMPLETE COVERAGE (assertion strength) | `cypress/support/pages/reservation.ts:44` with `:3-11` | The step check `cy.contains('.rbc-event','Selected')` does not tie the selection to the target dates. The URL deliberately pre-selects a window 14 days earlier (`:8`), and the month view renders leading off-range days (`notes/20261008-2345-reservation-dom-inspection.json` buttons `27,28,29,30,01...`). In the final run the target was 2029-02-12..14 and the submitted window was 2029-01-29..31 (attempts.json `.bookingObservations[0]`). Jan 29-31 sit in the first row of the Feb 2029 view, so this check can pass without the drag having any effect. In 2354, S-11 instead failed on this same check (XML:39). Whether it passes depends on where the URL window falls, not on the interaction. The final `deep.eq(dates)` at `guest-booking.cy.ts:48` still catches the problem, so this is not a false positive at test level. It does make the step-level diagnostics misleading. | Assert that the Selected event covers the target cells, e.g. that it sits in the row containing the target check-in and not in an off-range cell. Alternatively, choose a URL window outside the visible target month. |
| F-03 | Medium | INCOMPLETE COVERAGE (validation) | `cypress/support/node-tasks.ts:59,88,143-170` | The committed final source was never executed live. The final run's summary has keys and strings that the committed code cannot produce. Its `.status` is `"FUNCTIONAL RESULTS WITH RISKS; inspect symptoms and cleanup history"`, while committed `:162-166` can only emit `UNRESOLVED CLEANUP`, `UNVERIFIED TEST OUTCOME`, `FAIL: CORE INCOMPLETE`, `INCOMPLETE: UNEXECUTED TESTS`, `PASS WITH RISKS` or `PASS`. It also lacks `finalSymptom` (`:155`) and `cleanupStatus` (`:170`). README:66 and 03:85 disclose this honestly. | Run one authorized live `npm run daily` at the committed SHA and archive it next to the existing evidence. |
| F-04 | Medium | OPTIONAL IMPROVEMENT (traceability) | `cypress/support/node-tasks.ts:167` | `run-summary.json` records run, node and cypress but no source revision. Correspondence in section 5 had to be inferred from CLI clock stamps and commit times. | Add `GITHUB_SHA` or `git rev-parse HEAD` plus a dirty-tree flag to the summary. |
| F-05 | Medium | BLOCKING DEFECT for D-018 acceptance (not for the suite as delivered) | `cypress/support/e2e.ts:2-9`; `node-tasks.ts:101-106,166` | The tolerance is global, has no ceiling, and does not reach JUnit or the CI exit code. A smoke run with #418 exits 0 and is only qualified as `PASS WITH RISKS` inside `run-summary.json`. See the D-018 section. | Apply the D-018 changes listed below before accepting it. |
| F-06 | Low | OPTIONAL IMPROVEMENT | `cypress/e2e/hotfix/guest-booking.cy.ts:41-43` | `recordBookingObservation` has no test title or retry index, so the single 201 (id 6) in the final run cannot be attributed to S-11 or to a specific attempt from the artifact alone. 03 attributes it to "one mobile attempt"; that is NOT VERIFIABLE from the observation. | Add `Cypress.currentTest.titlePath` and `Cypress.currentRetry` to the observation. |
| F-07 | Low | OPTIONAL IMPROVEMENT | `cypress/e2e/smoke/reservation-page.cy.ts:9-20`; `README.md:37` | Diagnostic spike code (a DOM dump to `results/reservation-dom-inspection.json`) remains in a gate test. README says S-09 covers "initial URL dates", but the test has no date assertion; it only checks that the calendar and form inputs are visible. | Move the dump to a diagnostic-only spec. Either assert the initial window or reword README:37. |
| F-08 | Low | OPTIONAL IMPROVEMENT (fails safe) | `cypress/support/node-tasks.ts:60`; `cleanup.ts:13-14`; `guest-booking.cy.ts:35-39` | Deduplication keys on `run+bookingid+lastname`. If the browser witness is drained with `bookingid: null` while the explicit registration carries the ID, two entries are created. The null one becomes `missing-id-obligation` (`:80`) and causes a spurious `UNRESOLVED CLEANUP`. This errs on the safe side and was not observed in the evidence. | Deduplicate on `run+lastname` and upgrade a null ID in place. |
| F-09 | Low | INCOMPLETE COVERAGE (CI portability) | `cypress/support/data.ts:38`; `cypress.config.ts:23`; `README.md:78` | The fail-fast on missing credentials depends on `process.env.CI === 'true'`. GitHub Actions and Bitbucket set this; Jenkins does not by default. The README Jenkins mapping does not mention it, so a Jenkins write tier with missing credentials would skip silently instead of failing. | Document `CI=true` in the Jenkins mapping, or key the fail-fast on an explicit `REQUIRE_WRITE=1`. |
| F-10 | Low | OPTIONAL IMPROVEMENT | `cypress/support/pages/reservation.ts:38-41` | The drag driver mixes element-relative `mousedown` on `.rbc-day-bg` with `mousemove`/`mouseup` triggered on `body`, whose actionability check uses the body's own centre. The final S-10 failure is exactly "center of this element is hidden from view: `<body>`" (final XML:7). This is recorded as an observation; RCA belongs to the error-analyst (H1 below). | Pending RCA. If confirmed, dispatch move and up events on the target cell (or `document` without the actionability check) at the target coordinates. |
| F-11 | Low | OPTIONAL IMPROVEMENT | repo root `package-lock.json` | Uncommitted modification outside the delivery (`git status`, 2 lines changed). 03/run-log say it is unrelated. | Keep it out of any delivery commit; restore it or explain it. |

No blocking defect was found in data safety, privacy or cleanup ownership.

## 1. S-10/S-11 calendar failures (facts only; RCA deferred)

What the evidence establishes:

- **How selection was attempted:** navigate months with the `Next` button and assert the toolbar label (`reservation.ts:20-26`), then `scrollIntoView` with offset (`:27`), then a synthetic drag: `mousedown` on the start `.rbc-day-bg` at bottom-centre, followed by `mousemove`/`mouseup` on `body` with `clientX/clientY` set to the last-night cell (`:36-41`). There is no real pointer, no `force: true` and no touch events. Diagnostics: calendar-query (23:45), scroll (23:48) and hit-point (23:51) all failed with "`cy.trigger()` failed because this element: ..." (XML:7 of each), meaning the target was covered.
- **Whether slots were selected:** not established. There are no screenshots (`cypress.config.ts:11-12`). In 2354, S-11 never showed a Selected event (XML:39). In the final run, S-10 failed during the drag on both attempts (final XML:7, the last attempt). In at least one final S-11 attempt a POST was sent, but per F-02, a passing "Selected" check does not show that the drag changed the selection.
- **Submitted payload:** exactly one booking POST was observed in the final run (`attempts.json .bookingObservations`, length 1). It carried `submittedDates` 2029-01-29..2029-01-31 against `expectedDates` 2029-02-12..2029-02-14. The submitted dates equal `reservationUrl()`'s query window, which is the target minus 14 days (`reservation.ts:6-11`). They are not the chosen window.
- **Backend response:** `status: 201`, `bookingid: 6`. The record was later identity-checked and deleted with 202 (`final-daily-cleanup.jsonl:2`, marker qaovndgcjy). In 2354 the UI also created id 6 (marker qalzcskoix), but its observation was not captured in that run's summary.
- **User-facing confirmation:** NOT OBSERVED. The test fails at `guest-booking.cy.ts:48` before the confirmation assertions at `:58-60`, so there is no evidence either way that "Booking Confirmed" rendered.

Competing hypotheses (none concluded):

| Hypothesis | For | Against / open |
|---|---|---|
| H1 Test bug: interaction or hit-testing (synthetic events never reach the calendar's selection handler, or hit the wrong layer) | Every calendar failure is a `cy.trigger` actionability failure (covered or hidden). `body`-centre actionability is unrelated to the calendar cell (F-10). `mousedown` targets `.rbc-day-bg`, which `.rbc-row-content` overlays. Behaviour depends on viewport (S-10 fails in the drag; S-11 reaches the POST). | In the S-11 final attempt the events were dispatched without error, yet the URL dates were still sent. That fits H1 only if the events dispatched without the handler registering a selection. |
| H2 Product behaviour: the form submits query-string dates and ignores the calendar selection | The single accepted POST carried exactly the URL window, and 03 item 3 records bundle analysis showing `onSelectSlot` start/end. | It is not shown that `onSelectSlot` fired in that attempt. The F-02 check cannot distinguish "selection changed" from "URL pre-selection visible". No manual reproduction exists. |
| H3 Environment (headless Electron 138 at 390/1280 widths, fixed navbar overlap, React #418 client re-render replacing the tree mid-interaction) | #418 occurred once per booking attempt (attempts.json `.browserSymptoms`). Fixed-header coverage was noted in 03 item 4. | No timing correlation between #418 and the drag has been captured. |

Are the failure assertions the right ones? **Yes, at the end of the test.** `guest-booking.cy.ts:44-60` checks the unchanged request (room, names, deposit, target dates, contact equality as booleans), a real 201 and ID, the echoed identity and dates, and visible "Booking Confirmed" with the dates and "Return home". This would detect a broken booking journey, and the intercept is observation-only (`:14-24`; no `req.reply` or body rewrite). The weak spot is the intermediate step check (F-02), not the oracle.

## 2. Proposed D-018 (React minified error #418)

- **Exact handler,** `delivery/part1-test-suite/cypress/support/e2e.ts:2-9`:
  ```ts
  Cypress.on('uncaught:exception', error => {
    if (error.message.includes('Minified React error #418;')) {
      hydrationErrors++;
      return false;
    }
  });
  ```
- **Match criteria:** a case-sensitive substring match on `error.message`, not an exact or anchored message, and with no check of the error source or stack. In practice it matches only the React production #418 text (the trailing `;` narrows it slightly). It would also suppress any other error whose message embeds that substring, for example a Cypress-wrapped message, which D-018:208 says is how the error arrives. Every other uncaught error falls through and fails the test, which is correct.
- **Scope:** global. Registered in the support file, it applies to all specs and all tiers, including API-only specs where it is inert. It is not per spec or per test.
- **Evidence basis:** occurrence data is CONFIRMED for the final run: nine events (2+2+1+1+1+1+1 in `attempts.json .browserSymptoms`), one per UI booking attempt, and two per home test. The claimed original basis (D-018:208, "all three UI scenarios failed with React error #418 on both attempts"; "Cypress wraps that error message") is NOT VERIFIED by this review. `grep 418` finds no match in the CLI text of `command-output/20261008-2335-smoke-ui.txt` or `20261008-2339-smoke-hydration-diagnostic.txt`, and I did not open the 2335 XML or attempts JSON. The error-analyst should confirm where the original #418 failure text is preserved.
- **What it hides:** a server/client markup mismatch that forces React to discard the SSR tree and re-render on the client. Possible user impact (flash or re-layout, lost early input, SEO or accessibility differences) is unknown; D-018:211 documents this. It also hides the error from CI: Cypress exits 0 and JUnit shows a pass, and only `run-summary.json` carries `PASS WITH RISKS`.
- **Remaining detection power:** functional assertions still run against the client-rendered DOM, so a broken booking journey is still detected (section 1). The suppression did not turn any booking test green: S-10/S-11 failed with it in place.
- **Blanket suppression?** No. It is narrow and counted. It is also not justified only by making tests pass, because the decision records it as a risk and keeps the status proposed.

**Recommendation: ACCEPT WITH CHANGES** (D-018 stays `proposed` until these changes are made and the error-analyst confirms the evidence):
1. Make the signature explicit and source-bound: match `/^Minified React error #418;/` (or the `react.dev/errors/418` URL) on the unwrapped message, and in a comment record the observed text and the first evidence file.
2. Narrow the scope: register the handler only in UI specs that `cy.visit` the app (a helper such as `tolerateReactHydration418()` called in those `describe`s), not globally.
3. Set a ceiling: fail the test if a single test's occurrences exceed the observed baseline (≤2 for home, ≤1 for reservation and booking), so that a regression in frequency surfaces.
4. Make it visible in CI output: write the count into the JUnit (test name suffix or a `<property>`), or emit a CI annotation or warning. `run-summary.json` alone is not enough.
5. Expire it: link a ticket and an owner, and remove the tolerance once the root cause is fixed or reproduced outside Cypress (D-018:212).

## 3. Cleanup

- **Identity check before delete:** `node-tasks.ts:82-88`. An authenticated GET must return 200, with `read.body.bookingid === entry.bookingid` and `matches()` (`:66-70`) on roomid, firstname, lastname (a unique `qa`+8-letter marker, `data.ts:4-5`), depositpaid, checkin and checkout. The ID comes from the run's own 201 (API path: `createBooking` `:112`; UI path: the intercepted response, `guest-booking.cy.ts:35-38`). Email and phone are not compared; the observed GET echo has no contact fields (`booking-api.cy.ts:15`).
- **ID guards:** `register()` accepts only a positive safe integer and otherwise stores `null` (`:59`). A `null` ID never triggers a DELETE (`missing-id-obligation`, `:80`). `cleanupBooking` only deletes IDs registered in the current run (`:134-135`). Note: `:59` and the `bookingid` equality at `:88` were added after the final live run (F-03).
- **404 tolerance:** a GET returning 404 means `already-absent` with classification `unknown` and no DELETE (`:83-85`). A DELETE returning 404 is accepted, then absence is verified (`:90-94`).
- **Outcome reporting:** `cleanup-outcomes.jsonl` gets one line per outcome (`:75`). The console prints only id, outcome and status (`:76`). The registry is persisted atomically (`:20-24`) before assertions. `after:run` throws when the registry is non-empty (`:171`).
- **Does the evidence support zero unresolved?** Yes (claim e).
- **ID reuse across runs:** IDs 4 and 6 were each issued twice, to different markers (4: qakskqbajf, then qagpyddhlq; 6: qalzcskoix, then qaovndgcjy). This confirms the demo reuses IDs after reset or delete. The guard handles a reused ID that belongs to someone else: the marker and the other fields would mismatch, giving `identity-mismatch-no-delete` and a retained obligation. A mocked proof covers this (`tests/cleanup.test.mjs:46-59`; `20261009-0003-final-id-guard-proofs.txt`, 8/8 pass). Caveats: (1) the mismatch path has never been exercised live; (2) read-then-delete is not atomic (documented, D-009:134); (3) a registry left over from a prior run blocks every later run until manual recovery, which is intended by D-009.

## 4. Privacy

- **Auth:** credentials come only from `process.env` inside a Node closure (`node-tasks.ts:25`). Cypress's auto-imported `ADMIN_USER`/`ADMIN_PASSWORD` are deleted from the browser config (`cypress.config.ts:21-22`). The token is held in a Node variable and sent only as a Cookie header (`:42`). Every fetch error is swallowed into `{status:0}` with no message (`:49-52`), so a failure prints only status-level symptoms. `credentialsAvailable` returns a boolean.
- **Browser side:** `cy.request` uses `log:false` for the room and report calls. Form typing uses `log:false` (`reservation.ts:56-59`). Contact equality is asserted as booleans (`guest-booking.cy.ts:49-50`). `failOnStatusCode:false` is used only for the anonymous 401 check (`api-contracts.cy.ts:19`). Validation messages that are not on the allow-list are redacted (`node-tasks.ts:117-122`). A failure prints synthetic markers, dates and room IDs only; final XML:39 shows chai's `{ Object (checkin, checkout) }`.
- **Artifacts:** a grep of the final-run XML, jsonl, attempts and registry, and of all `*.jsonl`/`*attempts.json`, for `password|eyJ|token=|cookie` found no matches. A phone-number pattern search of the jsonl, attempts and XML found no matches. Emails found in evidence: `b@example.com` (contract-discovery scripts and responses, synthetic) and `fake@fakeemail.com` (`20261008-224448-api-branding-get.txt` and discovery responses; the demo's public placeholder branding contact). No real personal data or other users' records were found. `notes/20261009-0005-privacy-inspection.json` reports zero credential-value matches across 124 files (by its own description, a value check only).
- **Media:** `video:false` and `screenshotOnRunFailure:false` (`cypress.config.ts:11-12`). Screenshot and video folders are gitignored.
- **Tracked vs untracked:** `delivery/part1-test-suite/results/` is ignored (`.gitignore:4`, confirmed with `git check-ignore`). `cypress.env.json` and `.env*` are ignored. The tracked evidence includes three cleanup-registry copies (all `[]`) and cleanup jsonl files containing synthetic markers only. CI uploads only JUnit, run-summary and cleanup outcomes (`e2e.yml:56-60`), never the registry.

## 5. Source-to-execution correspondence

Commit times (-03): `d15967c` 2026-10-08 23:32:09 (scaffold: S-01/S-03, support, node-tasks); `bcd8002` 2026-10-09 00:08:27 (all other specs, pages, cleanup proofs, node-tasks changes); `8d12c4a` 00:09:48 (docs and CI only); `96c7ebe` 00:10:43 (evidence only).

| Live execution | Clock evidence (local -03) | Source state |
|---|---|---|
| API compatibility (S-01/S-03) `20261008-2331-api-compatibility.txt` | label ~23:31; internal stamp not inspected | At or before `d15967c`, uncommitted or just committed. NOT VERIFIED exactly. |
| Smoke UI (first #418 run) `2335-smoke-ui*` | label 23:35 | Uncommitted tree on top of `d15967c` (`home.cy.ts` only exists from `bcd8002`) |
| Smoke hydration diagnostic `2339` | CLI `1008/233448` = 23:34:48 | Uncommitted, on top of `d15967c` |
| API lifecycle `2340` | CLI `1008/233533` = 23:35:33 | Uncommitted (`daily/booking-api.cy.ts` added in `bcd8002`) |
| Calendar query / scroll / hit-point | CLI 23:45:26 / 23:47:34 / 23:50:19; XML 02:45:28Z / 02:47:36Z / 02:50:20Z | Uncommitted (different calendar-driver revisions; no SHA recorded) |
| Real guest booking `2354` (run 848522b6) | CLI 23:53:36; XML 02:53:37Z | Uncommitted |
| **Final daily** `cdd7962f-...` | CLI `1008/235823`; XML 02:58:26Z-02:58:48Z = 23:58 | **Uncommitted, about 10 minutes before `bcd8002`. Differs from committed code (F-03).** |

Changes made after the final live run, validated only locally (typecheck and mocked proofs):
1. Positive safe-integer ID guard in `register()` (`node-tasks.ts:59`) and returned-`bookingid` equality before delete (`:88`). Evidence: `20261009-0003-final-id-guard-proofs.txt`, `...-0003-final-id-guard-typecheck.txt`.
2. Primary run status ordering, `FAIL: CORE INCOMPLETE` taking precedence, plus `cleanupStatus` (`:159-170`). Evidence: `20261009-0004-final-summary-proofs.txt` (8 pass), `...-0004-final-summary-typecheck.txt`.
3. Fixed metadata (per the `20261009-0001-typecheck-fixed-metadata.txt` label; exact content not diffed because no SHA exists for the run).
4. `finalSymptom` per-test classification (`:143-156`), inferred from its absence in the final attempts.json.
5. Commit `8d12c4a`: README, DECISIONS and CI workflow (documentation and configuration; not executable as a test).

**The committed final source (`bcd8002` = HEAD for delivery code) was NOT executed live.** Every live run used an uncommitted working tree. README:66 and 03:85 state this correctly.

## 6. Delivery

- **Reproducibility:** exact pins (`package.json:17-20`: cypress 15.5.0, typescript 5.9.3, @types/node 24.10.0, node 24.11.1 as a devDependency), a lockfile, and `engines` `>=24 <25`. `npm ci` succeeded (`20261008-2357-npm-ci.txt`, 178 packages, exit 0). Typecheck passed (`20261008-2358-final-typecheck.txt`, `20261009-0004-final-summary-typecheck.txt`). There is no `.npmrc` `engine-strict`, so `engines` is advisory.
- **Tier scripts vs D-011:** consistent. Folder globs are used, smoke = `smoke/**` (GET-only: S-01, S-03, S-07, S-08, S-09), hotfix = smoke + hotfix, daily = all (`package.json:11-13`). Tags are metadata only. D-006's booking counts (hotfix 2, daily 3) match the specs.
- **CI workflow (read-only review):** triggers are PR → smoke, schedule `0 5 * * *` → daily, and dispatch choice (`e2e.yml:2-13,40`). Least-privilege `contents: read`. Static concurrency group with `cancel-in-progress:false` serialises shared-demo writes. Secrets are blanked on PRs (`:42-43`). The tier is validated through `case` (`:45-48`). The fail-fast on missing credentials relies on GitHub's `CI=true` → `data.ts:38` (see F-09 for Jenkins). The artifact upload is narrow, `if: always()` with 7-day retention, and excludes the registry and media. The workflow is nested under `delivery/part1-test-suite/.github`, so it is inert in this repository (documented in D-013 and README:76). **CI: NOT EXECUTED.**
- **Reporting:** built-in JUnit, one XML per spec, with `[S-xx][R-yy]` titles. `run-summary.json` preserves per-attempt states, #418 counts, booking observations and cleanup. The final run's primary status string predates the FAIL-first correction (manifest:3); the assessed outcome is FAIL / CORE INCOMPLETE, and the CLI exited with code 2.
- **README/DECISIONS vs observed limitations:**
  - S-10/S-11 are marked INCOMPLETE, failing (README:38,64,68; D-017 limit).
  - 390x844 is described as desktop-engine viewport coverage, not Safari/iOS (README:70; D-007:115).
  - Smoke is described as limited, with "A smoke pass alone does not justify a release" (README:18,22).
  - Findings are kept as observations, not bugs (README:82; D-016).
  - CI, Xray and real-device validation are all stated as unverified or unexecuted (README:60,70,76; D-008, D-013).
  - The nine #418 occurrences match the evidence.
- **Overclaims:** none material. Minor issues: README:37 "initial URL dates" (F-07); D-015's "2/2" was not re-verified by this review; D-017 is `accepted` as an oracle while unproven, which is acceptable given its explicit limit clause.

## Missing tests or coverage

- A passing real-UI booking at either viewport (F-01). The confirmation UI is unproven.
- A live exercise of the identity-mismatch path is not possible safely on a shared demo; the mocked proofs stand in for it.
- Deferred by decision (not defects): admin UI login, messages, room CRUD, real iPhone, Xray import, CI execution.

## Flakiness risks

- The synthetic drag depends on layout, scroll offset and viewport (F-10). The outcome of the `Selected` check depends on the random date window (F-02).
- `roomAndDates()` uses `rooms[0]` and random far-future windows, so the outcome varies with demo resets. The 409 overlap check is deliberate and safe.
- #418 occurs on every UI visit. If its frequency or position changes, the global tolerance hides the change (D-018 changes 3 and 4).

## Maintainability notes

- The helpers are small, typed and well bounded: Node tasks own authentication and cleanup, and the page module owns selectors. `.rbc-*` library classes and `input.room-*` classes are the best hooks available; D-017 asks for `data-testid`.
- The `import` at the bottom of `e2e.ts:18` works through hoisting but reads oddly. Move it to the top.
- The diagnostic DOM dump lives in the smoke spec (F-07).

## Security/data concerns

None blocking. The TOCTOU between identity GET and DELETE is documented (D-009:134). The D-016 observations (anonymous message count; a logged-out token still valid) remain open with Product/Security.

## Questions

1. Where is the original React #418 failure text preserved (2335 XML or attempts JSON), given the CLI text has no `418` string?
2. Which S-11 attempt produced booking id 6 in the final run (F-06)?
3. Is a live rerun of HEAD authorized (F-03)?

## Verdict

**CHANGES REQUESTED**

The suite's safety architecture is sound and verified against evidence:
- Node-only credentials and sanitized failures.
- Identity-checked, ownership-scoped cleanup that survives ID reuse in mocked proofs.
- Four live creates deleted, zero unresolved obligations.
- No sensitive data in the artifacts.

Reporting is honest: claims a-e are confirmed, and README/DECISIONS disclose that S-10/S-11 fail, that the 390x844 viewport is not iOS, and that CI, Xray and real devices are unverified. Changes are still required:
- The P0 guest booking journey has never passed (F-01), and its step-level selection check cannot discriminate a working drag from the URL pre-selection (F-02).
- The committed final source has not been executed live (F-03).
- D-018 needs scoping, ceiling and CI-visibility changes before it can be accepted (F-05).

None of these is a safety or privacy blocker, so the verdict is not BLOCKED.

## Minimum next steps (ordered)

1. error-analyst: RCA for S-10/S-11 using the handoff below. Classify before any fix.
2. test-automation-writer: depending on the RCA, fix the drag driver (F-10) and strengthen `reservation.ts:44` (F-02) without touching the final assertions. Add a test or attempt identifier to observations (F-06).
3. Apply the D-018 changes (scope, anchored match, ceiling, JUnit/CI visibility, ticket and expiry). Keep it `proposed` until the error-analyst confirms the original evidence.
4. Add the source SHA to `run-summary.json` (F-04), then run one authorized live `npm run daily` at the committed SHA (F-03). Archive the results under a new manifest entry.
5. Fix the low items: F-07, F-08, F-09, and the root `package-lock.json` (F-11).
6. Re-review, then qa-report-writer.

## Handoff to error-analyst

Questions to resolve:
1. S-10 (1280x800): which element covers the `body` centre after `scrollIntoView({offset:-120})`? Does `mousedown` on `.rbc-day-bg` reach react-big-calendar's selection handler at all, given the `.rbc-row-content` overlay?
2. S-11 (390x844): in the final attempt that POSTed 201 / id 6 with the URL window (2029-01-29..31), did `onSelectSlot` fire? Was the visible `Selected` event the URL pre-selection rendered in leading off-range cells (F-02)?
3. Does the reservation form submit the query-string dates regardless of a later calendar selection? Reproduce manually or outside Cypress with a real pointer and no test code. This separates H1 (test interaction) from H2 (product).
4. Is the #418 client re-render timed so that it overlaps the drag (H3)? Where is the original #418 failure text (2335 XML or attempts)?

Start from:
- `command-output/20261009-0000-final-daily-results-65f56ae2532bb2917ac26610d4219908.xml` (lines 7, 39)
- `20261009-0000-final-daily-attempts.json` (`.bookingObservations`, `.browserSymptoms`)
- `20261008-2354-results-d9b0301955d7b82d4df79657cafad962.xml` (lines 7, 39)
- `20261008-2345-calendar-query-*`, `20261008-2348-calendar-scroll-*`, `20261008-2351-calendar-hit-point-*`
- `notes/20261008-2345-reservation-dom-inspection.json`
- `20261008-2335-smoke-ui*`, `20261008-2339-smoke-hydration-diagnostic.txt`
- Source: `cypress/support/pages/reservation.ts:3-45`, `cypress/support/e2e.ts:2-9`

Classification options (one primary per failure): `test bug` (interaction or hit-testing, non-discriminating step check) / `product bug` (query dates override the selection) / `data issue` (date-window placement relative to the visible month) / `environment issue` (headless Electron layout, #418 re-render timing) / `unknown`, which requires a targeted diagnostic next and no confident fix.

# Automation Implementation - qa-lead-take-home

## Stage 7 - reduced booking journey

Status: **READY FOR REVIEW**. Scoped to S-10/S-11. In the targeted run, both tests passed on the first attempt under the temporary #418 allowance, and that run's status was `PASS WITH RISKS`. The full daily run is **FAIL: CORE INCOMPLETE**: smoke UI S-07/S-08/S-09 failed on #418, and they have no allowance by user scope.

### Tested source
- HEAD `63e0b5c` (delivery commit `0225278`). Delivery tree `54d9e8bc962211cc8e58892b1579645ce7254cc3`, cypress tree `bc72923941f0765e28db1a71bd5a04de5601f11e`.
- The working tree was clean except the unrelated root `package-lock.json`.
- After execution, the delivery tree changed only in README (documentation): the two "pending execution" markers were replaced with the observed results, and the older "Latest local daily run" sentence was relabelled "Earlier ... (before Stage 7)".

### Changes (user-authorized scope)
- `cypress/e2e/hotfix/guest-booking.cy.ts`
  - Reduced journey: URL-preselected dates (the target dates are in the query string), and the calendar is not driven.
  - Steps: `openForm()`, then pre-submit `assertPriceSummary(roomPrice, 2)`, then `fillGuest`, then submit.
  - The intercept is observation-only and unchanged. All business assertions are kept. The titles are renamed.
  - Temporary #418 allowance, test-scoped with `cy.on`:
    - The message must contain `Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]=`.
    - If the stack has any `/_next/static/chunks/` frame, it must contain `/_next/static/chunks/174b7k13ybrt2.js`.
    - At most one match per page load (`window:before:load` resets the counter).
    - Any other error, or an extra match, fails the test.
    - Each occurrence is recorded with `recordAllowedAppErrors` in `afterEach`.
- `cypress/support/pages/reservation.ts`
  - Removed the CDP/drag/geometry driver; git history keeps it.
  - `reservationUrl(roomid, dates)` now passes the target dates directly.
  - Added `assertPriceSummary`: `£{price} x {n} nights` and `Total £{price*n+40}`.
- `cypress/support/node-tasks.ts`
  - New `recordAllowedAppErrors` task, which prints to the CLI and persists `allowedAppErrors` in run-summary.
  - Any recorded occurrence turns an otherwise passing run into `PASS WITH RISKS`. FAIL precedence is unchanged, and `cleanupStatus` stays separate.
- `tests/cleanup.test.mjs`: one new proof, "an allowed #418 occurrence yields PASS WITH RISKS, not PASS".
- Cleanup behaviour is unchanged: identity GET before DELETE, verify 404, ID guard, registry. No request rewriting, stubs, state setting or `force`.

### Commands and exit codes (evidence in `evidence/command-output/`)
| Command | Exit | Evidence |
|---|---|---|
| typecheck | 2 | `20261009-012210-stage7-typecheck.txt` (TS18048 in reservation.ts) |
| cleanup proofs | 0 | `20261009-012212-stage7-cleanup-proofs.txt` (9/9) |
| typecheck rerun after fix | 0 | `20261009-012230-stage7-typecheck-rerun.txt` |
| cleanup proofs rerun | 0 | `20261009-012231-stage7-cleanup-proofs-rerun.txt` (9/9) |
| `run hotfix -- --spec cypress/e2e/hotfix/guest-booking.cy.ts` | 0 | `20261009-012415-stage7-s10-s11.txt` and `20261009-stage7-s10-s11-{run-summary.json,cleanup-registry.json,cleanup-outcomes.jsonl,junit.xml}` |
| `run daily` | 3 | `20261009-012501-stage7-daily.txt` and `20261009-stage7-daily-{run-summary.json,cleanup-registry.json,cleanup-outcomes.jsonl}`, `20261009-stage7-daily-junit/` |

Credentials were supplied only as an environment prefix on the command line. A grep of the stage7 evidence for `password`, `token=`, `Set-Cookie` and the synthetic token found no matches.

### Results (per-attempt data from run-summary, not JUnit)
**S-10/S-11 run `bc081863-b368-43f7-a964-398a402bf964`:** 2/2 passed. Status `PASS WITH RISKS`, cleanup RESOLVED, 0 unresolved.

| Test | Attempts | Status | ID | Submitted dates |
|---|---|---|---|---|
| S-10 | passed on the first attempt, no retry | 201 | 4 | 2029-05-14..2029-05-16 (equal to expected) |
| S-11 | passed on the first attempt, no retry | 201 | 5 | 2029-07-16..2029-07-18 (equal to expected) |

- `allowedAppErrors`: 2 entries, one per test, all with attempt 0, load 1, `stackSourceMatched=true`, firstChunkFrame `174b7k13ybrt2.js`, `allowed=true`.
- Cleanup: id 4 and id 5 were both `deleted-and-absent` (202). The registry is `[]`.

**Daily run `92ae02d0-b871-4924-8826-3d0bfe85b283`:** 6 passed, 3 failed. Status `FAIL: CORE INCOMPLETE`, cleanup RESOLVED, 0 unresolved.

| Test | Result | Detail |
|---|---|---|
| S-31, S-14 | passed on the first attempt | |
| S-10 | passed on the first attempt | 201, id 7, 2028-10-23..2028-10-25 |
| S-11 | passed on the first attempt | 201, id 8, 2029-06-04..2029-06-06 |
| S-01, S-03 | passed on the first attempt | |
| S-07, S-08, S-09 | failed on the initial attempt and the retry | finalSymptom `react-hydration-418`; no allowance outside the booking spec, by scope |

- `allowedAppErrors`: 2 entries (S-10 and S-11), same shape as in the S-10/S-11 run.
- Cleanup: ids 6, 7 and 8 were all `deleted-and-absent` (202). The registry is `[]`.

### Deferred and not validated
- Calendar interaction (drag selection) is **DEFERRED coverage**.
- The #418 allowance is temporary. Diagnostics suggest it is runner-induced, but the mechanism is not isolated, and this does not prove the app is defect-free.
- Smoke UI coverage stays blocked by #418.
- Not validated: CI (Jenkins/Bitbucket/GitHub), Xray import, real device, Safari, iOS. 390x844 is a desktop-engine viewport only.

---

## Previous stage (superseded by Stage 7)

Status: **BLOCKED**. The live S-10/S-11 run failed 0/2 on both attempts because of the unsuppressed application error React #418. Following Step 3, the full daily core was not run. The calendar driver and selection proof have still not been validated live.

## Upstream handoffs consumed

- AGENTS.md, GUARDRAILS, AI_OPERATING_MODEL, LOOPS, WORKFLOW and the test-automation-writer SKILL.md.
- 04-code-review.md (F-02, F-05, F-06, F-10, D-018 section) and 05-error-analysis.md (final native timeline, minimum recommended correction, acceptance checks).
- RCA script `evidence/notes/20261009-rca-native-pointer.mjs`, used for the native pointer sequence and hit-point geometry.
- User-required changes 1-5 for this iteration, as relayed by the coordinator. These are binding: native pointer driver, exact selection proof, preserved business assertions, #418 suppression removed, cleanup unchanged.

## Files changed (Phase A, committed by coordinator as c65c14c)

All files are under `delivery/part1-test-suite/`.

| File | Purpose |
|---|---|
| `cypress/support/pages/reservation.ts` | Native CDP pointer drag on the real calendar cells. `initialWindow()` produces two discriminating initial URL windows. Selection proof uses a pre-drag snapshot and exact target-cell assertions. `openForm` and `fillGuest` are unchanged. |
| `cypress/e2e/hotfix/guest-booking.cy.ts` | S-10 uses `inside-target-month` and S-11 uses `outside-target-month`. `recordBookingObservation` now records `test` (titlePath), `attempt` (currentRetry), `observedAt` and `initialWindow`. Business assertions are unchanged. |
| `cypress/support/e2e.ts` | No `uncaught:exception` handler at all. Keeps witness drain registration and `cleanupCurrentAttempt`. |
| `cypress/support/node-tasks.ts` | Removed the `recordBrowserSymptoms` task, the `browserSymptoms` state and summary field, and the symptom-only `PASS WITH RISKS` branch. `PASS WITH RISKS` now comes only from cleanup problems, and FAIL keeps precedence. Accepts the new observation fields. `failureSymptom` maps the new tagged messages. Cleanup logic is untouched. |

Post-execution documentation change (Phase B, not part of the tested commit): `README.md` sections "Mobile coverage and application symptoms" now match the observed results and the removal of the #418 toleration.

## Design decisions

- **Driver.** The driver sends Chrome DevTools Protocol input through `Cypress.automation('remote:debugger:protocol', {command:'Input.dispatchMouseEvent'})`. This adds no dependency. The input sequence copies the RCA: move, press on the bottom-centre of the check-in `.rbc-day-bg` (4px above its bottom edge), 12 moves with `buttons:1`, then release on the last-night cell. `cypress-real-events` is only a fallback proposal if CDP turns out to be unavailable, and it has not been installed.
- **Iframe mapping.**
  - The runner `iframe.aut-iframe` class was confirmed read-only in the Cypress 15.5 bundle.
  - The driver asserts `iframe.contentWindow === AUT window`.
  - Scale is `iframeRect.width / aut.innerWidth`, and the height ratio must agree within 0.01.
  - The top-page point is `iframeRect.left/top + local * scale`.
- **Stability and hit-testing.** The order is:
  1. Navigate with Next, asserting the label after every click.
  2. Scroll the target row to the centre with native `scrollIntoView`.
  3. Wait for 3 consecutive identical month-view rect and scroll reads.
  4. Re-read the rects in the same `.then` that dispatches.

  `elementFromPoint` at both AUT-local points must be inside `.rbc-month-view`, in the target `.rbc-month-row`, and not on an `.rbc-event`. A passive capture listener must see a trusted mousedown in the target row and a trusted mouseup.
- **Selection proof.**
  - Pre-drag snapshot: each Selected segment as row, first/last column and left/right px, measured from the `.rbc-row-segment` wrapper.
  - S-10 precondition: the URL Selected event is visible in the target month and does not equal the target.
  - S-11 precondition: no Selected segment in the target month view.
  - After the drag, in a retrying `should`:
    - exactly one Selected segment;
    - in the check-in row;
    - left edge within ±2px of the check-in cell;
    - right edge within ±2px of the last-night cell;
    - columns exactly `[checkinCol, lastNightCol]`;
    - not equal to any pre-drag segment.
- **Initial windows.**
  - Inside: target -7 days, or +14 days for check-in days 1-7. This is always the same month on a different row.
  - Outside: target -60 days, which can never appear in the target view.
  - The "minus 14" example was not used because, for check-in days up to 14, it can fall outside the visible month.
- **Failure messages** are tagged: `[native-pointer]`, `[calendar-hit-target]`, `[calendar-geometry]`, `[calendar-precondition]`, `[calendar-selection]`. There is no `force`, no `cy.on('fail')`, no stubs or request rewriting, and no state or URL bypass.

## Data and cleanup behavior

Cleanup behaviour is unchanged from the previous iteration:

- Full identity GET before DELETE, comparing the ID and all identity fields.
- 404 absence verified after the delete.
- Positive safe-integer ID guard.
- Unresolved obligations reported separately from test results.
- Registry throw in `after:run`.

`tests/cleanup.test.mjs` needed no changes.

## Tested source

| Item | Value |
|---|---|
| Delivery commit | c65c14c (coordinator-reported) |
| HEAD | 2a515a2d51ed1bec7df98d25a1d2749b12baa392. Read from the worktree's git ref file because git commands were refused by the session guard (`evidence/command-output/20261009-phaseB-source-state.md`). |
| Delivery tree | 88aca0dac59952befb4edc4f69733315cf3dc460 (coordinator-reported, not recomputed here) |
| Working tree | Clean except the unrelated root package-lock.json, per the coordinator. This agent made no delivery edits before the run. |

## Validation commands run

Each command was run from the worktree root through `scripts/collect-evidence.sh`. Credentials were passed only as an environment prefix; the evidence records only the command arguments.

| Phase | Command | Exit | Result | Evidence (`evidence/command-output/`) |
|---|---|---|---|---|
| A | `npm --prefix delivery/part1-test-suite run typecheck` | 0 | tsc clean | `20261009-005245-phaseA-typecheck.txt` |
| A | `npm --prefix delivery/part1-test-suite run test:cleanup` | 0 | 8 pass / 0 fail (mocked) | `20261009-005247-phaseA-cleanup-proofs.txt` |
| B | `npm --prefix delivery/part1-test-suite run hotfix -- --spec cypress/e2e/hotfix/guest-booking.cy.ts --reporter-options mochaFile=results/junit/phaseB-s10-s11/results-[hash].xml` | 2 | 2 tests, 0 passed, 2 failed (Electron 138 headless, Cypress 15.5.0, Node 24.11.1) | `20261009-005621-phaseB-s10-s11.txt`, `20261009-phaseB-s10-s11-run-summary.json`, `20261009-phaseB-s10-s11-results-43de883c2ab13fb2f439a864edd0dd34.xml`, `20261009-phaseB-s10-s11-cleanup-registry.json`, `20261009-phaseB-s10-s11-cleanup-outcomes.jsonl` (0 lines: the run id `5ee8b744-7fca-49c9-9786-74dbc79f3ef9` has no outcomes) |
| B | `npm run daily` (full core) | not run | Skipped by the Step 3 gate because S-10/S-11 did not pass | none |

## Results (run id 5ee8b744-7fca-49c9-9786-74dbc79f3ef9)

| Test | First attempt | Retry | Final | Symptom tag |
|---|---|---|---|---|
| [S-10] 1280x800, initial window inside target month | FAILED | FAILED | FAILED (1.783s) | `react-hydration-418` |
| [S-11] 390x844, initial window outside target month | FAILED | FAILED | FAILED (1.012s) | `react-hydration-418` |

- The final failure text in both cases is Cypress's default uncaught-exception failure: "Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]=". The stack is in the app chunk `_next/static/chunks/174b7k13ybrt2.js` (frames `rX`, `iu`, `sd`, `se`, `s$`, `MessagePort.O`). This is the hydration-mismatch error the previous iteration tolerated.
- JUnit records only the final attempt. The run summary shows both attempts as `failed`, classification `unknown`. The first-attempt failure messages are not retained individually, and I did not verify that the first attempt also failed on #418.
- **No tagged driver or selection message appeared.** `bookingObservations` is `[]`, so no booking POST was observed in any attempt. Each test lasted only 1.0-1.8s, which is far shorter than the 24+ Next clicks required. This implies, but does not prove (there are no screenshots or command log), that #418 fired during or right after `cy.visit`, before the drag. The native CDP driver, hit tests and selection proof are therefore **not exercised and not validated**.
- Run summary: status `FAIL: CORE INCOMPLETE`, totals 2/0/2/0/0, cleanup `[]`, `unresolvedCleanup` 0, cleanupStatus RESOLVED. The new summary format, without `browserSymptoms`, was produced live.

## Booking observations and cleanup

- Booking observations: none, so there is no submitted-vs-expected comparison, no status and no ID.
- 201 bookings created: none observed. Cleanup outcomes for this run: none. Registry: `[]`. Unresolved cleanup: 0. This is reported separately from the test results.
- Secret scan: `grep -il -e password -e "token=" -e cookie` over the five new Phase B artifacts found no match (exit 1).

## #418 status

- The suppression is removed, as the user required, and it was not restored.
- #418 now fails both booking tests on every attempt by default.
- Root cause (server/client markup mismatch) and user impact remain unknown.
- D-018 was not accepted (suppression removed per user instruction; DECISIONS.md status changed in c65c14c, history preserved). Any new #418 allowance would require a new explicit user decision. Options listed for that decision, as decision input only (this agent did not choose one):
  1. Keep the default failure and report S-10/S-11 as blocked by a product defect. The suite then remains red until the app is fixed.
  2. Authorize a narrow, scoped, observable allowance per 04 D-018 (anchored message, per-spec scope, per-test ceiling, CI-visible count, owner and expiry). That would be a code change and requires a new tested-source commit and rerun.
  3. Run a scoped diagnostic to time #418 relative to `cy.visit` and hydration readiness.

  Of the other smoke tests, S-07/S-08/S-09 visit UI pages and are expected to hit #418 too. This is a hypothesis; they were not run in Phase B.

## Validation not run

- Full daily core: gated off.
- The native driver, the selection proof, and the confirmation-date assertion on a live page.
- CI (GitHub Actions, Bitbucket, Jenkins), Xray import, real-device Safari/iOS, WebKit, Firefox, performance and stretch scope.
- No commits, pushes, publication or uploads by this agent.

## Known limitations and live-run risks (still open)

- Electron CDP `remote:debugger:protocol` availability is unverified live, because the server handler is inside the compiled snapshot.
- Headless AUT scaling and fractional coordinates.
- ±2px edge tolerance, which assumes the `.rbc-row-segment` box aligns with the day cells.
- Sticky navbar overlapping the target row; this would surface as `[calendar-hit-target]`.
- The stability wait uses Cypress's retry interval, which is shorter than the RCA's 50ms spacing.
- Shared-demo races and ID reuse; non-atomic read-before-delete (D-009).

## Reviewer focus areas

1. Native driver correctness: iframe mapping, the hit-test predicate, trusted-event trace, cleanup of the passive listener in `finally`.
2. Strength of the selection proof: the segment-based columns and the pixel checks, and whether the S-10/S-11 preconditions discriminate.
3. That the status precedence is unchanged after removing the symptoms branch, and the new tagged `failureSymptom` mapping.
4. #418 now blocks the P0 journey. D-018 was not accepted, so any allowance needs a new explicit user decision.

## Previous implementation iteration (superseded)

This is a summary; the full detail is in git history and the earlier evidence.

- The nine-test core was implemented: S-01, S-03, S-07, S-08, S-09, S-10, S-11, S-31 (S-12/S-15), S-14. Pins: Cypress 15.5.0, TypeScript 5.9.3, Node 24.11.1, @types/node 24.10.0. CI is configured as GitHub Actions and has not been executed. JUnit only; Xray is unverified.
- Final daily run `cdd7962f-e251-4728-afc3-7d68f9a419d8`: exit 2, 9 tests, 7 first-attempt passes, S-10/S-11 failed on both attempts.
  - S-10 failed on body actionability: "hidden from view: `<body>`".
  - One S-11 attempt sent a real 201 (ID 6) carrying the URL dates 2029-01-29..31 instead of the target 2029-02-12..14.
  - Nine #418 occurrences were tolerated by the previous global handler.
  - API ID 4 and UI ID 6 were identity-checked, deleted (202) and confirmed absent (404). Unresolved cleanup was 0.
- After that run, the ID-equality and positive-safe-integer guards and the FAIL-first summary status were tightened. They were proven locally (typecheck and 8/8 mocked proofs) but not live until this Phase B run.
- The 04 review returned CHANGES REQUESTED (F-02 weak Selected check, F-05 D-018 scope, F-06 observation attribution, F-10 body drag). The 05 RCA showed that native pointer input changes the selection at both viewports and that a native POST carries the changed dates. It recommended this iteration's correction.

## Handoff status

**BLOCKED.** The P0 guest booking journey (S-10/S-11) fails before the calendar interaction because of unsuppressed application error React #418. The corrected driver and selection proof are not yet validated live. No cleanup obligation remains. D-018 was not accepted; a new explicit user decision on #418 is needed before further live validation. If a new allowance is authorized, it needs a new code commit and a rerun of S-10/S-11, then the daily core.

# QA Final Report - qa-lead-take-home

Report date: 2026-10-09. Author: João Barbosa Martins, with AI support. Every evidence path is relative to `.agents/handoffs/qa-lead-take-home/` unless it starts with `delivery/`.

## Status at a glance

| Area | Status | Source revision / run | Evidence |
|---|---|---|---|
| **TEST EXECUTION STATUS (Part 1)** | **INCOMPLETE: reduced booking journey PASS WITH RISKS; the last full core suite FAILED 6/9; the full suite has not been rerun at the final revision** | see rows below | below |
| Reduced S-10/S-11 booking journey | PASS WITH RISKS on the first attempt (2/2, no retries) | 1e88fab, run e4d0dccd-c4a1-46c6-ad5e-1a00c16ea921 | `evidence/command-output/20261009-final-s10-s11-run-summary.json`, `...-junit.xml`, `20261009-014752-final-s10-s11.txt` |
| Last full core suite (9 tests) | FAIL: 6 passed, 3 failed (S-07/S-08/S-09 on React #418, on the first attempt and on retry) | 0225278, run 92ae02d0 | `evidence/command-output/20261009-stage7-daily-run-summary.json`, `20261009-012501-stage7-daily.txt`, run-log Stage 7 |
| Full core suite at the final revision 1e88fab | NOT RUN | - | run-log Stage 9; `evidence/notes/20261009-0004-execution-manifest.md` |
| Test-data cleanup (final run) | RESOLVED: 2 bookings created, deleted (202) and confirmed absent; registry empty; 0 unresolved | 1e88fab, run e4d0dccd | `20261009-final-s10-s11-cleanup-outcomes.jsonl`, `...-cleanup-registry.json` |
| Calendar date selection, CI, Xray, real Safari/iOS | NOT VERIFIED | - | run-log Stages 7 and 9; 04 |
| **DELIVERY READINESS** | **Parts 1-3 written and reviewed by AI. Final human review and approval are COMPLETE. Nothing committed, pushed, uploaded or sent in this closing stage.** | Part 1 tested code at 1e88fab; Parts 2/3 committed | below |
| Time spent per part | Approximately 5 hours total: Part 1, 4 hours; Parts 2 and 3 combined, 1 hour | - | run-log "Time tracking" |

Overall Part 1 status: **PASS WITH RISKS for the reduced booking journey only. INCOMPLETE for the suite.** The suite as a whole is not labelled PASS.

## Executive summary

Part 1 delivers a Cypress + TypeScript suite in `delivery/part1-test-suite/`. It covers a 9-test core: read-only smoke checks, an API booking lifecycle, and the P0 guest booking journey (S-10 at desktop size, S-11 at a phone-sized viewport). At the final corrected revision 1e88fab, the reduced booking journey passed on the first attempt, with risks. Two things carry that risk. First, the run relies on a temporary, narrowly scoped allowance for React error #418. Second, the dates come pre-selected in the URL, so the calendar interaction itself is not tested.

The last complete run of the 9-test core was at the earlier revision 0225278. It ended 6 passed, 3 failed: the three smoke UI checks failed on React #418, which they have no allowance for. The full core has not been rerun at 1e88fab.

Parts 2 and 3 are complete. AI-assisted reviews informed the corrections, and João Barbosa Martins approved the final deliverables, including his subsequent Part 3 revisions.

## Scope tested

- Read-only smoke checks of the public pages and API (S-01, S-03, S-07, S-08, S-09), plus booking validation with an intentionally invalid POST (S-14). Source: 01, 02, run-log Stage 7.
- API booking lifecycle (S-31): create 201, an identical overlapping booking rejected 409, admin read/list/report, delete 202, then GET 404. Source: run-log Stage 3 and Stage 7.
- Guest booking journey S-10 (1280x800) and S-11 (390x844). These are now reduced to URL-preselected dates (D-020). Calendar interaction is deferred.
- Out of scope or deferred: the 30-scenario catalogue beyond the core (01), calendar driving, load testing, admin UI.

## Approach

- Full flow: test-specifier -> test-architect -> test-automation-writer -> automation-reviewer -> error-analyst -> test-automation-writer (corrections) -> automation-reviewer (re-review and verification) -> qa-report-writer. No stage was skipped. The run-log records each stage and its timebox.
- Testing ran against the real demo backend with synthetic data that has unique markers. Credentials came only from environment variables. Cleanup deleted only records whose ownership was verified. Screenshots and videos were turned off for privacy (README, D-decisions).

## Automation delivered

- `delivery/part1-test-suite/`: Cypress 15.5.0 and TypeScript 5.9.3 with exact version pins and a lockfile, plus Node tasks for authentication and cleanup, a JUnit and run-summary reporter, a reference GitHub Actions workflow (configured, never executed), README.md and DECISIONS.md (D-001..D-020).
- Temporary React #418 allowance (D-019). Per the evidence, it:
  - applies only inside the booking spec (`guest-booking.cy.ts`, a test-scoped `cy.on`); there is no global handler, and the smoke specs get no allowance;
  - accepts at most **one** #418 per test, and only when the message matches exactly **and** the stack origin matches the app chunk (`stackSourceMatched === true`). Since 1e88fab, a missing or different origin fails the test (R-01 fix; verified in 04, "Verification of final corrections");
  - records every occurrence in the run summary and prints it as a CLI `[browser error]` line. Any other or extra error fails the test;
  - is **temporary**. The removal condition is documented in D-019. No ticket or owner has been invented.
- In the final run, the allowance accepted 2 errors, one per test. Each was attempt 0, load 1, `messageMatched` true, `stackSourceMatched` true, chunk `/_next/static/chunks/174b7k13ybrt2.js`. Nothing was rejected. Evidence: `20261009-final-s10-s11-run-summary.json`, `20261009-014752-final-s10-s11.txt:111,113`.

## Validation evidence

| Check | Revision | Result | Evidence |
|---|---|---|---|
| Typecheck | 1e88fab | exit 0 | `evidence/command-output/20261009-014618-final-typecheck.txt` |
| Local cleanup and safety proofs | 1e88fab | 9/9, exit 0 | `evidence/command-output/20261009-014620-final-cleanup-proofs.txt` |
| Live S-10/S-11 | 1e88fab, run e4d0dccd | 2/2 on the first attempt, CLI exit 0, "All specs passed!", status PASS WITH RISKS | `20261009-014752-final-s10-s11.txt:141`, `20261009-final-s10-s11-junit.xml` (tests=2, failures=0) |
| Live S-10/S-11 | 0225278, run bc081863 | 2/2 on the first attempt, PASS WITH RISKS | `20261009-012415-stage7-s10-s11.txt`, `20261009-stage7-s10-s11-run-summary.json` |
| Live 9-test core | 0225278, run 92ae02d0 | 6 passed / 3 failed, exit 3, FAIL: CORE INCOMPLETE | `20261009-012501-stage7-daily.txt`, `20261009-stage7-daily-run-summary.json` |
| Earlier history (superseded) | pre-bcd8002 run cdd7962f; c65c14c run 5ee8b744 | 7/9 with S-10/S-11 failing; then S-10/S-11 failing on unsuppressed #418 | run-log Stages 3 and 5; 05 |

In the final run, the submitted booking dates matched the expected dates (2028-12-04..06) for both tests: S-10 got 201 with id 4, S-11 got 201 with id 5. Both tests drew the same random window. This is consistent with id 4 being deleted before S-11 ran, but it was not investigated (run-log Stage 9).

## Results

- **Reduced booking journey (S-10/S-11): PASS WITH RISKS** at 1e88fab, run e4d0dccd, on the first attempt.
- **Last full core suite: 6 passed / 3 failed** at 0225278, run 92ae02d0. S-07, S-08 and S-09 failed on React #418 on the first attempt and on retry.
- **No full-suite rerun at the final corrected revision 1e88fab.** The 1e88fab changes touch only the booking-spec allowance condition, a log label in a task that only the booking spec uses, comments and documentation (run-log Stage 9; 04 verification). *Assumption:* the smoke specs would still fail on #418 at 1e88fab, because they were not changed. This has not been verified.

## Cleanup

- Final run e4d0dccd: bookings 4 and 5 are each `deleted-and-absent` (202). The registry is `[]`, `unresolvedCleanup` is 0 and `cleanupStatus` is RESOLVED. I checked these files directly in this pass.
- Earlier runs, as recorded in the run-log and in 04/05 (not re-inspected file by file in this pass): Stage 3 and Stage 7 runs resolved with empty registries. The RCA diagnostic booking (id 4, marker qaxtugqwgm) was deleted (202) and verified 404. Phase B created no bookings. One false ID-less cleanup entry from a rejected 400 RCA attempt is reconciled in `evidence/notes/20261009-rca-execution-notes.md`.
- Conclusion: cleanup is complete, and the evidence shows no unresolved cleanup obligations. No third-party records, rooms, global settings or messages were changed after contract discovery. The discovery message and booking were deleted and verified (run-log Stage 2a).

## Defects or risks

| ID | Severity | Risk | Status |
|---|---|---|---|
| R-06 | High | The smoke UI checks (S-07/S-08/S-09) fail on React #418 under Cypress | Open; needs a separate decision (04) |
| D-019 | Medium | The #418 allowance could mask a real hydration defect | Temporary, scoped and visible; removal condition documented |
| D-020 | Medium | Calendar date selection is untested; the dates come from the URL | Deferred coverage |
| R-04 | Low | PASS WITH RISKS does not show in JUnit or in the exit code | Open |
| F-04, F-07, F-08, F-09, F-11 | Low | Open review notes; for example, the run summary carries no source SHA | Open (04) |
| Env | - | CI, Xray and real Safari/iOS were never exercised; the 390x844 viewport is not Safari/iOS | NOT VERIFIED |

Product observations from contract discovery (not suite failures): `/api/message/count` answers without authentication, and an admin token stays valid after logout. Source: `evidence/notes/20261008-2305-observed-api-contracts.md`.

## RCA summary

- Original S-10/S-11 failures: test bugs, specifically calendar actionability and a selection check that could not tell a working drag from the URL pre-selection (05).
- React #418 is associated with the Cypress execution context in the observed comparisons: it appeared 12/12 times under Cypress in both Electron and Chrome, and 0 times in plain headless Chrome (control). Confidence is medium-high. The injection mechanism remains a hypothesis rather than a proven exclusive cause; real-user impact is unknown, and Safari, Firefox and real mobile devices were not covered (05; run-log Stage 6).

## CI/CD and maintainability notes

- The GitHub Actions reference workflow is configured but has never run. There is no Jenkins/Bitbucket pipeline and no Xray upload.
- The runtime and libraries are pinned (Node 24.11.1, Cypress 15.5.0, TS 5.9.3), and `npm ci` was verified clean (`20261008-2357-npm-ci.txt`).
- Unrelated item: the root `package-lock.json` has an unexplained, uncommitted change. It was left untouched (run-log Stage 2b).

## Parts 2 and 3 (summary)

- `delivery/part2-test-plan-review.md`: a review of the junior engineer's test plan. Of the 12 cases plus the nurse note: 2 Remove, 5 Fix, 3 Replace, 2 Question. It adds 10 missing scenarios and 13 questions, and drafts a message to the junior engineer (draft only, not sent). Assumptions P2-A1..A5 are in `evidence/notes/20261009-part2-3-decisions.md`.
- `delivery/part3-qa-process.md`: about one page. It covers shared quality ownership, release and hotfix checklists, a 30/60/90-day plan, "not yet" items, metrics without invented figures, and the candidate's revisions on Three Amigos handoffs, the 30/60/90-day plan, shared quality culture, and an open working environment.
- Combined AI reviews (`part2-3-review.md`) informed the final corrections. The final review's two wording findings were applied. Subsequent candidate-directed Part 3 revisions were incorporated with Codex support and approved by the candidate.

## AI-assisted QA usage

This work was developed collaboratively by me with Claude and Codex as supporting tools, not as an independently produced AI deliverable. I remained human-in-the-loop through scope decisions, approvals and iterative feedback, and human-on-the-loop through supervision of execution, evidence and risks. AI supported analysis, drafting, implementation and review where applicable; I retain responsibility for the conclusions and submission. Final human review and approval have been completed.

- Claude coordinated specialist agents, while Codex supported implementation, validation, later edits and delivery preparation: test-specifier (spec, Part 2 draft), test-architect (architecture), test-automation-writer (implementation, corrections, live runs), automation-reviewer (code reviews, Part 1 verification, Parts 2/3 review), error-analyst (RCA, #418 diagnostic) and qa-report-writer (Part 3 draft, this report).
- Independent checks: the coordinator re-checked each agent's claims against the evidence files using jq and grep (run-log, "coordinator verification" entries). Reviewer agents did not mark their own output as verified.
- Recorded deviations: 5 unauthorized early local commits (kept, not pushed), one guessed 404 route, and an analyst timestamp estimate later corrected (run-log).
- **Human direction, supervision and iterative review have taken place throughout. Final human review and approval of the deliverables are complete.**

## Delivery readiness

- Written: the Part 1 suite, README and DECISIONS (code at 1e88fab), Part 2, Part 3, and handoffs 01-06.
- AI-reviewed: Part 1 (04, APPROVE WITH NOTES for the change set; not a release approval) and Parts 2/3 (`part2-3-review.md`).
- Pending: Google Drive upload and verification of Drive file permissions. The repository has been published, and the candidate supplied session links and transcript records. The candidate accepted the documented limitations; R-06 remains a technical follow-up, not a new investigation in this submission.
- **Nothing has been committed, pushed, uploaded or sent in this closing stage.**

## Time spent per part

| Part | Human time |
|---|---|
| Part 1 | Approximately 4 hours (candidate estimate, corroborated by the overnight logs; includes investigation, corrections and review) |
| Parts 2 and 3 combined | Approximately 1 hour, including production, review and adjustments (candidate-reported; not tracked separately) |
| Total | Approximately 5 hours |

Part 1 includes work through the final independent verification. Parts 2 and 3 were tracked together, so no separate per-part breakdown is claimed. These estimates were confirmed by the candidate. Agent wall-clock time is not substituted for human working time.

## Submission steps and future work

Submission: package the approved deliverables and selected evidence; preserve incremental suite history; include the supplied AI-session links and transcripts; verify anonymous access to Drive files after upload.

Future engineering work, outside the completed timebox: resolve the smoke UI hydration failures, restore calendar interaction coverage, record source SHAs automatically, execute CI, validate Xray integration, and test real Safari/iOS. A complete suite run is needed after future code changes before claiming full-suite success.

## Final status

**Part 1 test execution: INCOMPLETE.** The reduced S-10/S-11 journey is PASS WITH RISKS at 1e88fab (run e4d0dccd). The last full core was 6/9 FAIL at 0225278 (run 92ae02d0), and it has not been rerun at 1e88fab.

**Delivery readiness: developed under human direction and reviewed with AI support; final human review and approval are complete.**

## AI sessions and transcripts

- [Claude session summary](https://claude.ai/artifact/AET4HD3cJWYBPZHKq5HJQn) — condensed account, not the full transcript.
- [Codex session presentation](https://qa-lead-take-home-session.elatedpeony.chatgpt.site).
- [Claude transcript in this repository](https://github.com/joaopedro-bs/qaLeadBravoCare/blob/main/2026-10-09-210910-we-will-prepare-the-qa-lead-take-home-exercise-in.txt).
- [Codex transcript in this repository](https://github.com/joaopedro-bs/qaLeadBravoCare/blob/main/codex-session-01a11e63-0975-7f03-b06b-6a54e6dc802e.md).

The transcript files are supplied session records; the Claude artifact is explicitly a summary. This work was developed collaboratively by João Barbosa Martins with AI support, with human-in-the-loop decisions and feedback and human-on-the-loop supervision. The candidate reviewed and approved the deliverables and remains responsible for the submission.

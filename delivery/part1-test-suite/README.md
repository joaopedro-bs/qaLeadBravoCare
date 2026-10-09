# Restful Booker QA foundation

Cypress + TypeScript checks for https://automationintesting.online, a shared, resettable demo. Nine core scenarios are implemented for public contracts, guest browsing, reservation form, booking at two viewports, validation and the guest-to-admin API boundary. The two booking UI scenarios pass in a reduced, URL-preselected journey under a temporary React #418 allowance (PASS WITH RISKS, one allowed #418 per test, at tested revision `0225278`); the nights count and price prove duration and pricing, not the exact dates, which are asserted in the request, the 201 response and the confirmation. Calendar selection is deferred (untested). The full core suite FAILED at tested revision `0225278` (run `92ae02d0`): 6 passed, 3 failed (S-07/S-08/S-09 on React #418). Final targeted S-10/S-11 rerun at the corrected revision `1e88fab` (run `e4d0dccd`): both passed on the first attempt, each with one allowed #418 (stack source matched), and both bookings were deleted and verified absent, so the run status is **PASS WITH RISKS**; the full core suite was not rerun at this revision. No backend stubs or request-field rewrites are used.

## Run locally

Use Node 24.11.1 LTS. Exact dependency pins and the lockfile make installation reproducible; the local Node dev dependency also makes npm scripts use this runtime when the host Node differs.

```sh
npm ci
npm run typecheck
npm run test:cleanup
npm run smoke
```

For writes, supply the assignment's demo credentials through `CYPRESS_ADMIN_USER` and `CYPRESS_ADMIN_PASSWORD` environment variables (or CI secrets `ADMIN_USER` / `ADMIN_PASSWORD`). Do not commit credential files or put values in command arguments. Then run `npm run hotfix` or `npm run daily`. `BASE_URL` defaults to the demo; only change it to an authorized environment.

Missing credentials mean write coverage is **unexecuted**: write specs skip locally with a visible message and fail in CI. A smoke pass alone does not justify a release.

| Script | Selection | Intended use |
|---|---|---|
| `smoke` | Five read-only checks | PR feedback; limited availability/contract check |
| `hotfix` | Smoke + two real guest bookings | On-demand hotfix gate |
| `daily` | All nine core scenarios | Daily schedule / pre-release foundation |
| `test:cleanup` | Mocked Node safety proofs | Local identity/obligation safety, not live integration |
| `cy:open` | Cypress interactive runner | Targeted debugging |

Use `npm run daily -- --spec cypress/e2e/daily/booking-api.cy.ts` for a narrow run. Folders select tiers; title tags are traceability metadata, not filters.

## Scenario map

| Scenario / requirements | File | Assertions / coverage intent |
|---|---|---|
| S-01 / R-01,R-03 | `smoke/api-contracts.cy.ts` | Live room field types, no seed/count oracle |
| S-03 / R-02,R-03 | same | Anonymous booking list returns observed 401 contract |
| S-07,S-08 / R-01,R-08 | `smoke/home.cy.ts` | Each API room's own reservation link and displayed type/description/price; desktop and 390x844 |
| S-09 / R-01 | `smoke/reservation-page.cy.ts` | API-sourced room, initial URL dates and visible booking inputs; no submission or claim of changed dates |
| S-10,S-11 / R-01,R-08 | `hotfix/guest-booking.cy.ts` | URL-preselected dates, pre-submit price summary (`£{price} x 2 nights`, Total), form, unchanged request, real 201 and visible confirmation at 1280x800 and 390x844. Live: both passed first attempt in two runs (`bc081863`, `92ae02d0`), each with one allowed #418 per test → **PASS WITH RISKS** |
| Calendar interaction (drag selection) / R-01 | none | **DEFERRED coverage.** The native-pointer drag driver did not validate live; it was removed from the suite (kept in git history) |
| S-31 (S-12,S-15) / R-01,R-02,R-03 | `daily/booking-api.cy.ts` | Guest create, deliberate identical overlap, own admin record/list visibility, report, identity-checked delete and absent GET |
| S-14 / R-01,R-03 | same | Observed field validation errors; unexpected successful creation is registered for cleanup |

The earlier display-name oracle was corrected after inspection: room cards show the room **type**, not `roomName`. The room-specific reservation URL preserves identity while card fields prove rendering of the live record.

## Shared-demo data and cleanup

Each attempt uses its own short alphabetic marker, synthetic name/contact data and report-checked future dates. Execution is serial; there is at most one retry. No third-party record, global room or branding settings are changed. The UI stays anonymous: the admin token is held only in Node for subsequent verification and cleanup.

The returned ID is saved with marker, room, names, dates and deposit flag in `results/cleanup-registry.json` before assertions. Before DELETE, an authenticated GET must match every stored identifying field. Absent records are already gone. A mismatched or unverifiable identity is not deleted and remains an obligation. Successful DELETE is followed by an absence check. These checks cannot be atomic because no conditional-delete contract was observed.

Cleanup outcomes are separately recorded in `results/cleanup-outcomes.jsonl` and the run summary. Cleanup HTTP failures do not replace original test failures or erase entries. Unresolved obligations make the run unsuccessful. Keep the registry after an interrupted run; inspect the exact record and identity manually before any recovery. The suite never sweeps marker patterns or automatically deletes old-run records.

A 404 or unexpected 409 is a symptom with **unknown cause**, unless separate evidence supports an explanation. The intentional identical-overlap scenario specifically tests the observed 409 contract. `results/run-summary.json` preserves every retry attempt, including failed attempts before a final pass.

## Privacy and reporting

Credentials and tokens remain in the Node process, never in browser state. Cypress's credential env imports are removed from browser config. Sensitive requests are performed by small Node tasks with sanitized transport failures; admin record bodies stay in Node. Form typing and intercepted request waits suppress command logging, and contact assertions expose booleans rather than contact values.

Screenshots/videos are disabled to prevent accidental capture of private application or Cypress command-panel content. JUnit plus sanitized status/attempt/cleanup evidence replaces automatic media capture. CI uploads only those explicit paths, excluding the cleanup registry and raw browser/API artifacts. Manually inspect any additional artifact before sharing it.

JUnit XML is generated per spec in `results/junit/`; titles carry scenario/requirement IDs. Xray import, existing keys and mapping remain **unverified**. Use the separate run summary to assess retries and cleanup, rather than treating final JUnit status as a clean first run.

## Mobile coverage and application symptoms

Earlier local daily run (before Stage 7; the latest is `92ae02d0`, below): **7 passed, 2 failed, 0 pending/skipped**; both UI booking scenarios failed on their initial attempt and retry. The seven passes were first-attempt passes. Two created records in that run were identity-checked, deleted with 202 and verified absent; unresolved cleanup was zero. This is **FAIL / incomplete core**, with nine recorded React #418 occurrences. Clean installation and typecheck passed; eight local mocked cleanup/reporting safety proofs passed. Those local proofs do not establish backend integration.

After that live run, returned-record-ID matching and primary run-summary status were tightened. These last changes passed typecheck and local safety proofs; they have not been rerun against the live demo. The exact final source is therefore not claimed fully live-validated.

Local real UI execution did **not** complete S-10/S-11. In that earlier run, calendar pointer hit-testing and selection visibility failed. In one attempt the accepted request kept the initial URL window, so the required target-date assertion failed. The owned record was deleted only after identity verification. No request was modified, and this is not reported as full E2E coverage.

A later native-pointer (CDP) calendar driver was rerun (run `5ee8b744`); both tests failed on the initial attempt and on the retry with the then-unsuppressed React #418 before any booking was sent. No booking was created, and unresolved cleanup was zero. That driver was never validated live and has been removed from the suite; git history keeps it.

S-10/S-11 now use a reduced, authorized journey: the target dates are passed in the reservation URL (URL preselection) and the calendar is not driven. Before submission the test requires the booking card to show `£{roomPrice} x 2 nights` and a Total of `£{roomPrice*2+40}`; if that structure is absent the test fails. It then fills the form, submits with an observation-only intercept and keeps every business assertion: request room, names, deposit and dates equal to the target, a real 201 with a numeric ID and echoed identity/dates, and the visible "Booking Confirmed" card with the date range. Calendar interaction (drag selection) is **DEFERRED coverage**. Live result of this source (delivery commit `0225278`): in the targeted run `bc081863`, S-10 and S-11 both passed on their first attempt with no retry. Each returned 201 with the submitted and echoed dates equal to the target, and each logged one allowed #418 (load 1, stack source matched). The run status is **PASS WITH RISKS**. In the full daily run `92ae02d0`, there were 6 passed and 3 failed: S-10/S-11, S-31, S-14, S-01 and S-03 passed on their first attempt. The smoke UI tests S-07, S-08 and S-09 failed on the initial attempt and the retry with an unallowed #418, so the run status is **FAIL: CORE INCOMPLETE**. In both runs every created booking (ids 4-8) was identity-checked, deleted with 202 and verified absent, and unresolved cleanup was 0.

390x844 is **desktop-engine coverage at an iPhone-sized viewport**. It does not validate Safari/iOS, touch, the on-screen keyboard or in-app browsers. No iOS user agent is spoofed. Real-device validation is unexecuted and unverified.

The application raises React hydration error #418 (minified, server/client markup mismatch) under Cypress. There is no global `uncaught:exception` handler: outside the booking spec, this and every other uncaught application error fails the test. Inside `hotfix/guest-booking.cy.ts` only, a **temporary, test-scoped allowance** (registered with `cy.on`, removed after each test) tolerates exactly one occurrence per page load when the message contains `Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]=` and the stack contains an application chunk frame and includes `/_next/static/chunks/174b7k13ybrt2.js`. Any other error, a missing or different stack source or a second #418 in the same load fails the test. Every recorded browser error is printed to the CLI (`[browser error] allowed=... messageMatched=... stackSourceMatched=...`) and stored in `allowedAppErrors` in `results/run-summary.json`; any allowed occurrence turns an otherwise clean run into **PASS WITH RISKS**, never PASS. Diagnostic evidence (`20261009-418diag-*`) suggests the error is runner-induced (a Cypress-injected script; it was absent in plain Chrome), with medium-high confidence; the mechanism is not isolated. The allowance does not prove the application is defect-free. It is removed when #418 no longer occurs under Cypress or the mechanism is fixed. Failures that still reach the run summary are labelled `react-hydration-418`.

## CI configuration

`.github/workflows/e2e.yml` defines PR smoke/typecheck without secrets, a daily 05:00 UTC run and manual smoke/hotfix/daily dispatch. Runs share a concurrency group; writes are never parallelized. CI is **configured, not executed**. This workflow activates only when this self-contained directory is a repository root. Nothing has been pushed, published or uploaded during implementation.

Bitbucket: map PRs to `npm run smoke`, custom pipelines to the tier scripts, a schedule to daily, secured variables to the credential env names, and publish only the listed report/summary paths. Jenkins: use a tier choice parameter, `disableConcurrentBuilds()`, a daily cron, credential binding, `npm ci`, typecheck, cleanup proofs and the selected tier; use `junit` and narrowly scoped artifacts in `post { always { ... } }`.

## Observations and next steps

Authorized upstream discovery found anonymous unread-message counts and a logged-out token that still validates/reads bookings. Intended behavior is unknown; these are observations, not confirmed bugs or passing regression contracts. Establish intended authorization/logout behavior before ticket-linked tests.

Deferred: admin UI login, contact messages, room CRUD, availability-filter semantics, component tests (no app source), GraphQL (none observed), Cucumber, performance, real-device runs and Xray import. No stretch work is included. Next add coverage based on risk after independent automation review and budget assessment; load testing requires a dedicated environment.

Manual pre-release charter (unexecuted): on a real iPhone Safari, select booking dates, interact with the keyboard, submit a synthetic booking and contact message under approved identity-checked cleanup. Separate authorization charter: agree expected admin protection, message-count visibility and token revocation with Product/Security before probing further.

AI assisted implementation and evidence summarization. Commands and live responses were inspected locally; independent automation review remains pending. Human working time has not been supplied; agent wall-clock is not reported as human effort.

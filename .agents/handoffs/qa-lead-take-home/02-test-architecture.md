# Test Architecture - qa-lead-take-home

Stage: architecture. Date: 2026-10-08. Author: test-architect agent (draft; the candidate reviews it).
No HTTP requests, installs or file changes outside this handoff were made for this stage.

## Specification consumed

| Input | Used for |
|---|---|
| `01-test-spec.md` (S-01..S-30, R-01..R-15, O-01..O-15, Q-01..Q-14, B-01..B-03) | Scenario catalogue, priorities, requirement IDs |
| `evidence/notes/20261008-2305-observed-api-contracts.md` (called **OBS** below) | Auth, booking, message and admin contracts, observed live |
| `evidence/notes/20261008-2246-frontend-endpoint-static-analysis.md` (called **FE** below) | Routes, payload field names, selectors |
| `delivery/part1-test-suite/DECISIONS.md` (D-002, D-003 accepted; D-006..D-010 proposed) | Decisions to keep or review |
| User brief for this stage | Binding decisions: delivery dir, scope, priority order, credentials, minimal writes |

Upstream changes since the spec was written:
- B-01 is resolved. The user authorized the admin account through env vars only, with minimal tagged writes.
- B-02 is resolved. The admin booking and message endpoints were observed (OBS).
- B-03 is resolved for the API. The UI confirmation text is still unknown and is covered by the spike below.

The 30 scenarios in the spec are a catalogue, not a commitment. This document picks a subset.

## Existing framework observations

| Item | Observed |
|---|---|
| `delivery/part1-test-suite/` | Contains only `DECISIONS.md` (`ls`, 2026-10-08). There is no package.json, Cypress config or tsconfig yet. |
| Cypress in the repo | Not installed (brief). |
| Local toolchain | node v26.5.0, npm 11.17.0 (brief). |
| Registry (read-only `npm view`, from the brief) | `cypress` latest 16.1.1, engines `node ^22 \|\| ^24 \|\| >=26`. `typescript` latest 7.0.2. |
| Packaging constraint | The directory becomes a standalone public repo, so nothing may reference the parent workspace: no root package.json, scripts or tsconfig paths. |
| GraphQL / Cucumber / load | None observed or required (spec "GraphQL checks", D-010). |

## Proposed test layers

| Layer | Tool | What it proves | Network |
|---|---|---|---|
| API contract | `cy.request()` | Status, body shape, key business fields, error contracts, auth gating | Real backend |
| API lifecycle (write) | `cy.request()` plus the admin cookie | Guest create -> admin visibility -> availability report -> delete, plus the overlap rule | Real backend, own records only |
| UI E2E guest (desktop and iPhone viewport) | Cypress E2E | Rendering from live data; the booking form submits a correct payload and the backend accepts it | Real backend. `cy.intercept()` only observes, it never stubs. |
| UI admin (stretch) | Cypress E2E | The admin login screen works end to end | Real backend |
| Manual exploratory | Charter in README | Real iPhone Safari (S-29), authz probe (S-30) | n/a |
| Component, GraphQL, performance | none | Out of scope (no component source; no GraphQL; shared demo, D-010) | n/a |

## Implementation subset

Tiers are cumulative: smoke ⊂ hotfix ⊂ daily. The tier tag names the lowest tier that runs the test, and it matches the folder (D-011).

| # | Spec ID(s) | Spec file | Test title | Layer | Viewport | Tags | Data created | Cleanup | Est. min |
|---|---|---|---|---|---|---|---|---|---|
| 1 | S-01 | `cypress/e2e/smoke/api-contracts.cy.ts` | `[S-01][R-01][R-03] GET /api/room returns the room list contract` | API | n/a | @p0 @readonly @smoke | none | n/a | 5 |
| 2 | S-03 | `cypress/e2e/smoke/api-contracts.cy.ts` | `[S-03][R-02][R-03] booking list rejects anonymous access with 401` | API | n/a | @p0 @readonly @smoke | none | n/a | 3 |
| 3 | S-07 | `cypress/e2e/smoke/home.cy.ts` | `[S-07][R-01] home page shows every room returned by the API` | UI | desktop 1280x800 | @p0 @readonly @smoke | none | n/a | 7 |
| 4 | S-08 | `cypress/e2e/smoke/home.cy.ts` | `[S-08][R-01][R-08] home page shows every room at iPhone viewport` | UI | iPhone 390x844 | @p0 @readonly @smoke | none | n/a | 3 |
| 5 | S-09 | `cypress/e2e/smoke/reservation-page.cy.ts` | `[S-09][R-01] reservation page loads the booking form for an API-sourced room` | UI | desktop | @p0 @readonly @smoke | none | n/a | 4. The form may appear only after a reserve control is clicked; the spike pins the assertion. No submit. |
| 6 | S-10 | `cypress/e2e/hotfix/guest-booking.cy.ts` | `[S-10][R-01] guest books a free far-future stay and the backend accepts it` | UI | desktop | @p0 @write @hotfix | 1 booking (tagged lastname) | afterEach DELETE of the `bookingid` from our own 201 | 20 (+10 spike) |
| 7 | S-11 | `cypress/e2e/hotfix/guest-booking.cy.ts` | `[S-11][R-01][R-08] guest books a free far-future stay at iPhone viewport` | UI | iPhone 390x844 | @p0 @write @hotfix | 1 booking | same as #6 | 5 |
| 8 | S-31 (new, evidence-backed), merges S-12 + S-15 | `cypress/e2e/daily/booking-api.cy.ts` | `[S-31][S-12][S-15][R-01][R-02][R-03] booking lifecycle: create 201, overlap 409, admin sees it, report blocks the window, delete 202 then 404` | API | n/a | @p0 @write @daily | 1 booking (the 409 creates nothing, OBS) | Explicit DELETE inside the test is the assertion; the afterEach registry is the safety net (404 tolerated) | 15 |
| 9 | S-14 | `cypress/e2e/daily/booking-api.cy.ts` | `[S-14][R-01][R-03] invalid booking is rejected with 400 and field rule messages` | API | n/a | @p1 @write @daily | none intended. An unexpected 201 registers the id and fails the test. | registry (only on an unexpected 201) | 6 |
| 10 (stretch 1) | S-20 | `cypress/e2e/daily/admin-login.cy.ts` | `[S-20][R-02] admin logs in through the UI and reaches the admin area` | UI | desktop | @p0 @readonly @daily (login POST only, no data) | none (one server-side token; logout does not revoke it, OBS) | n/a | 12 |
| 11 (stretch 2) | S-17 | `cypress/e2e/daily/contact-message.cy.ts` | `[S-17][R-01] guest sends a contact message and the API accepts it` | UI | desktop | @p1 @write @daily | 1 message (tag in subject and name) | afterEach: admin `GET /api/message`, match our unique tag, `DELETE /api/message/{id}` | 12 |

Totals:
- Core: 9 tests in 5 spec files, about 1:18 of test-writing (rows 1-9 plus the spike). With scaffold, CI and README this is about 2:00 (see the checklist).
- With stretch: 11 tests in 7 files. The stretch items are built only if the core is green with time left. Cut order: #11 first, then #10.

New scenario:
- **S-31 (new, evidence-backed)**: booking create -> overlap 409 -> admin GET by id and by `roomid` list -> report includes the window -> DELETE 202 -> GET 404. Every step was observed in OBS (Booking table).
- It absorbs S-12 (admin visibility at API level) and S-15 (overlap, now known to be 409). One write per run instead of three.

S-31 vs S-10: S-31 checks the backend rules (status codes, admin visibility, delete). S-10 checks that a guest using the UI can produce a booking the backend accepts. S-31 alone does not prove the UI books. S-10 alone does not prove admin visibility or overlap.

**Read-only smoke is a limited check.** S-01, S-03, S-07, S-08 and S-09 show the site is up, the main read contracts hold and anonymous access to bookings is refused. **They do not show that a guest can book, and on their own they do not justify a release.** The booking proof is S-10/S-11 (hotfix tier) and S-31 (daily).

Deferred from the catalogue:

| Deferred | Why |
|---|---|
| S-02 branding contract | Low risk. Cheap next step. |
| S-04 report contract (standalone) | Already used by the date helper and S-31. A standalone contract test comes next. |
| S-05, S-16 availability | Filtering semantics unknown (Q-04), so there is no oracle. |
| S-06 unauth message count | This is a finding, not a test (D-016). |
| S-13 UI empty-field booking | The server rules are covered by S-14. Client-side behaviour is unknown. |
| S-18, S-19 contact (iPhone, invalid) | After S-17. The invalid-message shape is known (bare array, OBS), so S-19 is cheap later. |
| S-21 wrong admin password | Cheap after S-20. Its error UI is unknown. |
| S-22, S-23 admin UI views | Admin selectors unknown. The guest -> admin boundary is covered at API level by S-31. |
| S-24, S-25 room CRUD | Global writes on a shared demo (D-009). |
| S-26, S-27, S-28 | P2. Semantics unknown (Q-14, Q-02). |
| S-29, S-30 | Manual charters, documented in the README, not automated. |

## Folder and file plan

Everything lives under `delivery/part1-test-suite/` and is self-contained.

```text
package.json              private, engines.node ">=22", exact pins (D-015), scripts below
package-lock.json         committed (npm ci in CI)
tsconfig.json             strict, noEmit, types ["cypress","node"], include cypress/**/*.ts + cypress.config.ts
cypress.config.ts         see config table
cypress.env.example.json  {"ADMIN_USER":"<set-me>","ADMIN_PASSWORD":"<set-me>"}  placeholders only
.gitignore                node_modules, cypress.env.json, .env, results/, cypress/screenshots, cypress/videos
README.md                 outline below
DECISIONS.md              existing; the candidate updates it
.github/workflows/e2e.yml runs only once this dir is the repo root
cypress/
  e2e/smoke/   api-contracts.cy.ts  home.cy.ts  reservation-page.cy.ts      GET only (review rule)
  e2e/hotfix/  guest-booking.cy.ts
  e2e/daily/   booking-api.cy.ts  [admin-login.cy.ts]  [contact-message.cy.ts]
  support/e2e.ts         imports commands; global afterEach -> cleanup.flush()
  support/commands.ts    cy.adminLogin() + `declare global { namespace Cypress { interface Chainable ... } }`
  support/api-types.ts   Room, RoomList, BookingRequest, BookingCreated, BookingList, ReportEntry interfaces (from OBS/O-02)
  support/data.ts        runTag(), guestFactory(tag)
  support/dates.ts       freeWindow(roomid) -> {checkin, checkout}
  support/cleanup.ts     registerBooking(id), registerMessageTag(tag), flush()
  support/env.ts         adminCreds() + requireAdminForWrites() (skip locally, fail in CI)
  support/pages/reservation.ts  every reservation selector in one module (only one place to change)
```

No fixtures folder: there are no seed oracles (D-009).

package.json scripts (tier selection by spec globs, D-011):

| Script | Command |
|---|---|
| `cy:open` | `cypress open` |
| `cy:run` | `cypress run` (all specs = daily) |
| `smoke` | `cypress run --spec "cypress/e2e/smoke/**/*.cy.ts"` |
| `hotfix` | `cypress run --spec "cypress/e2e/smoke/**/*.cy.ts,cypress/e2e/hotfix/**/*.cy.ts"` |
| `daily` | `cypress run --spec "cypress/e2e/**/*.cy.ts"` |
| `typecheck` | `tsc --noEmit -p tsconfig.json` |

Tag filtering: spec globs, not `@cypress/grep`.
- Zero extra dependencies, no plugin registration, and the behaviour is visible in package.json.
- The folder = tier rule doubles as a reviewable safety rule: `smoke/` sends no non-GET requests.
- Cost: moving a test between tiers means moving the file, and `@p0`/`@p1` cannot be filtered.
- Revisit with `@cypress/grep` past about 30 tests or when priority filtering is needed.
- Title tags are kept for humans, JUnit search and Xray mapping.

cypress.config.ts:

| Key | Value | Why |
|---|---|---|
| `e2e.baseUrl` | `process.env.BASE_URL ?? 'https://automationintesting.online'` | A future staging env is a variable, not a code change (A-07) |
| `e2e.specPattern` | `cypress/e2e/**/*.cy.ts` | Convention |
| `retries` | `{ runMode: 1, openMode: 0 }` | D-009: at most one retry; a retry picks a new tag and window |
| `reporter` / `reporterOptions` | `'junit'`, `{ mochaFile: 'results/junit/results-[hash].xml', toConsole: false }` | Built-in, one XML per spec (D-014) |
| `video` | `false` by default; CI daily passes `--config video=true` | Speed. Video only where triage needs it. |
| `screenshotOnRunFailure` | `true` (default) | Evidence |
| `viewportWidth/Height` | 1280x800 (desktop default). The iPhone tests call `cy.viewport(390, 844)`. | See Mobile |
| `defaultCommandTimeout` | 10000 | Latency of a public demo behind Cloudflare |
| `testIsolation` | `true` (default) | Independence |
| `env` | `ADMIN_USER`/`ADMIN_PASSWORD` from `process.env.CYPRESS_ADMIN_USER`/`CYPRESS_ADMIN_PASSWORD`, or local git-ignored `cypress.env.json`. Never committed. | Brief. The env API in Cypress 16 is NOT VERIFIED (see Risks). |
| `setupNodeEvents` | a single `log` task (prints cleanup warnings to the CI console) | Cleanup failures must be visible without failing tests |

Typed support:
- `cy.adminLogin()`:
  - `cy.session('admin', setup, { validate, cacheAcrossSpecs: true })`. The session id is a constant because it appears in the command log, so it must not contain the username.
  - Setup: `cy.request POST /api/auth/login {username,password}` -> 200 `{token}` -> `cy.setCookie('token', token, { domain: <baseUrl hostname>, log: false })`.
  - Validate: `cy.getCookie('token', { log: false })` -> `cy.request POST /api/auth/validate {token}` expects 200 `{valid:true}` (OBS Auth).
  - **Secret hygiene:**
    - Login, validate and every cleanup request use `{ log: false, failOnStatusCode: false }`.
    - Assert only the status, with a message that omits the request and response body (e.g. `expect(res.status, 'admin login status').to.eq(200)`).
    - Why: a default `cy.request` failure prints the request body (credentials) or the token into the error. That error then lands in the JUnit XML and the screenshots, which are uploaded as artifacts, and CI secret masking covers logs only, not artifacts.
  - Later `cy.request` calls to the same host carry the cookie automatically. Fallback if they don't: pass `headers: { Cookie: 'token=…' }` explicitly.
- The guest UI tests never call `adminLogin` before the journey. The guest must stay anonymous, and admin login runs only in afterEach cleanup.
- `cleanup.flush()`:
  - Runs only if the registry is non-empty.
  - Steps: `adminLogin()`, then for each own id `DELETE /api/booking/{id}` with `failOnStatusCode:false`. Accept 202 or 404.
  - Any other status goes to `cy.task('log')` and is not thrown. A throw in afterEach would abort the rest of the spec.
  - The registry is cleared after each test.
- `freeWindow(roomid)`:
  - Exactly one `GET /api/report/room/{id}`.
  - Then up to 20 in-memory candidates: start = today + random(730..1095) days, 2 nights.
  - Reject any candidate within 1 day of a reported `[start,end]`. End inclusivity is unknown, hence the buffer.
  - Format `YYYY-MM-DD` in UTC.
- `guestFactory(tag)`: `{ firstname: 'Tester', lastname: tag, email: tag+'@example.com', phone: '01234567890', depositpaid: false }`. Every value satisfies the observed rules: firstname 3-18, lastname 3-30, phone 11-21, well-formed email.

README outline:
1. Purpose and scope
2. Quick start: node, `npm ci`, credentials via env or `cypress.env.json`
3. Tiers and scripts
4. Folder layout
5. Data rules on the shared demo
6. iPhone coverage statement
7. CI
8. Traceability
9. Findings (unauth message count, logout not revoking tokens)
10. Manual charters (S-29, S-30)
11. Known limits and next steps

## Data strategy

| Test | Data | Tag / identity | Window | Cleanup | Mid-run reset behaviour |
|---|---|---|---|---|---|
| S-01, S-03, S-07, S-08, S-09 | none | n/a | S-09 uses `freeWindow` (GET only) | n/a | Room list may change; expected values are read live, never seeded (O-15) |
| S-10, S-11 | 1 booking each | lastname = `runTag()` | `freeWindow(rooms[0].roomid)` | `bookingid` from the intercepted 201 -> registry -> afterEach DELETE | Reset before the 201: no data. After it: the DELETE gets 404, which is tolerated. A 409 on a fresh window = `data issue` (another user took it). The retry uses a new window. |
| S-31 | 1 booking | `runTag()` | `freeWindow` | In-test DELETE (asserted 202 -> GET 404); registry as safety net | A 404 on the admin GET mid-test = `environment issue` (reset). Not masked; one runMode retry. |
| S-14 | none intended | `runTag()` (for traceability only) | `freeWindow` (so only field rules can fail) | Only if an unexpected 201: register id, then fail | n/a |
| S-17 (stretch) | 1 message | `runTag()` in `name` and `subject` | n/a | `GET /api/message`, match the exact tag, DELETE that id. Ownership is proven by the unique tag, since POST returns no id (OBS). | Tag not found = already gone; tolerated |

Tag format:
- `qa` + 8 random lowercase letters, e.g. `qakfmzrtwp` (10 chars).
- Letters only, because OBS proves a 10-letter lastname was accepted. Digits in names are untested.
- Fits lastname 3-30. firstname stays the fixed `Tester` (6). The tag is generated per test attempt, so a retry never collides with its own earlier attempt.

**Register before asserting.**
- In S-10, S-11, S-31 and S-14, the first action after the create response is `registerBooking(bookingid)`, whenever the status is 201.
- Only after that come the request-body, echo or status assertions.
- A failed assertion must never leave an unregistered booking on the shared demo.

Ownership rules:
- Delete only:
  - a `bookingid` returned by this run's own 201;
  - a message whose subject or name equals this run's exact tag.
- Never sweep by pattern (`qa*`). Leftovers from killed runs cannot be proven ours, so they wait for the demo reset (D-009 revision).

Admin credentials are required for every `@write` test, because cleanup needs them.
- Locally without credentials: `this.skip()` with a clear message.
- With `CI=true` and no credentials, every `@write` spec fails in `before()`. Tests do not need to know the tier. PR runs execute only `smoke/` (GET only), so they never reach this check. A hotfix or daily run without secrets therefore turns red instead of going green on skipped bookings.

## UI automation strategy

| Concern | Design |
|---|---|
| Selectors | Contact form: `[data-testid=ContactName]` etc. (FE). Reservation form: `input.room-firstname`/`[name=firstname]` etc., kept in `pages/reservation.ts` (FE). Admin: UNKNOWN; decided in the spike. Ask devs for `data-testid` on reservation and admin screens. |
| Oracle for live data | `cy.request GET /api/room` first, then `cy.visit('/')` and assert each `roomName` is visible. This works whether Next.js renders rooms on the server or the client; whether the browser fetches `/api/room` is NOT VERIFIED. |
| Booking oracle (network-first) | Register `cy.intercept({method:'POST', pathname:'/api/booking'}).as('createBooking')` before submit. Assert the request body (`roomid`, names, email, phone, `bookingdates` = our window) and the response (201, numeric `bookingid`, echoed names and dates). UI confirmation text is added only after the spike confirms it. |
| Waits | Aliases and retryable `.should()` only. No `cy.wait(ms)`. |
| UNKNOWN 1: dates from the query string | Not stated as fact. The spike checks whether `/reservation/{id}?checkin&checkout` preselects dates or needs a calendar click or drag. |
| UNKNOWN 2: "Reserve Now" / confirmation text | Not stated as fact. Pinned from the spike, or else the network oracle only. |
| UNKNOWN 3: admin selectors | Not stated as fact. Decided in the spike, only if stretch #10 is reached. |
| Spike (10 min timebox, first step after scaffold) | Run `cypress open` on `/reservation/{id}?checkin=..&checkout=..` with a `freeWindow` and inspect the DOM and the network panel. Record the findings in `03-automation-implementation.md`. Do not submit a booking in the spike unless it is through the real test with cleanup. |
| Fallback A (dates preselected) | Fill the form, click the reserve control found in the spike, assert the network oracle. |
| Fallback B (calendar interaction needed) | Spend at most 15 min on mouse events over day cells in the window. |
| Fallback C (B fails) | Keep the UI journey and, in `cy.intercept`, set `req.body.bookingdates` to our free window before it continues to the real backend. This is labelled in the title and the README: "calendar selection not covered; form -> backend covered". Not a stub: the response is real. |

## REST and GraphQL strategy

| Check | Assertions (all from OBS or O-02/O-06) |
|---|---|
| S-01 `GET /api/room` | 200. `rooms` is a non-empty array. Per item: `roomid` number, `roomName` string, `type` string, `accessible` boolean, `image` string, `description` string, `features` array, `roomPrice` number. No counts or values asserted. |
| S-03 `GET /api/booking` anon | 401, body exactly `{"error":"Authentication required"}` |
| S-31 create | 201. `bookingid` number. Echo equals the request for `roomid`, `firstname`, `lastname`, `depositpaid`, `bookingdates`. `email` and `phone` are absent from the echo (observed; asserting the absence documents the contract). |
| S-31 overlap | Same payload -> 409 `{"error":"Failed to create booking"}` |
| S-31 admin visibility | `GET /api/booking/{id}` 200, same shape. `GET /api/booking?roomid={id}` 200 and `bookings` contains our `bookingid` (match by id, not position). |
| S-31 report | `GET /api/report/room/{id}` contains an entry whose `start`/`end` covers our window. The exact end-date convention is NOT VERIFIED, so assert containment of checkin. |
| S-31 delete | `DELETE /api/booking/{id}` 202, then `GET` 404 |
| S-14 invalid | 400, `errors` is an array that includes `"size must be between 3 and 18"` (firstname `Qa`), `"size must be between 11 and 21"` (phone `123`), `"must be a well-formed email address"` |
| Messages (stretch) | `POST /api/message` 200 `{success:true}`. The invalid shape is a bare array (different from booking). Documented for S-19 later. |
| GraphQL | None. No endpoint observed (FE, spec). |

All expected 4xx responses use `failOnStatusCode:false`.

## Performance strategy

None in the foundation (D-010). The demo is shared and sits behind Cloudflare, and Cypress timings do not measure capacity. Next step: JMeter or k6 on a dedicated environment for `GET /api/room` and `POST /api/booking`.

## Mobile coverage

| Item | Decision |
|---|---|
| Preset | `cy.viewport(390, 844)` (iPhone 12-15 CSS size), set in `beforeEach` before `cy.visit`. A named constant `IPHONE = [390, 844]`. |
| User agent | An iOS Safari UA string, applied at suite level (`describe('iPhone viewport', { userAgent: … })`) if Cypress 16 allows a per-suite override; otherwise viewport only. NOT VERIFIED. The app declares a responsive viewport meta (O-01), so layout comes from CSS width, not UA. |
| Tests at iPhone size | S-08 (home) and S-11 (booking). Both run in the hotfix tier (S-11) and the daily tier. |
| **Non-coverage statement** | **iPhone viewport coverage does NOT validate Safari or iOS.** It runs a desktop engine (Electron/Chromium) at iPhone size. Touch events, the iOS keyboard, WebKit rendering, Safari quirks and in-app webviews are not tested. Reports say "iPhone viewport", never "iPhone". The real-device answer is S-29 (manual pass before release) and later WebKit or a device cloud (D-007). |

## Admin coverage (proportional)

| Option | Value | Cost | Choice |
|---|---|---|---|
| API-level admin check inside S-31 (authenticated GETs find the guest booking, DELETE works) | Covers the guest -> admin boundary (R-15) and the auth cookie flow. Uses known contracts. | ~5 min inside S-31 | **Core** |
| UI admin login S-20 | Proves the login screen works | 12 min plus selector discovery (unknown) | **Stretch 1** |
| Admin UI bookings/messages/rooms (S-22..S-27) | Medium | Selectors unknown; room writes are global | Deferred |

Admin risk is mainly "the backend admin functions break". That is covered faster and more stably at API level. A UI login only adds the screen itself, which matters less than the guest booking path inside a 2:00 budget.

## CI/CD strategy

One pipeline: GitHub Actions, `.github/workflows/e2e.yml` (D-013).

| Trigger | Tier | Secrets | Notes |
|---|---|---|---|
| `schedule: cron '0 5 * * *'` (daily, UTC) | daily | yes | R-07. Video on. |
| `workflow_dispatch` with `inputs.tier` choice `smoke\|hotfix\|daily` (default `hotfix`) | as chosen | yes | Hotfix gate = dispatch on the hotfix ref with `hotfix`. Pre-release = dispatch `daily` plus manual S-29. |
| `pull_request` | smoke + typecheck | no (fork-safe) | Read-only, so no credentials are needed |

Job outline:
- `concurrency: { group: e2e-shared-demo, cancel-in-progress: false }` serializes writes to the demo.
- `ubuntu-24.04`, `timeout-minutes: 20`.
- Steps:
  1. `actions/checkout@v4`.
  2. `actions/setup-node@v4` with node 24 and `cache: npm`.
  3. Cache `~/.cache/Cypress` keyed on the lockfile.
  4. `npm ci`.
  5. `npm run typecheck`.
  6. `npm run <tier>`.
  7. `actions/upload-artifact@v4` with `if: always()`: `results/junit/`, `cypress/screenshots/`, `cypress/videos/`.
- Optional: a JUnit summary action. It is third-party, so pin it by SHA.
- `env`: `CYPRESS_ADMIN_USER: ${{ secrets.ADMIN_USER }}`, `CYPRESS_ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}`, `BASE_URL: ${{ vars.BASE_URL }}`.
- Action major versions: v4 is known to exist. Confirm the current majors at implementation.

Bitbucket / Jenkins mapping:
- Bitbucket Pipelines:
  - `pipelines.custom.smoke|hotfix|daily` = the dispatch tiers;
  - a Bitbucket schedule on `custom.daily` = the cron;
  - `pipelines.pull-requests` = smoke;
  - secured repository variables `CYPRESS_ADMIN_USER`/`CYPRESS_ADMIN_PASSWORD` = secrets;
  - `artifacts: [results/junit/**, cypress/screenshots/**]` = the upload;
  - a `cypress/included` or `node:24` image runs the same `npm ci && npm run <tier>`.
- Jenkins: a declarative `Jenkinsfile` with:
  - `parameters { choice(name:'TIER', choices:['smoke','hotfix','daily']) }`;
  - `triggers { cron('H 5 * * *') }`;
  - `withCredentials([usernamePassword(credentialsId:'rbp-admin', usernameVariable:'CYPRESS_ADMIN_USER', passwordVariable:'CYPRESS_ADMIN_PASSWORD')])`;
  - `junit 'results/junit/*.xml'` plus `archiveArtifacts` in `post { always { … } }`;
  - `disableConcurrentBuilds()` = concurrency.
- The npm scripts are the contract, so any CI only calls `npm run <tier>`.

## Observability and debugging

- On failure: JUnit XML per spec, plus screenshots, plus video on daily, plus the Cypress CLI log captured as a CI log.
- Guest and contract `cy.request` failures print the status and body, which is useful for triage. Auth and cleanup requests run with `log:false` and assert the status only (see Typed support).
- The token and credentials are not written to logs, JUnit or screenshots by our code. This is a design rule, so the reviewer checks that no auth request runs with default logging. It is NOT VERIFIED until the first failing run's artifacts are inspected.
- Cleanup warnings go through `cy.task('log')` so they reach the CI console.
- Triage map (GUARDRAILS):

| Signal | Classification |
|---|---|
| 409 on a fresh window, or own data vanished | `data issue` / `environment issue` |
| Cloudflare 403/429/challenge HTML | `environment issue` |
| Contract change (field, status) | `product bug` until confirmed intended |
| Selector miss after a deploy | `test bug` or a product change; check the DOM snapshot |

## Traceability

- Titles: `[S-xx][R-yy] behaviour @pN @readonly|@write @tier`. IDs come first so the JUnit `testcase name` carries them.
- JUnit: one XML per spec (`results-[hash].xml`). Other placeholders (`[suiteFilename]`) are NOT VERIFIED in Cypress's bundled reporter.
- Xray: JUnit import into Xray and the mapping of IDs to Xray test keys are NOT VERIFIED (Q-11). The README holds the matrix below until test keys exist.

| Requirement | Scenario | Spec / test title | Execution |
|---|---|---|---|
| R-01 rooms, book, message | S-01, S-07, S-08, S-09, S-10, S-11, S-14, S-31, (S-17) | smoke/api-contracts, smoke/home, smoke/reservation-page, hotfix/guest-booking, daily/booking-api, (daily/contact-message) | TBD |
| R-02 admin | S-03, S-31 (incl. S-12), (S-20) | smoke/api-contracts `[S-03]`, daily/booking-api `[S-31]`, (daily/admin-login) | TBD |
| R-03 REST API | S-01, S-03, S-14, S-31 | smoke/api-contracts, daily/booking-api | TBD |
| R-04 shared demo | Data rules applied to S-10, S-11, S-14, S-31, (S-17) | cleanup registry, tag rules | TBD |
| R-06 fortnightly + hotfix | smoke and hotfix tiers | scripts `smoke`, `hotfix`; dispatch | TBD |
| R-07 daily schedule | daily tier | cron in e2e.yml | TBD |
| R-08 iPhone | S-08, S-11; S-29 manual | home `[S-08]`, guest-booking `[S-11]`; README charter | TBD |
| R-09 Xray | IDs in titles + JUnit | all | Import NOT VERIFIED |
| R-15 release bottleneck | S-31 (guest -> admin boundary), hotfix gate, S-29 | daily/booking-api, hotfix tier | TBD |

## Review of proposed decisions D-006..D-010

| ID | Recommendation | Revision (exact) | Evidence / reason |
|---|---|---|---|
| D-006 tiers | **ACCEPT WITH REVISION** | (1) In "Hotfix gate", replace "the guest booking journey" with "the guest booking journey at desktop and at iPhone viewport (S-10, S-11)". (2) In Consequences, replace "creates and deletes one tagged booking" with "creates and deletes two tagged bookings (one per viewport)". (3) Add: "Tier mapping: smoke = `cypress/e2e/smoke` (pull requests, no secrets); hotfix = smoke + `cypress/e2e/hotfix` (manual dispatch); daily = all specs (daily schedule); pre-release = daily dispatch + manual iPhone pass. In CI, missing admin credentials fail the hotfix and daily tiers instead of skipping." (4) Replace "Daily scheduled: the full automated subset, on desktop and at an iPhone-sized viewport" with "Daily scheduled: the full automated subset. UI guest journeys (home S-07/S-08, booking S-10/S-11) run at both desktop and iPhone viewport; API, reservation-page and admin checks run once, at desktop." | Most users are on iPhone (R-08), so the gate should exercise the majority layout. That costs about 1 extra minute and one booking. Without the fail-fast rule, a hotfix run without secrets would skip both write tests and go green. |
| D-007 iPhone | **ACCEPT WITH REVISION** | Replace "an iPhone-sized viewport with an iOS user agent" with "a 390x844 viewport (S-08 home, S-11 booking), plus an iOS user agent where Cypress allows a per-suite override (NOT VERIFIED)". Add "S-11 is in the hotfix gate". | O-01 viewport meta. The UA override scope is unverified, so the decision must not promise it. Safari non-coverage wording kept as is. |
| D-008 Xray | **ACCEPT WITH REVISION** | Add: "Title format `[S-xx][R-yy] behaviour @pN @readonly\|@write @tier`. Cypress's built-in `junit` reporter writes `results/junit/results-[hash].xml`, one per spec. The README holds a Requirement -> Scenario -> test -> Execution matrix until Xray keys exist." | Names a concrete mechanism with no extra dependency (D-014). The "Xray import NOT VERIFIED" statement is kept. |
| D-009 data | **ACCEPT WITH REVISION** | (1) Replace "Delete only IDs this run created" with "Delete only records whose ownership is proven: the `bookingid` from this run's own 201, or a message whose subject equals this run's exact unique tag (messages return no id). Never sweep by tag pattern." (2) Add "Tag = `qa` + 8 lowercase letters in lastname (a 10-letter lastname was accepted in discovery; digits untested)." (3) Add "Window check keeps a 1-day buffer around reported ranges (end inclusivity unknown)." (4) Add "Write tests need admin credentials for cleanup: skipped locally, fail fast in CI." (5) Add "Cleanup errors are logged, not thrown, so one failed delete does not abort the spec." | OBS: `POST /api/message` returns no id. Tag length and letters from the run-2 booking. An afterEach throw would skip the remaining tests. |
| D-010 Cucumber/load | **ACCEPT** | Optional one line: "No GraphQL layer: no GraphQL endpoint observed; no Newman: `cy.request` covers the API in one runner and report." | Nothing in the assignment needs BDD or load. The demo is shared and behind Cloudflare (O-13). |

New decisions to add (proposed):

| ID | Decision | One-line rationale | Alternatives |
|---|---|---|---|
| D-011 | Tier selection by spec folder globs (`smoke/`, `hotfix/`, `daily/`). Tags stay in titles only. | Zero dependencies, transparent scripts, and `smoke/` = GET only can be reviewed | `@cypress/grep` (one dev dep, tag filters); a custom grep helper |
| D-012 | Admin auth through the API: login -> `token` cookie inside `cy.session`, validated through `/api/auth/validate`. Credentials only from env or CI secrets. CI fails fast when they are missing. | Observed contract (OBS); fast and stable; no admin selectors needed | UI login per test (slow, selectors unknown); an Authorization header (not observed) |
| D-013 | GitHub Actions as the reference pipeline, with a Bitbucket/Jenkins mapping in the README | The public repo is likely on GitHub; npm scripts keep it CI-agnostic | Bitbucket Pipelines first; a Jenkinsfile |
| D-014 | Cypress built-in `junit` reporter, one XML per spec | No dependency; CI and Xray-friendly | `cypress-multi-reporters` + mochawesome (HTML, more deps); an Xray-specific reporter (setup unknown) |
| D-015 | Exact pins: `cypress` 16.1.1 and `typescript` 7.0.2, with a 5-min compatibility gate; fallback `typescript` 5.9.x pinned exactly at install. `@types/node` major 24, exact version pinned at install. Node 24 in CI. | Reproducible runs. TS 7 with the Cypress TS loader is NOT VERIFIED. | Caret ranges (drift); TS 5.x from the start (safer, older) |
| D-016 | Findings (unauth `GET /api/message/count` 200; logout does not revoke the token) are documented in the README and DECISIONS and raised to the team, not encoded as tests | Intended behaviour is unknown. A passing test would bless it, and a failing one would keep the daily run red over a product decision. | A failing test; `it.skip` with the reason (acceptable later as a ticket-linked pending test once Product answers Q-08/Q-07) |
| D-017 | The UI booking oracle is network-first (request body + 201 + `bookingid`). UI text is asserted only once observed. Fallback C (rewriting the dates in the request) must be labelled. | Unknown confirmation UI; avoids guessed strings | Assert guessed UI text; stub the backend (proves nothing) |

## Risks and tradeoffs

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| Shared demo resets or is edited mid-run | Medium / test fails without a product cause | Live oracles, own-id cleanup that tolerates 404, one retry, `environment issue` classification, run serialized by CI concurrency |
| Cloudflare challenge or rate limit on CI runners (Q-13) | Unknown / whole run red | Serial, about 40 requests per daily run, no polling, at most one retry. A 403/429 or challenge HTML is classified `environment issue`. |
| Reservation UI unknowns (dates from the query string, confirmation text) | High / S-10 blocked | 10-min spike, then fallbacks A/B/C. S-31 still proves the backend booking rules. |
| Admin UI selectors unknown | High / S-20 cost | Stretch only; admin covered at API level |
| TS 7.0.2 with the Cypress TS loader | Unknown / scaffold blocked | Compatibility gate: `npm run typecheck` plus one `cypress run --spec smoke/api-contracts.cy.ts`. If config or spec loading fails, pin typescript 5.9.x and record it in D-015. |
| Cypress 16 env API (`Cypress.env` vs newer `cy.env()`/`Cypress.expose()` from 15.x) | Unknown / credentials not read | Check the Cypress 16 changelog in the scaffold. Credentials are read in node from `process.env` either way, then exposed through whichever API is supported. Never log them. |
| UA override per suite unsupported | Medium / low impact | Viewport only. Layout is CSS-width driven (O-01). |
| Leftover tagged bookings if a run is killed | Low / cosmetic on the demo | Accepted until the next reset. No pattern sweep (ownership not provable). |
| Token accumulation (logout does not revoke) | Low | One session per run (`cacheAcrossSpecs`). Documented as a finding (D-016). |
| Fewer tests than the catalogue | Accepted | Risk-ordered subset; deferred list with reasons; README "next steps" |
| Retry hides a flaky test | Medium | `runMode: 1` only; any test that passed on retry is listed in the report |

## Implementation checklist

Planned, in order, total 2:02 (about 2:00):
1. (18) Scaffold: package.json (pins, scripts, engines), tsconfig, cypress.config.ts, .gitignore, `cypress.env.example.json`, support files (types, data, dates, cleanup, env, commands).
2. (5) Compatibility gate: `npm ci`, `npm run typecheck`, then run `api-contracts.cy.ts` once. TS fallback if needed. Check the env API.
3. (8) S-01, S-03. Run `npm run smoke -- --spec cypress/e2e/smoke/api-contracts.cy.ts`.
4. (10) Spike on the reservation page (dates from the query, reserve control, confirmation text). Record the findings.
5. (14) S-07, S-08, S-09. Run `npm run smoke`.
6. (25) S-10, S-11 with registry cleanup. Run `npm run hotfix`. Verify in the run output that our ids were deleted (202).
7. (21) S-31, S-14. Run the `daily/booking-api.cy.ts` spec.
8. (8) `.github/workflows/e2e.yml` (not runnable until this dir is the repo root: say so).
9. (8) README per the outline, including the findings and the iPhone statement.
10. (5) Full `npm run daily` once, with evidence saved under `evidence/command-output/`.
11. Stretch, only if 1-10 are done: #10 S-20 (spike admin selectors, 12), then #11 S-17 (12).

Each step: commit with a meaningful message (R-11, no squash). The candidate updates DECISIONS.md with the D-006..D-017 outcomes.

## Time budget (planned)

Human time spent so far: NOT YET PROVIDED by the user. The numbers below are a plan, not actuals.

| Stage | Planned |
|---|---|
| Implementation (incl. targeted runs) | 2:00 |
| Review (04) | 0:15 |
| Error analysis (05), only if failures | 0:10 |
| Report (06) + DECISIONS.md + README final | 0:20 |
| Contingency | 0:15 |
| **Part 1 remaining** | **about 3:00** |
| Parts 2 + 3 | 1:00-1:30 |
| Cap (R-14) | 6:00 total |

## Remaining blockers and open questions

| ID | Item | Blocks? | Handling |
|---|---|---|---|
| U-1 | Reservation dates from the query string vs calendar interaction | No | Spike + fallbacks A/B/C |
| U-2 | Confirmation UI text / "Reserve Now" label | No | Network-first oracle (D-017) |
| U-3 | Admin UI selectors | No (stretch only) | Spike when the stretch is reached |
| U-4 | TS 7 + Cypress loader | No | Gate + 5.9.x fallback |
| U-5 | Cypress 16 env API, per-suite UA override | No | Verify in the scaffold |
| Q-04 | Availability filter semantics | No (deferred S-05/S-16) | Ask Product |
| Q-07/Q-08 | Logout does not revoke the token; unauth message count | No | Findings (D-016) |
| Q-09/Q-13 | Reset cadence, Cloudflare limits | No | Classification rules |
| Q-10/Q-11 | iPhone usage split; Xray import route | No | Documented as next steps |
| Secrets | `CYPRESS_ADMIN_USER`/`CYPRESS_ADMIN_PASSWORD` must be set locally (shell or git-ignored `cypress.env.json`) and later as CI secrets | No (write tests skip locally without them) | The user provides them at run time, never in files |

## Handoff status

READY FOR IMPLEMENTATION

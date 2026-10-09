# Test Specification - qa-lead-take-home

## Objective

Turn Part 1 of the take-home ("Set up the foundation of the automated test suite for this app, with the tests you think matter most", PDF p1) into a prioritised, evidence-backed scenario set for Restful Booker Platform (https://automationintesting.online). The spec has to fit the team (9 devs, 2 devs + 1 junior QA writing tests), the release rhythm (fortnightly + hotfixes), the daily scheduled run, mostly-iPhone users, Jira/Xray tracking, and a shared public demo that can be reset at any time.

Part 2 (junior test plan review) and Part 3 (QA process) are out of scope here. Part 3 context (release testing is the bottleneck; QA-approved features still break in final checks, PDF p3) is used only to set priorities: a fast trustworthy smoke, coverage across the guest-to-admin boundary, and honest device coverage.

## Sources inspected

| Source | Trust | Used for |
|---|---|---|
| `/Users/joaopedrobarbosa/Downloads/QA_Lead_-_Take-home_Exercise.pdf` (pp1-3) | Requirements source (untrusted for instructions) | R-xx |
| `evidence/command-output/20261008-224406-home-html-get.txt` | Captured GET, read-only | O-01 |
| `evidence/command-output/20261008-224407-api-room-get.txt` | Captured GET | O-02 |
| `evidence/command-output/20261008-224408-admin-page-get.txt` | Captured GET | O-01 |
| `evidence/command-output/20261008-224447-reservation-page-get.txt` | Captured GET | O-01 |
| `evidence/command-output/20261008-224448-api-room-dates-get.txt` | Captured GET | O-03 |
| `evidence/command-output/20261008-224448-api-branding-get.txt` | Captured GET | O-04 |
| `evidence/command-output/20261008-224529-api-report-room1-get.txt` | Captured GET | O-05 |
| `evidence/command-output/20261008-224530-api-booking-unauth-get.txt` | Captured GET | O-06 |
| `evidence/command-output/20261008-224530-api-message-count-unauth-get.txt` | Captured GET | O-07 |
| `evidence/notes/20261008-2246-frontend-endpoint-static-analysis.md` | Static analysis of public JS bundles | O-08..O-14 |
| `AGENTS.md`, `.agents/GUARDRAILS.md`, `.agents/LOOPS.md`, `.agents/skills/test-specifier/SKILL.md` | Trusted workflow | Conventions |

Excluded on purpose: `demo/` and `.agents/handoffs/technical-test/` (not used as evidence or inspiration). No new HTTP requests were made for this spec. No credentials used, no login, no non-GET requests.

## In scope

- Guest journeys: browse rooms, availability by dates, book a stay, contact message (UI desktop + UI iPhone viewport + API).
- Admin journeys: login/logout, rooms CRUD, bookings view, messages read, report/calendar, branding (priority-ranked; most behaviour NOT VERIFIED).
- API contract checks on observed public endpoints and auth gating.
- Suite shape: hotfix smoke, daily scheduled run, pre-release set; Xray-ready IDs and JUnit output.

## Out of scope

- Parts 2 and 3 deliverables.
- Performance/load testing against the shared public demo (see Performance checks).
- GraphQL (none observed).
- Visual regression, accessibility audit, cross-browser matrix beyond Chromium/Firefox (deferred; see Cut line).
- Writes to global settings on the shared demo (branding update), and any destructive bulk operation.

---

## Explicit requirements (from the PDF)

| ID | Requirement (paraphrase/quote) | Page |
|---|---|---|
| R-01 | Public site where "guests see the rooms, book a stay and send the hotel a message". | p1 |
| R-02 | Admin panel at `/admin` "to manage rooms, bookings and messages". Admin credentials are given in the assignment (not copied here; to be provided via env var). | p1 |
| R-03 | "REST API under https://automationintesting.online/api". | p1 |
| R-04 | "Public demo shared with other people: data you create can be changed or removed by someone else, and it can be reset at any time." | p1 |
| R-05 | 9 developers; two of them plus a junior QA engineer write the automated tests. | p1 |
| R-06 | Release at the end of each two-week sprint; hotfixes can go out in between. | p1 |
| R-07 | "The suite runs once a day, on a schedule." | p1 |
| R-08 | "Most of our users are on iPhone." | p1 |
| R-09 | "Test results are tracked in Jira (Xray)." | p1 |
| R-10 | Set up the foundation of the automated suite "with the tests you think matter most"; team uses Cypress (another tool allowed); 3-4 h suggested. | p1 |
| R-11 | Public Git repo with commit history as you worked; do not squash. | p1 |
| R-12 | `DECISIONS.md` explaining choices, what was left out, what is next. | p1 |
| R-13 | Share AI sessions (links/exports) if AI was used. | p1 |
| R-14 | Max 6 h total (3-4 h Part 1, 1-2 h Parts 2+3); report time per part. | p1 |
| R-15 | Context: release testing is the bottleneck; features wait for QA; QA-approved features still break in final checks. | p3 |

## Application observations (evidence-backed, captured 2026-10-08)

| ID | Observation | Evidence |
|---|---|---|
| O-01 | `GET /`, `GET /admin`, `GET /reservation/1?checkin=2026-12-01&checkout=2026-12-03` return HTTP 200 HTML; Next.js app with `meta viewport width=device-width, initial-scale=1`. | `20261008-224406-home-html-get.txt`, `20261008-224408-admin-page-get.txt`, `20261008-224447-reservation-page-get.txt` |
| O-02 | `GET /api/room` -> 200, body `{"rooms":[...]}`; each item has `roomid` (number), `roomName` (string), `type`, `accessible` (boolean), `image` (path), `description`, `features` (string array), `roomPrice` (number). 3 rooms at capture time. | `20261008-224407-api-room-get.txt` |
| O-03 | `GET /api/room?checkin=..&checkout=..` -> 200 with same `{"rooms":[...]}` shape. Whether results are filtered by availability is NOT VERIFIED. | `20261008-224448-api-room-dates-get.txt` |
| O-04 | `GET /api/branding` -> 200 JSON with `address{line1,line2,postTown,county,postCode}`, `contact{name,email,phone}`, `description`, plus other fields not listed here. | `20261008-224448-api-branding-get.txt` |
| O-05 | `GET /api/report/room/1` -> 200 `{"report":[{"start":"YYYY-MM-DD","end":"YYYY-MM-DD","title":"Unavailable"}]}` (unauthenticated). Used by reservation calendar. | `20261008-224529-api-report-room1-get.txt`, notes |
| O-06 | `GET /api/booking` without auth -> 401 `{"error":"Authentication required"}`. | `20261008-224530-api-booking-unauth-get.txt` |
| O-07 | `GET /api/message/count` without auth -> 200 `{"count":3}`. Admin nav uses it. Observation only: possible authz/privacy concern, intent unknown (Q-08). | `20261008-224530-api-message-count-unauth-get.txt` |
| O-08 | Reservation bundle sends `POST /api/booking` JSON with `roomid, firstname, lastname, depositpaid` (default false), `email, phone, bookingdates.checkin, bookingdates.checkout` (`YYYY-MM-DD`); on non-OK reads `errors` from JSON. Server response contract NOT VERIFIED. | notes (static analysis) |
| O-09 | Home contact form sends `POST /api/message` JSON; on non-OK shows returned JSON or "An error occurred while submitting...". Payload fields and response NOT VERIFIED. | notes |
| O-10 | Admin login sends `POST /api/auth/login` JSON `{username,password}` and stores a token client-side on OK; `/api/auth/validate` and `/api/auth/logout` referenced. Token transport (cookie vs header) NOT VERIFIED. | notes |
| O-11 | Front-end routes: `/`, `/#booking`, `/reservation/<roomid>?checkin=..&checkout=..`, `/admin`, `/admin/report`, `/cookie`, `/privacy`; `/api/room/<id>` referenced (presumed GET, not called). | notes |
| O-12 | Home contact form inputs carry `data-testid` `ContactName`, `ContactEmail`, `ContactPhone`, `ContactSubject`, `ContactDescription` (input ids `name`, `email`, `phone`, `subject`, `description`). Reservation form has no `data-testid`; its inputs carry CSS classes `room-firstname`, `room-lastname`, `room-email`, `room-phone`. No `data-cy` anywhere in inspected bundles. Admin bundles not inspected (NOT VERIFIED). | `notes/20261008-2246-frontend-endpoint-static-analysis.md` ("Test attributes") |
| O-13 | Served via Cloudflare; no `set-cookie` on captured unauthenticated responses. | notes |
| O-14 | Admin sub-page bundles (rooms, report, messages, branding) were NOT inspected; admin write endpoints are unknown. | notes |
| O-15 | Seed data at capture: rooms 101 Single 100, 102 Double 150, 103 Suite 225; room 1 unavailable 2026-02-01..2026-02-05. Volatile; must NOT be used as oracles. | `20261008-224407-api-room-get.txt`, `20261008-224529-api-report-room1-get.txt` |

## Assumptions (all NOT VERIFIED unless stated)

| ID | Assumption | Consequence if wrong |
|---|---|---|
| A-01 | Restful Booker Platform is not the old restful-booker herokuapp API; nothing (paths, `/auth` token, payloads) is borrowed from it. Firm rule, not a guess. | n/a |
| A-02 | A successful `POST /api/booking` returns a 2xx and some booking identifier usable for cleanup. NOT VERIFIED. | Cleanup must go through admin listing by unique tag (Q-02, Q-06). |
| A-03 | Admin room/booking/message management uses authenticated `/api/...` endpoints discoverable by observing admin UI network traffic. NOT VERIFIED (O-14). | Write tests fall back to UI-only setup/cleanup; slower. |
| A-04 | Login token is reusable by `cy.request()` for API setup/cleanup (cookie or header). NOT VERIFIED (O-10). | API-level setup unavailable; UI login per spec via `cy.session()`. |
| A-05 | The server validates booking/message fields and returns `errors`; rules unknown. NOT VERIFIED (O-08, O-09). | Negative expectations stay TBD. |
| A-06 | Overlapping bookings for the same room are rejected. NOT VERIFIED. | S-15 expected result stays TBD. |
| A-07 | The demo is the only available environment and stands in for "our product"; `baseUrl` is configurable for a future staging env. | n/a |
| A-08 | Reset cadence is unknown; a reset can happen mid-run (R-04). No interval is assumed. | Tests must tolerate it ("Shared public demo" section). |
| A-09 | Xray can ingest JUnit XML results; mapping and import mechanism (REST API, CI plugin, test keys) NOT VERIFIED. | Reporter choice may change (Q-11). |
| A-10 | Admin credentials will be supplied via environment variables (e.g. `CYPRESS_ADMIN_USER`, `CYPRESS_ADMIN_PASSWORD`), never committed. | Admin scenarios skipped when unset. |
| A-11 | CI provider is the repo host's (GitHub Actions / GitLab CI / Bitbucket Pipelines); the architect chooses. | n/a |
| A-12 | "Most users on iPhone" means iOS Safari plus possibly in-app webviews; iOS version split unknown. | Device mitigation plan ("iPhone predominance" section) may change (Q-10). |

## Blockers or open questions

Open questions below; approval blockers are in the Blockers section (B-01..B-03).

| ID | Question | Who answers | Impact |
|---|---|---|---|
| Q-01 | Booking field validation rules (lengths, email/phone format, required fields) and error messages? | Product / Dev | Expected results for S-13, S-14; tag length for unique names. |
| Q-02 | Booking success contract: HTTP status, response body (id?), confirmation UI text? | Dev | S-10/S-11 assertions; cleanup strategy. |
| Q-03 | Is an overlapping booking for the same room rejected, and how (status, message)? | Product | S-15. |
| Q-04 | What does `GET /api/room?checkin&checkout` guarantee (only available rooms)? | Product / Dev | S-05, S-16 oracles. |
| Q-05 | Contact message fields, validation rules, success status and UI? | Dev | S-17..S-19. |
| Q-06 | Admin endpoints for rooms CRUD, booking list/delete, message list/read/delete, branding? | Dev | Setup/cleanup for all write tests. |
| Q-07 | Auth: token transport, expiry, invalid-login behaviour, logout invalidation? | Dev | S-20, S-21, `cy.session()` validation. |
| Q-08 | Is unauthenticated `GET /api/message/count` intended? | Product / Security | S-06 expected result; possible security/privacy finding. |
| Q-09 | Is there a non-shared test environment, and what is the demo reset cadence? | Env owner / interviewer | Flakiness budget; whether write tests run daily. |
| Q-10 | iPhone usage split (iOS versions, Safari vs in-app), budget for a device cloud? | Product / Analytics | Device coverage plan. |
| Q-11 | Xray setup: test type (Generic vs Cucumber), import route, existing test keys? | QA / Tooling admin | Title/tag format, reporter. |
| Q-12 | Approval to use the admin credentials and to create bookings/messages/rooms on the shared demo? | Candidate (user) | BLOCKER for write scenarios (B-01). |
| Q-13 | Any rate limits / Cloudflare bot protection affecting CI runners? | Env owner | Retry policy, run frequency. |
| Q-14 | Admin report/calendar semantics (which bookings, date boundaries, timezone)? | Product | S-27. |

## Shared public demo and data-reset strategy (R-04)

| Rule | Detail |
|---|---|
| Split read-only vs write | Tag `@readonly` vs `@write`. Read-only specs never send non-GET requests (except admin login when approved). Hotfix smoke is read-only. |
| Unique tagging | Every created entity carries a run tag, e.g. `qa<runId>` in lastname/room name/message subject. Keep it short until Q-01 answers length limits. Synthetic data only (example.com emails, fake phones). |
| No global oracles | Never assert total counts (rooms, bookings, messages) or others' records. Read expected data from the API at run time (e.g. room list from `GET /api/room`), not from seed values (O-15). |
| Booking dates | Random far-future window (e.g. 1-3 years ahead, random day offset, 1-3 nights, `YYYY-MM-DD` per O-08). Pre-check `GET /api/report/room/{id}` (O-05) and pick a window that does not overlap reported ranges. Different rooms/windows per test. |
| Own-data lookup | Find created records by unique tag, not by position or id guess. |
| Cleanup | `after`/`afterEach` best-effort, idempotent: delete only own tagged records; treat 404/"already gone" as success. Cleanup failures are logged, not test failures. Mechanism TBD (Q-06). |
| Reset mid-run | If own data disappears mid-test, classify as `environment issue` (not product bug) in RCA; do not mask with blind retries. One CI retry max in run mode. |
| No global writes | Branding update and bulk deletes are not automated on the shared demo. Room create/delete only for own tagged room. |
| Politeness | Serial execution, minimal write set (one created record per write scenario, roughly 6-8 per full run), no polling loops, no load tests. |

## iPhone predominance (R-08): coverage and the gap

- What Cypress gives: viewport + user-agent emulation in desktop Chromium/Firefox, plus experimental WebKit (`experimentalWebKitSupport`, Playwright WebKit build).
- What it does NOT give: iOS Safari on a real device or simulator (real touch events, iOS viewport/keyboard behaviour, Safari quirks, in-app webviews). An iPhone-viewport run means "layout at iPhone size in a desktop engine", not iPhone coverage. Reports and DECISIONS.md must say so.

| Mitigation | When | Status |
|---|---|---|
| iPhone viewport project (e.g. 390x844 + iOS UA) for P0 guest journeys in every daily run | Foundation | Planned |
| Experimental WebKit run of P0 guest journeys | Next step (optional nightly) | Deferred; experimental, not iOS Safari |
| Real-device / device-cloud run (e.g. BrowserStack/Sauce, Appium or Playwright on real iOS) for booking + contact | Next step, budget-dependent (Q-10) | Deferred |
| Manual exploratory pass on a real iPhone (Safari) for booking + contact before each release | Pre-release | Planned (S-29) |

## Team context and suite shape (R-05, R-06, R-07, R-09)

| Concern | Spec requirement for architecture |
|---|---|
| Junior-maintainable | One test style; small typed helpers (unique tag, date window, admin session); page modules only for repeated screens; no Cucumber layer now; readable `it()` titles. |
| Review | Every test PR reviewed by QA lead or a test-writing dev; checklist: no seed oracles, no global counts, cleanup present, selectors stable, IDs in title. |
| Hotfix smoke | P0 `@readonly` set (S-01, S-03, S-07, S-08, S-09, plus S-20 when creds approved); target < 3 min; runnable on demand. |
| Daily scheduled | All automated P0+P1 (desktop + iPhone viewport), write tests included once B-01 approved. |
| Pre-release | Daily set + P2 automated + manual exploratory S-29/S-30. |
| Xray traceability | Scenario + requirement IDs in titles/tags, e.g. `[S-10][R-01] guest books a stay @p0 @write`; later replace/augment with Xray test keys. JUnit XML output per spec run. Xray import specifics NOT VERIFIED (Q-11). |

## Critical journeys and priority

| Journey | Priority | Rationale |
|---|---|---|
| G-1 Browse rooms (home lists rooms) | P0 | Entry to all revenue; read-only, safe for smoke. |
| G-2 Availability by dates | P1 | Explicit flow, but filtering semantics unknown (Q-04). |
| G-3 Book a stay (reservation page -> submit) | P0 | Core business transaction (R-01); most iPhone-sensitive (calendar + form). Writes data. |
| G-4 Booking validation negatives | P1 | Common user error path; rules unknown (Q-01). |
| G-5 Contact message | P1 | Explicit (R-01) but lower business impact than booking. |
| AD-1 Admin login/logout + auth gating | P0 | Gate to every admin function; auth regressions are high impact. 401 gating observed (O-06). |
| AD-2 Bookings view (guest booking visible to admin) | P1 | Crosses the guest/admin boundary, where "approved features still break" (R-15). Endpoints unknown (Q-06). |
| AD-3 Messages read | P1 | Closes the contact loop; endpoints unknown. |
| AD-4 Rooms CRUD | P1 (create/delete own room) / P2 (edit) | Rooms feed the guest site; writes affect all demo users, so only own tagged room. |
| AD-5 Report/calendar | P2 | Read view; semantics unknown (Q-14). |
| AD-6 Branding | P2 (read) / not automated (write) | Global setting on a shared demo; update would affect everyone. |

## Test scenarios

Layer values: API / UI-desktop / UI-iPhone-viewport / Exploratory. "TBD - Q-xx" means the expected result is not observed or required yet.

| ID | Layer | Priority | Scenario | Expected result | Data needs | Mutates shared data? | Requirement IDs |
|---|---|---|---|---|---|---|---|
| S-01 | API | P0 | `GET /api/room` returns the room list contract | 200; `rooms` is a non-empty array; each item has `roomid` number, `roomName` string, `type` string, `accessible` boolean, `image` string, `description` string, `features` array, `roomPrice` number (O-02). No count/value oracles. | None | N | R-01, R-03 |
| S-02 | API | P1 | `GET /api/branding` returns branding contract | 200; object with `address`, `contact{name,email,phone}`, `description` present (O-04). | None | N | R-01, R-03 |
| S-03 | API | P0 | Protected booking list without auth is rejected | 401; body `{"error":"Authentication required"}` (O-06). | None | N | R-02, R-03 |
| S-04 | API | P1 | `GET /api/report/room/{id}` for a room id taken from S-01 | 200; `report` array; each item has `start`,`end` (`YYYY-MM-DD`) and `title` (O-05). | Room id from API | N | R-01, R-03 |
| S-05 | API | P1 | `GET /api/room?checkin&checkout` with far-future dates | 200 with `rooms` array of same item shape (O-03). Filtering semantics TBD - Q-04. | Random far-future window | N | R-01, R-03 |
| S-06 | API | P2 | `GET /api/message/count` without auth | Currently 200 `{"count":<number>}` (O-07); whether it should be 401 TBD - Q-08. Assert shape only; report as observation. | None | N | R-02, R-03 |
| S-07 | UI-desktop | P0 | Home page renders rooms from the API | Intercept `GET /api/room` (real response); each returned `roomName` is visible on the page (R-01); layout not asserted; no seed values hard-coded. | None | N | R-01 |
| S-08 | UI-iPhone-viewport | P0 | S-07 at iPhone viewport | Same assertions as S-07 at iPhone viewport; booking entry point visible and clickable. | None | N | R-01, R-08 |
| S-09 | UI-desktop | P0 | Open reservation page for an API-sourced room with far-future dates | `/reservation/{id}?checkin&checkout` loads; form inputs (`room-firstname`, `room-lastname`, `room-email`, `room-phone`, O-12) visible; calendar data requested from `/api/report/room/{id}` (O-05). | Room id, date window | N | R-01 |
| S-10 | UI-desktop | P0 | Guest books a stay end to end | `POST /api/booking` intercepted; request body has `roomid`, names, `email`, `phone`, `bookingdates.checkin/checkout` in `YYYY-MM-DD` matching the chosen window (O-08); bundle branches on HTTP OK, so success = OK status (O-08). Exact status, response body and confirmation UI TBD - Q-02. | Unique tagged guest, non-overlapping window ("Shared public demo" section), cleanup TBD - Q-06 | Y | R-01 |
| S-11 | UI-iPhone-viewport | P0 | S-10 at iPhone viewport | Same as S-10. | As S-10, different room/window | Y | R-01, R-08 |
| S-12 | API | P1 | Booking from S-10 is visible to an authenticated admin, found by unique tag | TBD - Q-06, Q-07. | Admin creds (env), S-10 booking | N (reads own record) | R-01, R-02 |
| S-13 | UI-desktop | P1 | Submit booking with required fields empty | Error path: UI shows server `errors` or client validation (O-08). Whether the request is blocked client-side, exact status and messages TBD - Q-01. | Room id, window | N (intended) | R-01 |
| S-14 | API | P1 | `POST /api/booking` with invalid payload (missing names, bad date order) | Non-2xx with JSON `errors` array/object (client reads `errors`, O-08). Status and messages TBD - Q-01. | Synthetic payload | N (intended) | R-01, R-03 |
| S-15 | API | P1 | Second booking overlapping own booking for the same room | TBD - Q-03. | Own booking from setup | Y | R-01 |
| S-16 | UI-desktop | P1 | Availability search with far-future dates on home | Intercepted `GET /api/room?checkin&checkout` carries the selected dates (`YYYY-MM-DD`); rooms from the response are rendered. Filtering semantics TBD - Q-04. | Date window | N | R-01 |
| S-17 | UI-desktop | P1 | Guest sends a contact message | `POST /api/message` intercepted; bundle branches on HTTP OK (O-09). Exact status, body and success UI TBD - Q-05. | Unique tagged message, synthetic contact data | Y | R-01 |
| S-18 | UI-iPhone-viewport | P1 | S-17 at iPhone viewport | Same as S-17. | As S-17 | Y | R-01, R-08 |
| S-19 | UI-desktop | P1 | Contact form submitted invalid/empty | Error shown (server JSON or "An error occurred while submitting...", O-09); no 2xx. Rules TBD - Q-05. | None | N (intended) | R-01 |
| S-20 | UI-desktop | P0 | Admin logs in and logs out | `POST /api/auth/login` sent with `{username,password}` (O-10) and the bundle stores a token on OK (O-10). Post-login landing, logout behaviour and session invalidation TBD - Q-07. | Admin creds from env | N | R-02 |
| S-21 | UI-desktop | P1 | Admin login with wrong password | Not logged in; error UI TBD - Q-07. | Synthetic wrong password | N | R-02 |
| S-22 | UI-desktop | P1 | Admin sees the guest booking from S-10 (search by tag) | TBD - Q-06. | Admin session, S-10 booking | N | R-01, R-02, R-15 |
| S-23 | UI-desktop | P1 | Admin sees and opens the message from S-17 | TBD - Q-06. | Admin session, S-17 message | Y (read flag, own record) | R-02, R-15 |
| S-24 | UI-desktop | P1 | Admin creates a tagged room, it appears in `GET /api/room` and on home; admin deletes it, it disappears | TBD - Q-06 (create/delete contract). Public visibility re-checked through the S-01 API contract. | Admin session, unique room name | Y | R-01, R-02 |
| S-25 | UI-desktop | P2 | Admin edits own tagged room | TBD - Q-06. | Own room from S-24 | Y | R-02 |
| S-26 | UI-desktop | P2 | Admin report/calendar shows own booking window | `/admin/report` loads (O-11); content TBD - Q-14. | Admin session, own booking | N | R-02 |
| S-27 | UI-desktop | P2 | Admin branding page displays current branding consistent with `GET /api/branding` | TBD - Q-06. No branding update automated. | Admin session | N | R-02 |
| S-28 | UI-desktop | P2 | Reservation route with unknown room id / invalid dates | TBD - Q-02, Q-04. | None | N | R-01 |
| S-29 | Exploratory | P1 | Real iPhone Safari pass: browse, date pick, booking, contact | Charter-based; findings logged as bugs; covers the gap in "iPhone predominance" section. | Real device, tagged data | Y | R-08, R-15 |
| S-30 | Exploratory | P2 | Authz probe of unauthenticated GETs on admin-used endpoints | Charter; report findings (starting from O-07) to Product/Security. GET only. | None | N | R-02 |

## Traceability matrix

| Requirement | Scenarios | Test (spec file / title) | Execution |
|---|---|---|---|
| R-01 | S-01, S-02, S-04, S-05, S-07..S-19, S-22, S-24, S-28 | TBD | TBD |
| R-02 | S-03, S-06, S-12, S-20..S-27, S-30 | TBD | TBD |
| R-03 | S-01..S-06, S-14 | TBD | TBD |
| R-04 | "Shared public demo" section rules applied to all `@write` scenarios (S-10, S-11, S-15, S-17, S-18, S-23..S-25) | TBD | TBD |
| R-05 | "Team context" section conventions | TBD (DECISIONS.md) | n/a |
| R-06 | Hotfix smoke + pre-release sets ("Team context" section) | TBD | TBD |
| R-07 | Daily scheduled set ("Team context" section) | TBD (CI schedule) | TBD |
| R-08 | S-08, S-11, S-18, S-29; "iPhone predominance" section | TBD | TBD |
| R-09 | IDs in titles + JUnit XML ("Team context" section) | TBD | TBD |
| R-10 | P0 set + cut line ("Time and coverage" section) | TBD | TBD |
| R-11..R-14 | Delivery items, owned by report stage | n/a | n/a |
| R-15 | S-22, S-23, S-29; smoke design | TBD | TBD |

## Priorities summary

- P0 (8): S-01, S-03, S-07, S-08, S-09 (read-only, hotfix smoke); S-20 (admin login, needs creds approval); S-10, S-11 (booking, needs write approval).
- P1 (16): S-02, S-04, S-05, S-12..S-19, S-21..S-24, S-29.
- P2 (6): S-06, S-25..S-28, S-30.
- GET-only scenarios (S-01..S-09, S-16) can be built and run without approval; every scenario that sends a non-GET request (including negative POSTs S-13/S-14/S-19 and login S-20/S-21) waits on B-01.

## Time and coverage constraints

Cut line for the Part 1 foundation:

| In the foundation | Explicitly deferred (to DECISIONS.md "next") |
|---|---|
| Cypress + TypeScript project, `baseUrl` + env-based admin creds | Cucumber/BDD layer |
| Helpers: run tag, far-future date window with report pre-check, admin session (`cy.session`) | Experimental WebKit run, device cloud |
| API: S-01, S-02, S-03, S-04, S-05, S-14 | S-15, S-25..S-28 |
| UI desktop: S-07, S-09, S-10, S-13, S-16, S-17, S-20 | Admin rooms CRUD UI (S-24), admin views S-22/S-23 if endpoints unclear |
| UI iPhone viewport: S-08, S-11 | S-18 (iPhone contact) if time is short |
| Tags `@p0/@p1/@readonly/@write`, JUnit XML reporter, CI workflow with daily schedule + on-demand smoke | Real Xray import, Slack/Jira notifications, visual/a11y checks, performance |
| DECISIONS.md, honest coverage statement (iPhone gap) | Manual exploratory S-29/S-30 (documented as charters only) |

Stage time budget (human time; total cap 6 h, R-14):

| Stage | Budget |
|---|---|
| Spec (this file) | 0:20 |
| Architecture | 0:20 |
| Implementation (incl. targeted runs) | 1:50-2:10 |
| Review | 0:20 |
| Error analysis | 0:15 |
| Report + DECISIONS.md | 0:20 |
| Part 1 subtotal | 3:25-3:45 (cap 4:00) |
| Parts 2 + 3 | 1:00-2:00 |
| Total | <= 6:00 |

## Blockers (need the candidate's approval before implementation of affected scenarios)

| ID | Blocker | Affects | Unblocked by |
|---|---|---|---|
| B-01 | Using the admin credentials from the assignment (via env vars) and sending non-GET requests to the shared public demo (bookings, messages, rooms, negative POSTs that could create data if validation is weaker than expected, login). | S-10..S-15, S-17..S-27, S-29 | Explicit user approval (Q-12). |
| B-02 | Admin endpoints and auth transport unknown (O-14). Discovering them needs an approved logged-in browser session with network capture. | Cleanup for all `@write` tests; S-12, S-22..S-27 | B-01 approval, then read-only network observation of admin UI. |
| B-03 | Server contracts for booking/message success and errors unknown. | Precise assertions in S-10, S-13, S-14, S-17, S-19 | First approved write run, captured as evidence. |

None of these blocks the architecture stage or the read-only scenarios.

## BDD candidates

Recommended as readable scenario titles now; no Cucumber runtime in the foundation (junior maintainability, time). Revisit if Xray uses Cucumber test type (Q-11).

```gherkin
Feature: Guest booking
  Scenario: Guest books an available room for future dates   # S-10 / S-11
    Given a room returned by the room list
    And a far-future date window with no reported unavailability for that room
    When the guest completes the reservation form with valid details
    Then the booking request contains the room id and the chosen dates
    And the booking request succeeds

Feature: Admin access
  Scenario: Booking list requires authentication              # S-03
    When the booking list is requested without logging in
    Then access is refused with "Authentication required"
```

## API contract checks

| Endpoint | Method | Checks | Evidence |
|---|---|---|---|
| `/api/room` | GET | status 200, `rooms` array, item field types (S-01) | O-02 |
| `/api/room?checkin&checkout` | GET | status 200, same item shape (S-05) | O-03 |
| `/api/branding` | GET | status 200, `address`, `contact`, `description` (S-02) | O-04 |
| `/api/report/room/{id}` | GET | status 200, `report[]` with `start`,`end` date strings, `title` (S-04) | O-05 |
| `/api/booking` | GET unauth | 401 + `error` message (S-03) | O-06 |
| `/api/message/count` | GET unauth | 200 + numeric `count`, flagged (S-06) | O-07 |
| `/api/booking` | POST | request shape from UI (S-10); error `errors` key (S-14); response TBD | O-08 (client side only) |
| `/api/message` | POST | 2xx / error JSON; fields TBD | O-09 |
| `/api/auth/login`, `/validate`, `/logout` | POST/? | TBD - Q-07 | O-10 |

Use `cy.request()` with `failOnStatusCode: false` for expected 4xx. Assert shapes and types, not seed values.

## GraphQL checks

None. No GraphQL endpoint observed in pages, bundles, or API responses (notes, O-08..O-11).

## Performance checks

Out of scope. The target is a shared public demo behind Cloudflare (O-13); load generation would be abusive and not representative (R-04). Cypress timings do not measure capacity. Next step: JMeter/k6 against a dedicated environment, starting with `GET /api/room` and `POST /api/booking`.

## Automation notes

- Real backend for all UI scenarios; `cy.intercept()` used to observe and alias requests (registered before the action), not to stub. Any stubbed variant must be labelled as not proving integration.
- Selectors (O-12): contact form (S-17, S-18, S-19) uses the existing `data-testid` values `ContactName`, `ContactEmail`, `ContactPhone`, `ContactSubject`, `ContactDescription`. Booking form (S-09..S-11, S-13) has no test ids, so it falls back to the `room-*` classes/input names, roles or labels, kept in one page module. Ask devs to add `data-testid` to the reservation and admin screens (low cost, 9 devs).
- No `cy.wait(ms)`; wait on aliases and retryable assertions.
- Admin auth via `cy.session()` with validation; creds only from env; skip admin specs with a clear message when env is unset.
- Run serially; `retries.runMode` at most 1; capture screenshots/videos on failure and JUnit XML per spec.
- Failure classification for demo-induced failures: `environment issue` or `data issue`, never silently retried.
- iPhone viewport: Cypress viewport preset/explicit size plus UA override; label as emulation in report.

## Handoff status

READY FOR ARCHITECTURE

GET-only scenarios (S-01..S-09, S-16) can proceed. Scenarios that send any non-GET request (writes, negative POSTs, login) stay gated by B-01 (user approval to use admin credentials and send requests that may create data on the shared demo). B-02 and B-03 are resolved during implementation once B-01 is approved.

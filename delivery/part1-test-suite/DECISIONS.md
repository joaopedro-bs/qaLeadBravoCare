# DECISIONS

Decision log for the Restful Booker Platform test suite foundation (Part 1 of the QA Lead take-home exercise).
Entries are written when the decision is made, not reconstructed at the end. Superseded entries are kept and marked.

Status values: `proposed` (awaiting confirmation), `accepted`, `superseded`.

Evidence notes: this file is meant to be read on its own. Evidence is summarised inline. Paths under
`.agents/handoffs/...` refer to the internal working area where raw evidence is kept; that area is
not part of this published repository.

## Summary

| ID | Stage | Decision | Status |
|---|---|---|---|
| D-001 | Setup | Build the suite in its own self-contained directory, extractable as the public repository | proposed |
| D-002 | Setup | Cypress + TypeScript | accepted |
| D-003 | Specification | Read-only inspection of the live demo before any test design | accepted |
| D-004 | Setup | No push or publication without explicit human approval | accepted |
| D-005 | Setup | Report human working time separately from AI-agent runtime | accepted |
| D-006 | Specification | Three suite tiers (hotfix smoke, daily, pre-release), split into read-only and write tests | proposed |
| D-007 | Specification | iPhone: emulated viewport in automation, plus manual checks on a real device; the gap is stated plainly | proposed |
| D-008 | Specification | Xray traceability through scenario and requirement IDs in test titles, plus JUnit XML | proposed |
| D-009 | Specification | Rules for shared, resettable demo data | proposed |
| D-010 | Specification | No Cucumber layer and no load testing in the foundation | proposed |

---

## D-001 - Self-contained delivery directory

- Timestamp: 2026-10-08 22:47 -03
- Stage: Setup
- Status: proposed

Context and evidence
- The exercise asks for a public Git repository with an unsquashed commit history (assignment PDF, "What to send").
- The working environment also holds internal agent configuration and notes from earlier, unrelated work. Those must not be published.

Alternatives considered
1. Separate Git repository outside the working environment. Clean history from the start. However, it sits outside the working environment, so the review workflow cannot track it.
2. Separate repository nested inside the working environment. Clean history, but the outer repository does not track it. If the working copy is cleaned up, the work can be lost.
3. **Tracked subdirectory `delivery/part1-test-suite/`, extracted later with `git subtree split --prefix=delivery/part1-test-suite`.** The extracted history contains only commits that touched this directory, in their original order.

Choice and rationale
- Option 3. It keeps one source of truth during the work and still produces a real, unsquashed history for the public repository.

Consequences and limitations
- Commit discipline is required:
  - A commit never mixes suite files with internal notes.
  - Suite commit messages are written for an external reader.
- The extraction step must be run and checked before publishing. Publishing is a separate, human-approved step (D-004).

Omissions and next steps
- Confirm this layout with the candidate before the first suite commit.
- Parts 2 and 3 are uploaded as documents rather than to this repository, so they will be drafted in sibling directories under `delivery/`.

## D-002 - Cypress + TypeScript

- Timestamp: 2026-10-08 22:47 -03
- Stage: Setup
- Status: accepted

Context and evidence
- The assignment says "We use Cypress, but you can use another tool."
- The team's automation contributors are two developers and one junior QA, so familiar tooling and type safety lower the cost of keeping the suite up.

Alternatives considered
- Playwright, which has native WebKit and mobile device profiles relevant to iPhone users.
- Plain API runners such as Postman/Newman.

Choice and rationale
- Cypress + TypeScript, matching the team's existing tool. A foundation in a different tool would need migration and retraining before it pays off.
- API checks use `cy.request()`, so one runner and one report cover both UI and API.

Consequences and limitations
- Cypress emulates a mobile viewport and user agent in desktop browsers; it does not run iOS Safari.
- iPhone coverage from this suite is therefore partial. The gap and how to close it are covered in the test specification and in later decisions.

Omissions and next steps
- Decide the WebKit/real-device strategy during architecture.

## D-003 - Read-only inspection before test design

- Timestamp: 2026-10-08 22:47 -03
- Stage: Specification
- Status: accepted

Context and evidence
- The app is a shared public demo; data created there can be changed or removed by other users, and it can be reset at any time (assignment PDF).
- Unauthenticated GET requests on 2026-10-08 returned:
  - `GET /api/room`: 200, JSON with a `rooms` array (3 rooms at capture time).
  - `GET /api/branding`: 200.
  - `GET /api/report/room/1`: 200, a list of "Unavailable" date ranges.
  - `GET /api/booking`: 401 `{"error":"Authentication required"}`.
  - `GET /api/message/count`: 200 `{"count":3}`, which needed no authentication.
- The front-end JavaScript references these endpoints: `/api/booking` (POST), `/api/message` (POST), `/api/auth/login`, `/api/auth/validate`, `/api/auth/logout`, `/api/room`, `/api/room/{id}`, `/api/branding`, `/api/report/room/{id}` and `/api/message/count`.
- Internal evidence (not published): `.agents/handoffs/qa-lead-take-home/evidence/`.

Alternatives considered
- Log into the admin panel and create bookings and messages straight away, to learn the full contracts.

Choice and rationale
- The specification is based only on the assignment text, public pages and unauthenticated GET responses. API contracts and business rules are not assumed. Anything not observed is recorded as an assumption or an open question.

Consequences and limitations
- Admin journeys, and the request and response contracts for writes, are not verified at this stage.

Omissions and next steps
- Authenticated and write-path exploration needs explicit approval, and will use uniquely tagged test data.

## D-004 - No publication without explicit approval

- Timestamp: 2026-10-08 22:47 -03
- Stage: Setup
- Status: accepted

Context and evidence
- The assignment asks for a public repository and uploads to a shared folder, but publishing is an outward-facing, hard-to-reverse action.

Alternatives considered
- Push as work progresses.

Choice and rationale
- Commits stay local until the candidate reviews them and approves publishing.

Consequences and limitations
- The public repository is created late. The commit history is still preserved (D-001).

Omissions and next steps
- At publication time:
  1. Run a secret scan.
  2. Extract the history.
  3. Check that the extracted history contains only suite files.
  4. Publish.

## D-005 - Time accounting

- Timestamp: 2026-10-08 22:47 -03
- Stage: Setup
- Status: accepted

Context and evidence
- The assignment asks for about 6 hours in total (Part 1: 3-4 h; Parts 2 and 3: 1-2 h) and asks how long was spent on each part.

Choice and rationale
- The internal run log records two things:
  - wall-clock timestamps for each stage, labelled as agent runtime;
  - human working time, as reported by the candidate.
- Only the human working time is reported as time spent.

Alternatives considered
- Report total elapsed session time.
- Report AI-agent runtime as time spent.
- Both would misstate the human effort the assignment asks about.

Consequences and limitations
- Human time depends on the candidate's own reports at each review checkpoint.

Omissions and next steps
- Ask for human time at each stage checkpoint.
- Put the per-part totals in the final report.

## D-006 - Suite tiers and read-only/write split

- Timestamp: 2026-10-08 22:52 -03
- Stage: Specification
- Status: proposed

Context and evidence
- Releases ship every two weeks, with hotfixes in between, and the suite runs once a day (assignment).
- Release testing is the current bottleneck (assignment, Part 3).
- The demo is shared, so any test that writes data adds risk for other users and makes failures less deterministic.

Alternatives considered
- One suite that runs everything on every trigger.
- Tiers defined only by priority.

Choice and rationale
- Three tiers:
  - **Hotfix smoke:** P0 read-only tests (room list contract, booking list rejected without auth, home page renders rooms on desktop and at iPhone size, reservation page loads), plus admin login once it is approved. Target under 3 minutes, so it can run on demand.
  - **Daily scheduled:** all automated P0 and P1 tests on desktop and at iPhone viewport. Write tests join once creating data on the demo is approved.
  - **Pre-release:** the daily set plus automated P2 tests and manual exploratory charters.
- Tests are tagged `@p0/@p1/@p2` and `@readonly/@write`.

Consequences and limitations
- A hotfix check alone does not prove that a booking can still be made end to end, because the booking test writes data. The release checklist must say so.

Omissions and next steps
- The architecture stage maps the tiers to CI triggers.

## D-007 - iPhone coverage

- Timestamp: 2026-10-08 22:52 -03
- Stage: Specification
- Status: proposed

Context and evidence
- Most users are on iPhone (assignment).
- The site sets `<meta name="viewport" content="width=device-width, initial-scale=1"/>` (observed in the home page HTML), so a responsive layout is expected.

Alternatives considered
1. Desktop-only automation.
2. Cypress experimental WebKit.
3. A device cloud running real iOS Safari.
4. Switching to a tool with WebKit device profiles (see D-002).

Choice and rationale
- P0 guest journeys run at an iPhone-sized viewport with an iOS user agent in every daily run.
- A short manual exploratory pass on a real iPhone in Safari (browse, choose dates, book, contact) happens before each release.
- WebKit and a device cloud are listed as next steps.

Consequences and limitations
- This is layout emulation in a desktop browser engine, not iOS Safari. Touch input, the on-screen keyboard and Safari-specific behaviour are not covered by automation. Reports must say "iPhone viewport", not "iPhone".

Omissions and next steps
- Confirm the iOS version split and the budget for a device cloud.

## D-008 - Xray traceability

- Timestamp: 2026-10-08 22:52 -03
- Stage: Specification
- Status: proposed

Context and evidence
- Results are tracked in Jira (Xray), according to the assignment.
- The Xray configuration (test type, import route, existing keys) is unknown.

Alternatives considered
- An Xray-specific reporter from the start.
- Cucumber with Xray Cucumber tests.

Choice and rationale
- Each test title carries its scenario and requirement IDs, for example `[S-10][R-01] guest books a stay`.
- Each spec writes JUnit XML. This keeps the chain requirement -> scenario -> test -> execution visible today, and an import can be added later.
- The assumption that Xray ingests JUnit XML is NOT VERIFIED.

Consequences and limitations
- The scenario IDs need to be mapped to Xray test keys once the Xray setup is known.

Omissions and next steps
- Ask how Xray is configured before wiring an import.

## D-009 - Shared demo data rules

- Timestamp: 2026-10-08 22:52 -03
- Stage: Specification
- Status: proposed

Context and evidence
- The demo is shared and can be reset at any time (assignment).
- At capture time it held 3 rooms, and room 1 had one "Unavailable" range. These values can change at any moment.

Alternatives considered
1. Assert on the known seed values (3 rooms, fixed prices). Simple, but it breaks as soon as someone else edits the demo or it resets.
2. Seed a known fixture state before each run. That means global writes to a shared demo, and a reset or another user can undo it.
3. Stub the backend in UI tests. Deterministic, but it would not prove the integration.

Choice and rationale
- Created data:
  - Every record a test creates carries a short run tag.
  - Synthetic contact data only.
  - Tests find their own records by that tag.
- Assertions:
  - Never assert global counts, seed values or other people's records.
  - Expected values are read from the API at run time.
- Bookings:
  - Use random far-future date windows.
  - Before booking, check the room's unavailability report.
- Cleanup and reruns:
  - Cleanup is best-effort and idempotent: data that has already gone counts as success.
  - Tests run one at a time, with at most one retry.
  - A failure caused by data disappearing mid-run is classified as an environment issue, not a product bug.
- Global writes: branding is never changed by automation.

Consequences and limitations
- Some failures will still come from the environment. The cleanup method depends on admin endpoints that have not been observed yet.

Omissions and next steps
- A dedicated test environment would remove this whole class of flakiness. That is the main recommendation.

## D-010 - Deferred: Cucumber layer and load testing

- Timestamp: 2026-10-08 22:52 -03
- Stage: Specification
- Status: proposed

Context and evidence
- The tests are maintained by two developers and a junior QA.
- Part 1 has 3-4 hours.
- The target is a shared public demo behind Cloudflare (response headers).

Alternatives considered
1. A Cucumber preprocessor from the start, so Gherkin maps directly to Xray Cucumber tests. It adds a layer of step definitions for a junior QA to maintain, before we know Xray needs it.
2. k6 or JMeter against the demo, to measure response times.

Choice and rationale
- Plain Cypress specs with readable titles. Gherkin is used only as wording, with no Cucumber runtime.
- No load testing against a shared public service, since it would be abusive and would not reflect the real product.

Consequences and limitations
- If Xray uses Cucumber test types, a BDD layer may be added later.

Omissions and next steps
- Add load testing on a dedicated environment, starting with the room list and booking endpoints.

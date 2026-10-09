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

Consequences and limitations
- Human time depends on the candidate's own reports at each review checkpoint.

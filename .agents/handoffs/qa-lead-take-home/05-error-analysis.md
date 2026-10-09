# Error Analysis - qa-lead-take-home

Status (Stage 6, 2026-10-09 01:20 -03): **NEEDS MORE EVIDENCE / USER DECISION**. React #418 has been diagnosed as runner-induced:
- it appears under Cypress in Electron 138 and in Chrome 155;
- it is absent in plain Chrome 155;
- the Cypress AUT head injection was observed;
- medium-high confidence; see "Stage 6" at the end of this document.

The booking journey has not been validated, and the full suite was not run.

Prior status (kept for history): **NEEDS FIX**. The calendar driver has a supported `test bug` diagnosis. The original React #418 cause and impact remain `unknown`. No implementation or decision was changed, no D-018 acceptance, and no commit/publication/upload occurred.

## Evidence inspected

Canonical AGENTS, RTK, GUARDRAILS, AI_OPERATING_MODEL, LOOPS, WORKFLOW, EVIDENCE and error-analyst contract; full 01/02/03/04, DECISIONS and run-log. The latest user instruction supersedes the historical request-rewriting, automatic reset/concurrency classification and review suggestions for a baseline-derived error ceiling or invented ticket/owner.

All paths below are relative to this work item's `evidence/`:

- `command-output/20261009-0000-final-daily-results-65f56ae2532bb2917ac26610d4219908.xml`: final S-10 body actionability stack and S-11 submitted-date assertion.
- `command-output/20261009-0000-final-daily-attempts.json`: final run `cdd7962f-e251-4728-afc3-7d68f9a419d8`, both failed attempts per UI scenario, the single 201 observation, nine React symptoms, cleanup outcomes.
- `command-output/20261008-2354-results-d9b0301955d7b82d4df79657cafad962.xml` and matching attempts: desktop body actionability; mobile Selected lookup failed; one accepted create exists without an attempt-level network observation.
- Exact `2345-calendar-query`, `2348-calendar-scroll`, `2351-calendar-hit-point` XML and attempts: covered by Amenities nav, an all-day event and Selected event content respectively; all retries failed, no creates.
- `notes/20261008-2345-reservation-dom-inspection.json`: month calendar, off-range days, no inputs before Reserve Now.
- Original `2335-results-a0c2d126...xml` and `2335-smoke-ui-attempts.json`: original application #418 failures; API passes and all three UI scenarios fail twice. The review itself did not inspect the original XML; the error is preserved there.
- `notes/20261009-0004-execution-manifest.md`, 03 and 04 source/execution sections; final post-run typing/safety evidence referenced there.
- Deliverable `cypress/support/pages/reservation.ts`, `cypress/e2e/hotfix/guest-booking.cy.ts`, `cypress/support/e2e.ts`; full-identity cleanup and final-source changes described in node-tasks/03/04.
- New RCA-only source `notes/20261009-rca-native-pointer.mjs` and raw journals `command-output/20261009-rca-native-pointer-{diagnostic,comparison,settled,booking,final}.json`. Earlier `...native-pointer.json`/`...no-query.json` preserve the first no-query readiness failure.

## Failure summary and classification

| Failure/question | Primary classification | Confidence | Conclusion |
|---|---|---|---|
| S-10 hidden body during synthetic drag | `test bug` | High | The driver selects `body` as mousemove/up subject; Cypress actionability evaluates its centre separately from the event's supplied calendar coordinates. The exact historical hit-test geometry was not recorded, but new native geometry explains the viewport difference. |
| S-11 wrong submitted dates / weak Selected check | `test bug` | High for driver/oracle defect; medium for precise historical event cause | An existing URL-selected event can satisfy the intermediate assertion without a changed selection. Native pointer changes the event and the submitted dates. Historical logs do not establish which handler ran or associate the 201 with an exact retry. |
| Hypothesis: product always submits URL dates after successful selection | `unknown` as a historical product-bug claim; contradicted in fresh diagnostic | High for this sampled contrary observation | Real changed selection produced Feb 12..14 request/response despite Jan 29..31 URL. No evidence supports an unconditional URL override. This is not proof across every engine/state/date boundary. |
| React #418 underlying cause and calendar impact | `unknown` | High that evidence is insufficient | Original Cypress execution captured it; no original interaction-relative timestamp. Fresh isolated Chrome did not emit it. Browser/version/runner differences prevent concluding it is always unrelated. |
| Final source lacks full live validation | `unknown` (validation gap, not a runtime failure diagnosis) | High | Final delivery source has not received live Cypress execution. RCA Chrome execution does not close that gap. |
| Initial RCA form-filling 400 | `test bug` in diagnostic code only | High | Native fill lacked focus/value proof and left lastname empty; rejected response was 400, no returned ID. A focus-verified rerun corrected the diagnostic and created exactly one accepted record. |

The final Cypress suite remains **FAIL / CORE INCOMPLETE**: seven first-attempt passes, S-10/S-11 failed on both attempts. A separate successful diagnostic is not a rerun/pass of those deliverable specs.

## Historical timeline: established facts and gaps

| Stage | Evidence-backed observation | Limit |
|---|---|---|
| Initial URL dates | Source deliberately subtracts 14 days from target. Single final observation: target Feb 12..14 2029, request Jan 29..31. | Original URL and DOM snapshot are not captured for that exact attempt; equality is source-plus-payload inference. |
| Visible calendar | URL creates Selected event; initial month is current month, Next navigates target month. January's final days occupy February's leading row. | Original DOM note alone does not show selection before/after the final attempt. |
| Pointer events | Source dispatches synthetic mousedown on day background, mousemove/up on body. S-10 stops at body actionability; earlier diagnostics stop at covered backgrounds. | No original trusted-event trace or elementFromPoint geometry. S-10 failure precedes a completed drag and has no booking observation. |
| Selected state | Final S-11 reaches later submitted-date assertion, so the Selected lookup passed. Prior targeted S-11 final attempt could not find Selected. | Text alone cannot distinguish URL-preselected from target-selected event. No original onSelectSlot trace. |
| Request | Single final observed POST carries Jan 29..31 against Feb 12..14 target. Final S-11 XML fails at the date assertion. | Observation lacks test/attempt key; attribution to the retry vs initial attempt is not established. |
| Response | 201 / ID 6 in that observation. | Proves acceptance of submitted payload only. |
| Confirmation | Deliverable stops at date assertion before confirmation checks. | Original Booking Confirmed/date label/Return home were **not proven**. |
| Cleanup | Original registry empty; outcome journal records owned record deleted-and-absent. | Prior logs infer verify404 through source; fresh diagnostic records every status explicitly. |

XML authoritative timestamps: query diagnostic 02:45:28Z, scroll 02:47:36Z, hit-point 02:50:20Z, targeted guest 02:53:37Z, final guest suite 02:58:48Z. Filename stage labels are not precise run-start times.

## Diagnostics executed and results

No deliverable imports, request intercept/rewrite, React state access, DOM value assignment or forced business-state mutation. Isolated fresh browser profile, cookies cleared between cases, actual CDP mouse inputs and native text input; passive capture observes DOM, trusted pointer/mouse events, application exceptions and unchanged booking network traffic. Administrative requests occur only after guest submission, in Node memory.

Runtime: installed Chrome **155.0.8059.39**, desktop engine at 1280x800 and 390x844, not Electron138/Cypress15.5 and not Safari/iOS. Chrome version was read from the installed app plist; the CDP journals do not contain Browser.getVersion output. Node24.11.1 executes the final env-launched diagnostic. Earlier read-only diagnostics use host Node26.5.0.

1. Initial sandbox Chrome did not start. Authorized unrestricted launch reached the demo. Bare `/reservation/1` loaded room headings but no calendar or booking controls at either viewport. This is an observed prerequisite, not a product-bug assertion. A truly unselected calendar was therefore not available by removing URL dates. No state was manipulated to manufacture one.
2. First URL case changed the selected event but browser smooth scrolling moved the layout during the diagnostic drag; it selected a different row and its form click missed. No POST. Preserved in `...comparison.json`; not used as a successful target selection.
3. Settled read-only run polled stable scroll/rect before coordinates. At both sizes, native drag moved Selected from Jan 29..31 leading row to Feb 12/13 target row, changing span from three cells to two. Form opens. Trusted event trace establishes real pointer delivery. No #418 in this run. No POST.
4. First form-submission diagnostic used native typing without focus/value verification. It submitted **Feb 12..14** and received **400**, with empty lastname. No ID/201, no delete. Its journal mistakenly allocated an IDless obligation after the rejected response. This false diagnostic obligation is explicitly reconciled in the notes below; original journal is retained unchanged.
5. Final bounded rerun verified focus and value equality for all four inputs before submission. Only one accepted synthetic booking was created. Guest had no token before submission. No more remote diagnostics followed.

### Final native timeline (raw `...native-pointer-final.json`)

- Fresh query URL Jan 29..31, calendar initially October2026, no visible Selected in that month.
- Native Next clicks to February2029: existing Selected covers leading Jan29/30/31 cells.
- Stable geometry then trusted pointerdown/mousedown on Feb12 bottom area, twelve native moves with button pressed to Feb13, pointerup/mouseup. Before and after snapshots show Selected change to row containing Feb11..17 with two-cell span, aligned to Feb12/13.
- At 390x844: start (99.14,492.98), end (146.57,492.98), both hit `.rbc-day-bg`. `after.events` selected rect x77.42,width92.84; prior rect x77.42,width140.28 in leading row. No error in journal's Runtime.exceptionThrown trace.
- Native form inputs focused/value-matched; token absent. Unchanged POST: room1, Tester, unique marker `qaxtugqwgm`, depositfalse, **checkin2029-02-12 / checkout2029-02-14**. Contacts recorded only as booleans, never raw values. Request time epoch `1791516877475` (03:34:37.475Z).
- Response **201**, ID4, same own identity and Feb12..14 dates. Source URL remains Jan29..31.
- Booking Confirmed and Return home have rendered positive-size/non-hidden elements at page time10870.10ms. These are independent DOM observations after the response, not inferred from201. The diagnostic visibility helper does not establish viewport intersection.
- **Confirmation date label NOT VERIFIED.** Its regex was embedded incorrectly in an evaluated template string, so `datesVisible:false`/missing dates do not establish that the product omitted dates. No raw confirmation text was captured that could repair this offline. Do not promote this diagnostic into a complete S-11 pass.
- Cleanup recorded: login200, owned GET200, ID+room+first/last names+deposit+both dates match, DELETE202, verifyGET404. Outcome `deleted-and-absent`, unresolvedfalse. No other records/settings touched.

### S-10 body geometry

New settled desktop sample: body centre (640,1030.69), viewport height800, elementFromPoint returnsnull. Mobile body centre (195,679.51), viewport height844, hits an ordinary visible element. This explains why actionability of an unrelated `body` centre can fail only at desktop while event client coordinates concern the calendar. It does **not** recover the precise original body bounds, covering element, scroll position or Chromium138 layout.

### Cleanup reconciliation

`...booking.json` keeps the initial erroneous unresolved IDless entry. It corresponds to the explicitly rejected400 and empty lastname, not an accepted booking with a missing response. No ID returned and no201; no record was deleted. The later final journal contains the sole accepted ID4 and verified removal. Separate `notes/20261009-rca-execution-notes.md` retains this correction; neither failed diagnostic nor its entry was silently removed. Current diagnostic remote obligation: **zero supported outstanding created bookings**. This does not claim a global empty booking list or explain any reused ID.

## Facts versus hypotheses

Established: body is the driver's actionability subject; intermediate Selected text does not encode target dates; native pointer can change selection at both viewports; one native accepted request uses changed dates; native DOM later renders confirmation heading/return link; full ownership cleanup succeeds. This is enough to route the driver back to test-automation-writer.

Supported hypothesis: synthetic mousedown/move/up sequence fails to register the intended calendar selection in original S-11, leaving URL state intact. Exact mechanism (event handler registration, stale geometry, target layer, synthetic events) remains unobserved in original Electron. Do not claim an exact React handler invocation was inspected.

Unsupported hypothesis: all successful selections are overridden by query dates. Fresh native request contradicts it. Unsupported hypothesis: #418 caused the drag failures. No timing link exists; native success without418 is not a controlled same-engine comparison.

## D-018: exact error, timing, scope and recommendation

Original message: `Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.` Cypress wraps it as originating from application code. Stack begins in served `/_next/static/chunks/174b7k13ybrt2.js` (rX at1:46254, then iu at1:97295). It is consistent with React's hydration-mismatch signal; actual mismatching DOM/client computation is not captured.

Original UI visits fail with it, including retries; final continuation counts nine events in UI tests, including one per booking attempt. Counts are recorded in afterEach, with no event timestamps, full exception provenance or relationship to drag timing. Global support handler returnsfalse on a message substring, affecting every UI visit. Business assertions remain but the runtime error does not fail JUnit and can be represented only as a summary risk.

Fresh native Chrome records no Runtime.exceptionThrown entries, with no exception suppression. This narrows the investigation but cannot distinguish Cypress instrumentation, engine/version difference, profile, execution timing or deployment drift. It does not demonstrate harmlessness in Cypress. No supported frequency ceiling, approved ticket, product owner or expiry exists.

**Keep D-018 proposed; recommend removal of the global suppression.** Default Cypress runtime failures should remain visible. No allowance is justified by the current evidence. If a future same-engine investigation supports a temporary allowance, it must use documented source/signature and narrow scenario/time scope, remain visible in JUnit/CLI and separate symptom evidence, preserve failed interaction/business assertions, and receive an explicit decision. Do not derive allowed counts from this small baseline or invent ownership/ticket approval.

Targeted next diagnostic for this `unknown`: reservation-only read-only visits in the same Cypress/Electron138 runtime, recording exact #418 message/stack/timestamp and passive DOM replacement/rect history before pointer interaction, then compare with a matching Chromium build outside Cypress. Use no write and no blanket suppression. If runtime error prevents the test, retain that failure and record the passive timeline up to it.

## Final-source changes without live execution

03/04 and manifest establish the final daily ran on an uncommitted tree before implementation commit `bcd8002`; HEAD now `96c7ebea9c7f8270a64e3845e01d7a9f5904ae17`. No full pre-run diff/source hash exists, so exhaustive attribution is impossible. Known post-live changes:

- Positive safe-integer returned-ID registration guard and returned-record-ID equality before delete: typecheck and eight local mocked safety proofs only.
- Primary FAIL/CORE INCOMPLETE precedence and separate cleanupStatus: typecheck/local mocked reporting proof only.
- Metadata typing correction and per-test finalSymptom/classification reporting: original final attempts lacks finalSymptom; no exact historical diff to reconstruct every modification.
- README/DECISIONS/CI workflow adjustments after live run: documentation/configuration only. CI has never run; Xray and real-device integration remain unverified.

The fresh diagnostic is separate code and cannot validate those deliverable changes. No claim that HEAD specs passed. A current snapshot of relevant delivery files/DECISIONS/root lock is recorded in `notes/20261009-rca-source-hashes.json`, captured during the final diagnostic; it is not a startup hash baseline. Diagnostics record HEAD, dirty status and own script hash. Final `git diff --stat -- delivery/part1-test-suite` is empty, matching the initially clean delivery state. The root lock was already modified at start and was never written by this investigation.

## Minimum recommended correction

For test-automation-writer, after authorization: replace body-subject synthetic drag with native pointer input to observed stable calendar cells in the existing reservation helper; require stable geometry/scroll, exposed hit targets and a completed pointer lifecycle. Choose the smallest Cypress-compatible existing mechanism; no generic service or unreviewed new dependency architecture.

Strengthen selection proof: snapshot initial event and assert target row/columns and exact span changed before opening form. Test with preselected dates visibly inside the month (Jan29..31 vs Feb12..14 is a discriminating case) and also preselection outside the target month; generic Selected existence is insufficient. Retain exact submitted and echoed dates,201, own identity and inspected confirmation/date assertions. Add test+attempt IDs and timing to observations so failed/retried creates can be traced unambiguously.

Remove D-018 suppression unless subsequent scoped evidence and explicit decision support an observable allowance. Do not weaken final business assertions or rewrite requests. Preserve cleanup and all retry histories.

## Acceptance checks for the correction

1. Typecheck and targeted S-10/S-11 execution on final recorded source revision/diff hash. First-attempt outcome and every retry remain visible; no prior result overwritten.
2. Both1280x800 and390x844 prove URL window -> changed Selected exact target cells -> unchanged intended request -> real201/echo -> visible Booking Confirmed, exact dates and Return home. Require viewport-visible date label, which this RCA did not prove.
3. No synthetic body-centre actionability, force operation, request/state rewrite or administrative guest cookie. Observe actual pointer event delivery and stable geometry.
4. Cleanup every accepted record with ID+full identity GET-before-delete and status-level verified absence; mismatches/unverified identity retain obligations and separate cleanup failure. Original assertion preserved, unresolved cleanup prevents unqualifiedPASS.
5. Original #418 remains observable with default failure, or separately authorized narrow allowance with evidence and explicit consequences; no baseline ceiling, invented ticket or clean-runtime claim.
6. One final authorized core run validates final ID guards/status reporting as live integration, alongside mocked negative-path proofs. Do not create a shared-demo ownership mismatch to test deletion safety.

## Unresolved questions and time spent

- Original S-11 exact pointer/handler history and retry responsible for201 are unavailable; new observation keys/passive native trace are next proof.
- Original S-10 exact body geometry and covering element are unavailable; same-engine read-only geometry snapshot is the narrow next diagnostic if needed.
- #418 mismatch source and interaction-relative timing remain unknown; diagnostic above is required before an allowance.
- Native diagnostic exact confirmation date visibility remains unverified because of diagnostic serialization. Validate it in corrected deliverable, without treating its false flag as a product defect.
- Bare reservation route has no calendar; a clean unselected selectable calendar was not exposed. Next selection comparison should use actual home entry URL/default dates and preserved native UI; no state bypass.
- No CI, Xray, Safari/iOS/device, performance, stretch or full HEAD Cypress execution. No implementation changes, commits, pushes, publication or upload.
- Human working time and remaining six-hour budget are **NOT YET PROVIDED**. No invented human duration. Diagnostic journal bounds: first authorized native start03:28:06.955Z, final finish03:34:43.910Z (6m36.955s of diagnostic interval including bounded retries). RCA reading/reporting is additional agent wall-clock, not fully timed; no exact total RCA duration is claimed. Remote work stopped after final run.

## Handoff status

**NEEDS FIX -> test-automation-writer**, not READY FOR REPORT. Scope: calendar driver/selection proof and the reviewed reporting validation gaps; preserve all ownership/privacy controls. D-018 remains proposed, removal recommended. No automatic writer launch or implementation performed by this RCA.

## Stage 6 - React #418 load diagnostic (2026-10-09 01:07-01:20 -03)

Read-only, GET/page visits only. Nothing under `delivery/part1-test-suite` was changed, there was no `uncaught:exception` suppression (the handler records and returns nothing), and no request rewriting/stubbing, writes, bookings, credentials, installs or commits. The harness lives outside the repo at `/Users/joaopedrobarbosa/.claude/jobs/255b32ab/tmp/diag418/` (`cypress.config.js`, `support/diag.js`, `diag/load418.cy.js`, `node_modules` symlinked to the suite's pinned Cypress 15.5.0). Retries are `runMode:1`, so each attempt is recorded separately.

### Established facts (with evidence)

- **#418 reproduces on every attempt under Cypress, in both Electron and Chrome.** The run was 3 tests x 2 attempts per browser (exit 3 each), and each attempt raised exactly one #418.
  - Electron 138.0.7204.251 headless: `evidence/command-output/20261009-010836-418diag-electron.txt`, `...20261009-418diag-electron-records.jsonl`, `...20261009-418diag-electron-results-a399591f8bd1a5d7d662931c98188430.xml`.
  - Chrome 155.0.8059.39 headless: `...20261009-010958-418diag-chrome.txt`, `...20261009-418diag-chrome-records.jsonl`, `...20261009-418diag-chrome-results-f0aba2efdcf22a7a20246a455b04d3ce.xml`.
- **The failure is page-wide, not tied to the reservation page or the calendar.** `/` (home) fails the same way. The home HTML is a statically cached Next.js page (`x-nextjs-cache: HIT`, `cache-control: s-maxage=31536000`), and it does not contain any rbc calendar markup.
- **Full message:** `Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]=`, wrapped by Cypress as "The following error originated from your application code". The window `error` event shows `Uncaught Error: ...` from `_next/static/chunks/174b7k13ybrt2.js`, with first stack frames `rX (174b7k13ybrt2.js:1:46254)`, `iu (:1:97295)`, `sd (:1:137985)`. These are the same chunk and frames as Phase B. No `console.error` or `console.warn` was emitted before the error.
- **Timing:** #418 fires 24-528 ms after the AUT navigation starts (`performance.now()`), with `readyState` already `complete` on the reservation page and `interactive` or `complete` on home. So it happens during initial hydration, before any test interaction. This agrees with the 1-2 s Phase B failures.
- **The runner modifies the document.** The raw server HTML from `cy.request` has `<meta>` as the first `<head>` child and contains no "cypress" text. In the AUT document, the first `<head>` child is an inline `<script>` beginning `(()=>{"use strict";const e=window.Cypress=parent.Cypress;...`. That text matches Cypress 15.5.0's `packages/runner/dist/injection.js`, and the script was present in the head snapshot taken when the error fired. It appears in both Electron and Chrome. No body nodes carry a cypress id, class or src. The `<html>` attributes (`lang=en id=root`) and `<body>` attributes (none) are identical between server and AUT.
- **There is no time- or locale-dependent text in the server HTML.**
  - Reservation: the HTML contains no rbc calendar markup, no month label and no "today"; the only dates are the echoed query values 2029-02-05 and 2029-02-07.
  - Home: no dates at all.
  - Client timezone was America/Sao_Paulo (offset 180) in all Cypress attempts. The server `Date` header was UTC.
- **Plain Chrome (no Cypress) does not show #418.** The same Chrome 155 binary ran headless=new with a fresh profile, `--enable-logging=stderr --v=0 --virtual-time-budget=8000`, on the same machine and therefore the same system timezone.
  - Same reservation URL `/reservation/1?checkin=2029-02-05&checkout=2029-02-07`: 0 `INFO:CONSOLE` lines and no "Uncaught"/418 (`...20261009-011048-418diag-plainchrome-reservation.txt`). The DOM rendered the calendar with the label "October 2026".
  - Home: 0 console lines (`...20261009-011132-418diag-plainchrome-home.txt`).
  - Positive control: a data: page calling `console.error` and `reportError(new Error(..))` was logged as `INFO:CONSOLE ... "Uncaught Error: POSCTRL_reportError"` (`...20261009-011106-418diag-plainchrome-posctrl.txt`). This logging channel therefore does surface `reportError`-style uncaught errors, which is how #418 appears under Cypress.
  - The earlier RCA plain-Chrome CDP run (`20261009-rca-native-pointer-final.json`, headless=new, fresh profile, `Runtime.enable` before navigation, a listener that keeps any description containing "418") also recorded no #418.

### Per-attempt table

Viewport is the `cy.viewport` value set before `cy.visit`. Harness limitation: the recorded `viewport` field reads `Cypress.config` (1000x660) and does not reflect `cy.viewport`. JUnit has only final attempts; the records keep both.

| Run | Browser / version / headless | Viewport | Page | Attempt | #418 | ms from nav | readyState | First frame | State |
|---|---|---|---|---|---|---|---|---|---|
| electron | Electron 138.0.7204.251 / yes | 1280x800 | reservation | 0 | yes | 445.8 | complete | rX 174b7k13ybrt2.js:1:46254 | failed |
| electron | Electron 138 / yes | 1280x800 | reservation | 1 | yes | 45.9 | complete | rX | failed |
| electron | Electron 138 / yes | 390x844 | reservation | 0 | yes | 34.4 | complete | rX | failed |
| electron | Electron 138 / yes | 390x844 | reservation | 1 | yes | 42.3 | complete | rX | failed |
| electron | Electron 138 / yes | 1280x800 | home | 0 | yes | 141.4 | interactive | rX | failed |
| electron | Electron 138 / yes | 1280x800 | home | 1 | yes | 43.6 | complete | rX | failed |
| chrome | Chrome 155.0.8059.39 / yes | 1280x800 | reservation | 0 | yes | 527.7 | complete | rX | failed |
| chrome | Chrome 155 / yes | 1280x800 | reservation | 1 | yes | 109.8 | complete | rX | failed |
| chrome | Chrome 155 / yes | 390x844 | reservation | 0 | yes | 37.4 | complete | rX | failed |
| chrome | Chrome 155 / yes | 390x844 | reservation | 1 | yes | 45.0 | complete | rX | failed |
| chrome | Chrome 155 / yes | 1280x800 | home | 0 | yes | 173.7 | interactive | rX | failed |
| chrome | Chrome 155 / yes | 1280x800 | home | 1 | yes | 24.1 | complete | rX | failed |
| plain Chrome | Chrome 155 headless=new, no Cypress | 1280x800 | reservation | 1 load | no (0 console lines; positive control logs) | - | - | - | n/a |
| plain Chrome | same | 1280x800 | home | 1 load | no | - | - | - | n/a |

The full message is identical on all 12 Cypress attempts (quoted above).

### Differences vs the plain-Chrome runs

- **Runner.** The Cypress proxy injects the `window.Cypress=parent.Cypress` script as the first `<head>` child, and the AUT runs inside the runner iframe. Plain Chrome has neither.
- **Browser.** This is not a differentiator. Chrome 155 fails under Cypress and passes without it.
- **Timezone and locale.** These are not a differentiator, because all runs used the same machine and system timezone. Assumption: plain Chrome inherits the system timezone America/Sao_Paulo, as Cypress-Chrome reported.
- **Viewport.** This is not a differentiator. Both 1280x800 and 390x844 fail under Cypress.
- **Session.** All runs used a fresh profile with no cookies. Cypress recorded `cookies: []`.
- **Node.** The diagnostic used host Node 26.5.0 for the Cypress server, while Phase B used 24.11.1. The browser-side failure is unchanged, so this does not matter here.

### Hypotheses

- **H-A, runner-injected markup: SUPPORTED, medium-high confidence.**
  - For: an injected inline script sits at `<head>` child 0 in every Cypress attempt, in both browsers, and is absent from the server HTML. The same Chrome 155 binary without Cypress shows no #418, with a working positive control. The failure is page-wide, including on a statically cached page, and fires during initial hydration.
  - Against or open: the experiment did not isolate cause. No run injected only that script into plain Chrome, and the AUT head after hydration also differs in order and missing preload links. That reordering is consistent with React discarding the SSR tree after #418, so it is effect, not cause. It is also possible that another runner factor, such as the iframe context or other proxy rewriting, is responsible.
- **H-B, Electron 138 specific: REJECTED, high confidence.** Chrome 155 under Cypress fails the same way.
- **H-C, timezone/locale rendering: NOT SUPPORTED, medium-high confidence.** The server HTML has no time-dependent content. The cached static home page fails too. Plain Chrome on the same machine and timezone passes. The `TZ=UTC` run was skipped because of the timebox and because the same-timezone plain-vs-Cypress control already separates the two.
- **H-D, app defect independent of the runner: NOT SUPPORTED by evidence, medium confidence.** There are two plain-Chrome observations with no #418: the RCA CDP run and today's console run with a positive control. Real-user impact is not shown. Not covered: Safari, Firefox, mobile devices, and slow networks.
- **H-E, test setup (viewport, cookies, consent): REJECTED, high confidence.** The error reproduces with a minimal visit-only spec, at both viewports, on home, and with no cookies. Suite code such as the driver and cleanup is not involved.

### Classification

**Runner-or-browser-specific, attributed to the runner (Cypress AUT document injection), not the browser.** Confidence: medium-high that it is runner-induced, medium that the injected head script specifically is the mechanism. It is not classified as an application defect, because no evidence was found outside Cypress. It is not a test setup issue.

### Smallest evidence-supported next action (proposal only, not implemented)

1. **Decision input for the user, not a decision.** The new evidence supports the "runner-induced" premise that D-018 lacked. If the user authorizes it, the narrow allowance from 04 D-018 points 1-5 would be justified on evidence rather than convenience:
   - anchored `/^Minified React error #418;/` on the unwrapped message;
   - additionally bound to `174b7k13ybrt2.js` in `err.stack`;
   - scoped to UI specs;
   - a ceiling of 1 per page load;
   - a CI-visible count;
   - an owner and expiry pending a Cypress-side fix.

   Risk: it would also hide a genuine future hydration defect in the app, which is why the ceiling and plain-browser control below matter. This remains the user's decision. Suppression stays removed.
2. **No browser or config change is supported.** Switching to `--browser chrome` does not help, since it fails identically. No verified Cypress 15.5 configuration option to disable the AUT injection was found in the time available, and none is proposed.
3. **Optional causal confirmation, about 10 minutes.** It requires explicit user approval because it involves response modification in a diagnostic browser, outside the suite: load the page in plain Chrome with the same inert first-child `<script>` inserted into the HTML. #418 appearing there would confirm the mechanism. Alternatively, check the Cypress issue tracker or changelog for React 19 / Next.js hydration problems with AUT injection.

### Not validated / not run

- The **booking journey (S-10/S-11) is NOT validated.** The calendar correction is implemented but has not been exercised live, because #418 fails each test before the calendar is reached.
- The **full suite was NOT run.** Only this load-only diagnostic and plain-Chrome page loads ran.

### Time used

The stage ran from 01:07:10 to about 01:20 -03 (about 13 minutes). Cypress runs took 01:08:36-01:08:52 (Electron) and 01:09:58-01:10:17 (Chrome). Plain-Chrome loads ran 01:10:48-01:11:38.

**Stage 6 status: NEEDS MORE EVIDENCE** for the exact mechanism, or a **user decision** on a scoped allowance. Cause classified as runner-induced, not browser and not timezone.

# Parts 2 and 3 - content review (automation-reviewer)

Date: 2026-10-09. Scope: factual consistency with the assignment PDF text (as quoted by the coordinator) and missing assignment requirements only. No stylistic rewrites. Read-only on deliverables; no code or deliverable changed.

Reviewed:
- `delivery/part2-test-plan-review.md` (P2)
- `delivery/part3-qa-process.md` (P3)
- `.agents/handoffs/qa-lead-take-home/part2-analysis.md` (analysis)
- `.agents/handoffs/qa-lead-take-home/evidence/notes/20261009-part2-3-decisions.md` (notes)
- `delivery/part1-test-suite/README.md` lines 1-6 (Part 1 limits, reference only)

Not done: no human-candidate review exists yet; both deliverables say so (P2:85, P3:67).

## Part 2 - requirements checklist

| Item | Status | Evidence |
|---|---|---|
| All 12 cases covered, plus the `nurse.qa` note | MET | P2:14-26 |
| Case 5 contradicts AC2, stated | MET | P2:6, P2:18, P2:74 |
| AC3 covered | MET (one over-assertion, see P2-01) | P2:36 |
| All four states covered, eligibility observed by booking attempt | MET | P2:42 |
| Nurse and support corrections; support expiration-date correction; both entry points | PARTIAL (AC2 date correction not asserted, see P2-02) | P2:19, P2:37, P2:48 |
| A check opens a review and never invalidates | MET | P2:7, P2:17, P2:24, P2:39 |
| Confirmation by a check OR support | MET | P2:18, P2:38 |
| AC4 and issuing-state time zone | MET | P2:40-41, Q7 at P2:60 |
| Numeric assumption called unsupported | MET | P2:20, P2:79 |
| Isolated data instead of `nurse.qa` | MET | P2:26, P2:75 |
| Daily-check processing; immediate execution not assumed | MET | P2:17 ("before the next check"), P2:24, Q11 at P2:64 |
| Precise expected outcomes | MET | P2:17-19, P2:36-50 |
| Browser/device coverage by usage | MET | P2:23, Q10 at P2:63 |
| (i) AC1 applied to SUPPORT number corrections of a Valid license | Asserted in the deliverable (P2:19), flagged only in working notes (analysis:34). AC1 names no actor, so this is the face-value reading, not an invention | P2:19; see P2-04 (Optional) |
| (ii) AC3 row: Invalid stays Invalid and "is not queued for re-checking" | INACCURATE: the re-check claim contradicts the review's own open Q2 and Q8 | P2:36 vs P2:55, P2:62; see P2-01 |
| (iii) P3 row: a Settings correction never moves the license to Valid or Invalid | MET: follows from the state definitions and AC2 ("a check, or the support team, confirms"; Invalid = "the support team invalidated it") | P2:50 |
| (iv) Q13 is beyond the brief | MET: explicitly labelled "Out of scope for AC4 as written; confirm" | P2:66 |
| No other invented validation rules or transitions | MET except P2-01; unspecified outcomes are routed to questions (Q3, Q4, Q7, Q8) | P2:17, P2:19, P2:48-49 |
| Questions explicit | MET (13) | P2:54-66 |
| Required corrections separated from optional coverage | MET | P2:32 (P1, 7 rows), P2:44 (P2/P3, 3 rows) |
| Junior message: supportive, specific, AI-verification coaching, marked not sent | MET (omits the two fully missing ACs, see P2-03) | P2:68-81; AI coaching P2:79; "draft, not sent" P2:68 |
| AI disclosure present | MET (says agents drafted it, it was checked against AC1-AC4, human review pending) | P2:85 |

## Part 2 - findings

| ID | Severity | Location | Issue | Minimal exact correction |
|---|---|---|---|---|
| P2-01 | Must-fix | P2:36 | The AC3 row asserts an Invalid license "is not queued for re-checking". The review leaves that open twice: Q2 (P2:55) asks which licenses the daily check reads at all, and Q8 (P2:62) asks whether "nothing changes" covers "any re-check". The spec says the check compares "each license" every day. "Stays Invalid, does not go back to Not checked yet" is the plain reading of AC3 and stays. | Replace `An Invalid license stays Invalid, does **not** go back to Not checked yet, and so is not queued for re-checking. Whether "nothing changes" also means no message and no audit entry is open (Q8).` with `An Invalid license stays Invalid and does **not** go back to Not checked yet. Whether "nothing changes" also means no message, no audit entry and no re-check is open (Q2, Q8).` |
| P2-02 | Should-fix | P2:19, P2:60 | AC2 says "When an invalid license is corrected, by the nurse or by the support team, it goes back to not checked yet". Support can correct "number or expiration date". The plain text therefore covers support's expiration-date correction of an **Invalid** license, but P2:19 declines to assert any date-correction outcome, and Q7 asks whether it follows AC2. Not asserting date corrections under AC1 is correct, because AC1 ties to "while the new number is checked". | P2:19: replace `What an expiration-date correction does to the state, including for an Expired license, is open (Q7); don't assert it.` with `An Invalid license whose expiration date is corrected also goes to **Not checked yet**, booking blocked (AC2). What a date correction does to a Valid or Expired license is open (Q7); don't assert it.` P2:60: replace `Does the same correction on a Valid or Invalid license follow AC1/AC2?` with `Does the same correction on a Valid license follow AC1?` |
| P2-03 | Should-fix | P2:72-77 | The junior message lists four changes but never says that AC3 and AC4 have no cases. Those are the two fully missing ACs and are part of the Summary verdict (P2:6). | Insert after P2:77: `> 5. **AC3 and AC4 have no cases yet.** Add one where the nurse re-enters the saved number (nothing changes), and one where an expired license is corrected and booking is still rejected, with expiry counted in the issuing state's time zone.` |
| P2-04 | Optional | P2:19 | Interpretation (i): the deliverable asserts AC1 for support corrections without saying AC1 names no actor. The reading is defensible but is flagged only in analysis:34. | Replace `stays **Valid** and bookable (AC1).` with `stays **Valid** and bookable (AC1 names no actor; we read it as covering support corrections too).` |
| P2-05 | Optional | P2:24 | Case 11 is "The daily check runs after the correction", with no "straight". The comment attributes an assumption the junior did not write. | Replace `It also assumes the check runs straight after the correction, and the spec says it runs daily.` with `It can also be read as the check running straight after the correction, but the spec says it runs daily.` |
| P2-06 | Optional | P2:85 | The disclosure uses the third person ("The candidate's"), while Part 3 uses "My own". "Was checked" does not say by whom. | Replace the line with `How AI was used: Claude coordinated specialist AI agents. A test-specifier agent drafted this review, and a separate reviewer agent checked it against the feature text and AC1-AC4. Where the spec is silent, the review lists a question instead of inventing a rule. My own review is still pending.` |

## Part 3 - requirements checklist

| Item | Status | Evidence |
|---|---|---|
| All six questions answered directly, in order | MET | P3:5, 13, 30, 36, 44, 54 |
| Who does what: devs, QA, product | MET | P3:7-11 |
| Context: release testing is the bottleneck | MET | P3:3, P3:32, P3:39, P3:48 |
| Context: QA-approved features still break in final checks | PARTIAL: measured (P3:49), and the real-iPhone gate helps (P3:19), but no step investigates why approved work breaks. See P3-02 | P3:49 |
| Release and hotfix gates proportionate | MET | P3:15-28 |
| Real-iPhone checks for relevant risks | MET | P3:19, P3:25, P3:33, P3:41, P3:60 |
| Post-deploy checks and failure ownership | MET | P3:11, P3:26, P3:32, P3:63 |
| Metrics with baselines; no invented figures or targets | MET | P3:46-52 |
| No big migration or bureaucracy | MET | P3:28, P3:38-39 |
| About one page | MET (746 words, at the upper edge) | whole file |
| Kept distinct from Part 1 limits | MET (one parenthetical only) | P3:28 |
| Part 1 reference accurate | INACCURATE. See P3-01 | P3:28 vs README:3 |
| AI disclosure says HOW AI was used | MET at minimum (specialist agents drafted it; checked against the questions; own review pending). Who checked is unstated; see P3-04 | P3:67 |

## Part 3 - findings

| ID | Severity | Location | Issue | Minimal exact correction |
|---|---|---|---|---|
| P3-01 | Must-fix | P3:28 | Three problems with the Part 1 reference. (1) "The full suite is not green" is in the present tense, but the README says the full core suite was 6/9 at revision `0225278` and "was not rerun" at `1e88fab`. (2) It omits that calendar selection, CI, Xray and Safari/iOS are unverified. Safari/iOS matters most, because this page leans on iPhone. (3) The README head does not call anything a "smoke". | Replace `(The Part 1 smoke and booking journey show what a hotfix smoke could look like, with limits: the reduced journey passes only with a temporary error allowance, and the full suite is not green.)` with `(The Part 1 booking journey (S-10/S-11) shows what a hotfix smoke could look like, with limits: it passed with risks under a temporary React #418 allowance; the last full-suite run, at an earlier revision, was 6/9 and was not rerun; calendar, CI, Xray and Safari/iOS are unverified.)` |
| P3-02 | Should-fix | P3:32 | The context says "QA-approved features still break in final checks". The page measures this but takes no step to find out why. | Replace `Map where features wait, collect the question 5 baselines,` with `Map where features wait, trace recent post-approval breakages to their source (environment, device, integration or a missed AC), collect the question 5 baselines,` |
| P3-03 | Optional | P3:33 | "One or two teams" assumes a team structure that the context (9 devs) does not state. | Replace `on one or two teams or features first` with `on one or two features first` |
| P3-04 | Optional | P3:67 | "Checked" does not say by whom, and the voice should match Part 2 (see P2-06). | Replace the line with `*How AI was used: Claude coordinated specialist AI agents. A qa-report-writer agent drafted this page from the six questions and the team context, and a separate reviewer agent checked it against the assignment. My own review is still pending.*` |

## Verdicts

- **Part 2: READY AFTER MUST-FIXES** (P2-01).
- **Part 3: READY AFTER MUST-FIXES** (P3-01).

Before sending either document, the candidate must still do their own review and update the "still pending" disclosure lines (notes:35). This review does not count as that review.

Counts: Part 2 has 1 Must-fix, 2 Should-fix and 3 Optional. Part 3 has 1 Must-fix, 1 Should-fix and 2 Optional.

## Final review (round 2, 2026-10-09)

Scope: one final content pass after the round-1 corrections. It covers only factual inconsistencies with the assignment PDF (pp2-3, plus the p1 context Part 3 relies on, read directly from `/Users/joaopedrobarbosa/Downloads/QA_Lead_-_Take-home_Exercise.pdf`) and missing assignment requirements. No stylistic findings. No deliverable was changed. Drafting attributions were checked against `run-log.md:457-476` and `notes:32`.

P2 = `delivery/part2-test-plan-review.md`, P3 = `delivery/part3-qa-process.md`.

| Item | Status | file:line |
|---|---|---|
| P2: all 12 cases plus the `nurse.qa` note have comments | MET | P2:14-26 |
| P2: AC2 covers support's expiration-date correction of an Invalid license (Not checked yet, booking blocked); Valid and Expired date corrections left open (Q7) | MET | P2:19, P2:37, P2:48, P2:60 |
| P2: the junior message names the missing AC3 and AC4 coverage | MET | P2:77 |
| P2: case 11 does not attribute an immediate-check requirement to the junior | MET | P2:24, P2:78 |
| P2: no invented empty-field, normalization or audit behaviour; unspecified items are questions or conditional | MET | P2:21 (conditional on Q1/Q9), P2:36 (Q2/Q8), P2:61-65 |
| P2: no unsupported praise | INACCURATE: "the core promise of the feature" is not in the spec, which does not rank the ACs. The spec's stated reason for the feature, a typo that fails the check, puts the main path on Not checked yet or Invalid (AC2), not AC1. | P2:5, P2:70 |
| P2: prioritized gaps split into required and optional | MET (7 P1, 3 P2/P3) | P2:32-42, P2:44-50 |
| P2: draft message marked not sent | MET | P2:68 |
| P2: Summary counts match the tables (12 cases, 10 scenarios, 7 required, 13 questions) | MET | P2:8 vs P2:14-25, P2:36-42, P2:48-50, P2:54-66 |
| P3: six direct answers, about one page | MET (about 784 words of text, at the upper edge; the PDF states a preference, not a limit) | P3:5, 13, 30, 36, 44, 54 |
| P3: release criterion (understood impact, compensating checks where appropriate, explicit acceptance by the accountable decision-maker, rollback or mitigation plan; an unexplained critical-journey failure blocks) | MET | P3:16, P3:28 |
| P3: hotfix checks proportionate | MET | P3:22-26 |
| P3: no claim that PR smoke plus the daily run is universally sufficient | MET | P3:42 |
| P3: no Part 1 implementation parenthesis | MET (no "Part 1" mention remains) | whole file |
| P3: no invented multiple teams | MET | P3:3, P3:33 |
| P3: metrics measurable, with baselines and no figures or targets | MET | P3:46-52 |
| Both: AI disclosure names the drafting agent and the independent AI review, and says human review is pending | MET (test-specifier and qa-report-writer drafted, as in run-log:459, 476) | P2:86, P3:67 |
| Both: nothing claims the candidate reviewed anything | MET | P2:86, P3:67 |

### Factual blockers

| ID | Location | Issue | Exact minimal replacement |
|---|---|---|---|
| R2-P2-01 | P2:5 | AC1 is called "the core promise of the feature". The assignment does not support this ranking. | Replace `case 4 targets AC1, the core promise of the feature.` with `case 4 targets AC1.` |
| R2-P2-01 | P2:70 | The junior message repeats the same unsupported ranking. | Replace `Case 4 goes straight to AC1, the core promise of the feature, and case 8 is a useful negative case to keep.` with `Case 4 goes straight to AC1, and case 8 is a useful negative case to keep.` |

Part 3: no factual blockers.

Non-blocking note: PDF p1 asks for "roughly how long you spent on each part". Neither deliverable states this. The time is the candidate's figure and belongs in the submission or final report. Do not invent it.

### Verdicts

- **Part 2: READY AFTER MUST-FIXES** (R2-P2-01, two one-phrase deletions).
- **Part 3: READY.**

The candidate's own review is still pending, as both disclosure lines state. This AI review does not replace it.

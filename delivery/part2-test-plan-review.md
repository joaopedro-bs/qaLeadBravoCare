# Part 2 - Review of the license-correction test plan

Author: João Barbosa Martins

## 0. Summary

- **What works:** case 4 targets AC1. Case 8 is a useful negative case, and case 10 starts on platform coverage.
- **Main issues:** case 5 contradicts AC2. AC3 and AC4 are not tested at all. The plan does not design around the four license states, and it never observes booking eligibility after a check or a support action. Several expected results are vague ("loads correctly", "success message"). Case 7 invents a rule ("numeric"), and one shared account (`nurse.qa`) couples every case.
- **Daily check:** case 11 tests that the scheduler runs. It should test what the check does with a corrected license: it confirms it, or it opens a review without invalidating the license.
- **Verdict:** **rework before execution.** The fixes are scoped below: 12 cases reviewed, 10 scenarios added (7 required), and 13 questions for product and support.

## 1. Feedback by case

| # | Verdict | Comment | Better version (precise expected outcome) |
|---|---|---|---|
| 1 | Remove | "Loads correctly" has no observable outcome, and the functional cases already load the page. | Fold it into cases 4/5: the opening step asserts the license number field shows the saved number. |
| 2 | Remove | Editing a field proves nothing about the feature. The behaviour is in what happens after saving. | Covered by the rewritten cases 4, 5 and the AC3 case. |
| 3 | Fix | A success message needs a defined text or behaviour, and it says nothing about the resulting state. The copy is unspecified (Q9). | Make it an assertion step inside each correction case: the agreed confirmation is shown **and** the license shows the expected state (Valid / Not checked yet). |
| 4 | Fix | Good: this is AC1. Make it precise. | Start with a nurse whose license is **Valid**. The nurse corrects the number in Settings. **Immediately after saving**, the state is still **Valid**, and a booking attempt **before the next check** succeeds ("keeps booking while the new number is checked"). The next check then reads the new number. If it confirms, the license stays Valid. If it finds a problem, a **review is opened** and the license is **not** Invalid (a check never invalidates). Whether it stays Valid and bookable while the review is open is a question (Q4). Record what happens, but don't assert it. |
| 5 | Replace | Contradicts AC2. After the correction the license goes back to **Not checked yet**, and the nurse **can't** book until a check or support confirms it. | **5a (negative):** start with an **Invalid** license. The nurse corrects the number. The state becomes **Not checked yet**, and a booking attempt is **rejected**. **5b (confirmation):** the next daily check confirms the new number. The state becomes **Valid**, and a booking attempt succeeds. |
| 6 | Fix | Too narrow. Support can correct the **number or the expiration date**, from **two entry points**: from the document the nurse uploaded, or while working on a review. The result depends on the starting state. | Matrix: field {number, expiration date} x entry point {uploaded document, review} x starting state. Expected: a Valid license with a number correction stays **Valid** and bookable (AC1). An Invalid license goes to **Not checked yet**, booking blocked (AC2). An Expired license whose number is corrected still cannot book (AC4). An **Invalid** license whose **expiration date** is corrected also goes to **Not checked yet**, booking blocked (AC2 covers any correction of an Invalid license, by the nurse or by support). What a date correction does to a **Valid** or **Expired** license is open (Q7); don't assert it. |
| 7 | Question | "License numbers are numeric" is not in the spec, and license formats vary by issuing state. The case would encode a rule nobody agreed. | Turn it into a question for product (Q1). Write the validation cases only after the rules per state are confirmed. |
| 8 | Question | A good negative case, but the empty-field behaviour is not specified. | Keep it: the nurse clears the field and saves. The expected message and blocking behaviour come from product (Q1, Q9). If product confirms an empty number is rejected, expect the saved number, the state and booking eligibility to stay unchanged. |
| 9 | Fix | A DB check alone is not user-facing evidence, and it needs access. Use it as supporting evidence only. | Verify through observable behaviour: the nurse sees the new number after reopening the app; support sees the new number on the license; the next check runs against the new number (its result or review refers to it); booking eligibility matches the expected state. |
| 10 | Fix | Pick browsers and devices by actual usage. The company context says most users are on iPhone; Chrome/Firefox alone misses the main audience. Whether the nurse app is web or native is unknown (Q10). | Run the correction and booking flows on the main nurse platform first (iPhone, as a native app or Safari), then the next platforms by usage. Run the support flows on the browsers support uses. |
| 11 | Replace | "Verify the daily check runs" tests the scheduler, not the feature. "After the correction" doesn't say which run or what result to expect; the case needs to name the next daily check and its outcomes. | Verify the **next** daily check picks up the corrected license. Its outcomes: **confirmed -> Valid**; **problem found -> a review is opened for support, and the license is NOT Invalid** (only a person invalidates). Dependency: a test-environment way to trigger or observe the check (Q11). |
| 12 | Replace | "Full regression" is unfocused and costs the most where release testing is already the bottleneck. | Targeted regression: booking eligibility for each of the four states; the existing check -> review -> support-invalidation flow; expiry handling, including the issuing-state time zone. |
| Note | Replace | One shared `nurse.qa` account couples every case. The cases need different starting states (Valid, Not checked yet, Invalid, Expired), each correction changes that state, and parallel or other people's runs interfere. | Use isolated data per case: a dedicated nurse and license per starting state, created and reset on every run (seeded by API or fixture where possible). |

## 2. Missing scenarios (prioritised)

Expected outcomes come only from the feature text and the ACs. Where the spec is silent, the outcome is a question.

**Required corrections (P1)**

| Priority | Scenario | Expected outcome | Source |
|---|---|---|---|
| P1 | The nurse enters the number that is already saved. Run it from Valid and from Invalid. | State, review and booking eligibility unchanged. An Invalid license stays Invalid and does **not** go back to Not checked yet. Whether "nothing changes" also means no message, no audit entry and no re-check is open (Q2, Q8). | AC3 |
| P1 | Support corrects the **number**, and separately the **expiration date**, of an **Invalid** license, from the uploaded document and from a review. | **Not checked yet**; a booking attempt is rejected. | AC2 |
| P1 | Confirmation after an AC2 correction: (a) the next daily check confirms; (b) support confirms. | (a) **Valid**, booking allowed. (b) **Valid**, booking allowed. How support confirms is not specified (Q6). | AC2 |
| P1 | After a correction, the check finds a problem with the new number. | A **review is opened** for support; the license is **not** Invalid. It becomes Invalid only if a support person invalidates it. | Spec ("a check never invalidates") |
| P1 | **Expired** license, number corrected by the nurse, then by support. | A booking attempt is still rejected. | AC4 |
| P1 | Expiry boundary in the **issuing state's** time zone. Use a nurse or server in a different time zone, around midnight in the issuing state. | Eligibility follows the issuing state's calendar, not the nurse's or server's. Test just before and just after the boundary; whether the expiration day itself is still valid is open (Q7). | Spec (Expired), AC4 |
| P1 | Booking eligibility for each state, observed with a booking attempt and not only the label. | Valid: allowed. Not checked yet, Invalid, Expired: rejected. | Spec ("only a valid license") |

**Optional coverage (P2/P3)**

| Priority | Scenario | Expected outcome | Source |
|---|---|---|---|
| P2 | Support corrects the **expiration date** of an **Expired** license. | Ambiguous: the Expired definition says it may stop being Expired, but AC4 says "whatever else happens". Don't assert anything until Q7 is answered. | Spec, AC4 |
| P2 | Correcting a **Not checked yet** license that has never been checked. | Still not bookable, since only Valid can book and only a check or support confirms. Any other effect is open (Q3). | Spec (state definitions) |
| P3 | A correction in Settings never moves the license to Valid or Invalid on its own. | Valid comes only from a check or support; Invalid comes only from support. | Spec (state definitions) |

## 3. Questions for product/support

1. **Format and validation:** what are the license-number rules per issuing state (characters, length, letters)? What happens when the field is empty?
2. Which licenses does the daily check read? The text says "each license", but AC2 implies an Invalid license is only read again after it is corrected.
3. If a **Not checked yet** license is corrected, does anything change?
4. A Valid license is corrected, and the check then finds a problem with the new number. Does it stay Valid, and can the nurse still book, while the review is open?
5. Does an open review close or update when the license is corrected, by the nurse or by support?
6. How does support **confirm** a license (AC2)? Is it a specific action, and is it available only from a review?
7. **Expiry:** does support's expiration-date correction take an Expired license out of Expired, or does AC4 still block it? Does the same correction keep a Valid license Valid (AC1 refers to "the new number")? Is a license still valid on its expiration date (in the issuing state's time zone)?
8. **AC3:** do spaces, case, leading zeros or separators count as "the same number"? Does "nothing changes" also cover the success message, the audit entry and any re-check?
9. What is the exact success and error copy for saving?
10. Is the nurse app web or native? Which devices and OS versions matter (most users are on iPhone)? Which browsers does the support team use?
11. Is there a non-production way to trigger the daily check or observe its result, a stub for the state board, and a controllable clock for expiry tests?
12. Is there an audit trail of who corrected which field and when, and is it visible to support?
13. Can a shift be booked while a license is in a given state if the shift itself falls after the expiration date? (Out of scope for AC4 as written; confirm.)

## 4. Message to the junior (draft, not sent)

> Hi! Thanks for the license-correction plan. Case 4 goes straight to AC1, and case 8 is a useful negative case to keep. Case 10 shows you're thinking about platforms; let's point it at what our users actually use (mostly iPhone).
>
> A few changes before we run it:
>
> 1. **Case 5 contradicts AC2.** After an invalid license is corrected, it goes back to Not checked yet, and booking must stay blocked until a check or support confirms it. Let's split it in two: booking is rejected right after the correction, and booking works once the license is confirmed.
> 2. **Design around the four states.** Almost every outcome depends on the starting state (Valid, Not checked yet, Invalid, Expired). Give each case its own nurse and license in that state, created fresh on each run. With one shared nurse.qa account, the cases overwrite each other's state.
> 3. **Test what the daily check does with the correction, not that it runs.** If it confirms, the license becomes Valid. If it finds a problem, a review opens and the license is not invalidated. I'll ask the devs how we trigger the check in test.
> 4. **AC3 and AC4 have no cases yet.** Add one where the nurse re-enters the saved number (nothing changes), and one where an expired license is corrected and booking is still rejected, with expiry counted in the issuing state's time zone.
> 5. **Make every expected result observable:** the state shown and whether a booking attempt succeeds. For case 11, name the next daily check and what it should do, rather than just that it runs.
>
> On AI help, which I fully support: check each generated case against the ACs before you keep it. "License numbers are numeric" isn't in the spec, and formats vary by state, so that one becomes a question for product. A good filter for each case: which AC or rule does it prove, and what exactly will I observe?
>
> Detailed notes per case are in the review. Want to pair for an hour tomorrow and rework it together?

## 5. How this review was produced

How AI was used: This work was developed collaboratively by me with Claude and Codex as supporting tools, not as an independently produced AI deliverable. I remained human-in-the-loop through scope decisions, approvals and iterative feedback, and human-on-the-loop through supervision of execution, evidence and risks. AI supported analysis, drafting, implementation and review where applicable; I retain responsibility for the conclusions and submission. Final human review and approval have been completed.

Time spent: approximately 1 hour for Parts 2 and 3 combined, including production, review and adjustments. I did not track these two parts separately.

## AI sessions and transcripts

- [Claude session summary](https://claude.ai/artifact/AET4HD3cJWYBPZHKq5HJQn) — condensed account, not the full transcript.
- [Codex session presentation](https://qa-lead-take-home-session.elatedpeony.chatgpt.site).
- [Claude transcript in this repository](https://github.com/joaopedro-bs/qaLeadBravoCare/blob/main/2026-10-09-210910-we-will-prepare-the-qa-lead-take-home-exercise-in.txt).
- [Codex transcript in this repository](https://github.com/joaopedro-bs/qaLeadBravoCare/blob/main/codex-session-01a11e63-0975-7f03-b06b-6a54e6dc802e.md).

The transcript files are supplied session records; the Claude artifact is explicitly a summary. This work was developed collaboratively by João Barbosa Martins with AI support, with human-in-the-loop decisions and feedback and human-on-the-loop supervision. The candidate reviewed and approved the deliverables and remains responsible for the submission.

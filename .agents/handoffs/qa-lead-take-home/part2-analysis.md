# Part 2 - working notes (test-specifier)

Source: assignment PDF p2, as quoted by the coordinator, plus the company context from p1. Assumptions come from `evidence/notes/20261009-part2-3-decisions.md` (P2-A1..A5). Deliverable: `delivery/part2-test-plan-review.md`.

## Requirement map (AC/spec -> junior cases -> gaps)

| Requirement | Junior cases | Gap |
|---|---|---|
| AC1: a corrected Valid license stays Valid; booking continues while the new number is checked | 4 (partial) | No assertion of the state right after saving or of booking before the next check; no support path; the post-check outcome is unspecified (Q4) |
| AC2: a corrected Invalid license goes to Not checked yet, booking blocked until a check or support confirms | 5 (contradicts), 6 (partial) | Case 5 expects immediate booking; support correction from both entry points is missing; neither confirmation path (check / support) is tested |
| AC3: entering the same number changes nothing | none | Fully missing |
| AC4: Expired can never book | none | Fully missing, including the issuing-state time zone |
| Spec: a check opens a review and never invalidates | 11 (wrong focus) | Tests that the scheduler runs, not the outcomes |
| Spec: four states; only Valid books | 4, 5 (implicit) | No per-state eligibility check with a booking attempt |
| Spec: support corrects number OR expiration date, from the document or a review | 6 (number only, one entry point) | Expiration date and both entry points are missing |
| Company context: most users on iPhone | 10 (Chrome/Firefox) | Coverage does not follow usage |
| Data | junior's note: shared `nurse.qa` | State coupling; isolated data per starting state needed |

Verdict counts: Remove 2 (1, 2), Fix 5 (3, 4, 6, 9, 10), Replace 3 (5, 11, 12), Question 2 (7, 8), Keep 0. The junior's note is also marked Replace.
Missing scenarios: 10 (P1 7, P2 2, P3 1). Questions: 13.

## Assumptions applied

- **P2-A1:** no validation rules or UI copy are specified. Cases 7 and 8 and the success message become questions (Q1, Q9).
- **P2-A2:** every expected outcome includes a booking attempt, not only the state label.
- **P2-A3:** the daily check needs a test hook or observable result. This is raised as a dependency (Q11); the review never assumes the check runs straight after a correction.
- **P2-A4:** unspecified transitions are questions, not defects. They cover: a Valid license whose new number fails the check (Q4), correcting a Not checked yet license (Q3), an open review on correction (Q5), expiration-date correction (Q7), and AC3 normalisation (Q8).
- **P2-A5:** device coverage follows usage, with iPhone first. Whether the app is web or native is open (Q10).

## Interpretations the coordinator should check

1. **The daily check's scope.** The spec says the check compares "each license" daily, but AC2 says the correction happens "so the daily check reads it again". That implies Invalid licenses are not re-read until corrected. I raised this as Q2 instead of resolving it.
2. **AC3 from Invalid.** I read "nothing changes" as: an Invalid license stays Invalid and does not go back to Not checked yet, so it is not queued for re-checking. Whether a message or audit entry still appears is Q8.
3. **AC1 and AC2 cover support corrections of the number.** AC2 names support explicitly. For AC1 I inferred it from "when a valid license is corrected", which has no actor. Expiration-date corrections are not asserted under AC1/AC2 (Q7).
4. **Correcting a Not checked yet license.** "Still not bookable" is derived from "only a valid license can be used to book" and from the rule that only a check or support confirms. Anything else is Q3.
5. **The expiry boundary.** "Has passed" suggests the expiration day itself is still valid, but that reading is not certain, so the review asks it as part of Q7 and only asserts that the issuing state's time zone governs.
6. **P3 row ("a correction never sets Valid or Invalid").** It follows from the state definitions (Valid = a check confirmed it, or support confirmed it per AC2; Invalid = support invalidated it). It is phrased narrowly and is not a new rule.
7. **Q13 (a shift date after expiry)** is a risk I added beyond the brief. The coordinator can drop it.

## Open questions

See section 3 of the deliverable (Q1-Q13).

# Parts 2 and 3 - coordinator assumptions and decisions

Created 2026-10-09 02:19 -03 by the coordinator. Source of requirements: assignment PDF, pages 2-3 (Part 2 feature, AC1-AC4 and the junior's plan; Part 3, six questions), plus the Part 1 context on page 1.

## Deliverables and location

- `delivery/part2-test-plan-review.md` and `delivery/part3-qa-process.md`, in English.
- They sit outside `delivery/part1-test-suite/` because the PDF says Parts 2 and 3 go to a shared drive in any format, not into the public repo. Uploading is a separate human decision; nothing is uploaded or sent.
- The message to the junior is a draft. It is not sent.

## Part 2 - assumptions (do not present as product facts)

| ID | Assumption / interpretation | Why | How it appears in the deliverable |
|---|---|---|---|
| P2-A1 | The feature description and AC1-AC4 are the only specification. Validation rules (format, length, allowed characters), messages and UI copy are unspecified. | PDF gives none | Expected results for format/empty input become questions, not invented rules |
| P2-A2 | "Only valid license can be used to book shifts" and AC4 are booking-eligibility rules; the plan must observe booking eligibility, not only the stored state. | PDF | Missing scenarios check booking eligibility |
| P2-A3 | Each check outcome (confirm / problem -> review) happens in the daily run. Tests need a controllable way to trigger or observe a check, e.g. a test hook or a non-production scheduler. The existence of such a hook is unknown. | Check runs "every day" | Raised as a question and a test-environment dependency, not assumed |
| P2-A4 | Behaviour not specified by the ACs is an open question, not a defect. Examples: correcting a "not checked yet" license; a valid license whose new number then fails the check; whether an open review closes on correction; whether support's expiration-date correction un-expires a license (AC4 "whatever else happens" vs the Expired definition); normalisation in AC3 (spaces/case). | Avoid inventing state transitions | "Questions for product/support" list |
| P2-A5 | Browser/device coverage should follow actual usage. The Part 1 context says most users are on iPhone; whether that applies to this nurse app (web or native) is unknown. | Same company context; not stated for this feature | Case 10 feedback asks for usage-based coverage; question flagged |

## Part 3 - decisions

| ID | Decision | Why |
|---|---|---|
| P3-D1 | About one page; answer the six questions directly, in order | PDF asks for "a clear page" |
| P3-D2 | No current figures or targets are invented. The metrics come with a baseline-collection plan and a 3-month comparison. | User instruction; there is no data |
| P3-D3 | Gradual changes; no tooling migration; light gates, no approval bureaucracy | User instruction; small team |
| P3-D4 | Keep the process proposal separate from the Part 1 demo-suite limits. Part 1 evidence may be cited only as an example of a hotfix/daily gate, with its limits. | User instruction |

## AI disclosure (both documents)

- Drafted by AI specialist agents: test-specifier (Part 2) and qa-report-writer (Part 3).
- Reviewed by an AI reviewer agent (automation-reviewer), coordinated by Claude.
- The coordinator checks every claim against the PDF text.
- The candidate must read and edit the documents before sending; human review is still pending.

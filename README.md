# QA Lead Take-home — João Barbosa Martins

This repository contains my take-home assessment, developed collaboratively with Claude and Codex as supporting tools and reviewed and approved by me.

## Deliverables

- [Part 1 — Cypress + TypeScript suite](delivery/part1-test-suite/README.md)
- [Technical decisions](delivery/part1-test-suite/DECISIONS.md)
- [Part 2 — Junior test-plan review and feedback](delivery/part2-test-plan-review.md)
- [Part 3 — QA process proposal](delivery/part3-qa-process.md)
- [Final report and evidence references](.agents/handoffs/qa-lead-take-home/06-final-report.md)

## Time and results

Approximately **4 hours for Part 1** and **1 hour for Parts 2 and 3 combined**: about **5 hours total**. Parts 2 and 3 were not timed separately.

The reduced booking journey passed on the first attempt at desktop and mobile viewport sizes with risks, under a temporary scoped React #418 allowance (tested code `1e88fab`). The last full core suite run at `0225278` had **6 passed and 3 failed**; it was not rerun at the final corrected revision. Calendar interaction, CI execution, Xray integration and real Safari/iOS remain unverified. Cleanup obligations were resolved.

The executable suite and its installation instructions are under `delivery/part1-test-suite/`; root Caveman dependencies are auxiliary tooling, not the test suite.

## AI sessions and transcripts

- [Claude session summary](https://claude.ai/artifact/AET4HD3cJWYBPZHKq5HJQn) — condensed account, not the full transcript.
- [Codex session presentation](https://qa-lead-take-home-session.elatedpeony.chatgpt.site).
- [Claude transcript in this repository](https://github.com/joaopedro-bs/qaLeadBravoCare/blob/main/2026-10-09-210910-we-will-prepare-the-qa-lead-take-home-exercise-in.txt).
- [Codex transcript in this repository](https://github.com/joaopedro-bs/qaLeadBravoCare/blob/main/codex-session-01a11e63-0975-7f03-b06b-6a54e6dc802e.md).

The transcript files are supplied session records; the Claude artifact is explicitly a summary. This work was developed collaboratively by João Barbosa Martins with AI support, with human-in-the-loop decisions and feedback and human-on-the-loop supervision. The candidate reviewed and approved the deliverables and remains responsible for the submission.

# Part 3 - QA process proposal

Author: João Barbosa Martins

Goal: QA stops being a queue at the end of the sprint. The whole team owns quality, QA moves earlier, and checks match the risk.

## 1. How would the QA process work, from planning to production? Who does what?

- **Refinement (product + dev + QA, a short talk per feature):** agree acceptance criteria with examples and name the risky states up front.
- **Developers:** write unit and integration tests and run the agreed checks before handoff. "Ready for QA" means ACs met, checks green, and a short note saying what changed and what to look at.
- **Before handoff (developer + QA + product owner):** hold a short Three Amigos demo of the completed work against the acceptance criteria. Surface misunderstandings and straightforward issues before the task is handed over, reducing avoidable back-and-forth.
- **QA:** risk-based exploratory testing of the changed areas, automation of stable critical paths, and coaching the junior QA and the developers on test design.
- **Product:** answers AC questions quickly and accepts the feature against the agreed ACs.
- **After deploy:** a smoke run on production-safe checks. Each failure has a named owner, agreed before the release.

## 2. What has to be true before a release goes out? And before a hotfix?

**Release:**
- Critical-path automated checks are green. A known failure ships only if its impact is understood, compensating checks cover it where appropriate, the accountable release decision-maker explicitly accepts the risk, and a rollback or mitigation plan exists. An unexplained failure in a critical journey blocks the release.
- No open blocker or critical issues.
- Exploratory notes exist for the changed areas.
- UI-affecting changes are checked on a real iPhone.
- The rollback or feature-flag plan is known.

**Hotfix (a smaller gate):**
- The fix is verified against the reproduced issue.
- Checks sized to the change: targeted regression of the touched area and the journeys it can affect, plus the critical-path smoke. The release rule for known and unexplained failures still applies.
- A real-iPhone check if the change is user-facing.
- Post-deploy verification; a follow-up test added afterwards.

Both are short checklists the team runs itself, not approval meetings; only an accepted risk needs the release decision-maker's explicit sign-off.

## 3. What would you do in your first 30, 60 and 90 days?

- **30 days — understand the company:** learn the product, observe how work moves, and listen to what causes friction across development, QA and product. Pair with the junior QA and colleagues in other areas, contributing small improvements as I learn. Establish initial baselines. By the end of the month, deliver a work plan for the next 60 days, with priorities, owners and expected outcomes.
- **60 days — start delivering improvements:** use the risk map to implement concrete actions: a minimum release checklist, an initial automation suite covering basic critical paths, and clearer handoffs. Start measuring whether these changes reduce recurring problems and waiting time.
- **90 days — consolidate and plan ahead:** use a stronger evidence base to assess the initial plan as it approaches completion. Critical cases should be in the test-management tool, initial automation integrated into the pipeline, and CI/CD practices reviewed, with better parity between test and production environments. QA should have a more structured process. Use the results and remaining risks to agree a medium-term plan.

## 4. What would you not do yet, and why?

- **No large tool migration or rewrite:** it would stall delivery without fixing the queue.
- **No heavy approval board:** it adds waiting time, which is the problem we are solving.
- **No 100% automation or coverage-% target:** it rewards test count, not the risks that break releases.
- **No device farm yet:** first prove which iPhone risks actually cause escapes; a few real devices may be enough.
- **No full-suite gate on every PR:** it would slow every merge. Start with a PR smoke plus the daily run, add targeted checks when a change's risk calls for them, and revisit once the suite is fast and stable.

## 5. How would we know, after 3 months, that it is working?

Compare the first-month baseline with the following two months, using Jira/Xray, pipeline results and feedback from the team. Account for delivery volume and change risk when interpreting the figures.

- **QA time and queue:** waiting time before QA and time spent in QA, tracked separately. Look for less waiting and fewer repeated handoffs.
- **Escaped problems and hotfixes:** defects found after QA approval or in production, by severity and per release, plus defect-driven hotfixes. Look for fewer recurring escapes.
- **Automation coverage:** the proportion of agreed critical journeys covered by reliable automated checks, alongside flakiness and execution results. Test count alone is insufficient.
- **Proactive QA and shared quality ownership:** evidence that QA participates earlier in refinement and risk decisions, rather than mainly reacting at the end. Review examples of risks prevented and checks owned by developers.
- **Autonomy and confidence:** feedback from development and product, supported by fewer avoidable returns and less dependence on QA for routine verification. Greater release confidence should be backed by the defect and pipeline data.

## 6. What would you need from us?

- An open working environment where people can have honest conversations about risks, mistakes and constraints.
- Transparency about priorities, product issues and delivery pressures, with trust to raise concerns early.
- Access to product knowledge, Jira/Xray, CI, logs and the people who can explain how things work.
- Time to pair with the junior QA and collaborate with development, product and other areas.
- Developer capacity for automation and pre-handoff checks, and a product owner available to clarify acceptance criteria.
- A stable test environment with controllable data and improving parity with production.
- Agreement on priorities, failure ownership and how we will evaluate the work plan together.

---

*How AI was used: This work was developed collaboratively by me with Claude and Codex as supporting tools, not as an independently produced AI deliverable. I remained human-in-the-loop through scope decisions, approvals and iterative feedback, and human-on-the-loop through supervision of execution, evidence and risks. AI supported analysis, drafting, implementation and review where applicable; I retain responsibility for the conclusions and submission. Final human review and approval have been completed.*

Time spent: approximately 1 hour for Parts 2 and 3 combined, including production, review and adjustments. I did not track these two parts separately.

# RCA execution notes and cleanup reconciliation

All commands ran in `.claude/worktrees/qa-lead-take-home` through RTK. Diagnostics are separate from delivery code; source revision `96c7ebea9c7f8270a64e3845e01d7a9f5904ae17`. Each JSON journal records exact start/end, dirty state and executing diagnostic hash. First sandbox Chrome launch failed; authorized unrestricted launches then reached the app. No dependency install.

Read-only invocation pattern (host Node26.5.0):

```text
rtk proxy node .agents/handoffs/qa-lead-take-home/evidence/notes/20261009-rca-native-pointer.mjs .agents/handoffs/qa-lead-take-home/evidence/command-output/20261009-rca-native-pointer-<stage>.json
```

Stages retained: no-query readiness failure, sanitized diagnostic readiness snapshot, comparison with unsettled scroll (failed form readiness), settled comparison (successful selection/form opening, no submit). Prior script variants were iteratively edited; their journals contain hashes, but exact copies of all prior variants were not retained. Only final journal/source correspondence is complete. Do not claim previous variants are reproducible solely from final script.

Env-only booking invocations (first400 and final201), final source SHA256 `4687d58110e4aff270cf30e27dafcae5d13031aada20c5a124c1011036f690b2`:

```text
rtk proxy python3 /private/tmp/qa-lead-rca-env-launch.py /Users/joaopedrobarbosa/Documents/techInterviewSNDB/.claude/worktrees/qa-lead-take-home/delivery/part1-test-suite/node_modules/node/bin/node .agents/handoffs/qa-lead-take-home/evidence/notes/20261009-rca-native-pointer.mjs .agents/handoffs/qa-lead-take-home/evidence/command-output/20261009-rca-native-pointer-booking.json
rtk proxy python3 /private/tmp/qa-lead-rca-env-launch.py /Users/joaopedrobarbosa/Documents/techInterviewSNDB/.claude/worktrees/qa-lead-take-home/delivery/part1-test-suite/node_modules/node/bin/node .agents/handoffs/qa-lead-take-home/evidence/notes/20261009-rca-native-pointer.mjs .agents/handoffs/qa-lead-take-home/evidence/command-output/20261009-rca-native-pointer-final.json
```

Launcher SHA256 `e7c492bb20487f9fa834a9d6f22ec8c6fa25d1af517027ffb4314fa7712a5010`: pypdf assignment text extracted in memory, expected demo account passed to child through CYPRESS_ADMIN_USER/PASSWORD, no persisted or printed values. No credential in command arguments. Full contacts are never written to JSON/CLI; booleans only. No cookies, tokens, headers, screenshot, video or HAR persisted. Public room metadata/headings, target geometry, own synthetic marker/identity and status-level responses only.

Final journal interval03:34:08.224Z..03:34:43.910Z. Installed Chrome version155.0.8059.39 read from app plist; engine runtime differs from original Electron138. The final journal script hash equals the source file hash. No deliverable live rerun.

## Explicit cleanup reconciliation (keep original journals)

- `...native-pointer-booking.json` request status400; lastname empty, response contains no returned booking ID. The diagnostic erroneously created a pending/IDless obligation then marked it identity-unverified. That entry is preserved unchanged for audit. It is a **false diagnostic obligation for a rejected response**, not evidence of an accepted record or a deleted record. Diagnostic correction: focus/value verified before submission and allocate registry obligation only for a successful status or returned ID; no negative outcome is hidden.
- Final `...native-pointer-final.json` creates only accepted ID4 / markerqaxtugqwgm / room1 / Tester / depositfalse / Feb12..14. Before delete, adminGET200 matches exact ID and all identity fields. DELETE202, verifyGET404. Outcome deleted-and-absent, unresolvedfalse.
- Supported outstanding created-record obligations at stop: **0**. No global search/sweep, guessed record deletion, third-party record or global setting write. ID reuse causes remain unknown.
- Final datesVisiblefalse is a diagnostic regex-serialization limitation. Header and Returnhome rendered DOM observations are separate from201; exact confirmation date text/viewport intersection remain unverified. No further remote interaction or repeat booking authorized by this diagnostic stage was performed after final cleanup.

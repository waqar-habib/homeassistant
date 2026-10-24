# Session 2026-10-24: networkpi Claude Code CLI, Phase 0

## Completed
- Owner gave GREEN LIGHT for Phase 0 only; recorded in the runbook header (`b9db0e9`).
- Owner ran Phase 0 by hand in Raspberry Pi Connect as the `claude` user.

## Results
| Check | Result |
|---|---|
| `claude --version` | 2.1.310 (Claude Code), pass |
| `claude doctor` | Ran clean; warnings expected (not signed in, `~/.local/bin` not on PATH) |
| `free -m` before | 705 MB available, swap 0 of 904 |
| `free -m` after | 676 MB available, swap 0 of 904 |
| `sudo dmesg` OOM check | Empty, no OOM kills |

## Decisions and notes
- Phase 0 only proves the binary installs and starts. I12 stays open until Phase A step 8 (a loaded session) shows memory holds.
- `claude` has no sudo by design; the `dmesg` check runs as `networkpi`.
- PATH warning ignored; the runbook uses the full path.

## Resume point
Phase A (token, `gh auth login`, clone, `/login`, read-only task with `free -m` watched). Needs a separate GREEN LIGHT and a fine-grained token created by the owner. Rollback is in the runbook.

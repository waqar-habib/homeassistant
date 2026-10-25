# Session 2026-10-24: networkpi Claude Code CLI, Phase A

## Completed
- Owner GREEN LIGHT for Phase A (`df3f5a7`).
- Fine-grained GitHub token created: repo `waqar-habib/homeassistant` only; Contents read and write; Metadata read; 90-day expiry. An earlier token was broader than intended, and the first copy was removed.
- `gh auth login` as `claude`, `gh auth setup-git`, git identity `networkpi-claude`.
- Found that the account had write access to `Stroupe79/repo-activity` (old group project). Owner removed self; push now false, visibility public.
- Cloned `~/homeassistant` as `claude`, on `main`.
- `/login` succeeded. Read-only HANDOFF summary answered in full.
- `git pull` as `claude`: already up to date.

## Results
| Criterion | Result |
|---|---|
| 1. `--version` and `doctor` clean | Pass |
| 2. Session reads HANDOFF.md, no OOM | Pass |
| 3. Available above ~150 MB, swap under ~600 MB | Pass: available 486 to 699 MB, swap 0 |
| 4. `git pull` works as `claude` | Pass |

Memory: baseline 699 MB available; during the session 505, 503, 486 MB. Swap 0 throughout. `dmesg` OOM check empty.

## Problems
- The first PAT was broader than intended (its repo list included public repos the token could read). Public repos are readable by design; write access stays with the selected repo.
- A `git pull` ran under the admin `networkpi` account in `~/homeassistant`. That copy is not used by Claude; the owner should decide whether to delete it.

## Resume point
Phase B (Remote Control and systemd) needs its own GREEN LIGHT and a day of stable running first. Not drafted yet. I12 stays open until then.

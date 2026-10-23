# Session 2026-10-23 (later): cross-device prompts

## Completed
- Created per-device prompt folders: `docs/prompts/pi5/`, `networkpi/`, `mac/`, `cloud/`, with `docs/prompts/README.md`.
- Moved the HA restart prompt to `docs/prompts/pi5/2026-10-23-ha-core-restart.md` and added a header (Target, Date, Tier 3, GREEN LIGHT given).
- Added a "Cross-device prompts" section to `CLAUDE.md`: prompts are committed to `main` (Tier 1), the owner gets a short pointer, and committing does not authorize running.
- D27 recorded in `docs/decisions.md`.
- Pushed as `11c6d9d`. Earlier pointer commit `247aa7a` referenced the old path, which no longer exists.

## Decisions
- D27: prompts are committed to git, not pasted. Pointers must fit a mobile terminal (no paste).
- Commit trailer uses the current model (Haiku 5.5, per the latest reminder).

## Problems
- None blocking. The restart itself has not run; this Mac session cannot reach the Pi 5's `ha` CLI.
- `caffeinate -dims` is still running on the Mac (started at the owner's request). Not stopped, awaiting the owner.

## Resume point
Pi 5 Claude Terminal: `git pull; read docs/prompts/pi5/2026-10-23-ha-core-restart.md (commit 11c6d9d); run it`. Then the open items in `HANDOFF.md`.

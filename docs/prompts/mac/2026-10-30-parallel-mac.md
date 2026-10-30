# Prompt: Parallel lane, Mac (Claude on the MacBook)

Target: mac
Date: 2026-10-30 (revised after owner replies, same day)
Tier: 0 and 1 only. Nothing in this lane touches live HA or networkpi.
GREEN LIGHT: not needed.

Runs in parallel with the Pi 5 and networkpi lanes. The Mac owns review work and drafts under `docs/`. Pull with rebase before every push. `feat/scenes` exists only on the Pi 5 until the Pi 5 lane (step 4) pushes it.

```
Read HANDOFF.md, docs/issues.md and docs/decisions.md. Run this lane in order. One short report block per step.

Step 1 (Tier 0) Sync. git pull --rebase. git status. Confirm caffeinate is running (pgrep caffeinate); if not, start caffeinate -dims in the background.

Step 2 (Tier 0) Review the networkpi unit. git diff main...feat/networkpi-claude-remote. Check: paths use %h, the tmux session name claude-rc matches the attach command, the restart loop is 30 s, Type=oneshot with RemainAfterExit is right for a detached tmux session, nothing prints a token. Report pass or exact fixes. Do not merge.

Step 3 (Tier 0) Scenes review, after the Pi 5 pushes feat/scenes. Check: git ls-remote --heads origin feat/scenes. If absent, do Step 4 and 5 first and come back. If present: git fetch, git diff main...feat/scenes. Confirm Movie Night is gone, list the 5 remaining scenes with entities, and flag any command touching the front door lock. Write the owner test checklist (5 scenes, expected result, how to undo) into docs/sessions/2026-10-30-parallel-mac.md. Entity IDs must exist in docs/entities.md; flag any that do not.

Step 4 (Tier 1, draft) Tunnel checklist for the owner. The Cloudflare GREEN LIGHT is given (2026-10-30). Read docs/prompts/pi5/2026-10-24-cloudflare-tunnel.md. Check it against HA core 2026.10.4 and flag anything stale (add-on name, trusted_proxies network, MFA screen). Write docs/prompts/pi5/2026-10-30-tunnel-owner-checklist.md: the owner's Cloudflare steps 1-3 as a numbered click-path, the cellular test, and the Nabu Casa cancel date (bills about 2026-11-23). No tokens.

Step 5 (Tier 1, draft) I9 proposal. One page in docs/sessions/2026-10-30-parallel-mac.md: weekly encrypted backup copy to cloud storage, 3 options with cost, best/base/worst case, recommendation. No accounts or credentials.

Step 6 (Tier 1) Merge point. After the Pi 5 and networkpi lanes push: git pull --rebase, reconcile HANDOFF.md into one document (Pi 5, networkpi, Mac sections), update docs/milestones.md and docs/issues.md (dashboard is now "Habib Home", Hatch added, Movie Night removed, I18 disabled), list the owner decisions still open.

Commit each step separately as docs(...) and push to main.
```

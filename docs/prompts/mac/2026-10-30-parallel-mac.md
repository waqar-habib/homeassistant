# Prompt: Parallel lane, Mac (Claude on the MacBook)

Target: mac
Date: 2026-10-30
Tier: 0 and 1 only. Nothing in this lane touches live HA or networkpi.
GREEN LIGHT: not needed.

Runs in parallel with the Pi 5 and networkpi lanes. The Mac owns review work and drafts under `docs/`. Pull with rebase before every push.

```
Read HANDOFF.md, docs/issues.md and docs/decisions.md. Run this lane in order. One short report block per step.

Step 1 (Tier 0) Sync. git pull --rebase. git status. Confirm caffeinate is running (pgrep caffeinate). If not, start caffeinate -dims in the background.

Step 2 (Tier 0) Review the networkpi unit. git diff main...feat/networkpi-claude-remote. Check: the user and paths match the claude user on networkpi, the tmux socket matches the attach command in HANDOFF.md, Restart and RestartSec are sane, nothing prints a token. Report pass or the exact fixes. Do not merge and do not push the branch.

Step 3 (Tier 0) Review the scenes. git diff main...feat/scenes. List each scene, its entities, and any command that touches the front door lock. Write an owner test checklist (4 scenes, expected result, how to undo) into docs/sessions/2026-10-30-parallel-mac.md. Entity IDs must exist in docs/entities.md; flag any that do not.

Step 4 (Tier 1, draft) Cloudflare Tunnel GREEN LIGHT request. Read docs/prompts/pi5/2026-10-24-cloudflare-tunnel.md and D6, D20, D22, D26. Write docs/prompts/pi5/2026-10-30-tunnel-green-light-request.md containing: what changes (cloudflared add-on, ha.thehabibfam.cc, http trusted_proxies, HA 2FA), impact, rollback, best/base/worst case, and the order of steps so the Nabu Casa trial (bills about 2026-11-23) is not cancelled before the tunnel is tested. Mark GREEN LIGHT: not given. Check the steps against HA core 2026.10.4 and flag anything stale.

Step 5 (Tier 1, draft) I9 proposal. One page in docs/sessions/2026-10-30-parallel-mac.md: weekly encrypted backup copy to cloud storage, 3 options with cost, best/base/worst case, and a recommendation. No accounts or credentials.

Step 6 (Tier 1) Merge point. After the Pi 5 and networkpi lanes push: git pull --rebase, reconcile HANDOFF.md into one document (Pi 5, networkpi, Mac sections), update docs/milestones.md and docs/issues.md, and list the owner decisions still open.

Commit each step separately as docs(...) and push to main.
```

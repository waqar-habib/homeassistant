# Prompt: dashboard cleanup, prayer card, tunnel step G

Target: pi5
Date: 2026-11-03
Status: PARTLY SUPERSEDED 2026-11-04 by `2026-11-04-habib-home-redesign.md`. The prayer card and both deletions are deferred; tunnel step G is moot (tunnel live, D39). Do not run.
Tier: 3 (deletions, tunnel, HA restart)
GREEN LIGHT: yes, 2026-11-03 (D38) for deleting `nuvio-test` and `prayer-times` and for the tunnel as written in `2026-10-24-cloudflare-tunnel.md`. The HA restart still needs a live "restart OK". Nothing else is covered.

```
Run after `git pull`. Read HANDOFF.md, docs/decisions.md D37 and D38, docs/issues.md I22.

1. Back up: ha backups new --name "pre-dashboard-cleanup".
2. Prayer card in `habib-home` (Nuvio strategy). Find out whether Nuvio accepts a markdown or template card in the same dashboard (Nuvio docs, ha-mcp dashboard config). If yes, add the card with the template from `dashboards/prayer-times-2026-10-30.json` (branch feat/prayer-dashboard), verify against the live prayer sensors. If no, stop and report the options (best, base, worst). Do not delete `prayer-times` until a prayer card shows in `habib-home`.
3. Export `habib-home` to `dashboards/` and commit (one change, one commit).
4. Delete `nuvio-test` (owner confirmed habib-home). Delete `prayer-times` only after step 2 passes. Confirm each is gone via ha-mcp.
5. Tunnel step G: only if the owner says "Cloudflare steps done" (checklist `2026-10-30-tunnel-owner-checklist.md`). Ask for a live "restart OK" before restarting HA.
6. Update HANDOFF.md, the session note, issues I22, and push to main.
Do not touch the front door lock, Adhan, scenes or I18.
```

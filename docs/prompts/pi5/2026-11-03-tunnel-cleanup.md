# Prompt: remove ignored tunnel package

Target: pi5
Date: 2026-11-03
Tier: 3 (deletion)
Status: SUPERSEDED. The Pi 5 session already removed the file (f1b38ba) and merged (cac9df1). Do not run.
GREEN LIGHT: the owner instructed "Pi 5 cleanup" on 2026-11-03 after being told it removes `packages/cloudflare.yaml`. That covers deleting this one file only. Nothing else, no restart.

```
Context: the trusted proxy for ha.thehabibfam.cc is set in the HA UI (D39). The http: block in packages/cloudflare.yaml is ignored, so the file is dead config.

Steps:
1. git status and git branch. Expect branch feat/cloudflare-tunnel (commit 502d33e). Do not touch automations.yaml (old uncommitted change, leave it).
2. ha core check as-is. Record the result.
3. git rm packages/cloudflare.yaml. Run ha core check again. If any error, git restore the file and stop.
4. Commit as "chore(tunnel): remove ignored cloudflare package (proxy trust lives in the UI, D39)". Push the branch. Do not merge to main; report the branch name and short commit ID.
5. Verify (Tier 0): the Cloudflared app is still running, and https://ha.thehabibfam.cc/ still returns the login page (HTTP 200 or 302, not 400). Do not restart anything. A reload is not needed.
6. Report: check results, commit ID, whether the URL still works.

Rollback: git revert the commit (the file was ignored, so there is no behaviour change either way).
Do not run the dashboard steps from 2026-11-03-dashboards-tunnel.md in this run.
```

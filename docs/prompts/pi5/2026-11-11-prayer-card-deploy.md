# Prompt: Pi 5 deploy the prayer card file (habib-prayer-card)

Target: pi5
Date: 2026-11-11
Tier: 2 (file drop, no restart). The Lovelace resource step is Tier 3 and is done by the Mac session with the owner's GREEN LIGHT, not here.
GREEN LIGHT: GIVEN by the owner in chat, 2026-11-11, for the Prayer Times card build including its Lovelace resource. This prompt does the file drop only.

```
Read HANDOFF.md. Stop and report on any error. No secrets in anything you write.

Goal: make /config/www/habib/habib-prayer-card.js exist so it is served at /local/habib/habib-prayer-card.js. The file is on branch feat/nuvio-home-build (commit a1eff73). It is a custom element, inert until a Lovelace resource loads it.

1. Preflight (Tier 0). ha core check (must be valid). git status (must be clean; if not, stop and report).
2. git fetch origin. Run git diff --stat main..origin/feat/nuvio-home-build. It must touch ONLY: www/habib/habib-prayer-card.js and dashboards/nuvio-layout-2026-11-11-*.json. If anything else changed, stop and report.
3. git checkout feat/nuvio-home-build (tracking origin). Do not edit files. Do not restart HA.
4. Verify the file: sha256 of www/habib/habib-prayer-card.js must equal b6f8a300c9d54578c491883b3cbe26481772004754fb786be075493cf853c1f1. Then curl -sI http://localhost:8123/local/habib/habib-prayer-card.js : expect HTTP 200 and a javascript content type. (If /local needs a restart to see a NEW www folder, HA OS normally serves it without one: if you get 404, STOP and report. Do not restart, a restart is Tier 3.)
5. Stay on the branch. Report: sha256 match yes or no, HTTP status, content type, git log -1 --oneline. The Mac session then tests the card and merges the branch to main. After that: git checkout main; git pull --rebase.
6. Write docs/sessions/2026-11-11-pi5-prayer-card-deploy.md (steps, results). Commit it on main after returning there, push. Never force-push.
```

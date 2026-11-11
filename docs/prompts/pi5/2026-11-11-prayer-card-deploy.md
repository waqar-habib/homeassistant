# Prompt: Pi 5 deploy the Habib cards file (habib-cards.js: prayer card and lock bar)

Target: pi5
Date: 2026-11-11
Tier: 2 (file drop, no restart). The Lovelace resource step is Tier 3 and is done by the Mac session with the owner's GREEN LIGHT, not here.
GREEN LIGHT: GIVEN by the owner in chat, 2026-11-11, for the Prayer Times card and lock bar build including their Lovelace resource. This prompt does the file drop only.

```
Read HANDOFF.md. Stop and report on any error. No secrets in anything you write.

Goal: make /config/www/habib/habib-cards.js exist so it is served at /local/habib/habib-cards.js. The file is on branch feat/nuvio-home-build (commit c86d6b9). It defines two custom elements, inert until a Lovelace resource loads it. The lock bar never calls a service.

1. Preflight (Tier 0). ha core check (must be valid). git status (must be clean; if not, stop and report).
2. git fetch origin. Run git diff --stat main...origin/feat/nuvio-home-build. It must touch ONLY: www/habib/habib-cards.js and dashboards/nuvio-layout-2026-11-11-*.json. If anything else changed, stop and report.
3. git checkout feat/nuvio-home-build (tracking origin). Do not edit files. Do not restart HA.
4. Verify the file: sha256 of www/habib/habib-cards.js must equal 5b13d2d8f0f57c09dbc15f425e0fb73d9f7cf01e179beb2209751b799cfe814e. Then curl -sI http://localhost:8123/local/habib/habib-cards.js : expect HTTP 200 and a javascript content type. (If /local needs a restart to see a NEW www folder, HA OS normally serves it without one: if you get 404, STOP and report. Do not restart, a restart is Tier 3.)
5. Stay on the branch. Report: sha256 match yes or no, HTTP status, content type, git log -1 --oneline. The Mac session then tests the card and merges the branch to main. After that: git checkout main; git pull --rebase.
6. Write docs/sessions/2026-11-11-pi5-prayer-card-deploy.md (steps, results). Commit it on main after returning there, push. Never force-push.
```

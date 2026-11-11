# Prompt: Pi 5 return to main after the habib-cards merge

Target: pi5
Date: 2026-11-11
Tier: 1 (git only, no restart, no config change)
GREEN LIGHT: not needed (Tier 0 to 2)

```
Read HANDOFF.md. Stop and report on any error. No secrets in anything you write.

1. git status must be clean (if not, stop and report).
2. git checkout main; git pull --rebase. Never force-push.
3. Confirm www/habib/habib-cards.js is now tracked on main (git ls-files www/habib) and its sha256 is 5b13d2d8f0f57c09dbc15f425e0fb73d9f7cf01e179beb2209751b799cfe814e (unchanged from the branch).
4. curl -s -o /dev/null -w "%{http_code}" "http://localhost:8123/local/habib/habib-cards.js?v=1" must print 200.
5. Write docs/sessions/2026-11-11-pi5-prayer-card-deploy.md (the branch deploy and this return, results only), commit as docs(session), push to main.
```

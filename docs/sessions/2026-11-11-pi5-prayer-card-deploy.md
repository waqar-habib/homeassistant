# Session: Pi 5 prayer card deploy (2026-11-11)

Prompts: `docs/prompts/pi5/2026-11-11-prayer-card-deploy.md`, `docs/prompts/pi5/2026-11-11-return-to-main.md`. Tier 2 then Tier 1. No restart.

## Branch deploy
1. `ha core check` valid; git status clean.
2. Diff `main...origin/feat/nuvio-home-build` touched only `www/habib/habib-cards.js` and `dashboards/nuvio-layout-2026-11-11-*.json`.
3. Checked out `feat/nuvio-home-build` (`c86d6b9`). sha256 of `habib-cards.js` matched `5b13d2d8...cfe814e`.
4. `/local/habib/habib-cards.js`: HTTP 200, `text/javascript`.

## Return to main
1. Clean tree, `git checkout main; git pull --rebase` (now at `37cd845`).
2. `www/habib/habib-cards.js` tracked on main; sha256 unchanged (match).
3. `...habib-cards.js?v=1`: HTTP 200 via `homeassistant.local:8123`.

## Notes
- `localhost:8123` is unreachable from the Claude Terminal add-on container (curl exit 7, code 000). Use `homeassistant.local:8123` for HTTP checks. The prompt's step 4 literal command prints 000 here.
- The prompt file was only on `main`, so `git pull` on the feature branch did not show it. Checkout `main` first.

## Resume point
Nothing pending on Pi 5 for this task. Next work is Mac side (Rooms optimization).

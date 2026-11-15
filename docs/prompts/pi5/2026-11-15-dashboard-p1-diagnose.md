Target: pi5
Date: 2026-11-15
Tier: 0 for steps 1 to 5, Tier 2 for step 6 (resource fix only)
GREEN LIGHT: yes, standing (D53), owner 2026-11-15 13:01 CST: "You can integrate a GREEN LIGHT from me (owner) for any action or tier that may need it so the process doesn't get held back if I step away." Covers a Lovelace resource fix. Not covered: lock, cover, climate calls, restarts without a backup, HomeKit Bridge, Adhan.

Problem (I45): after the foundation run the owner opened habib-wh, habib-mkh and habib-kiosk and each shows a blank screen with "Configuration error". Cloud test: loader.js and habib-ui.js parse, define habib-diag, register it in window.customCards and render in a plain Chromium page with a mocked hass, with no console errors. So the fault is most likely in how HA loads or caches the resource, not in the card code. Not yet tested inside HA's frontend.

```
Read HANDOFF.md, docs/issues.md I44 and I45. git checkout main; git pull --rebase. Read only; do not change anything before step 6. In every message to the owner write a step code only with its full phrase (D58).

1. ha_config_list_dashboard_resources: report every resource URL and its type. Expected: /local/habib/loader.js?v=1 with type module. Report if it is missing, duplicated, has type js, or points to another path.
2. From the Pi 5 curl http://homeassistant.local:8123/local/habib/loader.js and /local/habib/habib-ui.js: report the HTTP status, the content-type header and the byte size. Compare sha256 of /config/www/habib/loader.js and habib-ui.js with the files in git (git hash-object). They must match main.
3. ha_config_get_dashboard for habib-wh, habib-mkh, habib-kiosk (use the url_path): report the card type string exactly as stored (expected custom:habib-diag), and whether each view is type sections.
4. HA log: ha core logs (or ha_get_logs), search for habib, loader, "Custom element", resource, frontend errors in the last hour. Quote the lines (no secrets).
5. Write the findings to docs/sessions/2026-11-15-dashboard-p1-diagnose.md. Commit docs(session): diagnose configuration error (Tier 1), push to main. Then report: which of steps 1 to 4 failed.
6. Fix only what steps 1 to 4 prove is wrong, one change per commit, and report what you changed:
   - resource missing or wrong type: ha_config_set_dashboard_resource with url /local/habib/loader.js?v=2 and type module (this also busts the cache); delete the stale entry.
   - file missing or different from main: git checkout main -- www/habib and report the diff first.
   - card type typo or wrong view type: ha_config_set_dashboard with the corrected config, read back.
   - If steps 1 to 4 all pass, change nothing; report that the cause is browser cache or the card error text, and ask the owner for the exact error line (below).

Owner checks after this run (list them in the reply): (1) on the Mac browser open habib-wh, hard refresh (Cmd+Shift+R) and tell me the exact error line; the red box usually says "Custom element doesn't exist: habib-diag" or names a config problem; (2) on the iPhone app reset the frontend cache (Settings, Companion App, Debugging; I cannot confirm the exact menu name on your version) and reopen.
```

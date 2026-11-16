# 2026-11-16 Material You Utilities config and restart (Pi 5)

Owner GREEN LIGHT 2026-11-16 (update module, execute plan, restart when needed).

1. Module already at 2.2.0 (Marketplace, updated 22:46 CST 2026-11-15), so no update step was needed.
2. Backup `pre-material-you-utilities` (slug `eb34b459`, 301.6 MB, on networkpi share) taken 00:00 CST.
3. Branch `feat/material-you-utilities`: `configuration.yaml` gained `frontend: extra_module_url` and `panel_custom` (name `material-you-panel`, url_path `material-you-configuration`), both pointing at `/hacsfiles/material-you-utilities/material-you-utilities.min.js` (served 200). `ha core check` passed.
4. Old dashboard resource `/local/community/material-you-utilities/...` deleted through ha-mcp (avoids double load). Resources now: nuvio, habib-cards, habib loader.
5. Restart 00:01 CST (Fajr about 05:49, window clear). HA back up within about 2 minutes; system health fine; log shows only unrelated aidot connect warnings.
6. Adhan check after restart: automations fajr..isha all `on`, `adhan_restore_stuck_volume_on_start` on; `input_boolean.adhan_enabled` is `off` (unchanged by this work; it was off before); HomePods idle at 0.55 and 0.612. Isha fired 18:43 yesterday. **Finding:** `sensor.living_room_adhan_fajr_prayer` still reads 2026-11-15 05:48, not today's time. It may roll over later; recheck before Fajr.

## Open
- Owner: hard refresh, then confirm the "Material You Utilities" sidebar item and that HA dialogs and cards look Material 3. Admin item: the panel's "Create Helpers" adds input helpers; decide whether to use it (D64 says colours come from the theme).
- Claude: render `habib-lab` and check tokens reach our cards. Not yet done (needs the cloud renderer or an owner screenshot).
- Rollback: remove the two config blocks, restart, restore `pre-material-you-utilities`.

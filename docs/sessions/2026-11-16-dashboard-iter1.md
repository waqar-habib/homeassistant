# 2026-11-16 Dashboard iteration 1 (Pi 5, Tier 2)

Prompt: `docs/prompts/pi5/2026-11-16-dashboard-iter1-wh-mkh.md` (commit 04cb12b). Standing GREEN LIGHT D53. No lock, garage, climate, Adhan or network action.

1. **Gate (Tier 0):** evaluation note read. Theme "Material You" is set in the owner's profile (frontend user data). All 18 entity IDs exist with live state. No restart pending. Whether `--md-sys-color-*` is on `:root` was not measurable from the Pi: HA sets theme variables on the document element, and every colour has an HA-variable fallback, so no bridge block was added. The mock render must confirm it.
2. **Backup** `pre-dashboard-iter1` (slug `9986dad9`). Pre exports: `dashboards/habib-wh-2026-11-16-pre-iter1.json`, `dashboards/habib-mkh-2026-11-16-pre-iter1.json`. Branch `feat/dashboard-iter1`.
3. **habib-ui restyle** (loader `VERSION` 6, resource `/local/habib/loader.js?v=6`): tokens now map to `--md-sys-color-*` with fallbacks; teal and all backdrop-filter removed; tile 12 px corner, min 64 px, icon and text only, secondary-container on and surface-container off, state layers, unavailable at 0.38 opacity; status chips 32 px high, 8 px corner, outline-variant border, 48 px touch area via padding; brightness sheet surface-container-low, 28 px top corners, drag handle, 640 px max, scrim. Diag card lost its blur; its two diagnostic rows about glass remain. Tests: 19 of 19 pass (no new logic).
4. **habib-mkh** (hash `5b147c2b63ec0fe5`, require_admin true): status strip, Bedroom, Nursery, Living Room, Floors; one column.
5. **habib-wh** (hash `b29a354a4958b891`): MKH set plus garage status chip, Other rooms, Outdoor (Porch), Climate (two thermostat cards); `max_columns` 2.
6. **Verify:** read back both; no new frontend or habib errors in the HA log; `habib-home` and `nuvio-shared` untouched; resource list is nuvio, habib-cards v1, loader v6. The Pi 5 cannot render: nothing was tapped or viewed.
7. Judgement calls for the owner: icons are my picks (mdi), tile order and names follow dashboard-config.md, MKH `max_columns` is 1, WH 2. Light and dark follow the theme and the user's HA setting. The 8 px tile gap is HA's section grid (not verified on screen).

## Resume
Owner: refresh, open Habib WH and Habib MKH from the sidebar, report what looks wrong. Mac session: breakpoint check. Iteration 2 follows the feedback. Rollback: re-apply the -pre-iter1 JSON files, set the loader resource to `?v=5`, restore `pre-dashboard-iter1` only if config is damaged.

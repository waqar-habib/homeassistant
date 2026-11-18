# 2026-11-17 Pi 5: I52 fixed, clickable door and garage, design guide v1.0 HTML (late evening)

## Done
1. **I52 (red lamps), fixed:** owner confirmed the lamps were white. Live test (Side Table on for about 10 s, twice): a brightness-only `light.turn_on` makes AiDot report `rgbw [255, 0, 0, 0]`; `homeassistant.update_entity` does not correct it. Cards draw that exact report as white (loader v14, `3a1189f`, test added). Backup `pre-security-tap` (`cd1bebea`).
2. **I64, door and garage clickable on every dashboard:** `tap: more-info` added live to habib-wh (hash now `b84cd5fd361f1122`) and habib-wh-next (`1103604bcc72752d`), and in `dashboards/habib-glass-build.py`. Since loader v15 (`7a4447d`) it is the component default (`tap: none` = status only). The card still never calls a lock or cover service.
3. **I65, collapsed section summary:** a collapsed section without lights showed an empty summary until the next state change. Fixed, loader v16.
4. **Design guide v1.0 (draft):** `docs/design/guide/index.html`, Material 3 page styling (Roboto, M3 type scale, light and dark). Every component has a real render (`docs/design/guide/img/`, 26 images at 430 px from the render harness with mock states), purpose, use and don't, wireframe line, config, options, anatomy, states, behaviour and helper text. Nomenclature, foundations, layout, safety, build workflow, acceptance, cleaned gap list. `docs/design-guide.md` now points to it; CLAUDE.md and the library README updated.
5. Checks: 75 of 75 node tests, `ha core check` clean after each change. Resource is `/local/habib/loader.js?v=16`.

## Resume point
1. Owner reviews the guide (open `docs/design/guide/index.html`) and gives GREEN LIGHT to lock v1.0, or edits.
2. After the lock: interactive version (live components with mock states, copyable configs), then hosting.
3. Owner: hard refresh on the Mac and Reset frontend cache on the iPhone to get loader v16; check door and garage taps on habib-wh and habib-wh-next.
4. Still open: I62 and I63 (automation walkthrough), G1 cutover, tablet on arrival (about 2026-11-20).

Rollback: loader `?v=13` and `git revert` of the three merges; dashboards restore from backup `cd1bebea`.

# 2026-11-17 Pi 5: habib-layout and defect fixes (D78, D79), finish

Prompt: `docs/prompts/pi5/2026-11-16-habib-layout-and-defects.md` (Tier 2). An earlier Pi 5 session (2026-11-16, ended at the usage limit) did Parts 1 to 4 and the Part 5 renders, and set loader v11 (commits `f6fc4b0` to `ff5650b`, backup `pre-habib-layout`). This session finished Part 5 and the close.

## Done this session
1. Resumed on `feat/habib-layout` at `ff5650b`. Checks: 67 of 67 node tests pass (`node --test tests/habib-ui/*.mjs`; Node 24 rejects the folder form `tests/habib-ui/`, so use the glob). `ha core check` is clean. The resource is `/local/habib/loader.js?v=11`. Backup `pre-habib-layout` is on networkpiBackups.
2. The staging configs regenerated from `dashboards/habib-glass-build.py` match the committed JSON byte for byte. All 34 entity IDs exist in HA.
3. Created the admin-only sidebar dashboards **habib-wh-next** (hash `70f473df0f88e8de`) and **habib-mkh-next** (hash `902e2f306f8f7695`). Each is one panel view with one `custom:habib-layout`, theme "Habib Glass". Read back via ha-mcp. Themes reloaded.
4. Live dashboards untouched: habib-wh `95f4c477d92c3e07` and habib-mkh `c0d82737c4398684`, the same hashes as before.
5. Part 5.4: rendered the CURRENT live configs at 430 and 1184 wide on the old code (v10, `5969323`) and the new code (v11). Results are in `docs/design/live-on-v11-2026-11-17.json`. New against old: targets under 44 px went from 4–35 to 0. Broken or clipped words: 0 on both. No horizontal scroll. Page heights within 30 px. Lowest text contrast on new code: 4.55 (habib-mkh 1184, media tab). No console error apart from the harness favicon. Not worse, so the v11 bump stands.
6. Merged `feat/habib-layout` to `main` (`4bba5e5`); tests and core check pass on main.

## Part 5 criteria (measured, staging, 8 viewports plus 2 open states)
| Criterion | Result |
|---|---|
| Broken or clipped words | 0 everywhere |
| Dock bars 52 px, one line | 19 bars, all 52 px, all 1 line |
| Chip unused width at 150 px and wider (max 12) | 10 chips, max 9 left and 11 right |
| Blank area between groups at 2, 3, 4 columns (under 5%) | max 0.42% (wh-next 820, 2 columns) |
| habib-mkh-next at 430 x 932 ends above 800 px | content bottom 759 |
| Text contrast at least 4.5:1 | lowest 4.6 |
| Hit area at least 44 px | 0 under 44 |
| Horizontal scroll | none |
| Console errors | none (only the harness favicon 404) |

Colour renders (default evergreen, navy, plum): `docs/design/next-{mkh-430,wh-1184}-{evergreen,navy,plum}.png`.

## Problems and flags
1. **For the owner to explain, nothing changed:** HA now lists only 2 dashboards with a stored config (`habib-wh`, `habib-mkh`) and 2 Lovelace resources (`habib-cards.js?v=1`, `loader.js?v=11`). The handoff still names `habib-home`, `habib-lab`, `habib-kiosk`, `nuvio-shared` and the `nuvio.js` and Material Symbols resources. The repo records no deletion of them. Material You Utilities still loads through `frontend: extra_module_url` in `configuration.yaml`. The owner may have removed these by hand, or the Marketplace migration may have. If so, I58 item 3 is partly resolved.
2. The render harness's contrast sampler crashes on the old v10 code (`Cannot read properties of undefined (reading 'name')`), so the old-code renders have no contrast numbers. The audit's numbers (I55) stand in for them.

## Resume point
1. The Mac session verifies `habib-wh-next` and `habib-mkh-next` live in Chrome (read only). The owner checks them on the iPhone after Settings, Reset frontend cache.
2. Cutover of habib-wh and habib-mkh to habib-layout waits for the owner's word.
3. Removing unused resources is Tier 3 and needs its own GREEN LIGHT.

Rollback: set the loader resource back to `?v=10`, `git revert -m 1 4bba5e5`, delete the two staging dashboards (Tier 3), or restore `pre-habib-layout`.

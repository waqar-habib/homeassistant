# 2026-11-16 Dashboard fold (Pi 5, D71)

## Request
The owner liked the glass dashboards. They asked for the large cards on the iPhone dashboard (habib-wh) to collapse so there is less scrolling, the tablet kiosk to stay as it is, and no prayer card on habib-mkh.

## Done
1. `www/habib/habib-glass.js`: opt-in fold in the shared base card (`collapsible: true`, `collapsed: false` to start open). Folded summaries for prayer, climate, media and list. Fold button sits in each card's header. The list card's render hold now applies only while the add field has focus, so a focused fold bar still re-renders.
2. Loader v8; resource `f1a8ad9292d7478ab40adb5bca19ca1b` set to `/local/habib/loader.js?v=8`.
3. habib-wh patched: `collapsible: true` on prayer, climate, media and list (hash `6f28c6e64b4b7e4a`). habib-mkh patched: prayer card removed (hash `cdee379b6b4eda66`). Live configs match `dashboards/habib-glass-build.py` output; exports `dashboards/habib-{wh,mkh}-2026-11-16-fold.json`.
4. Checks: 26 of 26 tests pass; headless Chromium renders at 430 px folded and unfolded (`docs/design/glass-wh-430-{folded,unfolded}.png`); click test folds and unfolds all 4 cards, saves the choice, 0 service calls; `ha core check` passed; `habib-glass.js?v=8` served 200; no habib errors in the core log.
5. Backup `pre-dashboard-fold` (cb385e06).

## Decisions
D71. The media and list cards were folded as well as prayer and climate, since they are the other large cards.

## Not verified
Real iPhone frontend. habib-kiosk does not use the glass cards, so it is unaffected by design.

## Rollback
Re-apply `dashboards/habib-{wh,mkh}-2026-11-16-glass.json`, then loader resource `?v=7`.

## Resume point
Owner refreshes the app and reports. Fajr 05:49 Adhan run check (D69) still pending.

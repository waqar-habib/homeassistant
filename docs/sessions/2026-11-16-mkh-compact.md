# 2026-11-16 habib-mkh compact, one screen (Pi 5, D75)

## Request (owner, ~16:00 CST)
Work on habib-mkh only. Reduce the time and weather section height by 50%. Remove the Hijri date and the user icons. Keep the weather display, with smaller type. Show everything the dashboard has without scrolling: each section (Floors, Bedroom, ...) shows its controls as smaller buttons and icons, in an accordion card that opens to the full cards as they are now. Theme, fonts and lamp icons stay.

## Done
1. `www/habib/habib-glass.js` (all additive; habib-wh config unchanged, render unchanged):
   - `habib-hero`: `compact: true` (130 px instead of 260 px: clock and date left; weather icon, temperature, condition and pills right, smaller type) and `hijri: false`. No `persons` means no avatars.
   - New `habib-room`: room header with an "N on" count, plus one small chip per lamp (the same drawn lamp art at 25 px, name, % or Off). Tap a chip to toggle. The header or chevron opens the full `habib-light` cards (slider, colours) inside the card.
   - New `habib-dock`: folded cards two per row, 52 px bars with the label above the value. Tap one to open it across the full row.
   - Base card: `remember: false` (opens folded on every load), a `habib-fold` event, `fold_layout: stack`. `habib-security` gained a folded summary. `habib-climate` takes `short` names for the summary.
   - `lampSvg` prefixes gradient ids so several lamps can share one shadow root.
2. habib-mkh is one section (HA leaves 24 px between sections, 8 px between cards in a section): compact hero, rooms Floors, Bedroom, Nursery and Living Room, then a dock with Front door, Climate, Listen and Shopping list. Config hash `9dac0e9f30284b82`. Export `dashboards/habib-mkh-2026-11-16-compact.json`, built by `dashboards/habib-glass-build.py`.
3. Loader v9; resource `f1a8ad9292d7478ab40adb5bca19ca1b` now `/local/habib/loader.js?v=9`.
4. Checks: 26 of 26 tests pass. Headless Chromium mock at 430 x 839 (iPhone 430 x 932 minus the status bar and home indicator), with HA's real padding (24 px above and below, 8 px sides): content ends at about 814 px, so nothing scrolls. Click tests: a room opens to its 3 full lamp cards and closes; the climate bar opens across the row; a chip tap sends `light.turn_off` to the right entities (the group sends to its 7 lamps). habib-wh config is identical to the fold export. `ha core check` passed; `loader.js?v=9` and `habib-glass.js?v=9` are served with HTTP 200; no habib errors in the system log. Mocks: `docs/design/glass-mkh-430-{compact,room-open,dock-open}.png`.
5. Backup `pre-mkh-compact` (slug `18afddc4`). Commit `f0e4fa5` (branch `feat/mkh-compact`, fast-forwarded to main).

## Decisions
D75 (this note). Nothing remembers an open state on habib-mkh. When a dock card opens, the next bar moves up beside the bar before it (dense grid), so there are no empty half rows.

## Not verified
- Not checked on the real iPhone or iPad. The headroom of about 25 px depends on the HA app's real safe-area handling.
- On the iPad, one section means one column about 500 px wide, not 3 columns.
- The Floors chips show the 3-pendant group art at 25 px, which is small.

## Rollback
Re-apply `dashboards/habib-mkh-2026-11-16-fold.json` to habib-mkh (habib-wh is unaffected). The loader can stay at v9 because the old cards still work; or set the resource to `?v=8` and `git revert f0e4fa5`.

## Resume point
MKH (or the owner) refreshes the HA app on the iPhone. If the old layout shows, use Settings > Companion app > Reset frontend cache. Report: does it fit without scrolling, are the chips big enough to tap, and is the 25 px lamp art readable.

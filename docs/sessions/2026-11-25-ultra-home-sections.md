# 2026-11-25 Ultra Home tab: wireframes, Sections test build (Mac)

## Done
1. Wireframes v0.1 (Home tab: Hero, Prayer, Climate at 430 / 820 / 1440) accepted by the owner without changes; Sections chosen for the Home tab (D87).
2. Wireframes v0.2 on the same canvas (artifact 3ib7jm5EkaxchB3fZXcSdS, private to the owner): Lights tab at 3 sizes, light card (icon, name, state, brightness slider, ••• colour), colour drawer, card surfaces A frosted vs B soft tint. Waiting for owner edits; not built.
3. Throwaway dashboard `uc-home-test` "UC Home test" (admin only, not in sidebar), one Sections view, 3 Ultra Cards (Liquid Glass):
   - Hero: Ultra clock + weather modules (5-day forecast in equal columns).
   - Prayer: Ultra markdown module (Jinja + HTML): next prayer, countdown, progress since last prayer, 5-prayer strip, Sunrise footnote; after Isha shows tomorrow's Fajr. Adhan chip (text module, template) opens HA's dialog for `switch.adhan_pause`.
   - Climate: one row per thermostat (name, Heat/Cool targets, current temperature); a tap opens HA's thermostat dialog. No setpoint controls on the card.
   Generator `dashboards/ultra/build_home_sections_test.py` on branch `feat/ultra-home-sections` (`65acf5f`).
4. Rendered by Claude: desktop (2 columns at 1309 CSS px), tablet 820 (2 columns), phone 430 (1 column). No truncation, no overlap.
5. I79 check: the Ultra-module cards update live (countdown went from 8 h 31 to 8 h 30 min without reload). The Adhan chip was not toggled (Pause Prayer is off-limits for tests).

## Problems
- Ultra icon module shows "Icons Need Entities" without an entity: icon moved onto the text module.
- Chrome window cannot be resized (full screen); phone and tablet rendered in a same-origin iframe of that width instead.
- Browser blocks fetches to a localhost helper (local network access); config pasted directly.

## Resume point
Owner: review `/uc-home-test` (Mac and iPhone), answer surfaces A or B, edit light wireframes. Claude next: apply answers, then move the 3 cards into `habib-home-uc` Home tab as a Sections view (Tier 2, back up the dashboard JSON first), then light cards after owner edits, then audit defects 2–10.

## Later the same evening (22:00 to 23:10 CST)
1. Wireframes v0.3 (surface B, Floors + room drawers, D88) and v0.4 (one control per room, Outdoor as one card, themed drawers for a light, a room and a thermostat, D89). Owner approved v0.4 and extended themed drawers to locks, garage and all multi-step controls (D90).
2. Backup `pre-light-groups` (2acd3e8e), then 6 group helpers created through the config flow API and verified live (see `docs/entities.md`). All lights support colour, so a room colour reaches every lamp.
3. Lights tab prototype on `uc-home-test` (branch `feat/ultra-home-sections`, last `f3e7917`): Floors card (Downstairs, Upstairs) and the Living Room accordion (All lights + 4 tiles). Tile = name/state (tap toggles), ••• Ultra `drawer` module (bottom sheet) with brightness bar, 4 whites, 6 colours, "Open full controls". Rendered at phone width; drawer opened and closed. No light was switched (night; taps on toggle and swatches untested).
4. Mistake: commit `31a90a0` on the branch included the owner's local `.claude/settings.json` (permission rules and 3 local folder names, no secrets). Reverted in the next commit; still in branch history (no force-push). Squash-merge the branch so it never reaches `main`.

## Problems found in the prototype
- Ultra slider shows the entity name above the bar unless `show_bar_label: false`; its container adds 16 px padding.
- Drawer content renders outside the card, so `--primary-text-color` falls back to HA's dark theme (pale text). Fixed with explicit colours (#10224D / #4A5675) and our own title text.
- Empty text modules show "Add text in the General tab"; swatches are now a "●" glyph plus a label. Dots render about 20 px, smaller than the wireframe's 48 px.
- Drawer panel sits under HA's bottom tab bar; 84 px bottom padding added.
- Size: 7 tiles = ~100 KB of config (each tile carries its own drawer). The full tab (~20 tiles) needs one shared drawer per room or a lighter drawer to stay reasonable.

## Resume point (updated)
Claude next: test toggle and a swatch on a lamp in daytime with the owner's OK; shrink the config; build the remaining rooms, Outdoor and the room power buttons; render at 430 / 820 / desktop; then themed climate, lock and garage drawers (view-only tests); then move into `habib-home-uc`.

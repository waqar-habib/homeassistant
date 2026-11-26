# 2026-11-26 Ultra dashboards in the Habib Glass look (Mac, D91)

## Owner request (iPhone screenshot of habib-wh-next)
1. Nesting: the old tight, equal steps between nested containers.
2. Card tint matching the evergreen page; dark forest green scheme.
3. Old type hierarchy: big numbers large and thin, names smaller and bold.
4. Finish the open HANDOFF items.

## Done
1. Generator `dashboards/ultra/build_home_sections_test.py` rewritten (v2): views use theme "Habib Glass"; cards `uc_theme: "none"` with the Habib Glass surface, border and shadow tokens; card padding 12, wells `rgba(0,0,0,.14)` inset one step; type styles from `docs/design/habib-tokens.yaml` (clock 64/200, temperatures 56/200, next prayer time 44/200, names 15-17/600, states 13/500 dim, section labels 13/600 spaced capitals).
2. Home tab: Hero (thin clock, date, temperature, 5-day forecast in a well), Prayer (next-prayer panel, warm highlight for the next prayer), Home card (All secure, Front door and Garage with themed drawers, Porch toggle, Skip Evening Lights, Pause Prayer, Noor's Bedtime), Climate (two tiles, big thin temperature, range, bold name, mode; themed thermostat drawer with mode chips and setpoint readout).
3. Lights tab: Floors (Downstairs, Upstairs with drawers), Outdoor (one on/off pill), Living Room, Bedroom, Nursery, Upstairs (3 lamps + 2 plugs). Each room: name, state, power pill, closed accordion "N lights" with "All lights" (room drawer) and one tile per light (tap toggles, long press opens HA's dialog).
4. Handoff items: bigger colour dots (40 px discs, were ~20 px); remaining rooms, Outdoor, room power buttons; one shared drawer per room (config 198 KB for both full tabs, was ~100 KB for 7 tiles); themed lock, garage and thermostat drawers. Lock: "Lock" on tap, "Hold to unlock" on long press; Garage: "Hold to open" and "Hold to close" (Ultra has no tap confirmation, so a long press is the guard).
5. Rendered at 455 (phone), 820 (2 columns) and 1440 with sidebar (3 columns). Drawers opened view-only. No light, lock, garage, thermostat or switch was operated.
6. Moved into `habib-home-uc`: Home and Lights tabs replaced (Sections), Media tab kept. Backup of the previous config: `dashboards/ultra/habib-home-uc-backup-2026-11-26-pre-glass.json` (live equalled the MVP file plus `uc_theme: null`; no owner edits lost). Generator `build_habib_home_uc_v2.py`.
7. Branch `feat/ultra-home-sections` squash-merged to `main` (`6f3a474`); the reverted `.claude/settings.json` commit did not reach `main`.

## Problems and workarounds (I80, I81)
- Ultra row children share width equally: the ••• trigger is absolutely placed in the tile corner so the bar gets the full width.
- Top-level vertical blocks are padded twice: the security panel sits in a one-column grid.
- Accordion content has 16 px padding: inner stack uses negative margins. Header keeps a faint tint.
- Empty text and empty vertical blocks show editor placeholders: power and icons ride on text, colour discs are text blocks.
- Inline `font-family:"..."` in markdown broke the style attribute: font names use single quotes.
- Ultra climate module is Pro (D86 excludes Pro): own drawer; steppers need a step script (I81).

## Not done
- Daytime lamp test (toggle, swatch): needs the owner's OK.
- Media tab still Liquid Glass; MKH dashboard; kiosk; cutover (GREEN LIGHT).

## Resume point
Owner: review `/habib-home-uc` (and `/uc-home-test`) on the iPhone; OK a daytime lamp test. Claude next: Media tab in the Habib Glass look without `native_card`; `script.climate_step` + steppers (I81); then MKH; hide `uc-home-test` from the sidebar before cutover.

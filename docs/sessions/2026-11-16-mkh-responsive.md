# 2026-11-16 habib-mkh responsive, groups, garage (Pi 5, D76)

## Request (owner, ~18:00 CST, with a habib-wh iPhone screenshot)
1. habib-mkh is not responsive (phone layout on a laptop). Small cards on phones; expanded like habib-wh on tablets and MacBook.
2. habib-mkh buttons: icon on the left taking 33%, text wrapped in the other 66%.
3. Tapping Upstairs turned on only 2 lights. Validate all areas and groups.
4. All lamps are drawn red although they are warm white (3000 K).
5. habib-mkh: replace the shopping list with garage door control.

## Findings
1. Areas checked via ha-mcp (`area_entities` for all 11 areas). Upstairs has 5 lamps: `light.game_room`, `light.upstairs_guest`, `light.study_lamp` (HA name "Nightstand", area Study) and two Leedarson smart plugs, `switch.upstairs_guest_guest_nightstand` (Guest Nightstand) and `switch.study_study_floor_lamp` (Study Floor Lamp). The group held only the 3 lights, and the card only called `light.*`. Downstairs (Living Room 4, Master 3) was complete. Kitchen and Formal Living have no lamps. Nursery and Porch are left out of the floor groups by design.
2. Logbook: the dashboard's 16:09 Upstairs tap turned on all 3 lights. The screenshot shows Upstairs at 1%, and three brightness changes hit all 3 upstairs lamps at 17:52:23, :28 and :35. Likely cause: page scrolls that started on the brightness slider (it captured every touch). Fixed (below).
3. Red: not reproducible. At 19:05 every lit lamp reports `color_mode: color_temp`, 2700 K, rgb 255,167,87. A live test (Study lamp on for 22 s, then off) reported the same, and the mock draws amber. The recorder stores no colour attributes for these AiDot lamps, so the 17:52 state cannot be read back. I52 opened.
4. The sunset automation targets `light.*` only, so the two plugs never come on at sunset. I53 opened (owner decision).

## Done
1. `www/habib/habib-glass-logic.js`: `glowColor` (white wins unless HA reports a colour mode; an RGBW colour with a dominant white channel is drawn white), `colorLabel`, `byDomain`. `lightGlow` takes colour from the first lit lamp that reports one and averages brightness over dimmable lamps only. 4 new tests; 28 of 28 pass.
2. `www/habib/habib-glass.js`:
   - Group and chip taps call `light.turn_on/off` and `switch.turn_on/off` separately.
   - Slider: `touch-action: pan-y`; a vertical gesture or the browser's pointercancel sends nothing. A horizontal drag, or a tap with no movement, sets brightness.
   - The lamp sheet (•••) shows what HA reports ("White 2700 K" or the colour mode with its rgb).
   - Room chips: grid with the icon in the left third and the name (wraps to 2 lines) plus state in the right two thirds.
   - Dock bars: the same 1/3 icon, 2/3 text split. Icons: lock, garage, thermometer, speaker. The icon turns mint when the door is secure and rose when it is not.
   - `habib-security` with `direct: true` (one item): the bar opens HA's own dialog for that entity in one tap, with no service call from the card.
3. habib-mkh (hash `c0d82737c4398684`): compact section visible under 700 px (dock: Front door, Garage, Climate, Listen; shopping list removed). From 700 px, expanded sections like habib-wh: hero (no Hijri, no people), Home (door and garage tap to open HA's dialog, climate), Floors, Living Room, Bedroom, Nursery, Upstairs (5 lamps), Listen. `max_columns` 4. Export `dashboards/habib-mkh-2026-11-16-responsive.json`.
4. habib-wh (hash `95f4c477d92c3e07`): Upstairs group has all 5 lamps; the Upstairs section gains Guest Nightstand and Study Floor Lamp; "Study" renamed "Study Lamp". Export `dashboards/habib-wh-2026-11-16-plugs.json`.
5. Loader v10; resource `f1a8ad9292d7478ab40adb5bca19ca1b` is `/local/habib/loader.js?v=10`. Files served with HTTP 200 and the new code.
6. Checks: headless Chromium mock with live states at 430x839 (fits, content ends at about 720 px), 1024x1366 (2 columns) and 1440x900 (4 columns): `docs/design/glass-mkh-{430,1024,1440}-responsive.png`. Click test: an Upstairs chip tap sent `light.turn_off` to 3 lights and `switch.turn_off` to 2 plugs. The door and garage bars fired `hass-more-info` for `lock.living_room_front_door` and `cover.general_garage_door_garage_door` with zero lock or cover calls. `ha core check` passed.
7. Backup `pre-mkh-responsive` (c42207a8). Commit `5969323` (branch `feat/mkh-responsive`, fast-forwarded to main).

## Decisions
D76. Garage and front door on habib-mkh open HA's own dialog (no "GREEN LIGHT outdoor controls" was given, D60). Breakpoint 700 px, so iPad portrait (744+) gets the expanded layout.

## Not verified
- Real iPhone, iPad and Mac. HA's `screen` visibility is evaluated by the real frontend; the mock only imitates it.
- The slider scroll fix on iOS touch.
- Red lamps (I52): stricter logic, but the root cause is not proven.

## Rollback
Re-apply `dashboards/habib-mkh-2026-11-16-compact.json` and `dashboards/habib-wh-2026-11-16-fold.json`, set the loader resource to `?v=9`, and `git revert 5969323`. Or restore backup `pre-mkh-responsive`.

## Resume point
Owner refreshes the HA app on the iPhone (Settings > Companion app > Reset frontend cache if the old layout shows) and opens habib-mkh on a laptop. Report: phone fit and chip readability; laptop layout; Upstairs tap lights all 5; colour now correct. Owner decides I53 (plugs in the sunset automation). Claude reads lamp colour state at the next sunset (2026-11-17 ~17:33 CST) for I52.

# Session 2026-11-26: away lights check (Pi 5, read-only)

Trigger: owner asked to validate the away lights. Both people were away at sunset.
Expected per request: a few lights on at sunset, then all lights off except Outdoor within 4 hours.

## Findings
1. **Sunset 17:29:55 CST, on:** `evening_away_lights_120_min` passed its condition (`zone.home` = 0; Waqar and Maham both in `Sasural`). Turned on `light.console_lamp`, `light.game_room`, `light.dresser`, `light.side_table`. Notice "Nobody is home. 4 lamps are on until 7:29 PM." sent.
2. **Off step never ran:** the 2-hour delay was cancelled (trace `9af8fea8b539ef760355916edf05686e`, `script_execution: cancelled`, at 17:30:16 CST). Home Assistant restarted about 17:30:16 to 17:30:37 CST (startup logged 17:30:47 CST; cause not in the logs). The restart discards the in-memory delay, so `light.turn_off` and "Away lamps are off." never ran.
3. **Lamps still on at about 23:31 CST**, about 6 hours after sunset: console lamp 86% red (255,0,0); game room 100% red; dresser 100% 2995 K; side table 100% 2702 K.
4. **Spec mismatch:** the package does 2 hours, four lamps only. No rule turns all lights off except Outdoor. Older decisions say 3 hours (D32) and "select lights" (D43). The 4-hour, all-lights-off behavior is not implemented.
5. **Not a fault:** the Living Room, Downstairs, Upstairs and Bedroom light groups showed "on" in the logbook. Groups follow members; the automation did not command them.
6. **Outdoor lights** (`outdoor_lights_sunset_sunrise`) ran correctly at sunset (`switch.outdoor_*` on, same restart reconciled).

## Root cause
A `delay` inside one automation run is lost on any Home Assistant restart. The off step depends on that run surviving.

## Not changed
No config, device, or helper was changed. Lamps were left on; owner decides.

## Resume point
1. Owner: decide the away behavior (see `docs/issues.md` I83).
2. Owner: say whether to turn the four lamps off now.
3. Claude: after the decision, make the change on a branch, back up first (`pre-away-lights-fix`), run `ha core check`, and read the next away trace.

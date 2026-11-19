# Audit: automations, scripts, scenes, areas, groups, zones (2026-11-19, Pi 5, read only)

Scope: every automation (12), script (2), scene (3), area (10), floor (2), group (0) and zone (6) live in HA, plus the 6 packages in `packages/`. `automations.yaml` and `scripts.yaml` are empty; everything lives in packages.
Evidence: live states, traces, recorder history (2026-11-18 17:25 to 2026-11-19 00:10 CST) and the system log. **Nothing was changed.** Each fix below names its tier; Tier 3 items wait for a GREEN LIGHT.

## 1. Summary (ranked by impact)

| # | Severity | Item | Finding | Proposed fix | Tier |
|---|---|---|---|---|---|
| A1 | High | `automation.arrival_garage_open_*` + `script.arrival_garage_notify` | Fails on **every** run: `Action notify.waqars_iphone not found` (4 of 4 runs, latest 2026-11-18 19:35 CST). `notify.waqars_iphone` is a notify *entity*, not an action. No dry-run notice has ever reached a phone (I62) | Lines 45 and 50 of `packages/arrival_garage.yaml`: replace with `action: notify.send_message` + `target: entity_id: notify.waqars_iphone` (same pattern as Adhan, which works) | 2 (garage package: owner said walkthrough first) |
| A2 | High | Arrival garage, condition "driving" | `sensor.waqars_iphone_activity` and `sensor.mahams_iphone_activity` are **unavailable** now. Even after A1 every run reports "not driving", so live mode would never open | Owner: in each Companion app, Settings > Companion App > Sensors > Activity: enable, allow Motion & Fitness. Then 3 real arrivals each (I51) | Owner |
| A3 | High | Evening lights vs Evening Away | Both trigger at sunset. "All lights on" has **no presence check and no off step**, so when nobody is home every light (except Nursery) turns on and stays on all night. "Away" turns 4 of them off after 2 h; the other 9 stay on | Add `condition: state person... home` (someone home) to "all lights", or merge both into one automation with a `choose` on presence | 2 (owner-approved automation, logic change) |
| A4 | Medium | Evening "all lights" target | Template `states.light` includes **Porch** (on since 17:32 yesterday, still on now: nothing turns it off) and excludes the two plug lamps (`switch.upstairs_guest_guest_nightstand`, `switch.study_study_floor_lamp`, I53). No automation turns any light off at night | Owner decides: (a) Porch off at a set time or sunrise; (b) include the two plugs; (c) a bedtime "all off" | 2 |
| A5 | Medium | `input_number.adhan_saved_volume` | Has `initial: 0`, so every restart resets it to 0 **before** `adhan_startup_restore` reads it. The startup restore can therefore never run (its condition is "above 0"). Same class of bug as the gate fix of 2026-11-17 (I60) | Remove `initial: 0` (the helper then keeps its last value across restarts) | 3 (Adhan) |
| A6 | Medium | `adhan_startup_restore` | Restores **both** HomePods to the first speaker's saved volume (only one value is stored). If the bedroom HomePod was at a different level it is restored to the wrong level | Store one value per speaker (2 helpers) | 3 (Adhan) |
| A7 | Medium | AiDot integration (13 of 16 lights) | System log: `401 Please login again` (2 times since the last start). At 18:05 CST all AiDot lights went unavailable for about 1 s. Cloud login may expire and drop control | Owner: Settings > Devices & services > AiDot > Reconfigure / re-login | Owner |
| A8 | Medium (security) | AiDot logging | The AiDot library logs each command at WARNING level **including a per-device local password** (13,000+ lines since start). Anyone with log access sees them; the log also bloats the SD card | Set `logger: logs: aidot: error` in `configuration.yaml` | 2 (proposed, not applied) |
| A9 | Low | Two one-time automations (`one_time_re_enable_*_2026_11_18`) | Did their job on 2026-11-18 and are now off. Dead config | Delete the two packages `adhan_maghrib_reenable_2026_11_18.yaml`, `evening_reenable_2026_11_18.yaml` | 3 (deletion) |
| A10 | Low | `scenes.yaml` (Turn on lights, Turn off lights, Away) | Reference `light.study_study_floor_lamp` and `light.upstairs_guest_guest_nightstand`, removed on 2026-11-14 (now `switch.*`). Those two lamps are skipped silently | Replace with the `switch.*` IDs, or move the scenes to a package (I19 scenes planning) | 2 |
| A11 | Low | Evening Away condition | Template `states.person | selectattr(state == home) | count == 0`. Works, but the native form is validated at load: `condition: numeric_state, entity_id: zone.home, below: 1` | Swap to native | 2 |
| A12 | Low | Traces | Several automations ran on 2026-11-18 but keep no trace (Maghrib, both evening). Default `stored_traces` is 5 and traces are lost on restart | Add `trace: stored_traces: 20` to the Adhan and arrival automations | 2 |

## 2. Automations, line by line

### Adhan (`packages/adhan.yaml`): 5 prayer automations + startup restore + `script.adhan_play`
1. Gate `input_boolean.adhan_enabled`: no `initial` (fixed 2026-11-17). State **on**. OK.
2. Triggers `time at: sensor.living_room_adhan_*`. OK. Fajr 2026-11-18 05:51 finished (3 min 49 s); Isha 2026-11-18 18:42 finished; `adhan_last_error` empty. OK.
3. Conditions: gate on + sensor not unknown. The template could be dropped: a time trigger on an unavailable sensor never fires. Harmless.
4. Fajr uses `Fajr.mp3` on the Living Room HomePod only; others on both HomePods. Matches the spec (owner choice, D50).
5. `script.adhan_play`: fail closed on unreadable volume, set 0.35, read back, play, wait track length + 10 s, stop if still playing, restore each speaker to its own V0 with one retry, notify on success and on failure. Matches the CLAUDE.md rules (restore volume, notify on failure).
6. Notify: `notify.send_message` to `notify.waqars_iphone` entity. Works (state shows last send 2026-11-19 00:44 UTC). Maham is never notified (by design?).
7. `adhan_saved_volume` `initial: 0`: see A5. Startup restore: see A6.

### Arrival garage (`packages/arrival_garage.yaml`)
1. `arrival_garage_live` OFF (dry run). Never opens the door today. OK.
2. Arm: template trigger on `distance()` vs zone radius for 10 min. Ran 3 of 3 OK earlier; arms correctly (the 2026-11-18 19:35 arrival found Waqar armed).
3. Open: zone enter on `zone.arrival_home` (passive, 150 m). Fires. Then fails at the first notify (A1).
4. `dist_m` is measured to `zone.home`, not `zone.arrival_home`: same centre, so equal. OK.
5. Problems list: driving (A2), GPS < 50 m, person state, garage closed, fault off (now off), vacation off (now off), 30 min cooldown. Logic OK.
6. Live branch: open, notify, check it moved within 2 min, warn if still open after 15 min. Never auto-closes. OK.
7. Door B disabled (D66). Not referenced. OK.

### Evening (`packages/evening_lights.yaml`, `evening_away_lights.yaml`)
1. All lights: ran 2026-11-18 17:32, turned on 13 lights incl. Porch. See A3, A4.
2. Away: last ran 2026-11-15 (nobody home). See A3, A11.

### One-time re-enable (2 packages): see A9.

## 3. Areas and floors
1. Floors: Downstairs (Living Room, Kitchen, Master, Nursery, Formal Living, Laundry, Outdoor), Upstairs (Game Room, Upstairs Guest, Study). 0 unassigned, 0 orphaned.
2. Floor ID of Upstairs is `upstairss` (typo). Cosmetic: IDs cannot be renamed; nothing references it. Leave.
3. Area IDs `big_guest` (Upstairs Guest) and `small_guest` (Study) do not match their names. Cosmetic, leave.
4. Areas not in CLAUDE.md: Laundry, Outdoor. Update CLAUDE.md area list (docs only).
5. Light areas: all 16 lights have an area and match the dashboards. Hatch light and clock are in Nursery (so the evening automation skips them). OK.
6. `switch.hatch` has no area. Suggest Nursery (Tier 2).
7. Thermostat switches: `switch.nest_thermostat` in Game Room, `switch.nest_thermostat_2` in Living Room. Fine if those are the thermostat locations.

## 4. Groups
None (old-style groups: 0). Matches D54: groups are dashboard-side only (I37, HomeKit bridge). OK.

## 5. Zones
| Zone | Radius | Passive | Note |
|---|---|---|---|
| Home | 100 m | no | OK |
| Arrival Home | 150 m | yes | Same centre as Home. Used by arrival garage. OK |
| Neighborhood | 500 m | **no** | Same centre. Because it is active, a person 100 to 500 m away shows "Neighborhood", not "Away". Evening Away counts it as away (as written). Make it passive if you want "Away" on the person badge |
| Leander | 3000 m | yes | OK |
| Cedar Park | 2700 m | yes | OK |
| Sasural | 200 m | no | OK |

## 6. Proposed order (needs your answers)
1. A1 + A11 + A12 (one commit, Tier 2): reply **"fix A1"** or include in a GREEN LIGHT.
2. A3/A4: choose the behaviour (someone home vs away; Porch off time; plugs in or out).
3. A5 (+A6 optional): Tier 3 Adhan change, needs **GREEN LIGHT**.
4. A9: Tier 3 deletion, needs **GREEN LIGHT**.
5. A2, A7: owner actions on the phones and the AiDot login.
6. A8, A10: Tier 2, on your word.

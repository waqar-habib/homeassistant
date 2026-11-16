# Dashboard config: entity IDs and group members (single source of truth)

Source: P0 discovery, 2026-11-15 (about 13:30 CST), read live through ha-mcp. Re-read before any dashboard change (CLAUDE.md rule 9). Counts are live and will drift; re-check with ha-mcp. Session record: `docs/sessions/2026-11-15-dashboard-p0-discovery.md`.

## 1. Lights (16 live)

| Entity ID | Name | Area | Floor | Modes | Brightness | State 2026-11-15 13:30 |
|---|---|---|---|---|---|---|
| light.buffet | Buffet | Living Room | Downstairs | color_temp, rgbw | yes | off |
| light.floor_lamp | Floor Lamp | Living Room | Downstairs | color_temp, rgbw | yes | off |
| light.side_table | Side Table | Living Room | Downstairs | color_temp, rgbw | yes | off |
| light.console_lamp | Console Lamp | Living Room | Downstairs | color_temp, rgbw | yes | off |
| light.dresser | Dresser | Master | Downstairs | color_temp, hs | yes | off |
| light.mahams_lamp | Maham's Lamp | Master | Downstairs | color_temp, hs | yes | off |
| light.waqars_lamp | Waqar's Lamp | Master | Downstairs | color_temp, hs | yes | off |
| light.bookshelf | Bookshelf | Nursery | Downstairs | color_temp, rgbw | yes | off |
| light.changing_table | Changing Table | Nursery | Downstairs | color_temp, hs | yes | off |
| light.nursery_floor_lamp | Nursery Floor Lamp | Nursery | Downstairs | color_temp, hs | yes | off |
| light.nursery_hatch_light | Hatch Light | Nursery | Downstairs | rgb | yes | off |
| light.nursery_hatch_clock | Hatch Clock | Nursery | Downstairs | brightness | yes | **on** |
| light.game_room | Game Room | Game Room | Upstairs | color_temp, rgbw | yes | off |
| light.upstairs_guest | Upstairs Guest | Upstairs Guest | Upstairs | color_temp, rgbw | yes | off |
| light.study_lamp | Nightstand (friendly name) | Study | Upstairs | color_temp, rgbw | yes | off |
| light.smart_wi_fi_light_switch | Porch | Outdoor | Downstairs | onoff | **no** | **on** |

Per-area counts: Living Room 4, Master 3, Nursery 5 (includes both Hatch lights), Game Room 1, Upstairs Guest 1, Study 1, Outdoor 1. Total 16. No light has no area.

Friendly-name caution: `light.study_lamp` is named "Nightstand" in HA. Use the entity ID in YAML, never the name.

Removed since the 2026-10-30 plan (owner cleanup 2026-11-14): `light.study_study_floor_lamp`, `light.upstairs_guest_guest_nightstand`, `light.unk_1`, `light.unk_2`. Earlier counts of 17 are stale.

## 2. Light group membership (dashboard-side only, no HA group entities)

| Group | Members | Live count |
|---|---|---|
| Downstairs | light.buffet, light.floor_lamp, light.side_table, light.console_lamp (Living Room); light.dresser, light.mahams_lamp, light.waqars_lamp (Master) | 7 |
| Upstairs | light.game_room, light.upstairs_guest, light.study_lamp | 3 |
| Nursery (alone) | light.bookshelf, light.changing_table, light.nursery_floor_lamp | 3 |
| Excluded from both groups | light.nursery_hatch_light, light.nursery_hatch_clock | 2 |
| Neither group (owner to place) | light.smart_wi_fi_light_switch (Porch) | 1 |

Check: 7 + 3 + 3 + 2 + 1 = 16. Owner decision pending: where Porch appears.

Excluded everywhere: lock.804_front_door and its switches (switch.804_front_door_keypress_beep, switch.804_front_door_1_touch_locking), binary_sensor.804_front_door_keypad_disabled, select.804_front_door_auto_lock_time, sensor.804_front_door_battery, select.804_front_door_* (not this household).

Brightness: all lights except Porch support brightness (Porch is onoff only). Long-press brightness sheets apply to 15 of 16.

## 3. Climate

| Entity ID | Friendly name | State | Current temp (indoor) | Setpoints | hvac_modes | Unit | Min / Max | supported_features |
|---|---|---|---|---|---|---|---|---|
| climate.downstairs | Downstairs | heat_cool | 72 | high 75, low 72 (`temperature` null) | off, heat, cool, heat_cool | °F | 50 / 90 | 387 |
| climate.upstairs | Upstairs | heat_cool | 71 | high 75, low 70 (`temperature` null) | off, heat, cool, heat_cool | °F | 50 / 90 | 387 |

Indoor temperature source for the status strip: the `current_temperature` attribute on each climate entity. `hvac_action` is not present in the attributes, so the status strip cannot show "Idle" from it. Use `hvac_action` only if it appears on a later read, otherwise derive idle from the state and setpoints.

## 4. Lock and garage

| Entity ID | Friendly name | State | Device class | Notes |
|---|---|---|---|---|
| lock.living_room_front_door | Front Door | locked | (none) | Z-Wave (Allegion BE469ZP, via Zooz Stick). Supported features 0. Chip is status only; never bind a service to it (D48) |
| binary_sensor.living_room_front_door_current_status_of_the_door | Front Door Current status of the door | on | door | Door sensor from I30. `on` as reported by HA's door class (open convention); meaning not verified against the physical door |
| cover.general_garage_door_garage_door | Garage Door Garage door | closed (`is_closed` true) | garage | Supported features 3 (open and close). Status only |

Excluded: lock.804_front_door (state unlocked at 2026-11-15 18:59 UTC). Not part of this household; the owner should check it.

## 5. Ring (Front Door doorbell, loaded, no errors)

| Entity ID | Name | State | Notes |
|---|---|---|---|
| event.outdoor_front_door_ding | Front Door Ding | unknown | device_class doorbell. Last state change 2026-11-14 23:02:17 CST (integration reload). No press recorded in 7 days |
| event.outdoor_front_door_motion | Front Door Motion | unknown | device_class motion. No motion recorded in 7 days |
| camera.outdoor_front_door_live_view | Front Door Live view | idle | supported_features 2 (stream). Snapshot returned HTTP 500 on 2026-11-15 |
| sensor.outdoor_front_door_battery | Front Door Battery | 100 | battery |
| sensor.outdoor_front_door_last_activity | Front Door Last activity | 2026-11-15T05:02:39+00:00 (23:02:39 CST 2026-11-14) | category on_demand, answered true |
| switch.outdoor_front_door_in_home_chime | Front Door In-home chime | on | |
| switch.outdoor_front_door_motion_detection | Front Door Motion detection | on | |
| number.outdoor_front_door_volume | Front Door Volume | 8.0 | |
| button.living_room_front_door_ping | Front Door Ping | (timestamp 2026-10-05) | Do not press |

Other Ring-related: event.outdoor_front_door_ding and motion are the doorbell trigger for A1. Garage camera: camera.general_garage_door_camera (idle).

Do not use lock.804 or switch.804 as Ring or door entities.

## 6. Calendar and tasks

- Calendar: no calendar.* entities. CalDAV: not loaded. FamFam: not loaded (pilot pending).
- Tasks: todo.shopping_list (state "0"). Only todo entity.

## 7. Prayer (read only)

| Entity ID | Local time (CST) for 2026-11-15 |
|---|---|
| sensor.living_room_adhan_fajr_prayer | 05:48 |
| sensor.living_room_adhan_sunrise_time | 06:57 |
| sensor.living_room_adhan_dhuhr_prayer | 12:16 |
| sensor.living_room_adhan_asr_prayer | 15:13 |
| sensor.living_room_adhan_maghrib_prayer | 17:34 |
| sensor.living_room_adhan_isha_prayer | 18:43 |
| sensor.living_room_adhan_midnight_time | 00:16 (16 Nov) |

- Next-prayer sensor: none found.
- Calculation method: not readable through the API (the options need the ha_mcp_tools component). Recorded method is ISNA with standard/Shafi Asr (D28). Verify in the integration options UI.
- Adhan automations, helpers and scripts: untouched (input_boolean.adhan_enabled is on; see D34 and the Adhan rules before changing anything).

## 8. Persons, notify, frontend

- Person entities: "Waqar Habib" and "Maham Habib" (MKH person exists, D43/M15). Entity IDs not recorded here; read them with ha_search before use.
- Notify services: notify.mobile_app_waqars_iphone, notify.mobile_app_mahams_iphone, notify.send_message, notify.notify, notify.persistent_notification.
- Lovelace resources (storage mode): `/local/community/nuvio/nuvio.js?v=14169677322310` (module); `/local/habib/habib-cards.js?v=1` (module).
- Dashboards: `habib-home` (title "Habib Home", strategy `custom:nuvio`, sidebar on, non-admin); `nuvio-shared` (admin only, hidden from sidebar). The three new dashboards do not exist yet.

## 9. Media and other entities used by the layout

- Media players (names only; entity IDs not verified in P0, read them with ha_search before use): Living Room HomePod, Bedroom HomePod, Living Room TV, Hatch Media Player.
- Weather entity (name "Weather", state cloudy at read; ID not verified in P0). Sun entity (name "Sun", above_horizon at read; ID not verified in P0).
- Scenes: scene.turn_on_lights, scene.turn_off_lights, scene.away, scene.nursery_hatch_brahms_lullaby, scene.nursery_hatch_brown_noise.
- Automations (Evening): automation.evening_all_lights_on_at_sunset_except_nursery, automation.evening_away_lights_on_for_2_hours_when_no_one_is_home.

## 10. Owner-facing facts (no secrets)

- HA version 2026.11.1 (system_info). The HomeKit bridge firmware is recorded as 2026.10.2 in docs/entities.md; not re-verified.
- No secrets, tokens, PINs or street addresses are recorded in this file.

## 11. Entities used by the live dashboards (iteration 1, 2026-11-16)

- `habib-mkh` (16 entity IDs): all lights except Game Room, Upstairs Guest, Study as tiles (Dresser, Maham's Lamp, Waqar's Lamp; Bookshelf, Changing Table, Nursery Floor Lamp; Buffet, Floor Lamp, Side Table, Console Lamp), the Upstairs and Downstairs groups (members in section 2), `climate.downstairs`, `climate.upstairs` (status chips, tap opens the dialog) and `lock.living_room_front_door` (status only).
- `habib-wh` (18 entity IDs): the MKH set plus `light.game_room`, `light.upstairs_guest`, `light.study_lamp` (tile "Study"), `light.smart_wi_fi_light_switch` (Porch, on and off) and `cover.general_garage_door_garage_door` (status chip only), and two `thermostat` cards for the climate entities.
- Not used on either: Hatch lights, Ring, calendar, media, scenes, any lock or garage control.
- Live config hashes: habib-wh `b29a354a4958b891`, habib-mkh `5b147c2b63ec0fe5`. Exports: `dashboards/habib-wh-2026-11-16-iter1.json`, `dashboards/habib-mkh-2026-11-16-iter1.json`.

## 12. Glass redesign (2026-11-16, D70)

- Both views: theme `Habib Glass`, `max_columns` 4 (WH) and 3 (MKH), `dense_section_placement`. Generator: `dashboards/habib-glass-build.py`. Exports: `dashboards/habib-{wh,mkh}-2026-11-16-glass.json`. Hashes: habib-wh `7ecc07e2887a6c77`, habib-mkh `47794b40818dd448`.
- Added entities (all verified live 2026-11-16 00:50): `weather.forecast_home`, `sun.sun`, `person.waqar_habib`, `person.maham_habib`, the six `sensor.living_room_adhan_*` times, `input_boolean.adhan_enabled` (display only), `media_player.living_room_living_room_homepod`, `media_player.master_bedroom_homepod`, `todo.shopping_list`.
- Lamp art per light is a guess (`art:` key: table-lamp, floor-lamp, desk-lamp, pendant, shelf, nightlight, coach, group). Change it in the config, not in JavaScript.

### 12.1 Fold (2026-11-16, D71, loader v8)
- Any glass card except hero, lamp and label accepts `collapsible: true` (folded by default; `collapsed: false` starts it open). Folded = one 60 px bar: label, one-line summary, chevron. Tap the bar or the chevron in the card header to toggle.
- Summaries: prayer = next prayer, time, countdown and a progress line; climate = each thermostat's current temperature (orange heating, blue cooling); media = playing title and speaker, or "Nothing playing"; list = open item count.
- The fold choice is kept in the browser's localStorage under `habib_fold:<path>:<type>:<title>`; if storage is blocked the card just starts folded.
- Used on habib-wh only (prayer, climate, media, list). habib-mkh has no prayer card. habib-kiosk is not on glass cards.
- Toggling never calls a service (headless click test: 4 cards, 0 calls).

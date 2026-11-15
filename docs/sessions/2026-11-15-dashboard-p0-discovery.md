# Session 2026-11-15: P0 dashboard discovery (read only)

Device: Pi 5 (Claude Terminal). Branch: `main` (pulled; the session started on `feat/evening-lights`, which was left unchanged and clean). Tier 0 run, plus a Tier 1 docs commit. No dashboard, resource, config, entity, automation, integration or service was changed. No service was called. Lock, garage and Adhan were read only.

Prompt: `docs/prompts/pi5/2026-11-15-dashboard-p0-discovery.md` (on `main`, not on the prior branch; `git pull` on the feature branch did not fetch it).

## Numbered findings

1. **Lights, 16 live** (was 17 in older notes). Areas: Living Room 4, Master 3, Nursery 5 (includes the two Hatch lights), Game Room 1, Upstairs Guest 1, Study 1, Outdoor 1 (Porch). No light lacks an area. On: Porch and Hatch Clock. Only the Porch is onoff-only (no brightness). Full table in `docs/dashboard-config.md` section 1.
2. **Groups (dashboard side):** Downstairs 7 (Living Room 4 + Master 3), Upstairs 3, Nursery 3, Hatch 2 excluded, Porch 1 in neither. Sum 16. Owner still chooses where Porch appears.
3. **Climate.** `climate.downstairs`: current 72 °F, setpoints high 75 / low 72, heat_cool, range 50 to 90 °F, features 387. `climate.upstairs`: current 71 °F, setpoints high 75 / low 70. Best source for indoor temperature: the `current_temperature` attribute. `hvac_action` is absent from both, so "Idle" cannot come from it yet. `temperature` (single setpoint) is null because the mode is heat_cool.
4. **Lock and garage.** `lock.living_room_front_door` locked, features 0, no device class. `cover.general_garage_door_garage_door` closed, device class garage, features 3. Door sensor from I30: `binary_sensor.living_room_front_door_current_status_of_the_door` is `on`, device class door. What `on` means physically is not verified.
5. **Ring.** Integration loaded with no errors (one entry; the account title is the owner's email, not recorded). Entities: `event.outdoor_front_door_ding`, `event.outdoor_front_door_motion`, `camera.outdoor_front_door_live_view` (stream feature), `sensor.outdoor_front_door_battery` (100), `sensor.outdoor_front_door_last_activity`, chime, motion-detection switch, volume number. The doorbell has been silent in 7 days of history apart from an integration reload at 23:02 CST on 2026-11-14. **Snapshot test failed:** `ha_get_camera_image` returned HTTP 500 for the live view (the entity exists). Snapshot age not measured. Latency test not run (the protocol is below).
6. **Calendar and tasks.** No `calendar.*` entities. CalDAV and FamFam integrations are not loaded. The only todo entity is `todo.shopping_list`.
7. **Prayer.** Seven `sensor.living_room_adhan_*` sensors (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, Midnight) with sample times in `docs/dashboard-config.md` section 7. No next-prayer sensor. The calculation method cannot be read through the API (needs the ha_mcp_tools component); the recorded value is ISNA with standard Asr (D28). Adhan automations, helpers and scripts were not touched. `input_boolean.adhan_enabled` reads on; this was not changed here. Check it against D34 before any Adhan work.
8. **Frontend and users.** HA version 2026.11.1. Lovelace resources (storage): `nuvio.js` (module) and `/local/habib/habib-cards.js?v=1` (module). Dashboards: `habib-home` (strategy `custom:nuvio`, sidebar, non-admin) and `nuvio-shared` (admin, hidden). **HA users: not read.** No user-list tool is available in this ha-mcp toolset. Person entities "Waqar Habib" and "Maham Habib" exist (MKH person present, D43/M15). Notify services: `notify.mobile_app_waqars_iphone`, `notify.mobile_app_mahams_iphone`.
9. **Editability.** Read the config of `habib-home` (proves read access; it is a strategy dashboard, so no static views). Writes: `ha_config_set_dashboard`, `ha_config_set_dashboard_resource`, `ha_config_delete_dashboard`, `ha_config_delete_dashboard_resource`, `ha_config_set_helper`, `ha_set_entity`. Reads: `ha_config_get_dashboard`, `ha_config_list_dashboard_resources`, `ha_config_list_helpers`. The HA sections-view docs were checked: the sections view is documented. The Raw configuration editor is not on that page. **`window.customCards` was not confirmed:** the contributors card doc does not mention it and points to a separate picker page. Treat it as unverified.
10. **Fully Kiosk.** `fully_kiosk` integration is absent (as expected). The GitHub HEAD test returned HTTP 200 in 0.14 s. The custom resource folder is `/config/www/` (the existing habib cards live in `/config/www/habib/`, served as `/local/habib/`). Lovelace resources can be created through `ha_config_set_dashboard_resource`. Nothing installed.
11. **Apple Home bridge.** Two `homekit` entries loaded: "HASS Bridge:21064" (bridge) and "Front Door" (accessory). The bridge's options cannot be read through the API (they need the ha_mcp_tools component). The documented filter (`docs/entities.md`) is domains `light` and `lock`. **Conflict to resolve:** D37 says the Hatch lights are excluded from the bridge (owner did it 2026-11-03); `docs/entities.md` line 133 says the Hatch lights would be exposed on the next reload. Owner should confirm in Apple Home. **Porch (`light.smart_wi_fi_light_switch`) is a light, so the domain filter would expose it to Apple Home.** The owner should know before the Porch is placed.
12. **Excluded and noted.** `lock.804_front_door` reads **unlocked** (last change 2026-11-15 18:59 UTC). It is outside this household's scope (D35 and the plan) and was not touched. The owner should confirm.

## Facts the component spec needs

- Indoor temperature: `current_temperature` on each `climate.*`. Setpoints are `target_temp_high` and `target_temp_low` (heat_cool). `temperature` is null.
- Light brightness: call `light.turn_on` with `brightness_pct` only for lights whose modes are not `onoff`. Porch is onoff only.
- Light groups are plain entity lists in YAML (CR1). Groups never create HA entities (I37).
- Lock chip: status only, opens the HA dialog, no service bound (D48).
- Doorbell trigger: `event.outdoor_front_door_ding` (device class doorbell). It is `unknown` now with no event_type. Whether its state changes on every press is not yet verified; the latency test must confirm it before A1 relies on it.
- Camera: `camera.outdoor_front_door_live_view` is streaming-capable. Snapshot returned HTTP 500 today; A1 should not depend on the snapshot until the cause is found.
- Dashboard edits: use sections views, `ha_config_set_dashboard`, resources through `ha_config_set_dashboard_resource`.

## Ring press-latency protocol (for the owner, from I35)

Not run in P0. The owner runs it when ready:

1. Owner presses the Ring doorbell 5 times at a steady pace, and writes each press time to the second (their clock, CST).
2. Owner replies in chat with the 5 times, for example "press 1 14:05:10".
3. Claude reads `event.outdoor_front_door_ding` history for those windows (`ha_get_history`, `minimal_response` false) and records each state change time.
4. Claude reports the median seconds from press to state change, and applies the I35 rule: median under about 5 s, build A1; over about 30 s, Ring tab and phone notification only; between, decide with the owner.

## Blockers

- **HA users:** not readable with the available tools. Needed for D43 and the MKH setup. Owner can list users in Settings, People, or it can be read later with a user tool.
- **Camera snapshot HTTP 500** for `camera.outdoor_front_door_live_view`. Check the Ring integration and the HA log before relying on snapshots (A1).
- **Options not readable** for `islamic_prayer_times` and `homekit`. Needs the ha_mcp_tools component or a manual UI check.
- **`window.customCards`** unverified in HA docs.

## Next

- P1 (foundations and dev loop, Tier 2) was **not** run; the prompt asked for P0 only. It is ready to run when the owner says so.
- FamFam (`docs/prompts/pi5/2026-11-15-famfam-integration.md`) runs after P0 and not with P1 (core restart).
- Owner items: confirm Porch placement, Hatch exclusion in Apple Home, the 804 lock state, and the Ring test window.

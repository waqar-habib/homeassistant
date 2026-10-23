# Entity inventory

Generated 2026-10-23 for setup step 1.6 from ha-mcp (entity registry, area registry, device registry, and live state). Re-generate after adding devices.

## Summary

| Item | Count |
|---|---|
| Live entities (have a state in HA now) | 132 |
| Live entities assigned to an area | 94 |
| Live entities with no area | 38 |
| Registry entries matched to the 7 owner areas | 176 (94 live, 82 with no state) |
| Areas defined | 9 (2 floors) |
| Areas with no entities | Kitchen, Formal Living |
| Unavailable | 1 (`media_player.living_room_tv`) |

Notes:
- **Laundry** is an area in HA but was not in the owner's list. It is listed below.
- **No state** means the entity is in the registry but has no live state. These are disabled by their integration (`disabled_by: integration`), mostly Z-Wave and Matter diagnostic entities. They are not stale.
- Live entities are listed with their live state. Integration is the platform from the device registry.

## HomePod media players

| Entity | Area | Integration | State | Notes |
|---|---|---|---|---|
| `media_player.living_room_living_room_homepod` | Living Room | apple_tv | playing | Remote counterpart: `remote.living_room_living_room_homepod` |
| `media_player.master_bedroom_homepod` | Master | apple_tv | idle | Remote counterpart: `remote.master_bedroom_homepod` |

## Living Room (22 live)

| Entity | Friendly name | Domain | Integration | State |
|---|---|---|---|---|
| `binary_sensor.living_room_front_door_current_status_of_the_door` | Front Door Current status of the door | binary_sensor | zwave_js | on |
| `binary_sensor.living_room_front_door_lock_jammed` | Front Door Lock jammed | binary_sensor | zwave_js | off |
| `binary_sensor.living_room_front_door_keypad_temporary_disabled` | Front Door Keypad temporary disabled | binary_sensor | zwave_js | off |
| `binary_sensor.living_room_front_door_intrusion` | Front Door Intrusion | binary_sensor | zwave_js | off |
| `binary_sensor.living_room_front_door_replace_battery_soon` | Front Door Replace battery soon | binary_sensor | zwave_js | off |
| `binary_sensor.living_room_front_door_replace_battery_now` | Front Door Replace battery now | binary_sensor | zwave_js | off |
| `binary_sensor.living_room_front_door_system_hardware_failure` | Front Door System hardware failure | binary_sensor | zwave_js | off |
| `button.living_room_front_door_ping` | Front Door Ping | button | zwave_js | last pressed 2026-10-05 |
| `light.buffet` | Buffet | light | aidot | off |
| `light.console_lamp` | Console Lamp | light | aidot | off |
| `light.floor_lamp` | Floor Lamp | light | aidot | off |
| `light.side_table` | Side Table | light | aidot | off |
| `lock.living_room_front_door` | Front Door | lock | zwave_js | locked |
| `media_player.living_room_living_room_homepod` | Living Room HomePod | media_player | apple_tv | playing |
| `remote.living_room_living_room_homepod` | Living Room HomePod | remote | apple_tv | on |
| `select.living_room_front_door_current_lock_mode` | Current lock mode | select | zwave_js | Secured |
| `sensor.living_room_front_door_node_status` | Node status | sensor | zwave_js | alive |
| `sensor.living_room_front_door_battery_level` | Battery level | sensor | zwave_js | 98.0 |
| `sensor.800_series_long_range_usb_controller_status` | Zooz Stick Status | sensor | zwave_js | ready |
| `update.living_room_front_door_firmware` | Front Door Firmware | update | zwave_js | off |
| `update.800_series_long_range_usb_controller_firmware` | Zooz Stick Firmware | update | zwave_js | off |
| `update.hacs_update` | HACS Update | update | hacs | off |

## Master (26 live)

| Entity | Friendly name | Domain | Integration | State |
|---|---|---|---|---|
| `media_player.master_bedroom_homepod` | Bedroom HomePod | media_player | apple_tv | idle |
| `remote.master_bedroom_homepod` | Bedroom HomePod | remote | apple_tv | on |
| `binary_sensor.dresser_cloud_connection` | Dresser Cloud connection | binary_sensor | tplink | on |
| `binary_sensor.dresser_overheated` | Dresser Overheated | binary_sensor | tplink | off |
| `binary_sensor.mahams_lamp_cloud_connection` | Maham's Lamp Cloud connection | binary_sensor | tplink | on |
| `binary_sensor.mahams_lamp_overheated` | Maham's Lamp Overheated | binary_sensor | tplink | off |
| `binary_sensor.waqars_lamp_cloud_connection` | Waqar's Lamp Cloud connection | binary_sensor | tplink | on |
| `binary_sensor.waqars_lamp_overheated` | Waqar's Lamp Overheated | binary_sensor | tplink | off |
| `light.dresser` | Dresser | light | tplink | off |
| `light.mahams_lamp` | Maham's Lamp | light | tplink | off |
| `light.waqars_lamp` | Waqar's Lamp | light | tplink | off |
| `number.dresser_smooth_on` | Dresser Smooth on | number | tplink | 1 |
| `number.dresser_smooth_off` | Dresser Smooth off | number | tplink | 1 |
| `number.mahams_lamp_smooth_on` | Maham's Lamp Smooth on | number | tplink | 2 |
| `number.mahams_lamp_smooth_off` | Maham's Lamp Smooth off | number | tplink | 2 |
| `number.waqars_lamp_smooth_on` | Waqar's Lamp Smooth on | number | tplink | 2 |
| `number.waqars_lamp_smooth_off` | Waqar's Lamp Smooth off | number | tplink | 2 |
| `select.dresser_light_preset` | Dresser Light preset | select | tplink | Not set |
| `select.mahams_lamp_light_preset` | Maham's Lamp Light preset | select | tplink | Not set |
| `select.waqars_lamp_light_preset` | Waqar's Lamp Light preset | select | tplink | Not set |
| `sensor.dresser_signal_level` | Dresser Signal level | sensor | tplink | 3 |
| `sensor.mahams_lamp_signal_level` | Maham's Lamp Signal level | sensor | tplink | 3 |
| `sensor.waqars_lamp_signal_level` | Waqar's Lamp Signal level | sensor | tplink | 3 |
| `switch.dresser_auto_update_enabled` | Dresser Auto-update enabled | switch | tplink | on |
| `switch.mahams_lamp_auto_update_enabled` | Maham's Lamp Auto-update enabled | switch | tplink | on |
| `switch.waqars_lamp_auto_update_enabled` | Waqar's Lamp Auto-update enabled | switch | tplink | on |

## Nursery (17 live)

| Entity | Friendly name | Domain | Integration | State |
|---|---|---|---|---|
| `binary_sensor.changing_table_cloud_connection` | Changing Table Cloud connection | binary_sensor | tplink | on |
| `binary_sensor.changing_table_overheated` | Changing Table Overheated | binary_sensor | tplink | off |
| `binary_sensor.nursery_floor_lamp_cloud_connection` | Nursery Floor Lamp Cloud connection | binary_sensor | tplink | on |
| `binary_sensor.nursery_floor_lamp_overheated` | Nursery Floor Lamp Overheated | binary_sensor | tplink | off |
| `light.bookshelf` | Bookshelf | light | aidot | off |
| `light.changing_table` | Changing Table | light | tplink | off |
| `light.nursery_floor_lamp` | Nursery Floor Lamp | light | tplink | off |
| `number.changing_table_smooth_on` | Changing Table Smooth on | number | tplink | 1 |
| `number.changing_table_smooth_off` | Changing Table Smooth off | number | tplink | 1 |
| `number.nursery_floor_lamp_smooth_on` | Nursery Floor Lamp Smooth on | number | tplink | 2 |
| `number.nursery_floor_lamp_smooth_off` | Nursery Floor Lamp Smooth off | number | tplink | 2 |
| `select.changing_table_light_preset` | Changing Table Light preset | select | tplink | Not set |
| `select.nursery_floor_lamp_light_preset` | Nursery Floor Lamp Light preset | select | tplink | Not set |
| `sensor.changing_table_signal_level` | Changing Table Signal level | sensor | tplink | 3 |
| `sensor.nursery_floor_lamp_signal_level` | Nursery Floor Lamp Signal level | sensor | tplink | 3 |
| `switch.changing_table_auto_update_enabled` | Changing Table Auto-update enabled | switch | tplink | on |
| `switch.nursery_floor_lamp_auto_update_enabled` | Nursery Floor Lamp Auto-update enabled | switch | tplink | on |

## Formal Living (0 entities)

No entities are assigned to this area.

## Kitchen (0 entities)

No entities are assigned to this area.

## Game Room (1 live)

| Entity | Friendly name | Domain | Integration | State |
|---|---|---|---|---|
| `light.game_room` | Game Room | light | aidot | off |

## Upstairs Guest (6 live)

| Entity | Friendly name | Domain | Integration | State |
|---|---|---|---|---|
| `light.upstairs_guest` | Upstairs Guest | light | aidot | off |
| `light.upstairs_guest_guest_nightstand` | Guest Nightstand | light | switch_as_x | off |
| `switch.upstairs_guest_guest_nightstand` | Guest Nightstand | switch | matter | off |
| `button.smart_plug_identify_2` | Guest Nightstand Identify | button | matter | unknown |
| `select.smart_plug_power_on_behavior_2` | Guest Nightstand Power-on behavior | select | matter | previous |
| `update.smart_plug_firmware_2` | Guest Nightstand Firmware | update | matter | off |

## Study (6 live)

| Entity | Friendly name | Domain | Integration | State |
|---|---|---|---|---|
| `light.study_lamp` | Nightstand | light | aidot | off |
| `light.study_study_floor_lamp` | Study Floor Lamp | light | switch_as_x | off |
| `switch.study_study_floor_lamp` | Study Floor Lamp | switch | matter | off |
| `button.smart_plug_identify` | Study Floor Lamp Identify | button | matter | last pressed 2026-10-22 |
| `select.smart_plug_power_on_behavior` | Study Floor Lamp Power-on behavior | select | matter | previous |
| `update.smart_plug_firmware` | Study Floor Lamp Firmware | update | matter | off |

## Laundry (16 live, not in the owner's list)

| Entity | Friendly name | Domain | Integration | State |
|---|---|---|---|---|
| `vacuum.milos_poop_can_litter_box` | Milo's Poop Can Litter box | vacuum | litterrobot | docked |
| `switch.milos_poop_can_panel_lockout` | Milo's Poop Can Panel lockout | switch | litterrobot | off |
| `update.milos_poop_can_firmware` | Milo's Poop Can Firmware | update | litterrobot | off |
| `button.milos_poop_can_reset` | Milo's Poop Can Reset | button | litterrobot | unknown |
| `select.milos_poop_can_clean_cycle_wait_time_minutes` | Milo's Poop Can Clean cycle wait time minutes | select | litterrobot | unknown |
| `select.milos_poop_can_globe_brightness` | Milo's Poop Can Globe brightness | select | litterrobot | high |
| `select.milos_poop_can_globe_light` | Milo's Poop Can Globe light | select | litterrobot | auto |
| `select.milos_poop_can_panel_brightness` | Milo's Poop Can Panel brightness | select | litterrobot | low |
| `sensor.milos_poop_can_waste_drawer` | Milo's Poop Can Waste drawer | sensor | litterrobot | 22 |
| `sensor.milos_poop_can_sleep_mode_start_time` | Milo's Poop Can Sleep mode start time | sensor | litterrobot | unknown |
| `sensor.milos_poop_can_sleep_mode_end_time` | Milo's Poop Can Sleep mode end time | sensor | litterrobot | unknown |
| `sensor.milos_poop_can_last_seen` | Milo's Poop Can Last seen | sensor | litterrobot | 2026-10-21 13:19 |
| `sensor.milos_poop_can_status_code` | Milo's Poop Can Status code | sensor | litterrobot | rdy |
| `sensor.milos_poop_can_hopper_status` | Milo's Poop Can Hopper status | sensor | litterrobot | unknown |
| `sensor.milos_poop_can_litter_level` | Milo's Poop Can Litter level | sensor | litterrobot | 90.0 |
| `sensor.milos_poop_can_pet_weight` | Milo's Poop Can Pet weight | sensor | litterrobot | 13.43 |

## No area (38 live) — flagged

These entities have no area. Assign an area in the entity or device registry if they should appear under one of the rooms above.

| Entity | Friendly name | Domain | Integration | State | Flag |
|---|---|---|---|---|---|
| `media_player.living_room_tv` | Living Room TV | media_player | cast | unavailable | **Unavailable and no area** |
| `climate.upstairs` | Upstairs | climate | matter | cool | Nest thermostat, no area |
| `climate.downstairs` | Downstairs | climate | matter | cool | Nest thermostat, no area |
| `switch.nest_thermostat` | Nest Thermostat | switch | matter | on | |
| `switch.nest_thermostat_2` | Nest Thermostat | switch | matter | on | |
| `sensor.nest_thermostat_temperature` | Nest Thermostat Temperature | sensor | matter | 74.588 | |
| `sensor.nest_thermostat_temperature_2` | Nest Thermostat Temperature | sensor | matter | 74.57 | |
| `button.nest_thermostat_identify` | Nest Thermostat Identify | button | matter | unknown | |
| `button.nest_thermostat_identify_2` | Nest Thermostat Identify | button | matter | unknown | |
| `sun.sun` | Sun | sun | sun | below_horizon | |
| `sensor.sun_next_dawn` | Sun Next dawn | sensor | sun | 2026-10-24 05:46 | |
| `sensor.sun_next_dusk` | Sun Next dusk | sensor | sun | 2026-10-24 17:02 | |
| `sensor.sun_next_midnight` | Sun Next midnight | sensor | sun | 2026-10-23 23:24 | |
| `sensor.sun_next_noon` | Sun Next noon | sensor | sun | 2026-10-24 11:24 | |
| `sensor.sun_next_rising` | Sun Next rising | sensor | sun | 2026-10-24 06:21 | |
| `sensor.sun_next_setting` | Sun Next setting | sensor | sun | 2026-10-24 16:26 | |
| `event.backup_automatic_backup` | Backup Automatic backup | event | backup | 2026-10-23 09:54 | |
| `sensor.backup_backup_manager_state` | Backup Backup Manager state | sensor | backup | idle | |
| `sensor.backup_next_scheduled_automatic_backup` | Backup Next scheduled automatic backup | sensor | backup | 2026-10-24 09:50 | |
| `sensor.backup_last_successful_automatic_backup` | Backup Last successful automatic backup | sensor | backup | 2026-10-23 09:54 | |
| `sensor.backup_last_attempted_automatic_backup` | Backup Last attempted automatic backup | sensor | backup | 2026-10-23 09:54 | |
| `device_tracker.waqars_iphone` | Waqar's iPhone | device_tracker | mobile_app | not_home | |
| `notify.waqars_iphone` | Waqar's iPhone | notify | mobile_app | unknown | |
| `person.waqar_habib` | Waqar Habib | person | (no device) | not_home | |
| `zone.home` | Home | zone | (no device) | 0 | |
| `todo.shopping_list` | Shopping list | todo | (no device) | 0 | |
| `conversation.home_assistant` | Home Assistant | conversation | (no device) | unknown | |
| `tts.google_translate_en_com` | Google Translate en com | tts | google_translate | unknown | |
| `binary_sensor.raspberry_pi_power_status` | Raspberry Pi Power status | binary_sensor | rpi_power | off | |
| `update.raspberry_pi_5_firmware` | Raspberry Pi 5 Firmware | update | raspberry_pi | off | |
| `update.home_assistant_core_update` | Home Assistant Core Update | update | hassio | off | |
| `update.home_assistant_supervisor_update` | Home Assistant Supervisor Update | update | hassio | off | |
| `update.home_assistant_operating_system_update` | Home Assistant Operating System Update | update | hassio | off | |
| `update.matter_server_update` | Matter Server Update | update | hassio | off | |
| `update.z_wave_js_update` | Z-Wave JS Update | update | hassio | on | Update available |
| `update.get_hacs_update` | Get HACS Update | update | hassio | off | |
| `update.claude_terminal_pro_update` | Claude Terminal Pro Update | update | hassio | off | |
| `update.home_assistant_mcp_server_update` | Home Assistant MCP Server Update | update | hassio | off | |

Unassigned entries with no state (disabled by their integration) are not listed here. They appear per device in the entity registry. They include the Home Assistant host, Core, and Supervisor diagnostic sensors, the Waqar's iPhone sensors other than those above, the Z-Wave JS, Matter Server, Get HACS, Claude Terminal Pro, and MCP Server diagnostics, the Nest diagnostic sensors, and the `light.unk_1` and `light.unk_2` lights.

## Apple Home connection method (I7)

| Device | How HA connects | Evidence |
|---|---|---|
| Living Room HomePod, Bedroom HomePod (HomePod Mini) | **Apple TV integration** (`apple_tv`) | Two `media_player` and `remote` entities per HomePod |
| Nest Thermostat (2 units) | **Matter** (`matter`), through the Matter Server add-on. Shared with Apple Home (multi-admin) | Matter fabrics on one unit: Apple Home, Apple Keychain, Home Assistant, Google |
| Leedarson smart plugs (Study Floor Lamp, Guest Nightstand) | **Matter** (`matter`). Shared with Apple Home (multi-admin) | Matter fabrics on the Study plug: Apple Home, Apple Keychain, Home Assistant. `switch_as_x` light helpers sit on top |
| Front Door lock (Allegion BE469ZP) | Z-Wave JS (`zwave_js`) through the Zooz Stick. Exported to Apple Home twice: by the HomeKit Bridge (lock domain) and as the "Front Door" accessory | `lock.living_room_front_door`; `homekit` entries "HASS Bridge:21064" (mode `bridge`) and "Front Door" (mode `accessory`) |

Findings:
- **No HomeKit Device pairings.** There are no `homekit_controller` config entries. HA does not pull any device in through HomeKit Device pairing.
- **HomeKit Bridge (HA to Apple Home).** The bridge's filter is domains `light` and `lock`, with no entity or exclude lists. It exposes 16 entities: all 15 lights and the lock. The HomePods, Nest thermostats, and smart-plug switches are not in those domains, so they are not bridged.
- **Duplicates in Apple Home.** The two Matter-backed `switch_as_x` lights (`light.study_study_floor_lamp`, `light.upstairs_guest_guest_nightstand`) are also in Apple Home through Matter. The bridge exposes them as lights too. The lock is exposed twice, by the bridge and by the "Front Door" accessory.
- **Not checked.** The TP-Link and aidot lights are not Matter or HomeKit devices in HA. Whether either is HomeKit-native is not verified here.
- **Proposed fix (not applied).** Remove the two Matter plug lights from the bridge. Drop the lock domain from the bridge so the "Front Door" accessory alone exposes the lock. This is a Tier 3 change (HomeKit Bridge reload) and waits for owner GREEN LIGHT. Full detail is in `docs/issues.md` (I7).

## Open items

1. `media_player.living_room_tv` is unavailable and has no area. Check whether the onn box is powered and on the network, then assign an area.
2. Assign areas to the no-area entities above, starting with the Nest thermostats and the Waqar's iPhone sensors.
3. Kitchen and Formal Living have no entities. Add devices there or remove the areas.
4. I7: get GREEN LIGHT for the bridge change above, then check Apple Home for duplicates.

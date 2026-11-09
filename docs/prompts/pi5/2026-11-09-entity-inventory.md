# Prompt: Pi 5 entity inventory per area (read-only), input for the dashboard design

Target: pi5
Date: 2026-11-09
Tier: 0 (read-only) plus Tier 1 (one docs commit). No restart, reload, config, dashboard or install change.
GREEN LIGHT: not needed

Gap from `docs/sessions/2026-11-08-pi5-status-sync.md` section 5: per-entity area, HomeKit exposure and the two front-door locks were not read.

```
Read docs/sessions/2026-11-08-pi5-status-sync.md section 5. Read only; change nothing. Use ha-mcp template rendering (ha_eval_template or Developer Tools equivalent) so areas are exact. If a read is blocked, say which and continue.

1. For EVERY area (Living Room, Kitchen, Master, Nursery, Formal Living, Laundry, General, Game Room, Upstairs Guest, Study) and for "no area": list entities with entity_id, friendly name, domain, state, device_class and whether it is disabled or hidden. Template idea: area_entities('<area_id>') then states[...]. For "no area", loop over states and keep entities where area_id(e) is none. Skip pure diagnostic/config entities (update, button, number, select, sensor with entity_category diagnostic) but give counts of what was skipped per area.
2. For lights: area, friendly name, whether the name is unique and readable on a phone (flag names over 18 characters or duplicates), supported color modes (brightness, color temp, color).
3. Locks: `lock.living_room_front_door` vs `lock.804_front_door`: which is the real front door, are they the same device, which is exposed to HomeKit, what is each one's device and integration. Same for the two HomePods and the two thermostats (area of each, current and target temperature, hvac modes).
4. HomeKit Bridge exposure: which entities the HASS Bridge exposes (domain filter light and lock, exclusions for Hatch, I23). Report the list of exposed entity_ids.
5. Other dashboard-relevant domains: cameras and doorbell (Ring), covers, fans, switches (names, areas), binary_sensors for doors, windows and motion, weather entities, person entities and device trackers, the prayer sensors, input_boolean helpers, and which media_players exist beyond the HomePods.
6. The unknown `homedeck` custom component (custom_components/homedeck, modified 2026-11-08 23:50) and its `update.homedeck_update`: what is it (manifest.json name, version, documentation URL), does it expose any dashboard, panel or card? Read only; do not enable, disable or update it. Also say how it got there (marketplace install?) if the HA log or HACS/marketplace records show it.
7. Scenes: for each of the 7 scenes, its state and why 5 are unavailable (which entity is missing). Read only.
8. Write docs/sessions/2026-11-09-entity-inventory.md: one table per area with the columns above, the lock/HomePod/thermostat findings, the HomeKit list, the homedeck finding. No secrets. Commit as docs(session): entity inventory for dashboard design and push to main (git pull --rebase first). Reply with the commit ID and a 6-line summary, including anything surprising.
```

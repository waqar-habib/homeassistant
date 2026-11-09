# Prompt: Pi 5 owner decisions D42 (scenes, lock, homedeck, notifications)

Target: pi5
Date: 2026-11-09
Tier: mixed, see each step. Scope is only what the owner approved in D42 (docs/decisions.md).
GREEN LIGHT: given in chat 2026-11-09 for: deleting the homedeck custom component (h), scenes (c), automations (i), notifications (j). Nothing else.

```
Read HANDOFF.md, docs/decisions.md (D42, D43) and docs/dashboard-design.md. Do not touch dashboards (the redesign is not approved yet). Stop and report on any error.

1. homedeck (GREEN LIGHT): record its manifest.json (name, version, source) and any entities it creates. Back up first: ha backups new --name "pre-homedeck-remove". Then remove the integration (Settings > Devices and services, delete, or the matching ha tool). Confirm: custom_components/homedeck gone, no homedeck entities, ha core check valid. Restart only if the integration cannot be removed without one, and stop to report first.
2. Scenes (GREEN LIGHT c): create scene.turn_on_lights (turns on all lights), scene.turn_off_lights (turns off all lights), scene.away (created with NO entities for now). Verify each via ha-mcp. Do not reference entities you have not read from the registry.
3. Automations (GREEN LIGHT i): before writing, read the registry for the sunset trigger (sun.sun) and person entities. If no person or presence entity exists that reports "nobody home", STOP for this automation and report. Otherwise:
   a. Evening: at sun.sun below_horizon (sunset), if any person is home, turn on all lights in areas except Nursery. Exclude Nursery by entity list read from the registry, not by name guessed.
   b. Away (light list from D43): Dresser (Master area), Floor Lamp (Nursery), Console Lamp and Side Table (Living Room), Game Room light (Game Room), Upstairs Guest light (Upstairs Guest), Nightstand (Study). Map each to its HA light entity from the registry; report any Apple name that maps to zero or several entities and stop on that one. Hatch lights are NOT included.
   c. Away off: 2 hours after Away turns on, if nobody is home, turn off the same lights. Do NOT enable this until MKH is in the zones, or the owner confirms in writing that the risk is accepted (D43).
   Create automations disabled first; enable only after a trace check. Report each trace.
4. Notifications (GREEN LIGHT j): an automation that notifies notify.waqars_iphone on front door lock or unlock (lock.living_room_front_door), and on lights turning on or off while nobody is home. Use the existing notify service. Limit: one notification per 5 minutes per light group to avoid spam. Confirm with a test notification only after the owner says yes.
5. HANDOFF.md: confirm the Adhan line matches D42. Commit docs as docs(session) and push to main after git pull --rebase.
6. Write docs/sessions/2026-11-09-d42-owner-decisions.md with each step, its result, entity IDs created, traces checked, and anything skipped. No secrets. Reply with the commit ID.
```

Target: pi5
Date: 2026-11-15
Tier: 3 (door lock and garage door automations, zones, helpers)
GREEN LIGHT: NOT GIVEN for the build. Steps 1 and 2 are Tier 0 (read only) and may run now. Step 3 onward needs the owner to write "GREEN LIGHT arrival automations" in chat; the standing GREEN LIGHT (D53) and D35 explicitly exclude lock, unlock and garage actions. The file may record only a GREEN LIGHT the owner actually gave.

Owner request, 2026-11-15 13:38 CST (D60): geofenced automations that unlock when either the owner or MKH arrives within a small radius, for (a) a separate family property the owner has access to (`lock.804_front_door`, kept apart from the household) and (b) the garage door at the primary house. Dependency: proper Zones in HA.

```
Read HANDOFF.md, D35, D42, D43, D53, D60, I40, I41, I43 and docs/dashboard-config.md. Stop and report if the GREEN LIGHT line in this file's header does not contain the owner's quote for step 3 onward. Never write coordinates, street addresses, tokens or lock codes into any file, commit or chat (the repo is public until D25). Never touch Adhan, the HomeKit Bridge, the habib dashboards, or any lock or garage service call before step 3 is approved.

1. Tier 0 pre-checks. git checkout main, git pull --rebase, ha core check.
   a. MKH is onboarded (D43, M15): her person entity exists, its device_tracker comes from mobile_app, and it updated recently. Report each person's tracker age in minutes. Stop if MKH is missing.
   b. Read states of lock.living_room_front_door, cover.general_garage_door_garage_door, lock.804_front_door, and report, for lock.804_front_door, which integration provides it (config entry domain) and how HA reaches it (Z-Wave radio range from this Pi, or a cloud account). I cannot confirm this; report it as found.
   c. List every zone: entity ID, name, radius, passive flag. No coordinates.
   d. Check whether the geofencing helpers from docs/prompts/pi5/2026-10-30-geofencing.md exist (input_boolean.geofence_live, binary_sensor.anyone_home, binary_sensor.everyone_away) and whether that prompt ran.
2. Write docs/sessions/2026-11-15-arrival-prechecks.md with the findings, commit (Tier 1) and push to main. If zones are missing, STOP and report the owner steps below. Wait for the owner.

Owner steps (HA UI, Settings, Areas, labels and zones, Zones). Coordinates go only in the UI:
   - Add zone "Arrival Home" at the primary house. Add zone "Arrival Second Property" at the other property. Passive OFF. Radius: owner's choice; assumption: start near 150 m and tune after the dry run, because phone location accuracy varies and I cannot confirm what radius is reliable for this phone and area.
   - The existing "Near Home" 3-mile zone (geofencing prompt) is a different zone and is not changed.

3. (Needs "GREEN LIGHT arrival automations".) ha backups new --name "pre-arrival". Branch feat/arrival. Build in notify-only mode:
   - Helper input_boolean.arrival_live, created OFF. While OFF every automation only sends a notification saying what it would do. Never turn it ON; the owner does.
   - Arming (anti-jitter): a person is armed for a zone only after being outside that zone for at least 10 minutes. The trigger is that person entering the zone while armed. At most one action per person per zone per 30 minutes.
   - Second property: on trigger, if lock.804_front_door is locked, and person states are not unknown or unavailable, call lock.unlock only when arrival_live is ON; notify both phones either way. No auto-relock changes.
   - Primary garage: on trigger, if cover.general_garage_door_garage_door is closed, call cover.open_cover only when arrival_live is ON; notify both phones. If the garage is still open 15 minutes later, notify both phones (no automatic close).
   - Failure: any unavailable lock, cover or tracker means no action and a notification.
   - ha core check, reload automations (no restart), verify traces by firing each trigger with a test notification only.
4. Dry run: leave arrival_live OFF. After 3 real arrivals per person per zone, report from the notifications: trigger distance, delay, false triggers. Commit, merge to main after verification. The owner decides when to turn arrival_live ON.

Risks (best / base / worst):
   Best: triggers 1 to 2 minutes before the door, no false events. Base: the radius needs tuning after the dry run. Worst: a stale or spoofed location unlocks a door while nobody is there; mitigations are the arming rule, the notify-only phase, the owner-only switch, and notifications to both phones.

Rollback: turn arrival_live OFF, disable the automations, or revert the commit and reload; restore backup pre-arrival as the last resort. The owner can also remove the zones.
```

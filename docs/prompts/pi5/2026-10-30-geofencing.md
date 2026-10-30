# Prompt: Geofencing, thermostats and Evening (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-10-30
Tier: 3 (automations, thermostat setpoints)
GREEN LIGHT: yes, expanded (D35). Owner, 2026-10-30: "Let's expand the GREEN LIGHT permissions to allow CRUD on automations and thermostat changes; NOT the front door lock; this expanded allow list also includes geofencing set up." Does not cover the front door lock or anything Adhan (D34).

Milestone: M16. Decisions: D31, D32, D35.

## Run this only when

1. **MKH is onboarded (M15).** She has a simple (non-admin) HA user, the HA app on her iPhone with location set to Always and precise location on, and a `person` entity linked to her `device_tracker.*` from `mobile_app`. The prompt stops if this is not true. One person is not "everyone"; a one-person definition would drop both thermostats to 78F while she is home.
2. **The scenes prompt has run** (`scene.evening` exists).
3. **The owner created the zone** (owner steps below).
4. Apple Home automations that touch either thermostat or the lights are disabled, so two systems do not fight.

## Owner steps (manual, in the HA UI)

1. Settings, Areas, labels and zones, Zones, Add zone. Name: `Near Home`. Place the pin on the home location (do not type coordinates into chat or files; the repo is public until D25). Radius: 4828 m (about 3 miles). Turn **Passive** ON so people still show as `not_home` while inside it.
2. Give Claude the MKH person entity ID (for example `person.<name>`; read it from Settings, People).

## Design

| Item | Setting |
|---|---|
| Helpers | `input_boolean.geofence_live` (created OFF). While OFF, the automations only send a notification saying what they would do |
| `binary_sensor.everyone_away` | ON only if neither person is `unknown` or `unavailable` and neither is `home` (fails safe) |
| `binary_sensor.anyone_home` | ON if either person is `home` |
| Away AC | `everyone_away` ON for 10 minutes. Both thermostats to 78F, only if both are in `cool` mode |
| Cool Down | First person to enter `zone.near_home` while `anyone_home` is OFF. `climate.downstairs` to 75F, only if in `cool` mode. At most once per hour |
| Evening | At sunset, if `anyone_home` is ON: `scene.evening` (all lights except the 3 Nursery lights). No auto-off. Acts immediately, not gated by `geofence_live` |
| Away Evening | Not in this prompt. Waits for the owner's light picks |
| Notify | `notify.waqars_iphone` |
| Never touched | the front door lock, the Adhan package, any dashboard |

## Assumptions and risks

| # | Item | Risk |
|---|---|---|
| 1 | iOS reports location late or skips an update | A late trigger. Mitigated by the 10 minute debounce and a 3 mile zone |
| 2 | Passive zone and zone triggers | A zone trigger should still fire for a passive zone. If a real drive shows it does not, set the zone non-passive and trigger on the person's state instead |
| 3 | Nests are in Matter multi-admin with Apple Home | A second system can overwrite setpoints. Disable the Apple Home automations (precondition 4) |
| 4 | Nest hvac modes other than `cool` | `temperature` may be rejected in auto mode. The automations skip and notify instead of changing the mode |
| 5 | Upstairs stays at 78F after return | Cool Down only sets downstairs, per D32. Raise it if upstairs should come back down too |
| 6 | Remote access ends (Nabu Casa trial, D26) | The app can no longer report location from outside, and Away AC will never fire. Keep remote access up while this is live |
| 7 | Both Nests shown as "No room" | Harmless to the automations; fix areas separately |

Outcomes:
- **Best:** everything loads, dry-run notifications read correctly in manual tests, and a real drive triggers Cool Down.
- **Base:** one trigger needs a tweak (zone passive or timing). Fix on the branch and retest in notify-only mode.
- **Worst:** a wrong setpoint or a false "everyone away". Turn `geofence_live` OFF, disable the automation, revert the branch.

Rollback: `input_boolean.geofence_live` OFF, then disable the automations, or revert the commit and reload. The `pre-geofencing` backup is the last resort.

## Prompt body

```
Resume from HANDOFF.md. Task: set up geofencing (docs/prompts/pi5/2026-10-30-geofencing.md).
Tier 3 with the owner's expanded GREEN LIGHT (D35): automations and thermostat changes
allowed, geofencing included. The front door lock and anything Adhan are NOT allowed.
If that GREEN LIGHT quote is missing from the file header, stop and report.

HARD RULES for this run:
- Never touch lock.living_room_front_door or its entities. Never touch packages/adhan.yaml
  or anything Adhan or media_player.
- Do NOT turn input_boolean.geofence_live ON. Leave it OFF; the owner decides.
- Do not call climate.set_temperature or climate.set_hvac_mode directly. Setpoints change only
  through the automations, and only when geofence_live is ON.
- No restarts. Never read or print secrets.yaml. Never edit .storage/. Never put the home
  coordinates in any file.
- If any step fails or surprises you, stop and report; do not improvise.

1. Pre-checks (Tier 0):
   - git pull; confirm this file is at HEAD.
   - ha core info and ha core check. Core running, no errors.
   - claude mcp list. If ha-mcp is not connected, tell the owner; entity checks then come from
     Developer Tools, States.
   - Read-only checks (rule 9, never guess IDs):
     a. person.waqar_habib exists. The MKH person entity (the owner supplied the ID) exists,
        and its device_tracker is from mobile_app and has a recent update.
        If MKH is missing or has no tracker: STOP and report. Do not continue with one person.
     b. zone.near_home exists with radius about 4828 m, Passive ON. Report radius and passive
        (never the coordinates).
     c. scene.evening exists.
     d. climate.upstairs and climate.downstairs: report hvac_mode, hvac_modes and
        the temperature attribute names. Confirm the unit system is imperial (values near 74).
     e. notify.waqars_iphone exists.

2. Back up first: ha backups new --name "pre-geofencing". Confirm it exists.

3. Branch: git switch -c feat/geofencing

4. Write packages/geofencing.yaml. Use this draft. Replace <MKH> with the real person entity
   ID. Adjust syntax only if ha core check requires it, and report any change.

   input_boolean:
     geofence_live:
       name: Geofence live (off = notify only)
       icon: mdi:map-marker-radius

   template:
     - binary_sensor:
         - name: Everyone away
           unique_id: everyone_away
           state: >-
             {% set s = [states('person.waqar_habib'), states('<MKH>')] %}
             {{ (s | select('in', ['unknown','unavailable']) | list | length == 0)
                and (s | select('eq', 'home') | list | length == 0) }}
         - name: Anyone home
           unique_id: anyone_home
           state: "{{ is_state('person.waqar_habib', 'home') or is_state('<MKH>', 'home') }}"

   automation:
     - id: away_ac
       alias: Away AC
       mode: single
       triggers:
         - trigger: state
           entity_id: binary_sensor.everyone_away
           to: "on"
           for: "00:10:00"
       conditions:
         - condition: template
           value_template: >-
             {{ is_state('climate.upstairs', 'cool') and is_state('climate.downstairs', 'cool') }}
       actions:
         - choose:
             - conditions:
                 - condition: state
                   entity_id: input_boolean.geofence_live
                   state: "on"
               sequence:
                 - action: climate.set_temperature
                   target:
                     entity_id:
                       - climate.upstairs
                       - climate.downstairs
                   data:
                     temperature: 78
                 - action: notify.send_message
                   target:
                     entity_id: notify.waqars_iphone
                   data:
                     message: "Away AC: both thermostats set to 78F"
           default:
             - action: notify.send_message
               target:
                 entity_id: notify.waqars_iphone
               data:
                 message: "DRY RUN Away AC: would set both thermostats to 78F"

     - id: cool_down
       alias: Cool Down
       mode: single
       triggers:
         - trigger: zone
           entity_id:
             - person.waqar_habib
             - <MKH>
           zone: zone.near_home
           event: enter
       conditions:
         - condition: state
           entity_id: binary_sensor.anyone_home
           state: "off"
         - condition: template
           value_template: >-
             {{ is_state('climate.downstairs', 'cool') and
                (this.attributes.last_triggered is none or
                 (now() - this.attributes.last_triggered).total_seconds() > 3600) }}
       actions:
         - choose:
             - conditions:
                 - condition: state
                   entity_id: input_boolean.geofence_live
                   state: "on"
               sequence:
                 - action: climate.set_temperature
                   target:
                     entity_id: climate.downstairs
                   data:
                     temperature: 75
                 - action: notify.send_message
                   target:
                     entity_id: notify.waqars_iphone
                   data:
                     message: "Cool Down: downstairs set to 75F"
           default:
             - action: notify.send_message
               target:
                 entity_id: notify.waqars_iphone
               data:
                 message: "DRY RUN Cool Down: would set downstairs to 75F"

     - id: evening_lights
       alias: Evening lights
       mode: single
       triggers:
         - trigger: sun
           event: sunset
       conditions:
         - condition: state
           entity_id: binary_sensor.anyone_home
           state: "on"
       actions:
         - action: scene.turn_on
           target:
             entity_id: scene.evening

5. Validate: ha core check. Never reload on a failed check.

6. Reload without a restart: input_boolean, template and automation (ha-mcp reload services,
   or the owner runs them in Developer Tools, YAML).

7. Verify (rule 8) and report:
   a. input_boolean.geofence_live exists and is OFF. If it is ON, set it OFF and report it.
   b. binary_sensor.everyone_away and binary_sensor.anyone_home exist. Report their states
      and the two persons' states. Check they agree (for example, an owner at home means
      anyone_home ON and everyone_away OFF).
   c. automation.away_ac, automation.cool_down and automation.evening_lights exist and are on.
   d. Dry-run test, only with geofence_live OFF: ask the owner's OK, then call automation.trigger
      on away_ac and on cool_down with skip_condition true. Each must send one "DRY RUN"
      notification and change no thermostat. Confirm both thermostats' setpoints are
      unchanged before and after. Do NOT trigger evening_lights (it acts on lights).
   e. Read the traces for both runs and report the path taken.

8. Record (Tier 1) and merge:
   - Commit the package on the branch as feat(geofencing): ...
   - After the owner confirms 7, merge feat/geofencing into main (fast-forward) and push.
   - docs/milestones.md: M16 "Installed, notify-only (geofence_live OFF)". docs/issues.md: the
     passive-zone check and "real drive test pending". Leave D32 and D35 unchanged.
   - docs/sessions/2026-10-30-geofencing.md and HANDOFF.md with the exact resume point:
     real-drive test, then owner turns geofence_live ON when satisfied.
   - Commit as docs(session): ... to main. git pull --rebase first. Never force-push.

Report back: backup slug, the MKH person ID used, zone radius and passive state, thermostat
modes, helper state, trace results, and the resume point. Notify the owner.
```

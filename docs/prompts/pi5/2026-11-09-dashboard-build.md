# Prompt: Pi 5 full run: D42 to D45 tasks plus dashboard build (habib-home-new)

Target: pi5
Date: 2026-11-09
Tier: mixed (each step says which). Replaces and includes `docs/prompts/pi5/2026-11-09-d42-owner-decisions.md`; run THIS file, not both.
GREEN LIGHT: GIVEN by the owner in chat, 2026-11-09, for exactly: (1) deleting the `homedeck` custom component; (2) creating scenes `turn on lights`, `turn off lights`, `away` (empty); (3) filling and checking the four D42 automations, ALL DISABLED; (4) building the new dashboard `habib-home-new` from `docs/dashboard-design.md` v1.0. Nothing else.

```
Read HANDOFF.md, docs/decisions.md (D42 to D46), docs/dashboard-design.md (v1.0) and docs/sessions/2026-11-08-pi5-status-sync.md. Stop and report on any error. Never guess an entity ID or area ID: read them from the registry. Never print secrets.

A. Preflight (Tier 0). ha core info, ha core check (must be valid), list backups. ha backups new --name "pre-dashboard-build". Record its slug.

B. homedeck (GREEN LIGHT). Record manifest.json name, version and the entities it makes. Remove the integration (Settings, Devices and services, delete) and confirm custom_components/homedeck is gone and no homedeck entities remain. Restart only if removal truly needs it, and stop to ask first.

C. Scenes (GREEN LIGHT). Create scene "Turn on lights" (all lights on), "Turn off lights" (all lights off), "Away" (NO entities). Read the light entity list from the registry. Leave the Hatch lights out of on/off (I23; verify the entity IDs). Confirm each scene exists. Record the scene entity IDs.

D. Automations (GREEN LIGHT, ALL DISABLED, D45). Branch feat/d42-automations (92902d7) has packages/d42_automations.yaml with <<FILL>> placeholders. Replace each from the registry, one Apple name to ONE HA light for the Away list in D43 (Dresser = Master, Floor Lamp = Nursery, Console Lamp and Side Table = Living Room, Game Room, Upstairs Guest, Nightstand = Study). Report any name that maps to zero or several lights and stop on that item. Check out the branch only to run ha core check, then return to main. Do NOT reload automations, do NOT enable any of them, do NOT merge. Push the branch.

E. Dashboard habib-home-new (GREEN LIGHT). Create a new storage dashboard: url_path habib-home-new, title "Habib Home (new)", admin only, in the sidebar. Do not touch habib-home or nuvio-shared. Follow docs/dashboard-design.md section 5 (wireframes), 6 (component map) and 10 (build approach):
  1. One sections view with custom:nuvio-* cards. In-page navigation by custom:nuvio-tabs-card with five tabs: Home, Rooms, Climate, Media, Family. Use cards documented in Nuvio 2.31.0 (components.md at tag v2.31.0). Do not invent options.
  2. Home tab: status chips (front door lock state, both thermostats, who is home, next prayer, lights on count), scenes row (Turn on lights, Turn off lights, Away), Favorites (front door, both thermostats), one room card per area with lights, HomePods strip. Areas: Living Room, Master, Nursery, Game Room, Upstairs Guest, Study (plus others only if they hold lights).
  3. Front door: lock.living_room_front_door ONLY, never lock.804_front_door. Use nuvio-lock-card with confirm (or smartlock-card with hold): unlocking needs a confirm. A single accidental tap must not unlock.
  4. Climate: climate.downstairs, climate.upstairs, outside weather. Media: media_player.living_room_living_room_homepod, media_player.master_bedroom_homepod. Family: person entities, the prayer sensors (sensor.living_room_adhan_*), the Hatch lights as read-only controls.
  5. Layout rules (non-negotiable, from the 2026-11-04 failure): nuvio-grid-card columns: 0 with min_width 260; no named control narrower than 220 px; no inline switch on a narrow card; one card type per row; every light shows its full name; rename long names in the card (name:), not in the registry.
  6. Do NOT add automation controls. Do NOT edit the Nuvio Settings (header, bottom bar, Screensaver): those are UI-only and are owner follow-ups.
  7. Export the dashboard config to dashboards/habib-home-new-2026-11-09.json and commit on branch feat/habib-home-new (do not merge).
  8. Check the HA log for frontend or card errors after load. You cannot take screenshots: do not claim it looks right. Say it is built and loads without errors.

F. Report. Write docs/sessions/2026-11-09-dashboard-build.md: each step, result, entity IDs and scene IDs created, the backup slug, branch names and commit IDs, anything skipped or ambiguous. No secrets. git pull --rebase, commit as docs(session): dashboard build habib-home-new and push to main. Reply with commit IDs and the dashboard URL path.

STOP after F. The Mac renders it at 430, 1280x800 and 1440 and sends fixes before the owner views it.
```

## Rollback
- Dashboard: delete `habib-home-new` in Settings, Dashboards (nothing else depends on it).
- Scenes: remove the three scenes in Settings, Automations and scenes.
- homedeck: restore from `pre-dashboard-build` if needed.
- Automations: branch only, never merged or enabled; delete the branch.

# Prompt: Parallel lane, Pi 5 (Claude Terminal)

Target: pi5
Date: 2026-10-30 (revised after owner replies, same day)
Tier: 2 and 3, each with the owner's words below
GREEN LIGHT, as given by the owner on 2026-10-30:
- I18: "Disable it, temporarily; put a note to revisit this item."
- Scenes: "Remove 'Movie Night'; rest I will review later and rename as needed."
- Cloudflare Tunnel: "GREEN LIGHT." (answer to the tunnel item). Covers `docs/prompts/pi5/2026-10-24-cloudflare-tunnel.md` as written. The HA restart in its step 6 still needs a live confirmation from the owner.
- Zones: "Edit and set up zones at your discretion to ensure all devices are grouped for smooth operation." Read as: the Near Home zone (D32) and area assignments. Covered with D35.
- Not given: Adhan live test or enabling `input_boolean.adhan_enabled` (D34), scenes merge to main, any other front door lock change, HomeKit Bridge changes, backup location change (M4).

Runs in parallel with the networkpi and Mac lanes. Pi 5 owns live HA state, `packages/` and `dashboards/`. Pull with rebase before every push. Never force-push.

```
Read HANDOFF.md, docs/issues.md, and the Open list in docs/decisions.md. Run this lane in order. Report each step in one short block (result, evidence, next). Do not stop between steps unless a step says STOP. Entity IDs come from docs/entities.md or ha-mcp, never guessed.

Step 1 (Tier 0) Baseline.
- git status, git branch. ha core info, ha core check, ha backups list.
- Via ha-mcp confirm: automation.front_door_geofence_auto_lock_unlock, input_boolean.adhan_enabled (must be off), the scene entities, the dashboard currently titled Nuvio Test (url nuvio-test).
- STOP if ha core check fails or input_boolean.adhan_enabled is on.
- Backup once for the whole lane: ha backups new --name "pre-parallel-2026-10-30". Confirm it exists.

Step 2 (Tier 3, approved) I18: disable and note.
- Read the automation config and last trace first (read only). Describe it in docs/issues.md in words only: no coordinates, no device IDs, and do not commit the YAML.
- Disable it: automation.turn_off for automation.front_door_geofence_auto_lock_unlock. Do not edit or delete it. Verify the state is off.
- Update the I18 row in docs/issues.md: "Disabled temporarily by owner, 2026-10-30. REVISIT: decide keep as notify-only, rewrite under D32 and commit to git, or delete. Not in git." Add the same line as item 0 in HANDOFF.md. Commit to main as docs(session): I18 disabled, revisit. Push.
- Open the reply with: "I18 disabled: <state>."

Step 3 (Tier 2) Entity refresh, including the new Hatch integration.
- Re-run the inventory (docs/setup.md step 1.6) through ha-mcp. List every new entity since docs/entities.md was written, especially Hatch (device, light, media_player, sensors, areas).
- Update docs/entities.md and docs/devices.md with Hatch (integration name, entity IDs, area, how it connects). Commit as docs(entities): refresh with Hatch. Push to main.
- Hatch checks, report only, change nothing: (a) does a Hatch light.* entity exist, and in which area; (b) would scene.evening, scene.good_night or any automation turn it on or off (the Nursery must stay excluded); (c) the HomeKit Bridge filter is domain light, so a new Hatch light may now be exposed to Apple Home after the next bridge reload. Report that; a bridge change is Tier 3 and not approved.
- Add Hatch to the "Device onboarding" record (D23) if it needs a note.

Step 4 (Tier 2/3, approved) Scenes: remove Movie Night.
- Branch feat/scenes (02588c7). Remove scene.movie_night from packages/ and from any dashboard or doc reference (docs/prompts/pi5/2026-10-30-scenes.md, docs/milestones.md M11 list). Leave the other 5 scenes unchanged; the owner will rename them later.
- ha core check, then scene.reload. Verify scene.movie_night is gone. If it lingers as unavailable, remove that one entity from the entity registry through ha-mcp and say so.
- Commit on feat/scenes as fix(scenes): remove Movie Night. Push the branch to origin so the Mac can review it: git push -u origin feat/scenes. Do not merge to main.

Step 5 (Tier 2) Zone and area grouping (M16 groundwork, D32, D35).
- Zone: create "Near Home" as zone.near_home through ha-mcp, radius 4828 m, Passive ON. Copy latitude and longitude from zone.home inside HA. Never print or write coordinates into chat, files or commits (repo is public until D25).
- Areas: audit all devices and entities against the 8 areas (Living Room, Kitchen, Master, Nursery, Formal Living, Game Room, Upstairs Guest, Study). Assign the unambiguous ones through the registry (Nest thermostats, Hatch, anything unassigned). List ambiguous ones for the owner; do not guess. Find where "Laundry" and "General" come from and report; do not delete areas.
- Do not touch Apple Home automations. Report any that touch lights or thermostats (the geofence prompt needs them disabled first).
- Record the result in docs/sessions/2026-10-30-parallel-pi5.md.

Step 6 (Tier 2) Dashboard: rename, prayer card, rooms layout. Use ha-mcp, never .storage.
- Rename "Nuvio Test" to "Habib Home". New URL path habib-home. Before the rename, check what uses nuvio-test (default dashboard, sidebar, iOS app). Tell the owner they may need to re-pick the dashboard in the iOS app, and that the old URL will stop working. Update names in docs/ (HANDOFF.md, M9) to match.
- Prayer times card: find the islamic_prayer_times sensors by ha-mcp (Fajr, Dhuhr, Asr, Maghrib, Isha, next prayer). Add a card showing the next prayer with its time prominently and all 5 times in a compact list. D2 puts it on the left of Home. Check how Nuvio accepts extra cards or a custom view (repo kczepiec/nuvio); use its supported mechanism. If none fits, add a Prayer card to a normal view and say so. Verify the card renders the right entities.
- Rooms layout (M14, I16): smaller tiles, thermostats under their rooms. Nuvio edit-mode resize and Appearance, Rooms settings first. Assign areas in HA, not in Nuvio.
- Export the layout JSON to dashboards/habib-home-<date>.json. Branch feat/rooms-layout, commit as feat(dashboard): rename, prayer card, rooms layout. Do not merge. Tell the owner to check on the iPhone.
- Rollback: restore from pre-parallel-2026-10-30, or re-import the previous JSON from dashboards/.

Step 7 (Tier 3, approved) Cloudflare Tunnel. Start only when the owner confirms the Cloudflare steps 1-3 in docs/prompts/pi5/2026-10-24-cloudflare-tunnel.md are done (tunnel ha-pi5 created, hostname set, token saved in the add-on options by the owner).
- Follow that prompt body. Backup pre-cloudflare-tunnel first. If the owner has not done the Cloudflare steps yet, skip and report "waiting on owner".
- The http block needs a restart. Ask the owner for a live "restart OK" immediately before it. Do not restart before then.
- Do not cancel Nabu Casa (D26) until the owner has tested on cellular.

Step 8 (Tier 2) Geofencing, only if the MKH person exists. Check for a person entity linked to a mobile_app device_tracker for MKH (the owner is setting this up in parallel, M15). If it exists, run docs/prompts/pi5/2026-10-30-geofencing.md in notify-only mode (input_boolean.geofence_live OFF). If not, skip and report. The Evening and Welcome Home automations must exclude the Hatch light and the Nursery.

Step 9 (Tier 3, NOT approved, do not start): Adhan live test (I17), scenes merge (I19), HomeKit Bridge changes, backup location change (M4), enabling I18 again.

Step 10 (Tier 2) Remote Control test on the Pi 5 (I20). Run claude doctor. If Remote Control is available, run claude remote-control --name pi5 and ask the owner to confirm the session appears on claude.ai/code on the iPhone. Record the result in docs/issues.md I20 and propose D37 (not decided until the owner confirms).

End: session protocol from CLAUDE.md (docs/sessions/2026-10-30-parallel-pi5.md, HANDOFF.md Pi 5 section only, issues, milestones). git pull --rebase, then push to main.
```

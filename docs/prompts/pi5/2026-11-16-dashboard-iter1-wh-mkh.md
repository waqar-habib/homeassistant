# Prompt: dashboard iteration 1, M3 restyle and full WH and MKH views

Target: pi5
Date: 2026-11-16
Tier: 2 (dashboard config, a Lovelace resource version bump, a backup first). No lock, unlock or garage service call, no climate change, no Adhan, no HomeKit Bridge, no network change.
GREEN LIGHT: standing (D53) for habib-* dashboards, `habib-ui` JS and the resource version. Design acceptance stays the owner's (D67 records the owner's design answers). "GREEN LIGHT outdoor controls" has NOT been given, so lock and garage stay status only.

Replaces the one-piece-at-a-time plan: restyle the whole `habib-ui` library to Material 3 and build the real `habib-wh` (owner iPhone) and `habib-mkh` (MKH iPhone) views in one pass. The owner reviews live, the Mac session checks breakpoints (`docs/prompts/mac/2026-11-16-dashboard-iter1-breakpoints.md`), and iteration 2 adds, removes and edits components.

```
Read HANDOFF.md, docs/decisions.md D52, D53, D54, D60 to D64 and D67, docs/dashboard-v2-plan.md sections 4 to 7, docs/dashboard-cookbook.md, docs/dashboard-config.md, docs/design/m3-reference.md and docs/design/m3-components.md. git checkout main; git pull --rebase. Never print secrets. Step codes to the owner only with their full phrase (D58).

Step 0 Gate (Tier 0).
- Read docs/sessions/2026-11-15-material-you-evaluation.md and the live state: which theme is selected in the OWNER's profile, whether `--md-sys-color-*` variables are visible on :root to our shadow-DOM cards (the evaluation's fact 4), and whether a restart is pending. If the evaluation note is missing, stop and say so.
- Re-read every entity ID you will use from docs/dashboard-config.md with ha-mcp and confirm each exists (rule 9). Stop on any mismatch.
- If the theme tokens are NOT on :root, do Step 2 with a small bridge (a CSS block in habib-ui.js that sets --habib-* from the theme's own values) and say so in the report. Do not install or change anything about the theme.

Step 1 Backup and branch (Tier 2).
- ha backups new --name "pre-dashboard-iter1"; confirm with ha backups list.
- Export the current habib-wh and habib-mkh configs to dashboards/habib-wh-2026-11-16-pre-iter1.json and dashboards/habib-mkh-2026-11-16-pre-iter1.json. Branch feat/dashboard-iter1.

Step 2 Restyle habib-ui to Material 3 (JS change, CR6: bump VERSION in loader.js and the resource to the next number, use the ?dev loop, keep node --test tests/habib-ui/logic.test.mjs green, no entity IDs, labels or icons in JS).
Design rules (owner, D64 and D67):
1. Colour only through theme tokens with fallbacks to HA's own variables, for example `var(--md-sys-color-secondary-container, var(--secondary-background-color))`. No hard-coded accent colour. Remove the old teal (#2EC4D6) everywhere.
2. Tile = M3 card: 12px radius, 16px side padding, 8px gap between tiles, no shadow, no backdrop-filter or blur anywhere (blur is backburnered, D67).
3. Function buttons (lights, groups, actions) are half width (columns: 6 default, two per row on a phone), hold an icon and text only, and are never edge to edge. Min height 64px; the whole tile is the 48px+ touch target.
4. Light button colours: on = container `--md-sys-color-secondary-container`, content `--md-sys-color-on-secondary-container`; off = container `--md-sys-color-surface-container`, content `--md-sys-color-on-surface-variant`. Action button: same as off, with a tonal press. Unavailable: 0.38 opacity, "No response".
5. State layers on the content colour: hover 0.08, focus 0.10, pressed 0.10, dragged 0.16. Visible 2px focus ring on keyboard focus. Transitions under 200 ms; no continuous animation.
6. Status strip chips = M3 assist chip: height 32px, corner 8px, 1px `--md-sys-color-outline-variant` border, 18px icon, 16px side padding (8px with an icon), tone colours from the theme (ok uses primary, warn uses error); min touch area 48px via padding.
7. Brightness sheet = modal bottom sheet: container `--md-sys-color-surface-container-low`, 28px top corners, 22px drag-handle padding, scrim, width up to 640px, content colour on-surface-variant. A confirmation dialog (not needed yet) would be surface-container-high with 28px corners.
8. Type: Roboto (already in HA), no web fonts. Label 14px weight 500, supporting text 12px, heading 16px. The M3 pages did not give per-style sizes as text, so these are working values the owner will tune.
9. Light and dark both follow the user's HA setting.
Add or update node tests for any new logic. The DOM stays in habib-ui.js.

Step 3 Build habib-mkh (Tier 2, config only, through ha-mcp with the current config_hash). One view "Home", one column on a phone, no scrolling needed for the lights at 430x932. Admin-only stays (require_admin true).
1. Status strip: clock; indoor temperature Downstairs and Upstairs (climate current_temperature, tap opens the thermostat dialog); Front door lock status (tap: none).
2. Section Bedroom (heading), lights: Dresser, Maham's Lamp, Waqar's Lamp as individual half-width tiles.
3. Section Nursery (heading), independent: Bookshelf, Changing Table, Nursery Floor Lamp. No Hatch light or clock.
4. Section Living Room (heading): Buffet, Floor Lamp, Side Table, Console Lamp.
5. Section Floors: Upstairs and Downstairs group buttons (members from docs/dashboard-config.md section 2; Nursery and Hatch in neither).
6. Left out on purpose: Ring, calendar, scenes, thermostat cards, media, garage, outdoor, any lock control.

Step 4 Build habib-wh (Tier 2, config only). One view "Home", scrolling allowed.
1. Status strip as MKH, plus Garage status (tap: none).
2. Priority rooms with inline light tiles: Bedroom, Nursery, Living Room (same lists as MKH).
3. Floors: Upstairs and Downstairs group buttons.
4. Other rooms: Game Room (light.game_room), Upstairs Guest (light.upstairs_guest), Study (light.study_lamp; its friendly name is "Nightstand", use the entity ID).
5. Outdoor: Porch light button (light.smart_wi_fi_light_switch, on and off only). Lock and garage appear only as status chips in the strip. No lock, garage or cover service anywhere.
6. Two built-in thermostat cards, climate.downstairs and climate.upstairs (the theme styles them). Do not call a climate service from Claude.
7. Left out on purpose (iteration 2 or later): Ring (snapshot returned HTTP 500, I35, I39), calendar (FamFam not loaded), media (entity IDs unverified), scenes. Scenes are held because scene.turn_on_lights and scene.turn_off_lights still include the Nursery lights (I47); ask the owner before adding them.

Step 5 Verify (Tier 0). No taps on controls. Read each config back and record the config_hash. Check every entity ID exists with a live state. HA log: no new frontend, habib or Lovelace errors. Run the node tests. Confirm the loader resource version is the new one. Confirm habib-home and nuvio-shared are untouched. State plainly that the Pi 5 cannot render; the Mac session checks breakpoints and the owner checks the iPhone.

Step 6 Record (Tier 1). Export the two dashboards to dashboards/habib-wh-2026-11-16-iter1.json and dashboards/habib-mkh-2026-11-16-iter1.json. Update docs/dashboard-config.md (entities used) and docs/dashboard-cookbook.md (new recipes: room section, floors section, thermostat card). Session note docs/sessions/2026-11-16-dashboard-iter1.md, update I46 and I48, rewrite the dashboard block of HANDOFF.md. Commit feat(dashboard): iteration 1 M3 restyle and WH and MKH views on feat/dashboard-iter1, merge to main, git pull --rebase, push. Never force-push.
Reply with the short commit ID, the config hashes, and one line each: what the owner checks on the iPhone for habib-wh and habib-mkh ("refresh the dashboard", then open the two dashboards from the sidebar).

Rollback: re-apply the -pre-iter1 JSON files through ha-mcp for both dashboards; set the loader resource back to the previous version; restore backup pre-dashboard-iter1 only if config is damaged (Tier 3).
```

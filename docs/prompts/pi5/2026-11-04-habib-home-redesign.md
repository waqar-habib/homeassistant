# Prompt: redesign `habib-home` to match Apple Home, for phone, iPad and Mac

Target: pi5
Date: 2026-11-04
Tier: 2 (dashboard config, backup first, `ha core check`, no restart). No Tier 3 action is requested.
GREEN LIGHT: not needed (Tier 0-2). Nothing in this prompt is covered by a GREEN LIGHT beyond Tier 2. The deletions in D38 (`nuvio-test`, `prayer-times`) stay approved but are deferred: do not run them in this prompt.

```
Run after `git pull`. Read HANDOFF.md, docs/decisions.md (D1, D2, D18, D38, D41), docs/issues.md (I22), docs/entities.md, and docs/sessions/2026-10-30-nuvio-install.md. Entity IDs come from docs/entities.md or ha-mcp, never guessed.

GOAL
Owner wants to move daily use from Apple Home to Home Assistant, then retire the Home app. Redesign the Nuvio dashboard `habib-home` so it looks and feels like the Apple Home screen (reference below) but is easier to use. The owner tests it in the morning, so the result must be usable even if part of the plan is blocked. Not now: prayer times card, tablet/kiosk, scenes (see NON-GOALS).

RULES
- Do not restart HA. Do not edit .storage/. Do not read or print secrets. Change dashboards through ha-mcp only.
- Do not call any service on any device (lights, locks, climate, media, Adhan). Read states only. The owner operates devices from the dashboard in the morning.
- Do not touch the front door lock behavior, Adhan, scenes, HomeKit Bridge, climate setpoints, `nuvio-test`, `prayer-times`, or zone/automations.
- One change, one commit. Work on branch feat/habib-home-redesign. Docs-only session notes go to main (Tier 1).

STEP 1  Safety net (Tier 2)
a. `ha backups new --name pre-habib-redesign` — type exactly this. The name must be the text pre-habib-redesign only, not the command (the earlier I18 backup was misnamed). Confirm the backup name with `ha backups list`.
b. Read the current `habib-home` config with ha-mcp and save it as dashboards/habib-home-pre-redesign-2026-11-04.json. Commit on the branch.

STEP 2  Find out what Nuvio can do (read-only research, record findings in the session note)
Read Nuvio's README and docs (repo kczepiec/nuvio, v2.30.1) and the current `habib-home` config. Answer each with evidence:
1. Can views, sections or cards be hidden, removed or reordered (wizard, settings, per-area options, YAML options)?
2. Where does the stock text come from (for example "Your whole home in one place") and can it be turned off?
3. Where does the "Scenes" card come from and can it be turned off?
4. Can Nuvio build a Favorites section, summary chips (climate, lights, security, speakers), per-area sections and a two-column tile grid like Apple Home?
5. Can the config be saved by ha-mcp, or only through Nuvio's own edit mode or wizard?
6. Does Nuvio offer a "take control" or static export, and does that remove its generated layout?
Also answers I22: can a markdown card sit inside a Nuvio dashboard? Record the answer, do not build the prayer card.

STEP 3  Build, by path (choose the first that works, state which one you used)
Path A (preferred, matches D1): apply the design through Nuvio's supported configuration on `habib-home` itself.
Path B: if Nuvio cannot reach the design but offers a documented static takeover, take it only on `habib-home`, keep the Step 1b export as the rollback, and say so in the report.
Path C (safe fallback, owner still has something to test): leave `habib-home` untouched. Create a new dashboard `habib-home-v2` (title "Habib Home v2", admin only, sidebar) with the same design, using the Glass Cards already installed (D2) and native HA cards where Glass Cards has no fit.
Whichever path, `habib-home` must remain usable in the morning. If a path fails halfway, restore from the Step 1b export and move to the next path.

DESIGN SPEC (copy of the Apple Home screen on the owner's iPhone)
Header: the page title reads "Waqar, Maham & Noor's Home". No subtitle or stock text on any view. Remove every Nuvio default blurb (Step 2 item 2) and every card that is not in this spec, including the stock "Scenes" card.

Home view, in this order:
1. Summary chips in one row, scrollable on phone: Climate (range of the two thermostat temps, for example 72-76 degrees), Lights (number on, for example "4 On"), Security (lock state or "No Alerts"), Speakers ("None Playing" or the number playing). Chips open a filtered detail on tap if Nuvio supports it, otherwise open more-info.
2. Favorites: three tiles. `climate.downstairs` (Living Room) shows current temperature large, name, and the cool target ("Cool to 73"). `climate.upstairs` (Game Room) the same. Front door lock tile shows "Front Door, Locked". Lock tile tap opens more-info (never a one-tap lock or unlock). Thermostat tiles open more-info. Do not set any value.
3. Room sections, each with a heading that links to the room view where Nuvio supports it. Rooms in this order: Master, Nursery, Living Room, Kitchen, Formal Living, Game Room, Upstairs Guest, Study, Laundry. Apple Home calls Master "Bedroom": its HomePod is `media_player.master_bedroom_homepod` (name "Bedroom HomePod"), plus Dresser, Maham's Lamp and Waqar's Lamp. Keep the HA area name "Master" in the section heading unless Nuvio only supports renaming per card. Do not rename areas in HA.
   Tiles per room, from docs/entities.md: lights (name, Off or brightness %, yellow when on), thermostat (Living Room downstairs, Game Room upstairs, shown once on the dashboard if repeated is confusing), HomePod (large tile, state such as Paused or Playing, name), Nursery includes the Hatch lights. Hide rooms with no tiles. Do not show the "General" area on the Home view (weather and service entities live there); show weather only if Nuvio has a header slot for it.
4. Security section at the bottom: front door lock, same tap rule as above.
Apple Home bottom bar has Home, Automation, Discover. HA equivalent: Nuvio's own navigation. Keep to at most four views: Home (above), Downstairs rooms, Upstairs rooms, and Climate and Security only if Nuvio builds them natively. Do not create a view that needs more than a small edit to stay accurate.

LOOK AND FEEL (D2 Minimalist Glass)
Translucent rounded tiles, icon on the left, name and state on the right, lights yellow when on, bright (light) tiles for on and dim (translucent) for off. Large tile for HomePods. Works in light and dark mode. No hover-only controls. No horizontal page scroll except the chip row.

TARGET DEVICES (design must fit all four; record which breakpoints were checked)
- iPhone 15 Plus, HA Companion app and Safari bookmark: 430 x 932 points, portrait. Two-column tile grid, 44 point minimum touch target.
- iPad Air 11-inch (M3, 2025), HA Companion app and Safari bookmark: 820 x 1180 portrait and 1180 x 820 landscape. Three or four columns.
- MacBook Pro and Air in Safari or Chrome: about 1280 to 1728 wide. Cap content width and use four to six columns. Pointer and keyboard fine, touch rules still apply.
The app and Safari both open https://ha.thehabibfam.cc (D39). Do not change tunnel, trusted proxy, or companion app settings.

NON-GOALS (do not build, only record in the session note as follow-ups)
- Prayer times card (I22): scope the options only, best / base / worst, after the Step 2 answer.
- Tablet or kiosk dashboard (I5): backlog (D41).
- Scenes (M11, I19): not merged, owner wants a planning session first. No Scenes row. Apple Home has Bedtime and Turn Off Lights scenes; list them as a gap in the parity table.
- A simpler dashboard for MKH: later, after MKH onboards.
- Deleting `nuvio-test` or `prayer-times`: deferred until the owner accepts the redesign.

STEP 4  Verify (Tier 0, no device calls)
- Read the saved config back with ha-mcp and confirm: no stock text, no Scenes card, no General area on Home, every entity ID in the config exists (ha-mcp state read), no entity guessed.
- `ha core check` passes. Check the HA log for new frontend or Nuvio errors.
- Export the final dashboard config to dashboards/habib-home-2026-11-04.json (or habib-home-v2-2026-11-04.json for Path C). Commit on the branch and push the branch. Do not merge.
- If you can render screenshots at the three breakpoints without storing a login token, attach them. If not, say so; do not fake it.

STEP 5  Transition parity table (Tier 1, docs only)
Write docs/transition-apple-home-to-ha.md: a table of what Apple Home does for the household today against what HA does now. Columns: Apple Home feature, HA equivalent, status (works, needs build, gap), owner action. Rows must include: room tiles, favorites, summary chips, scenes (Bedtime, Turn Off Lights), automations in Apple Home that HA does not replace yet, presence and geofencing (I18 was deleted), HomePod control and Adhan, front door lock, thermostats, notifications, the Home app widgets and Siri. Read the facts from docs/entities.md and ha-mcp. Mark anything you cannot see from here as unknown.

STEP 6  Record and report (Tier 1, to main)
- docs/sessions/2026-11-04-habib-home-redesign.md: what was done, the path used (A, B or C), Step 2 findings with evidence, what is blocked, resume point, and a morning test checklist for the owner:
  1. Open habib-home (or habib-home-v2) on the iPhone Companion app and in Safari.
  2. Open it on the iPad Air in portrait and landscape.
  3. Open it on the Mac in Safari and Chrome.
  4. On each, confirm: no stock text, no Scenes card, chips and Favorites render, each room shows its lights and HomePod, the lock tile opens more-info.
  5. Report anything that looks wrong, per device.
- Update HANDOFF.md, docs/issues.md (I22, I5), docs/milestones.md if M9 changed. Commit as docs(session): habib-home redesign and push to main.
- Report in one short block: path used, branch and commit IDs, backup name, what to test in the morning.
```

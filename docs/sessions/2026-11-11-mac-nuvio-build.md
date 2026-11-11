# Session 2026-11-11: Mac, Nuvio study, render and tap tests, Home v1 build (partial stop)

Lane: Mac (Claude Code, Chrome). Owner GREEN LIGHT 2026-11-11 (D47): build approved, 44 px touch rule, GREEN LIGHT for any build step including the Prayer Times card and its Lovelace resource.

## 1. Findings that changed the plan
1. `habib-home-new` was narrow because it is a stock Sections view with one `nuvio-tabs-card`. The card asks for 6 of 24 section grid columns (240 px at every size) and has no `grid_options`. It also lacks the `nuvio-page` shell (header, rail, phone bottom bar, responsive columns). Measured live, DOM-only test (I33).
2. Earlier claim "needs Take control" was wrong. Nuvio's editor saves added components to the hidden dashboard `nuvio-shared`; `habib-home` stays `strategy: custom:nuvio`.
3. Earlier claim "component registry not exposed" was wrong. The bundle renames `hg` to `nuvio`: `window.__nuvioCompT.list` (84 entries) and `window.__nuvioBackup` exist.
4. Nuvio has no prayer card or setting. "Card from HA (YAML)" embeds any custom element and passes it `hass`.
5. Scenes card disables scenes in state `unknown` (I31). Quick actions with explicit services works.
6. Door sensor reads open while the lock reads locked (I30).

## 2. Tests run (Chrome, iframe at exact width, scaled; no taps left the browser)
- Rendered Home, Rooms, Media, Family, Map at 430, 1280x800, 1440; room page (`/habib-home/pokoj?area=living_room`) at all three. No clipping, no horizontal scroll.
- Tap audit: all interactive Nuvio elements per view and size. Findings in I32. Nuvio adds touch expanders (`::before`, 4 to 13 px) that a desktop browser cannot trigger.
- Tap tests behind a guard that intercepts `call_service` on the HA connection (proved on a nonexistent entity first): bottom nav, Rooms tile to room page and Back, room light button (`homeassistant.turn_on` for the 4 Living Room lights), light row (`light.toggle`), media Play, lock padlock single tap (no call), thermostat step (78 to 79), Quick actions (3x `scene.turn_on`). Afterwards: no events by the owner's user in the logbook, states unchanged.
- Not tested: hold-to-unlock (Tier 3), slider drags, light and dark themes, non-admin kiosk user, screensaver, real touch input.
- Lights going off at 13:13:44 UTC came from HomeKit (Apple Home), not from tests.

## 3. Changes made (Tier 2, all reversible)
- HA backup `pre-nuvio-extend` (slug `82cc58de`, agent networkpiBackups).
- Nuvio layout applied through Nuvio's own import (merge), saved to `nuvio-shared`:
  - `dashboard:tiles`: lock card (`lock.living_room_front_door`), Outside weather (existing), AC `climate.downstairs`, AC `climate.upstairs`, Quick actions Scenes (Lights on, Lights off, Away).
  - `dashboard`: built-in empty hint card hidden (it left a blank top-left cell).
  - `wiz.hiddenRooms`: `general`, `_none`.
- Repo branch `feat/nuvio-home-build` (not merged): `dashboards/nuvio-layout-2026-11-11-pre-build.json` (rollback snapshot), `...-home-v1.json`, `...-rooms-v1.json`, `www/habib/habib-prayer-card.js` (sha256 `b6f8a300c9d54578c491883b3cbe26481772004754fb786be075493cf853c1f1`).
- Main: `docs/prompts/pi5/2026-11-11-prayer-card-deploy.md` (commit `6a4a4e4`).

## 4. Rollback
Nuvio toast "Restore previous" (browser local), or Settings, Backup and import, Import `dashboards/nuvio-layout-2026-11-11-pre-build.json` with Replace. Whole HA: restore backup `82cc58de`.

## 5. Resume point
1. Owner runs the Pi 5 prompt (pointer in `HANDOFF.md`). Until then `https://ha.thehabibfam.cc/local/habib/habib-prayer-card.js` returns 404.
2. Mac: when it returns 200, create the Lovelace resource (`/local/habib/habib-prayer-card.js?v=1`, type module) through the HA websocket, then import the prayer item (`c:hacard:hh0005`, already in the order list) via Nuvio's "Card from HA (YAML)" JSON, render at 430, 1280x800, 1440, run the guarded tap tests once more, then merge `feat/nuvio-home-build` to main and tell the Pi 5 to `git checkout main; git pull --rebase`.
3. Then: Rooms, Media, Family polish if the owner wants; owner decisions below.

## 6. Owner decisions waiting
- Door sensor check (I30). Presence zone (I27). HomeDeck removal (I28). Delete `habib-home-new` (Tier 3, I33). Kitchen and Formal Living tiles are empty but still shown. Keep both weather views on wide screens (hero left, Outside right)?

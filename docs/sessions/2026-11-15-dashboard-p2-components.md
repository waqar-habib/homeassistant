# Session 2026-11-15: dashboard components (Pi 5, Sonnet 5.5)

Prompt: `docs/prompts/pi5/2026-11-15-dashboard-p2-components.md`. Standing GREEN LIGHT quote (D53) confirmed present in `docs/decisions.md`.

## Done
1. Backup `pre-habib-components` (slug 5bcc956c, full, listed). Branch `feat/habib-components`.
2. Foundation verified live and note written (commit on main, `docs(session): foundation verification`). Resource, three dashboards, config hashes and HTTP 200 on loader.js and habib-ui.js all matched; no habib line in the core log.
3. `www/habib/habib-logic.js`: pure logic, named exports. `habib-ui.js` loads it with its own version query (derived from `import.meta.url`).
4. Cards: `habib-light-button`, `habib-action-button`, `habib-status-strip`, shared bottom sheet (no blur, closes on scrim and Escape). `habib-diag` re-renders only on setConfig, resize and user change (I44). Every card registers in `window.customCards` with getStubConfig, getCardSize, getGridOptions.
5. Dashboard `habib-lab` (admin only, sidebar, one sections view, max_columns 4), hash `eb522b64ea28c0d9`, exported to `dashboards/habib-lab-2026-11-15.json`. Resource bumped to `loader.js?v=2` (matches VERSION 2). `ha core check` clean. No restart.
6. Cookbook recipes added (light button, group members, scene button, status chip, room tab, No response and Not found).

## Verification
- `node --test tests/habib-ui/logic.test.mjs`: 19 pass, 0 fail. Covers tap rule, counts with unavailable members, brightness detection, blocked-service guard, states map, No response, Not found, and the render gate (a hass update with no relevant change gives 0 renders).
- A DOM-stub smoke run (throwaway, not committed) exercised setConfig, hass, click and disconnect for all four cards: no errors, 0 timers left after disconnect.
- Live service check on light.game_room, light.upstairs_guest, light.study_lamp only: all off at start; `light.turn_on` then `light.turn_off` with the three-member list; states changed each time; all three left off (as recorded). Note: Game Room and Upstairs Guest came on red (rgbw default) because no prior colour is stored.
- Sizes (bytes): habib-ui.js 27201, habib-logic.js 7861, loader.js 740 (library 35,802 of 150,000).
- Timers: one helper (`_later`), at most one pending 3 s timer, one 500 ms long-press timer, one 1.2 s flash timer per card, one clock timer per strip (minute-aligned, re-armed after each tick); all cleared in disconnectedCallback. Listeners: light button 7 on its own shadow root, action button 1, status strip 1, diag 1 on window (removed on disconnect); the sheet adds one capture keydown on document while open and removes it on close.

## Decisions and deviations
- The action guard also blocks the `homeassistant` domain and any `entity_id` in `data` or `target` that belongs to a blocked domain (homeassistant.turn_on and light.turn_on with a lock ID would otherwise reach a lock).
- A first lab draft included a "Blocked test" button (lock.lock); removed before the export so the lab holds no lock call. The guard is covered by tests.
- Foundation fix, logic, cards and lab are separate commits except the render-gate change and the cards, which share one file (`habib-ui.js`) and one commit.
- Working on a branch inside the live /config means the files were live on disk before merge; the pinned resource (`?v=2`) is what browsers request.

## Not verified
- No render or touch test (I46). Pi 5 cannot render. Owner checks and the cloud render are listed in HANDOFF.
- Hatch brown-noise button (D61): not built; stop method not verified.

## Owner checks and follow-up fixes (same day, iPhone)
- Owner confirmed: tap on single light, group and scene button; long-press brightness sheet; three Habib cards in the Add card picker.
- Screenshot 1: status strip overlapped by the next card (fixed height, wrapped chips). Fix: strip `rows: auto` (loader v3).
- Screenshot 2: large gaps between buttons. Fix: buttons `rows: auto` (loader v4).
- Screenshot 3 and Apple Home reference: buttons too wide. Fix: default half width (`columns: 6`), 88 px minimum height, pill radius, round icon badge; the 220 px minimum width rule was dropped (half a phone section is about 190 px). Loader v5, merge 105e11c. Owner: "all good so far".
- Still open: tablet (960x600, 1280x800) render by the cloud session; optional lighter "on" fill like Apple Home.

## Resume point
After the owner checks and the cloud render: fix findings, then P3 to P5. Rollback: delete habib-lab, `git revert` the merge, resource back to `loader.js?v=1`, or restore backup pre-habib-components.

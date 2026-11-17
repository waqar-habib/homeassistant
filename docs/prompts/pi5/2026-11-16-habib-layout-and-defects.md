# Prompt: packed layout card, scaling components, single-hex colour, defect fixes

Target: pi5
Date: 2026-11-16
Tier: 2 (card code, theme, two new staging dashboards). No Tier 3 step is included.
GREEN LIGHT: not needed (Tier 2). Owner chose the approach (D78, D79). The live `habib-wh` and `habib-mkh` dashboard configs are NOT replaced by this prompt; cutover is a later owner step.

Source of every number below: `docs/design/audit-2026-11-16.md`, I55 to I59, D78, D79.

## Wireframes (owner-visible spec, per breakpoint)

Phone, 430 wide, habib-mkh (one column, compact, must end above 800 px):

```
[ hero: clock | weather            ]  130
[ FLOORS            2 on  v        ]
[ (i) Downstairs  2 of 7 | (i) Upstairs  Off ]   name left, state right, edge to edge
[ BEDROOM                 v        ]
[ (i) Dresser | (i) Maham's | (i) Waqar's ]      icon left, 2 text lines
[ LIVING ROOM       2 on  v        ]
[  (i)   |  (i)  |  (i)  |  (i)   ]              4 chips: icon above, name under, no broken word
[ Floor  |Buffet | Side  |Console ]
[ Front door Locked > | Garage Closed > ]
[ Climate 72° · 72° v | Listen Idle  v ]         always one line
```

Laptop, 1440 wide with sidebar (3 columns) and 1728 (4 columns). Groups fill each column top to bottom; no row gaps:

```
col 1            col 2            col 3            (col 4 at 1728+)
[ hero 262 ]     [ HOME 476  ]    [ FLOORS 312 ]   [ ...        ]
[ LIVING 568 ]   [ BEDROOM 504 ]  [ NURSERY 504 ]
[ LISTEN 322 ]   [ UPSTAIRS 760 ] [ ...          ]
```

Each group goes, in config order, into the column that is currently shortest. Wall tablet (1280 x 800, sidebar hidden): same rule, 3 columns.

## Prompt

```
You are the Pi 5 Claude Code session. Step codes only with full phrases (D58). Read CLAUDE.md, HANDOFF.md, D78, D79, I55 to I59, docs/design/audit-2026-11-16.md and docs/design-guide.md sections 3 to 7 and 9 before writing code. Read www/habib/habib-glass.js by card block, not whole.

Hard rules: no card ever calls a lock, cover or climate service; Adhan is shown, never changed; Nursery lamps stay out of floor groups; never edit .storage; entity IDs only from the live configs; do not replace or edit the live habib-wh and habib-mkh dashboard configs; do not remove any Lovelace resource (deletion is Tier 3). Never show the owner a layout you have not rendered.

Setup: git checkout main && git pull --rebase; ha backups new --name "pre-habib-layout"; git checkout -b feat/habib-layout. One change, one commit. Run node --test tests/habib-ui/ after every code commit and ha core check after every YAML change.

Part 1, quick defect fixes in the existing cards (I56 to I59):
1. Hyphenation: replace every "hyphens: auto" with "hyphens: manual" and keep overflow-wrap: normal. A name is never broken inside a word.
2. Chips (habib-room): the chip sizes itself from its own width with a container query, never from the screen. Icon column is the icon's width (not one third). Three layouts: 150 px and wider = icon, name left, state right on one line (13 px name, 12 px state); 100 to 149 px = icon left, name (up to 2 lines) over state; under 100 px = icon above, name and state centred below. If the longest word still does not fit, step the name down to 10 px minimum. Check "Console Lamp" at a 76 px chip.
3. Dock bars (.mini.stack): icon column 44 px, text column takes the rest. The value is always one line: each card's _summary returns a long and a short form and the bar picks by its own width. Climate short form "72° · 72°" (long "Down 72° · Up 72°"), Listen short form "Idle". All four bars are 52 px. aria-label always carries the long form.
4. Prayer fold bar: when no prayer is left today, show "All done today" (not "Times unavailable"). "Times unavailable" only when a sensor is missing, unknown or unavailable. Add a node test for both.
5. Slider value colour: use the text token, not rgba(255,255,255,.9).
6. Touch targets: give these a hit area of at least 44 px with padding or a pseudo-element, visible size unchanged: media volume slider (6 high), room header (22 high), three-dot button (26), media tabs (28.5), lamp slider (34), avatars (39.8), media side buttons (40).
7. Contrast: raise text-dim from 62% to 84%. Use text-faint only for placeholders. Darken the hero surface so primary text reaches 4.5:1. Verify by sampling pixels of your renders: text-dim at least 4.5:1 on hero, a typical card, a lit lamp card and a dock bar.
8. Feedback: after the 2.5 s pending window, if the state did not change, the control returns to the real state and shows "No response". Add a hover style (raised fill lightens) under @media (hover: hover) only.

Part 2, single-hex colour (D78 item 3):
1. One theme key, habib-base (today "#1c3226"), is the only place the background colour is chosen. One scheme only: dark glass with light text. No light mode, no modes key.
2. In the cards, derive page, page-deep, dialog, sheet, surface-solid and scrim from var(--habib-base) with color-mix(in oklab, ...) and keep today's values as the fallback. Today's look must not visibly change with the default base.
3. The wallpaper can no longer be a fixed-colour file. The layout card from Part 3 paints it: gradients and the leaf shapes as inline SVG, all derived from habib-base. Keep evergreen.svg as the fallback for the current live dashboards.
4. HA chrome keys that need literal values (sidebar, header, dialog, rgb-card-background-color and similar): write dashboards/habib-theme-build.py that takes --base "#rrggbb", rewrites themes/habib_glass/habib_glass.yaml and prints the derived palette. It must clamp the base to a dark range so light text stays readable, compute the contrast of text and text-dim on the derived surfaces, and refuse with a clear message below 4.5:1. Owner flow: one hex, one command, theme reload.
5. Prove it: render the staging dashboards with three bases (default, a navy, a plum) and keep the screenshots.

Part 3, habib-layout (the packed container, D79):
1. New card custom:habib-layout, registered like the others. Config: groups[] each with id, label, note, cards[] and optional compact_cards[]; max_columns (default 4); min_column (default 320); max_column (default 500); compact_below (default 700).
2. It measures its own width with a ResizeObserver. Columns = min(max_columns, floor((width + gap) / (min_column + gap))). Under compact_below it shows one column and each group's compact_cards when present. No screen media query and no HA visibility condition is used for layout, so no width can render blank (I56).
3. Packing: each group, in config order, goes into the column that is currently shortest; ties go left. Put the function in habib-glass-logic.js as pure logic with node tests (the heights in the wireframe are a test case; also 1, 2, 3 and 4 columns, and a group taller than all others). Re-pack when a group changes height (fold, room opened). Keep DOM order equal to config order for keyboard and screen readers.
4. Inside a group: optional habib-label, then the cards on a 12-column grid using each card's getGridOptions (lamp 6, wide lamp 12, others 12; rows times 56 px plus 8 px gaps where rows is a number). Child cards are created with HA's card helpers, as habib-dock does, and receive hass.
5. Host it in a panel view with theme "Habib Glass". If a panel view breaks the theme, the header or scrolling, use a sections view with one section spanning all columns and say so in the session note.
6. Hero clock follows the hero card's width (container units), not the viewport.
7. Wall tablet: no behaviour may need a long press or hover.

Part 4, standard building blocks (D78 item 5):
1. Move the shared primitives (surface, well, chip, bar, pill, round button, status dot, focus ring, the six state looks) into one shared stylesheet used by every card through adoptedStyleSheets. No card may redefine them.
2. Add custom:habib-button: a generic chip or tile for any switch, light, scene, script or input_boolean, built only from those primitives, with options entity, name, icon (inline SVG name from the existing set), size (auto, chip, tile). It refuses lock, cover, climate, alarm and media_player services.
3. Every component sizes itself with container queries on its own width. Type and spacing use only the tokens in docs/design/habib-tokens.yaml.
4. Split habib-glass.js into glass-base.js plus one file per card if the loader can load them in order without a flash; otherwise leave one file and say so.

Part 5, staging and proof (nothing unseen ships):
1. Regenerate with dashboards/habib-glass-build.py two NEW admin-only dashboards, habib-wh-next and habib-mkh-next, each one panel view with one habib-layout. habib-mkh-next uses compact_cards for the phone (hero compact, habib-room, habib-dock). Leave habib-wh and habib-mkh configs untouched.
2. Render with headless Chromium and mock states, and look at every screenshot yourself, at: 375 x 667, 393 x 852, 430 x 932, 820 x 1180, 1280 x 800, 1184 x 900 (1440 minus the sidebar), 1472 x 1117 (1728 minus the sidebar), 1920 x 1080. Mock data must include "Console Lamp", "Changing Table", both thermostats at 72 and nothing playing.
3. Pass criteria, measured in the render, not assumed: zero broken or clipped words; every dock bar 52 px and one line; no chip with more than 12 px of unused width on either side at 150 px and wider; blank area between groups under 5% of the card area at 2, 3 and 4 columns; habib-mkh-next at 430 x 932 ends above 800 px; text-dim at least 4.5:1; every control at least 44 px hit area; no horizontal scroll; no console error.
4. Only when all pass: bump VERSION in loader.js and the resource URL together, ha core check, reload themes, read both staging dashboards back through ha-mcp and record their hashes. Because the shared card file is live for habib-wh and habib-mkh too, also render the CURRENT live configs at 430 and 1184 wide with the new code before the bump and confirm they are not worse than today.
5. If any criterion fails after two attempts, stop, do not bump the loader, and write what failed.

Close: merge feat/habib-layout to main only if Part 5 passed. Session protocol: session note, HANDOFF, issues I55 to I59, milestone M19, commit docs(session): habib-layout and defect fixes, push. Reply with the short commit ID, the pass or fail of each criterion with its measured number, the three colour renders, and what is left for the Mac check. Rollback: loader back to v=10 and the previous resource URL, git revert the merge, delete the two staging dashboards, or restore pre-habib-layout.
```

## After this prompt

1. The Mac session verifies `habib-wh-next` and `habib-mkh-next` live in Chrome (read only) and the owner checks them on the iPhone.
2. Cutover of `habib-wh` and `habib-mkh` to the new layout happens on the owner's word.
3. Removing the unused `nuvio.js`, Material You Utilities and Material Symbols resources is a deletion (Tier 3) and needs its own GREEN LIGHT.
4. The design guide moves to Draft v0.3 only after the cutover.

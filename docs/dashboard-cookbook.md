# Dashboard cookbook (Habib dashboards)

Copy-paste recipes for the three Habib dashboards: `habib-wh` (owner iPhone), `habib-mkh` (MKH iPhone), `habib-kiosk` (wall tablet). Entity IDs live in `docs/dashboard-config.md`; never guess one (CLAUDE.md rule 9). Layout is a native sections view (CR3), so every change below is config only: no JavaScript deploy and no resource bump (CR4).

Status: P2 recipes added 2026-11-15. "Tested on habib-lab" means the YAML is live on the `habib-lab` dashboard (read back through ha-mcp, config hash `eb522b64ea28c0d9`) and its logic is covered by `node --test tests/habib-ui/logic.test.mjs`. The phone and tablet visual check is still pending (the Pi 5 cannot render).

## How the changes are applied

- **From Claude on the Pi 5:** use `ha_config_set_dashboard` with `python_transform` (or `patch`) and the current `config_hash` from `ha_config_get_dashboard`. Read back after every write. Template: `docs/prompts/templates/pi5-dashboard-change.md`.
- **By hand in the UI:** open the dashboard, then the three-dot menu, then Edit dashboard (Edit, then the layout editor). Drag cards, or use Add card. Raw configuration editor: open it from the same menu. Note: the HA docs page for sections views does not mention the Raw configuration editor (P0 finding 9). Confirm it appears in the menu on your version before relying on it.

## Shape of a habib dashboard (current)

```yaml
views:
  - title: Home
    path: home
    type: sections
    max_columns: 4
    sections:
      - type: grid
        cards:
          - type: custom:habib-diag
            title: Habib WH diagnostics
```

Each card in the layout is a `custom:` card or a built-in card. Every habib card takes only YAML options (for example `title`).

## Add a card

Add a card to a section's `cards` list. Example: a second diagnostics card on `habib-wh`.

```yaml
          - type: custom:habib-diag
            title: Second check
```

Card picker: Edit dashboard, then Add card, then search "Habib". Every habib card registers in the picker (CR2). The picker only shows cards registered by `habib-ui.js`, so the loader resource must be loaded first (refresh once).

## Move or resize a card

Use `grid_options` on the card (12-column grid per section; see dashboard-guide). `columns` is 1 to 12 or `full`; `rows` is a number or `auto`.

```yaml
          - type: custom:habib-diag
            title: Habib WH diagnostics
            grid_options:
              columns: 6
              rows: 3
```

To move a card, cut and paste its YAML block to another section, or drag it in the layout editor.

## Add a section

Sections group cards in a view. Add a new entry under the view's `sections`. Start each section with a heading card (the section `title` key is deprecated).

```yaml
      - type: grid
        cards:
          - type: heading
            heading: Diagnostics
            heading_style: title
          - type: custom:habib-diag
            title: Section two card
```

## Add a tab (view)

Add a new entry under `views`. Each view needs a unique `path`.

```yaml
  - title: Test
    path: test
    type: sections
    max_columns: 4
    sections:
      - type: grid
        cards:
          - type: custom:habib-diag
            title: Test tab card
```

## Hide a card

Option A (remove): delete the card's block. Option B (keep, hide per device): add `visibility` with a `screen` condition (phones only, for example).

```yaml
          - type: custom:habib-diag
            title: Phone only
            visibility:
              - condition: screen
                media_query: "(max-width: 767px)"
```

## Change a title

Edit the card's `title` value. Example: rename the `habib-wh` card.

```yaml
          - type: custom:habib-diag
            title: Habib WH check
```

## Edit by hand (UI)

1. Open the dashboard, then the three-dot menu, then Edit dashboard.
2. Use Add card, drag to move or resize, or use the card's editor.
3. For raw YAML, use the three-dot menu, then Raw configuration editor (see the caution above).
4. Save. Check the view renders. Read back in Claude if you want it verified.

## Light button (tested on habib-lab)

`custom:habib-light-button`. One entity or a list. Tap: if any member is on, all usable members turn off; if all are off, all turn on. Press and hold 500 ms opens a brightness sheet (10 to 100 %) when a member supports brightness. Unavailable or unknown members are skipped in the call and the count.

```yaml
          - type: custom:habib-light-button
            name: Study lamp
            icon: mdi:lamp
            entities:
              - light.study_lamp
```

Optional `columns: 6` sets the card's width in the section grid (1 to 12, default 6, half a section like Apple Home). Entity IDs come from `docs/dashboard-config.md`.

## Group of lights, change members (tested on habib-lab)

A group is a light button with more than one entity. Edit the list; nothing is created in HA, so nothing reaches Apple Home (I37). The label reads "x of y on".

```yaml
          - type: custom:habib-light-button
            name: Upstairs
            icon: mdi:stairs-up
            entities:
              - light.game_room
              - light.upstairs_guest
              - light.study_lamp
```

Add a member: add a line. Remove one: delete its line. A mistyped member shows a small "Not found: <id>" under the label and is left out of the call.

## Scene button (tested on habib-lab)

`custom:habib-action-button`. One tap is one service call, then a short "Done" flash. For scenes and light services only: lock, cover, climate, alarm, media player and homeassistant services are refused and the card shows "Blocked in this card" (D60, D62).

```yaml
          - type: custom:habib-action-button
            name: All lights on
            icon: mdi:lightbulb-group
            action:
              service: scene.turn_on
              data:
                entity_id: scene.turn_on_lights
```

## Status chip (tested on habib-lab)

`custom:habib-status-strip`. Items are a clock or an entity. The strip never calls a service. A chip opens HA's native dialog for its entity (`tap: more-info`, the default); `tap: none` makes it plain status.

```yaml
          - type: custom:habib-status-strip
            items:
              - kind: clock
              - entity: climate.downstairs
                attribute: current_temperature
                label: Downstairs
                icon: mdi:thermometer
                unit: "°"
              - entity: lock.living_room_front_door
                label: Front door
                icon: mdi:door
                tap: none
                states:
                  locked: { text: Locked, tone: ok }
                  unlocked: { text: Unlocked, tone: warn }
```

`tone` is `ok`, `warn` or `neutral`. A state missing from the `states` map shows its own name in plain text. To add a chip, add an item.

## Add a room (tab) (tested on habib-lab)

A room is a view with one section: a heading and that room's light buttons. Add it under `views`; the path must be unique.

```yaml
  - title: Study
    path: study
    type: sections
    max_columns: 4
    sections:
      - type: grid
        cards:
          - type: heading
            heading: Study
            heading_style: title
          - type: custom:habib-light-button
            name: Study lamp
            icon: mdi:lamp
            entities:
              - light.study_lamp
```

## What "No response" and "Not found" mean

- **No response:** the entity exists but HA reports `unavailable` or `unknown` (device offline, integration restarting). On a group it appears only when every member is like this; otherwise a note "No response: n" counts the skipped members. Nothing is called for those members.
- **Not found: light.xyz:** no entity has that ID, almost always a typo in the YAML. Fix the ID against `docs/dashboard-config.md`. The lab dashboard has one deliberate example ("Typo test").

## Render rule for new cards

A card's `set hass` computes a signature of only the states and attributes it displays and renders only when the signature changes. Pure logic goes in `www/habib/habib-logic.js` with a node test; the DOM stays in `habib-ui.js`. Any JS change bumps `VERSION` in `loader.js` and the resource URL (`loader.js?v=N`).

## Rules that apply to every recipe

- Never put entity IDs, labels or icons in JavaScript (CR1). They go in YAML.
- Read the config back after each write and record the `config_hash`.
- Admin-only habib dashboards: `require_admin` stays true until the owner decides MKH's access (D31, D43).
- Never change the lock chip to call a service (D48). Never bind a service to the lock from a dashboard.

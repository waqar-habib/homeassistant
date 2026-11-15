# Dashboard cookbook (Habib dashboards)

Copy-paste recipes for the three Habib dashboards: `habib-wh` (owner iPhone), `habib-mkh` (MKH iPhone), `habib-kiosk` (wall tablet). Entity IDs live in `docs/dashboard-config.md`; never guess one (CLAUDE.md rule 9). Layout is a native sections view (CR3), so every change below is config only: no JavaScript deploy and no resource bump (CR4).

Status: skeleton, written in P1 (2026-11-15). Recipes marked **added in P2** need the P2 components and do not exist yet.

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

## Planned recipes (added in P2)

- **Add a light button** (needs `docs/dashboard-config.md` entity IDs and the P2 light tile component).
- **Change group members** (edit the member list in YAML; no entity is created in HA, so nothing reaches Apple Home; I37).
- **Add a room** (new section with heading and the room's light tiles).

## Rules that apply to every recipe

- Never put entity IDs, labels or icons in JavaScript (CR1). They go in YAML.
- Read the config back after each write and record the `config_hash`.
- Admin-only habib dashboards: `require_admin` stays true until the owner decides MKH's access (D31, D43).
- Never change the lock chip to call a service (D48). Never bind a service to the lock from a dashboard.

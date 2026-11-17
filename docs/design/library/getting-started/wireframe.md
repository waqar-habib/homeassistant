# Wireframe to dashboard

Purpose: describe a new dashboard with library names only, so Claude can build it without guessing.

## 1. Write the wireframe

One line per part, indented by nesting. Use the element names from the [index](../README.md). Entities by friendly name are fine; Claude looks up the real IDs (CLAUDE.md rule 9) and asks if one is ambiguous.

```
page  (max 4 columns)
  hero                       clock, weather, people: Waqar, Maham
  accordion > prayer         Adhan badge
  section "Home"
    security                 front door, garage
    accordion > climate      downstairs, upstairs
  section "Kitchen"  collapsed_view: compact
    card  "Pendants"         light group: kitchen pendants
    card  "Under cabinet"    size: wide
  section "Listen"
    media                    living room HomePod
```

Words that matter:
- `page` once, at the top. Everything else is a group of the page.
- `section "Name"` = outlined, collapsible container. Add `collapsed` to start closed, `collapsed_view: compact` to show Compact cards when closed (phone pattern).
- `card` = Large card. `size: wide` spans the full section. `variant: control` = Control pill only.
- `accordion > X` = X as a one-line bar that opens to the full card.
- Phone-only or wide-only parts: say "phone: ..." or "wide: ..." per group (page `compact_cards`).

## 2. Hand it to Claude

Commit the wireframe as `docs/prompts/<target>/YYYY-MM-DD-<slug>.md` or paste it. Claude:
1. Maps every line to a config (examples on each component page).
2. Adds it to `dashboards/habib-glass-build.py` and builds a staging dashboard (`<name>-next`, admin only).
3. Renders 375 to 1920 wide, measures (no broken words, 44 px targets, contrast 4.5:1, no sideways scroll, blank under 5%), and shows the screenshots.
4. Cuts over only on the owner's word.

## 3. Rules

- Build from library parts. A part that is missing becomes a new component page (status Planned) before it is built.
- Never a literal colour, size or duration in a card file: tokens only (test `glass-style.test.mjs`).
- The [safety rules](../safety.md) cannot be overridden by a wireframe.

# Bar

Class `.glass.mini` · Layer: components · Status: **Locked** (60 px bar and 52 px dock bar, measured 2026-11-16)

Purpose: a card folded to one line. Used by a collapsed [Accordion](accordion.md) and by the [Dock](data-cards.md#dock).

| Variant | Height | Layout |
|---|---|---|
| Bar | 60 px | label (eyebrow caps), value right-aligned, chevron; optional 3 px progress line (prayer) |
| Dock bar (`.stack`) | 52 px | 44 px icon column, label over value, chevron; half width |

Rules: always one line. The value has a long and a short form (`Downstairs 72° · Upstairs 72°` / `72° · 72°`) and the bar picks by its own width. `aria-label` always carries the long form. `direct: true` (one entity) opens HA's dialog instead of unfolding (door, garage).

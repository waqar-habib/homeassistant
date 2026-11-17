# Grid

Layer: layout · Status: Draft

Inside a [Page](page.md) group and a [Section](section.md) body, cards sit on a **12-column grid**, gap 8 px (`--z-gap-card`).

| Card | Columns | Rows (56 px + 8 px gaps) |
|---|---|---|
| Large card | 6 | 2 (120 px) |
| Large card, `size: wide` | 12 | 2 |
| Control pill (`variant: control`) | 12 | 1 |
| Section, accordion, data cards | 12 | auto |

Override per card with `grid_options: { columns: 4, rows: 2 }`.

Column widths follow the page: 320 to 500 px per column. A 6-column Large card is therefore 152 to 236 px wide; the card's own container queries handle the rest (no screen media queries anywhere).

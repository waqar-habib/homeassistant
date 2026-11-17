# Heading

`custom:ui-heading` · Layer: content · Status: Draft

Purpose: small-caps label that sits on the wallpaper above a group of cards (a page group `label` creates one).

```yaml
type: custom:ui-heading
label: Living Room
note: optional dim text on the right
```

- Type `section` (13 px, 600, +0.22em, caps), text shadow for the wallpaper.
- Space: 14 px above, **10 px below** (`--z-label-gap`; was 0, the owner's 2026-11-17 defect).
- Inside a Section the header carries its own heading (class `.heading`), so a page group that holds a Section has no `label`.

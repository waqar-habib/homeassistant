# Tokens and colour

Purpose: every visual value lives in one place, `www/habib/glass/base.js` (mirrored in `docs/design/habib-tokens.yaml`). Components use tokens only; the test `glass-style.test.mjs` fails on a literal colour, length or duration in a component file.

## Colour from one hex

- One theme key, `habib-base` (default `#1c3226`, evergreen), sets the background family. Page, dialog, sheet, solid surface, scrim and the wallpaper are derived from it with `color-mix(in oklab, ...)`.
- One scheme: dark glass with light text. No light mode (D78).
- Change it: `python3 dashboards/habib-theme-build.py --base "#rrggbb"`, then reload themes. The script clamps the base to a dark range and refuses a colour that drops text below 4.5:1.

| Token | Use |
|---|---|
| `--g-text` | primary text |
| `--g-dim` | secondary text (84% of text, at least 4.5:1 on every surface) |
| `--g-faint` | placeholders only |
| `--g-warm` | lit, next prayer, "n on" |
| `--g-mint` | OK, secure, Adhan on |
| `--g-rose` | alert, error |
| `--g-heat`, `--g-cool` | climate heat and cool |
| `--c` | a lamp's own colour (set per card) |

## Type (`--t-*`)

Display face Outfit, text face Inter, both self-hosted. Roles used most: `title` 17/22 600, `title-sm` 15/20, `section` 13 caps +0.22em, `section-sm` 12 caps, `label` 13, `label-b` 13 600, `state` 12 600, `caption` 11 600, `micro` 10. Metrics: `metric-xl` 56 to `metric-sm` 30 (light 200 to 300). Clock follows its card width (`26cqi`, 64 to 104 px).

## Space, radius, size

| Group | Values |
|---|---|
| Space `--s-N` | 2, 4, 6, 8, 10, 12, 14, 16, 18, 22, 24 |
| Radius `--r-*` | card 26, sheet 30, tile 20, panel 18, item 16, chip 14, control 12, small 8, pill 999 |
| Key sizes `--z-*` | touch 44, row 56, bar 60, bar-stack 52, slider 34, card-lg-min 120, card-lg-art 56, section-pad 10, label-gap 10, stepper 44, sheet-max 560 |

All lengths scale with the theme key `habib-scale` (default 1).

## Motion (`--m-*`)

press 0.18 s spring, fast 0.2 s, state 0.4 s, sheet 0.32 s. `prefers-reduced-motion` turns all of them off. JavaScript timings: pending 2.5 s, no response 4 s, setpoint debounce 0.8 s (`TIME` in base.js).

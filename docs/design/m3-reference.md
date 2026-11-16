# Material Design 3 reference (read 2026-11-15)

Source: Chrome, read by the Mac Claude session under `docs/prompts/mac/2026-11-15-m3-reference-read.md`. Paraphrased; one short quote at most per page. Values are as printed on the pages. "Not found on the page" means the text read did not contain it. Pages were read as rendered text; tables that did not render as text are listed as not found.

## Answers to the five questions

- **a. Selected toggle colour roles.** Not found on the pages read. The switch overview gives no colour tokens; the switch spec tokens were not read. General rule from the colour roles page: a container uses a container role (for example `secondary container`) and its content uses the matching `on` role. The colour roles page cites "the selection state of a navigation icon" as a secondary-role use. The navigation bar page says the active label moved from on-surface-variant to secondary. (Sources: colour roles, navigation bar.)
- **b. Frosted glass or blur.** Not found. None of the pages read mention blur, frosted or translucent surfaces. Material 3 uses tonal surface colours and state layers for depth (elevation page: "Elevation can be shown as tonal surface colors or shadows"). Glass effects are therefore not part of Material 3 as read here.
- **c. Card corner radius.** Cards: 12dp corner radius (cards specs, Measurements). Large and extra large steps: large increased 20dp, extra large increased 32dp, extra extra large 48dp (shape overview, "M3 Expressive update", May 2025). The base "large" value before the increase was not on the page read.
- **d. Minimum touch target.** 48dp interactive target; the state layer itself is 40dp (state layers page, "The size of state layers is 40dp while the interactive target size is 48dp"). Bottom sheet drag handle: 48dp hit target (bottom sheets overview, Differences from M2).
- **e. Density for large or wall screens.** Not found. The pages only describe window size classes: navigation bar for compact and medium; bottom sheets for compact and medium breakpoints; surface add-on roles for "larger window class sizes" (colour roles). Nothing on density or wall-mounted displays.

## Numeric values

### State layers (state layers page, read 2026-11-15)
| State | Opacity |
|---|---|
| Hover | 0.08 |
| Focus | 0.10 |
| Pressed | 0.10 |
| Dragged | 0.16 |
| Disabled | 0.38 |

State layer colour = the content colour (the `on` role). Size 40dp; interactive target 48dp.

### Shape corner scale (shape overview, read 2026-11-15)
| Token | Radius |
|---|---|
| Large (increased) | 20dp |
| Extra large (increased) | 32dp |
| Extra extra large | 48dp |
| Full | fully rounded (was 50% of component size) |

Card 12dp (cards specs). Bottom sheet top corners 28dp (bottom sheets overview). Other component radii: not found on the pages read.

### Type scale (typography page, read 2026-11-15)
- 15 baseline and 15 emphasized styles, Display Large to Label Small. Major Second scale (1.125), key base 14.
- Emphasized styles: heavier weight; recommended for selection, primary actions, badges, extended FAB, selected list and menu items.
- Brand typeface for Display and Headline; plain typeface for Body and Label. Roboto is the default for both; Roboto Flex is named as a replacement.
- Language height: small, medium (default recommendation), large, extra large.
- Per-style sizes, line heights and weights: not found as text (the token tables did not render).

### Elevation (elevation page, read 2026-11-15)
- Levels are described, not valued. Example given: a hovered FAB moves from level 3 to level 4; buttons rise one level on hover.
- Level-to-dp values and shadow values: not found on the page. Tokens have no shadows or colour; each platform decides.
- Surface tint is not named as a method; the page says elevation can be shown as tonal surface colours or shadows.

### Motion (motion overview, "how it works", read 2026-11-15)
- Physics system (springs), replacing easing and duration. Two schemes: expressive (default for most, overshoots) and standard (minimal bounce).
- Tokens: `md.sys.motion.spring.{fast|default|slow}.{spatial|effects}`. Spatial moves position, size, rotation, corners and may overshoot. Effects covers colour and opacity with no overshoot.
- Example: switches and buttons use fast; bottom sheet and expanded nav rail use default; full-screen uses slow.
- Numeric stiffness, damping and easing curves: not found on the pages read.

## Colour roles (colour roles page, read 2026-11-15)
- Accent roles: primary, secondary, tertiary, each with container and on-container, plus `on` pairs. Primary for the most important elements (FAB, high-emphasis buttons, active states). Secondary for less prominent items (filter chips, tonal buttons). Tertiary for contrast accents (input fields, badges).
- Error roles: error, error container and `on` pairs.
- Surface roles: surface, on surface, on surface variant; five surface container levels (lowest, low, default, high, highest). Surface for backgrounds; containers for cards, sheets and dialogs. Navigation area typically surface container.
- Surface add-ons: surface dim, surface bright (keep their relative brightness across light and dark).
- Inverse: inverse surface, inverse on surface, inverse primary (snackbars).
- Outline: outline for important boundaries (3:1); outline variant for dividers and decorative elements.
- Fixed accents: primary, secondary, tertiary fixed (and dim), same tone in light and dark; the page warns they can cause contrast issues.
- Pairing rule: apply colours only in their intended pairs. Accessible minimum pair contrast 3:1.

## Components (overview and specs pages, read 2026-11-15)
| Component | Facts read |
|---|---|
| Cards | Three variants: elevated, filled, outlined. Corner radius 12dp; 16dp left/right padding; 8dp maximum between cards. Elevated: surface container low. Filled: surface container highest. Outlined: surface with outline variant border. Lower elevation, no shadow by default. |
| Switch | Taller and wider track than M2; optional icon in the handle; new colour mappings meet non-text contrast. Numeric dimensions and selected colour tokens: not found (spec tokens not read). |
| Chips | Assist, filter, input, suggestion. Rounded rectangle. Elevation 0 by default. Stroke is outline variant (updated Aug 2024). |
| Buttons | Default and toggle. Five colour configs: elevated, filled, tonal, outlined, text. Five sizes. Default height 40dp, fully rounded. Standard leading and trailing icon 20dp. Expressive: round and square shapes; shape morphs on press and selection. |
| Icon buttons | Default and toggle. Filled, tonal, outlined, standard. Sizes: extra small, small (default), medium, large, extra large. Widths narrow, default, wide. Toggle: outlined icon unselected, filled icon selected. Web tooltip on hover. |
| Navigation bar | 3 to 5 destinations for compact and medium windows. Flexible navigation bar (expressive) is shorter, usable in medium windows. Active indicator is a pill; M3 uses filled icons plus indicator for active state. No drop shadow. |
| Bottom sheets | Standard and modal. Compact and medium breakpoints. 28dp top corner radius; max width 640dp; optional drag handle with 48dp hit target. |
| Dialogs | Basic and full-screen. Increased corner radius; larger headline; custom basic dialog positioning. Numeric radius: not found. |
| Sliders | Not read (page not opened). |

## Icons (icons overview, read 2026-11-15)
- Material Symbols is the icon set: variable font, three styles (outlined, rounded, sharp).
- Four axes: weight, fill, optical size, grade.
- Catalog at fonts.google.com/icons. Icon keyline template available.

## Theme builder (read 2026-11-15)
- Not readable. The page at https://material-foundation.github.io/material-theme-builder/ is canvas-based; the accessibility tree had only an "Enable accessibility" button. Export format (for example CSS custom properties) not confirmed. Seed colour and palette not read, per the prompt.

## Notes for the dashboard work
- The corner radii, state opacities and touch targets above are the numbers to use for `--md-sys-*` fallbacks in `habib-ui` (I48, D64), once the M3 theme is chosen.
- Glass or blur is not part of M3 as read; if the owner still wants it, it is a styling choice beyond M3 and should be labelled as such.
- Dashboard colours still come from the Material You theme (D64); none chosen here.

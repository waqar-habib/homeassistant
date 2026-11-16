# Material Design 3 component specs (read 2026-11-15)

Source: each component's `/specs` page on https://m3.material.io/components/<name>/specs, read as rendered text in Chrome by the Mac Claude session. Companion to `docs/design/m3-reference.md`. Paraphrased. Token tables (collapsed folders) and image-only measurement diagrams did not render as text, so some numbers are "not found". Colour roles are listed in the order the page printed them; where a role-to-element mapping is my reading of that order or of the element list, it is marked (inferred).

Read: switch, chips, buttons, icon buttons, button groups, navigation bar, bottom sheets, dialogs, sliders, lists, tabs, menus, snackbar, badges, progress indicators, cards. Not read: FAB, app bars, toolbars, text fields, search, carousel, date and time pickers, tooltips, side sheets, navigation rail and drawer, segmented button (now button groups), radio, checkbox, divider, loading indicator.

## 1. Selected versus unselected colours (answers question a)
| Component | Unselected | Selected |
|---|---|---|
| Switch | track surface container highest, outline `outline`, handle `outline` (inferred from list order) | track primary, handle on primary, handle icon on primary container (inferred) |
| Filled toggle button | container surface container, label and icon on surface variant | container primary, label and icon on primary |
| Tonal toggle button | container secondary container, content on secondary container | container secondary, content on secondary |
| Outlined toggle button | outline variant border, content on surface variant | container inverse surface, content inverse on surface |
| Elevated toggle button | container surface container low, content primary | container primary, content on primary |
| Icon button toggle (filled) | surface container, icon on surface variant | primary, on primary |
| Icon button toggle (tonal) | secondary container, on secondary container | secondary, on secondary |
| Icon button toggle (standard) | icon on surface variant | icon primary |
| Filter chip | outline variant border, label on surface variant | secondary container, label on secondary container |
| Navigation bar item | icon and label on surface variant | active indicator secondary container, icon on secondary container, label secondary |
| List item (expressive) | surface, text on surface | primary container, text on primary container |
| Menu item (standard) | surface container low, text on surface | tertiary container, text on tertiary container |

A card-like tile has no selected state on the cards page. The nearest M3 pattern is a list item or filled tonal toggle: primary container with on primary container, or secondary container with on secondary container. Cards: elevated uses surface container low, filled uses surface container highest, outlined uses surface with an outline variant border. (Sources: switch, buttons, icon buttons, chips, navigation bar, lists, menus, cards specs.)

## 2. Measurements (dp)
| Component | Value |
|---|---|
| Switch | track 52 x 32, outline 2, handle 16 unselected, 24 selected or with icon, 28 pressed, icon 16, state layer 40, target 48, shape full |
| Chips (all four) | height 32, corner 8, icon 18, side padding 16 (8 with icon), gap 8; avatar 24 with 12 corner; input chip close target min 48 |
| Button (default) | height 40 (M3 baseline), fully rounded; small padding 16 recommended (24 not recommended); sizes XS, S (default), M, L, XL; square corners 12, 12, 16, 28, 28; pressed corners 8, 8, 12, 16, 16; XS and S need a 48 x 48 target. Per-size heights: not found (diagram only) |
| Icon button | same size, shape and corner scale as buttons; widths narrow, default, wide; XS and S need a 48 x 48 target. State layers listed on its page: disabled 10%, hover 8%, focus 10%, pressed 10% |
| Button group | XS container height 32; standard inner padding XS 18, S 12, M 8, L 8, XL 8; connected padding 2 at every size; connected inner corners XS 4, S 8, M 8, L 16, XL 20; XS and S minimum width 48 |
| Navigation bar | full window width; baseline bar is no longer recommended in favour of the flexible bar (shorter; vertical items in compact, horizontal in medium); numeric heights: not found |
| Bottom sheet | width up to 640; top margin 72; above 640 wide, top and side margin 56; drag handle padding 22 top and bottom; corner 28 (overview page); height variable |
| Basic dialog | corner 28; width 280 to 560; padding 24; icon 24; title to body 16; body to actions 24; button gap 8; divider 1 |
| Full-screen dialog | corner 0; header 56; bottom action bar 56; padding 24; gap 8; max width 560 |
| Slider | track height XS 16, S 24, M 40, L 56, XL 96; handle height 44, 44, 52, 68, 108; handle width 4; track corner 8, 8, 12, 16, 28; inset icon 24 (M, L), 32 (XL); label container 48 x 44 |
| Tabs | height 48 (label only), 64 (icon and label); icon 24; divider 1; primary indicator 3, secondary 2; indicator min length 24; inline icon gap 8 |
| List | targets 48; label left padding 16; trailing right padding 24; divider inset 16 left and 24 right; selected item corner 16; unselected 4 inner and 16 outer; item height: not found |
| Menu (baseline) | width 112 to 280; corner 4; item height 48; padding 12; icon 24; divider 1. Expressive vertical menu measurements: not found |
| Badge | small 6 with corner 3; large one digit 16 with corner 8; large max count 16 x 34 |
| Progress | default thickness 4; flat or wavy; inset 4 from screen edge for linear. Other sizes: not found |
| Card | corner 12; side padding 16; gap between cards 8 max |

## 3. Colour roles per component (as printed)
- **Switch:** surface container highest, outline, outline, primary, on primary, on primary container. Adjacent label: on surface; supporting text on surface variant.
- **Slider:** inverse surface, inverse on surface, primary, on primary, primary, secondary container, on secondary container, on secondary container, on primary (active track primary, inactive track secondary container).
- **Tabs, primary:** surface container, primary active, on surface variant inactive, outline variant divider, primary indicator. Secondary tabs: on surface active label.
- **Bottom sheet:** surface container low, on surface variant (drag handle), scrim.
- **Basic dialog:** surface container high, on surface (headline), on surface variant (body), primary (text buttons), secondary (icon), scrim. Full-screen dialog: surface container high.
- **Snackbar:** inverse surface, inverse on surface, inverse primary (action).
- **Badge:** error with on error.
- **Progress indicator:** primary (active), secondary container (track).
- **Menu, standard:** surface container low, on surface text, on surface variant icons, tertiary container selected. Vibrant: tertiary container with on tertiary container, selected tertiary with on tertiary.
- **Navigation bar:** surface container.
- **List:** surface, on surface, on surface variant, outline variant (divider), primary container selected.
- **Chips:** assist outline border with primary icon; suggestion outline border; input and filter outline variant border; optional surface container low fill.
- **Disabled and states:** hover 8%, focus 10%, pressed 10%, dragged 16% (state layers page, `docs/design/m3-reference.md`).

## 4. Behaviour and rules that matter for the dashboard
1. Buttons: toggle buttons do not use the text style. A resting round toggle becomes square when selected (and the reverse). Pressed morphs to a smaller radius. Colour roles listed are defaults; others are fine if container and content have 3:1 contrast.
2. Icon buttons: use an outlined icon when unselected and a filled icon when selected.
3. Button groups: standard groups animate neighbours when one is selected; connected groups only change the selected button. Avoid text or standard icon buttons inside a group (no container).
4. Lists: one selection interaction per item; slots must keep 48 x 48 targets. Selected list items change corner shape.
5. Navigation bar: 3 to 5 destinations; flexible bar for expressive designs.
6. Sliders: horizontal and vertical, five sizes, optional value indicator and stops.
7. Progress: determinate or indeterminate; wavy is an expressive option.
8. Menus: standard (surface) or vibrant (tertiary, "used sparingly").
9. Nothing on these pages defines blur or frosted glass, and nothing addresses wall-mounted or high-density displays (the button groups page mentions a density setting only in passing).

## 5. Suggested mapping for `habib-ui` (proposal, not decided)
| Our card | M3 pattern | Roles |
|---|---|---|
| Light button (on) | filled tonal toggle or card | secondary container and on secondary container, or primary and on primary for emphasis |
| Light button (off) | same, unselected | surface container and on surface variant |
| Group buttons | connected button group | 2 dp gap, inner corner 8 (S) or 16 (L) |
| Scene or action button | filled or tonal button | primary or secondary container |
| Status strip chip | assist chip | height 32, corner 8, outline border |
| Brightness sheet | modal bottom sheet | surface container low, corner 28, drag handle, scrim |
| Lock and garage confirmation | basic dialog | surface container high, corner 28, text buttons in primary |
| Brightness control | slider | primary active, secondary container track |
| Tab bar on kiosk and iPhone | navigation bar | surface container, secondary container indicator |
| Tile corner | card shape | 12 dp (cards), 28 dp for sheets and dialogs |
| Touch targets | 48 dp minimum | state layer 40 dp |
| State overlays | state layers | hover 0.08, focus and pressed 0.10, dragged 0.16 |

Open choices for the owner: whether tiles follow M3 card (12 dp) or the larger expressive steps (20 dp, 32 dp); whether to keep Apple-style half-width tiles (decision D52) or switch to M3 cards; and whether any blur stays (not part of M3).

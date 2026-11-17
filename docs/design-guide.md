> **Superseded in part (2026-11-17):** the component library in [`docs/design/library/`](design/library/README.md) (Draft v0.3, Bootstrap 6 format, generic `ui-*` names) is now the reference for layout, components and naming. This file keeps the measured audit values, rationale and gap list (Draft v0.2). Where they differ, the library wins.

# Habib Glass design guide — Draft v0.2 (2026-11-16)

Audience: any AI tool (or person) that builds or changes a Habib Home Assistant dashboard.
Goal: two builds made from this guide by two different tools look the same: same fonts, sizes, colours, spacing, icons and behaviour.
Status: draft. v1.0 only after the owner's "GREEN LIGHT". Nothing in the dashboards was changed to write it.
v0.2 replaces the v0.1 estimates with values measured in Chrome on 2026-11-16 (`docs/design/audit-2026-11-16.md`). Dark values equal what is live. Light values are still proposed.

Values live in `docs/design/habib-tokens.yaml`. This guide explains how to use them. If the two disagree, the tokens file wins.

## 0. How to read this (context budget)

Load only what the task needs. Sizes are approximate.

| Task | Read | Skip |
|---|---|---|
| Add, move, hide or rename a card | Section 5 (card you need), section 6, `docs/dashboard-cookbook.md` | card JavaScript |
| Change a colour, font, radius | `habib-tokens.yaml`, section 8 | everything else |
| New component | Sections 2 to 4, 7, 9 and the tokens file | other components' code |
| Edit one card's code | Grep `habib-glass.js` for its marker (`// ---- C. habib-light`) and read that block only | the whole file (about 45,000 tokens) |
| Entity IDs | `docs/dashboard-config.md` or ha-mcp | guessing (CLAUDE.md rule 9) |

Never read `.storage/`, `secrets.yaml` or the PNG mocks unless the task is visual review.

## 1. What exists today (validated 2026-11-16)

1. **Nuvio is no longer used on either dashboard.** `habib-wh` and `habib-mkh` contain only `custom:habib-*` cards in a native `sections` view. The Nuvio dashboard `habib-home` is gone; `nuvio-shared` (admin, hidden) is a leftover. Three resources still load on every page and are not used by the glass cards: `nuvio.js`, Material You Utilities 2.2.0 and Material Symbols (measured).
2. **Stack:** HA sections view + theme "Habib Glass" (set per view; the profile theme is "Material You", dark) + custom elements in `www/habib/habib-glass.js` (loader v10) + pure logic in `habib-glass-logic.js` (28 node tests) + a Python generator for both configs.
3. **Look:** translucent glass panels on a dark evergreen wallpaper, drawn lamps that glow in the lamp's real colour, a very thin large clock, wide-tracked small-caps labels, warm amber as the one accent.
4. **Dark only.** There is no light variant, and the cards hard-code their colours inside each shadow root, so the HA theme cannot recolour them. Section 8 gives the path to a light and dark toggle.
5. **Seen so far:** measured in the real frontend in Chrome on a Mac at 12 viewport sizes from 430 × 932 to 2560 × 1440 (audit file). Both self-hosted fonts load. No overflow, clipped text or console error at any size. Not yet seen on a real iPhone, iPad or the wall tablet: Chrome does not reproduce iOS safe areas, the dynamic toolbar or touch.

## 2. Principles (how to decide when the guide is silent)

From the Figma UI principles article, applied to this house. Each has a testable rule.

| # | Principle | Rule here |
|---|---|---|
| 1 | Hierarchy | One hero per view. Size order is fixed: clock > metrics > titles > body > labels. Never invent a size between two type tokens. |
| 2 | Progressive disclosure | Phone shows state and one-tap actions; detail is one tap down (fold bar, room chevron, `•••` sheet, HA dialog). Never more than 2 levels. |
| 3 | Consistency | A control looks and behaves the same everywhere. New UI is built from section 4 primitives before any new CSS is written. |
| 4 | Contrast | Colour means state: warm = on or next, mint = safe, rose = needs attention. No decorative use of mint or rose. |
| 5 | Accessibility | Text 4.5:1, large text and icons 3:1 (WCAG 2.2 AA). Every control has a name, a focus ring and keyboard activation. State is never colour alone: text always says it. The live dashboards do not meet the text ratio yet (section 10, gap 2). |
| 6 | Proximity | One card per room or function. Risky things (lock, garage) sit apart from lamp toggles and never act on one tap (section 9). |
| 7 | Alignment | Everything sits on HA's 12-column section grid. No absolute positioning of content, no pixel offsets to "nudge". |

The Medium article "UI/UX Standards" was read in the audit. It is a general checklist of 14 standards; its only numbers (text 4.5:1, non-text 3:1) match rule 5, and nothing in it contradicts this guide. It adds five topics the guide was silent on. They are rules for new work from v0.2:

| # | From the article | Rule here |
|---|---|---|
| 8 | Hover and other states | On a pointer device a control may lighten its `raised` fill on hover. Hover never reveals information that touch cannot reach. |
| 9 | Feedback on failure | If a service call fails or the state has not changed after the 2.5 s pending window, the control returns to the real state and shows "No response". Never leave an optimistic state on screen. |
| 10 | Orientation | A layout must hold in portrait and landscape. Landscape phones (height under 500 px) get the phone layout. |
| 11 | Localisation | Clock, date and numbers follow the browser locale. Card wording is English only today; new wording goes through one string table per card so it can be translated later. |
| 12 | Performance | No new always-running animation, no second blur layer inside a card, images as SVG. A performance budget for the wall tablet is not set yet (section 10, gap 13). |

## 3. Tokens

### 3.1 Three tiers
1. **Primitive:** raw values (`#eef4ee`, `26px`). Only in the tokens file and the theme.
2. **Semantic:** role names (`text-dim`, `accent-mint`, `radius.card`). Components use only these.
3. **Component:** a component's own choices expressed in semantic tokens (`lamp card: radius.card, card-pad.lamp`).

Rule: component CSS holds no literal colour, font-size or radius. A literal in a review is a defect, except entity-driven colour (a lamp's own rgb).

### 3.2 Typography
Two self-hosted variable fonts: **Outfit** ("Habib Display") for numbers, titles and section labels; **Inter** ("Habib Text") for everything else. Fallback `system-ui`. Never load a web font from a CDN.

| Token | Font, weight, size/line | Tracking | Use |
|---|---|---|---|
| clock | Display 200, clamp(64, 19vw, 104)/0.92 | -0.04em | hero clock |
| clock-sm | Display 200, 54/0.95 | -0.04em | compact hero |
| metric-xl / lg / md / sm | Display 200, 56 / 40 / 36; 300, 30 | -0.04 to -0.02em | temperature, dial, countdown |
| headline | Display 700, 22/26 | -0.01em | list title |
| title-lg | Display 600, 18/22 | 0 | weather condition, media title |
| title | Display 600, 17/22 | -0.01em | card and lamp name |
| title-sm | Display 600, 15 | -0.01em | tile name, dock-bar value |
| bar-value | Display 600, 17 | 0 | fold-bar value ("71°") |
| section | Display 600, 13/16, UPPERCASE | 0.22em | section label |
| section-sm | Display 600, 12/14, UPPERCASE | 0.20em | room header |
| body | Text 500, 15 | 0 | rows, list items |
| label | Text 500 or 600, 13 | 0 | secondary line, item name, fold-bar text |
| sub / state | Text 500 / 600, 12/16 | 0 | subtitle, state line, slider value |
| hijri | Text 500, 12/16 | 0.02em | Hijri date |
| eyebrow | Text 600, 11/14, UPPERCASE | 0.14em | card eyebrow, fold-bar label |
| caption / micro | Text 600, 11/13 and 10/12 | 0 | compact chips, room counter, dial range |
| micro-caps | Text 600, 10/12, UPPERCASE | 0.12em | dock-bar label |

Every row above was checked against the computed style at 430 and 1440 wide.

Rules: numbers use `tabular-nums`. Units are a smaller sibling of the number, about half its size. AM/PM is in `text-dim`; the degree sign keeps the number's colour (measured: 28 of 56, 18 of 40, 17 of 36). Sentence case everywhere except `section` and `eyebrow`. New components do not go below 12 px; 10 and 11 px are codified only inside `habib-room` chips and dock bars.
The clock size follows the viewport width (`19vw`), not the card width: from 548 px upward it is 104 px even when the card is only 324 px wide. It fits today; a new hero layout must test "12:00 PM".

### 3.3 Colour (dark, codified)
| Role | Value | Use |
|---|---|---|
| text | `#eef4ee` | primary text |
| text-dim | text at 62% | secondary text, idle icons. Measured contrast 2.7 to 5.5, typically 3.2 to 3.6 |
| text-faint | text at 38% | placeholders and notes only, never state. Measured contrast 1.9 to 3.0 |
| accent-warm | `#ffc978` (255, 201, 120) | on, next prayer, progress, focus ring |
| accent-mint | `#9fd6b5` (159, 214, 181) | secure, home, playing, Adhan on |
| accent-rose | `#ff8a80` (255, 138, 128) | unlocked, open, error, missing |
| heat / cool | `#ffb36b` / `#8fc9ff` | climate only |
| surface | white 13% > 4% > 7% gradient at 160° + 22 px blur | every card |
| border | white 14% | every card |
| well | black 14% to 22% | inset tiles, slider track, input |
| raised | white 7% to 18% | pills, round buttons, tabs |
| page | `#12221a` under `evergreen.svg` | view background |

Accents are stored as `r, g, b` triples so one token gives fill (20 to 24%), border (25 to 50%), glow (50 to 90%) and solid.
Lamp colour is data, not a token: it comes from the entity (kelvin or rgb), softened 15% toward white; the fallback glow is 255, 196, 120.
No teal anywhere (owner decision D64). The purple "add" button on the list card is a one-off; do not reuse it.
One literal remains outside the roles: the slider value is `rgba(255, 255, 255, 0.9)` (token `slider-value`). New work uses `text`.
Measured card backgrounds (what text actually sits on): darkest 27, 55, 40; typical 57 to 68, 94 to 107, 77 to 88; hero 76, 123, 91; a lit lamp card 107, 112, 80.

### 3.4 Shape, elevation, blur
Radius steps: 26 card, 30 sheet, 20 tile, 18 panel, 16 item, 14 chip, 12 control, 8 small, 999 pill. A nested shape is always at least 6 px smaller than its parent.
One elevation: `inset 0 1px 0 white 18%` plus `0 18px 40px -18px black 55%`. Active lamps swap the drop shadow colour to the lamp colour. Nothing else casts a shadow except floating art.
Blur: 22 px + saturate 150% on cards, 30 px + 160% on sheets. With `prefers-reduced-transparency`, blur is off and the surface is the solid fallback.

### 3.5 Spacing and size
1. New work uses 4, 8, 12, 16, 24. The dense steps (2, 6, 10, 14, 18, 22) exist today and stay inside compact components.
2. HA owns the outer grid: 12 columns per section, 56 px rows, 8 px between cards, about 24 px between sections. Cards never add outer margin.
3. Card padding: 16 standard; 22 hero; 14 lamp; 6 to 8 compact room.
4. Fixed heights (measured): fold bar 60, dock bar 52, compact hero 130, lamp card 248 (4 rows), wide lamp 184 (3 rows), security item 52, lamp chip 46 (50.8 when the name wraps to 2 lines).
5. Touch targets: 44 px minimum for anything new, 48 preferred, 56 on the wall tablet. Measured targets under 44 px today: media volume slider 6 high, room header 22 high (full width), `•••` 26 × 26, media speaker tabs 28.5 high, lamp slider 34 high, people avatars 39.8, media side buttons 40. They stay until the owner approves a change; do not copy them.
6. The fold bar is not a small target: the whole 60 px bar takes the tap, and the 24 px chevron is decoration. The same holds for the 52 px dock bar and for a lamp card (the whole card toggles).

### 3.6 Icons and illustration
1. Interface icons: inline SVG, 24 viewBox, 1.8 stroke, round caps and joins, `currentColor`. Transport icons are filled. Sizes 14 to 26 from `size.icon`. No `mdi:` or `ha-icon` in glass cards.
2. Lamps are drawn, not icons: 120×150 art, 8 kinds (`table-lamp`, `floor-lamp`, `desk-lamp`, `pendant`, `shelf`, `nightlight`, `coach`, `group`), chosen per light with `art:` in YAML. A new kind reuses the shared gradients (`lit`, `unlit`, `metal`, `ceramic`, `wood`, `cone`, `bloom`).
3. Weather is drawn from layers (orb, cloud, rain, snow, bolt, fog); a new condition is a new layer rule in the logic file, not a new picture.
4. An icon changes shape as well as colour when state changes (closed and open padlock).

### 3.7 Motion
Press: scale 0.97 with an overshoot curve, 180 ms. State change: 300 to 400 ms on colour and shadow. Sheet: 320 ms up, scrim 200 ms. Ambient loops (lamp breathing 5 s, weather, record) run only on visible state. Every tap sends a light haptic. `prefers-reduced-motion` turns all of it off.

## 4. Primitives (build everything from these)

| Primitive | Class today | Spec |
|---|---|---|
| Surface | `.glass` | radius.card, surface, border, elevation.card, blur.card, text colour, text font |
| Well | `.t`, `.it`, `.chip`, `.slider` | well fill, well-border, radius 12 to 20, sits inside a surface |
| Pill | `.pill`, `.tab`, `.adhan` | radius.pill, raised fill, caption or state type, padding 5 to 7 by 8 to 11 |
| Round button | `.fold`, `.b` | raised fill, round, icon 16 to 18; primary variant is solid white with dark ink |
| Bar | `.mini` | 60 high (52 stacked), eyebrow label left, value right, chevron; optional 3 px progress line. The whole bar is the button. Value in bar-value (17), text in label (13); stacked: title-sm (15) and micro-caps |
| Status dot | `i` in `.state` | 7 px, colour = state, glow 8 to 10 px when active |
| Section label | `habib-label` | section type on the wallpaper, optional note right in sub type |
| Sheet | `.sheet` | bottom, max 560 wide, radius.sheet top, 38×5 handle, safe-area padding |
| Focus ring | `:focus-visible` | 2 px accent-warm at 80% |

Every state a control can show, with its exact wording:

| State | Look | Text |
|---|---|---|
| Off | desaturated art (saturate 0.6, brightness 0.9), dim dot | "Off", "All off" |
| On | accent or lamp-colour border, glow, coloured dot | "82%", "On", "3 of 7 on" |
| Pending | unchanged look | "…" for up to 2.5 s |
| No response (unavailable, unknown) | 50% opacity, no pointer | "No response" |
| Not found (bad entity ID) | 50% opacity, rose note | "Not found", "Missing: <id>" |
| Alert | rose border and icon | the state word, for example "Unlocked" |

## 5. Components (the contract)

All options are YAML. `collapsible`, `collapsed`, `remember`, `fold_layout: stack` and `direct` are shared by every card marked F.

| Card | Purpose | Options | Grid (cols × rows) | F |
|---|---|---|---|---|
| `habib-hero` | clock, date, Hijri, weather, people | `weather`, `sun`, `persons[]`, `compact`, `hijri` | 12 × auto (min 260; compact 130) | |
| `habib-label` | section label | `label`, `note` | 12 × 1 | |
| `habib-light` | one lamp or a group; tap toggles, slider dims, `•••` colour sheet | `name`, `entities[]`, `art`, `size: wide`, `room` | 6 × 4, wide 12 × 3 | |
| `habib-room` | a room as lamp chips; chevron opens the full lamp cards | `name`, `note`, `lights[]` (habib-light configs), `remember` | 12 × auto | always |
| `habib-security` | lock and garage status | `items[]` (`entity`, `name`, `kind`, `states`, `ok_states`, `tap`), `subtitle`, `title`, `direct` | 12 × auto | F |
| `habib-climate` | dial per thermostat; tap opens HA's dialog | `entities[]` (`entity`, `name`, `short`), `title` | 12 × auto | F |
| `habib-prayer` | five prayers, next with countdown, Adhan status | `prayers{}`, `adhan` | 12 × auto | F |
| `habib-media` | speaker tabs, art or record, transport, volume | `players[]` | 12 × auto | F |
| `habib-todo` | list with quick add | `entity`, `title`, `max_items` | 12 × auto | F |
| `habib-dock` | folded F cards two per row; an opened one takes the row | `cards[]` (security, climate, media, todo, prayer only) | 12 × auto | |

Composition rules:
1. A section is `habib-label` then cards of one kind. Lamp cards go two per row; the first lamp of a room with an odd count is `size: wide`.
2. Order of sections: hero, Home (security, climate), Floors, rooms downstairs then upstairs, Outdoor, Listen, Lists.
3. A fold bar summary is one line: label, value, optional progress. If it needs two lines, the card should not fold. A stacked dock bar has about 100 px for its value at 430 wide: write the summary to fit that (today "Down 71° Up 70°" and "Nothing playing" wrap; section 10, gap 9).
4. Group lamps (`art: group`) show "n of m on"; a group may mix `light.*` and `switch.*`.

## 6. Responsive layout

### 6.1 Target devices and columns (measured 2026-11-16)

**Column rule.** HA decides the columns from the width left for the view (viewport minus a docked sidebar of 256 px):
columns = the smaller of `max_columns` (4) and floor((view width − 32) ÷ 352).
So 2 columns need a view of 736 px, 3 need 1088 px, 4 need 1440 px. A section is 320 to 500 px wide with a 32 px gap; beyond 4 × 500 the block is centred and the margins grow. The rule matched all 27 measurements.

| Device | CSS viewport | Sidebar | Columns, sidebar docked (measured) | Columns, sidebar hidden |
|---|---|---|---|---|
| iPhone 15 Plus | 430 × 932 | never shown | n/a | 1 (measured). MKH compact ends at 740 px |
| iPad mini portrait | 744 × 1133 | hidden by HA | n/a | 2 (measured) |
| iPad / Air portrait | 820 × 1180 | hidden by HA | n/a | 2 (measured) |
| iPad Pro portrait | 1024 × 1366 | docked | 2 | 2 (rule) |
| iPad landscape | 1180 × 820 | docked | 2 | 3 (rule) |
| Wall tablet at 2x | 960 × 540 | docked | 1 | 2 (rule) |
| Wall tablet at 1.5x | 1280 × 720 | docked | 2 | 3 (rule) |
| Wall tablet at 1x | 1920 × 1080 | docked | 4 | 4 (rule) |
| MacBook Air 13 | 1440 × 900 | docked | 3 | 4 (v0.1 mock) |
| MacBook Pro 14 | 1512 × 982 | docked | 3 | 4 (rule) |
| MacBook Pro 16 | 1728 × 1117 | docked | 4 | 4 (rule) |
| Large monitor | 2560 × 1440 | docked | 4, sections 500 wide, 360 px side margins | 4 (rule) |

"(rule)" means derived from the column rule, not seen: hiding the sidebar is an HA setting and the audit changed nothing. HA hides the sidebar by itself on narrow screens (seen hidden at 820, docked at 1024). The wall tablet model and its pixel ratio are still open (I5); it should run with the sidebar hidden.

### 6.2 Rules
1. **Mobile first.** Design the 430 px layout, then let HA add columns. The card decides nothing about page columns.
2. **Two breakpoints only.** Phone `(max-width: 699px)`, wide `(min-width: 700px)`, applied with section `visibility`. Column count above that belongs to HA (`max_columns: 4`). Do not add a third query without an owner decision. Measured defect: the two queries leave widths between 699 and 700 px uncovered, and at 699.09 px habib-mkh rendered no section at all. A pair of queries must always cover every width; the proposed pair is `(max-width: 699.98px)` and `(min-width: 700px)` (section 10, gap 8).
3. **Fluid inside the card.** Use `clamp()`, `minmax(0, 1fr)`, `auto-fit` and `min-width: 0`. No fixed widths except art (112 record, 132 dial max). Text wraps at word boundaries, at most 2 lines, never mid-word.
4. **Per-device variants** come from config, not code: `compact: true`, `collapsible: true`, `habib-room` instead of a lamp section.
5. **One phone screen for MKH:** at 430 × 932 the compact section must end above the fold. Measured: the last card ends at 740 px, 192 px to spare in Chrome. The iPhone's own bars take part of that, so the owner's phone check decides.
6. **Never:** horizontal page scroll, clipped names, more than 4 lamp chips in a row, hover-only information.
7. **Wall tablet:** targets 56 px, no fold bars (cards stay open), no behaviour that needs a long press.
8. **Sections in one row should be of similar height.** Measured on wide habib-mkh: the hero section is 262 px beside a 462 px Home section, which leaves about 200 px of bare wallpaper under the clock. habib-wh avoids it by putting the Prayer bar under the hero.

## 7. Building a new component

1. Extend `GlassCard`. Implement `_validate`, `_signature`, `_render`; add `_summary` if it folds.
2. Render only when the signature (the states and attributes you display) changes.
3. Take every entity, name, icon choice and label from YAML. No entity ID in JavaScript.
4. Register with `registerCard` and return `getGridOptions` so the editor and the grid know the size.
5. Use section 4 primitives and tokens only. Put pure logic in `habib-glass-logic.js` with a node test.
6. Give every control a role, an `aria-label` that includes the state, keyboard Enter and Space, and the focus ring.
7. Handle the six states in section 4, with the same words.
8. Bump `VERSION` in `loader.js` and the resource URL together. Add the card to section 5 and its values to the tokens file in the same commit.

Token-saving structure (recommended refactors, not done):
1. Share the `GLASS` stylesheet across shadow roots with one constructable stylesheet (`adoptedStyleSheets`) instead of copying the string into every card. One edit point, less memory.
2. Split `habib-glass.js` into one file per card plus `glass-base.js`, so a tool loads about 3,000 tokens for a card edit instead of 45,000.
3. Make cards respond to their own width with container queries, so `habib-mkh` no longer needs every section twice (its config is 7.5 KB against 4.7 KB for `habib-wh`).
4. Keep generating both dashboards from `dashboards/habib-glass-build.py`; shared dictionaries there are the dashboard-level components.

## 8. Customising without breaking the system

| Change | Where | Effort |
|---|---|---|
| Layout: order, width, columns, hide per device | dashboard YAML (`grid_options`, `max_columns`, `visibility`), via the generator | config only |
| Lamp drawing, names, group members, fold | dashboard YAML | config only |
| Accent, text or surface colour; radius; fonts | tokens file, then theme + `GLASS` (today: two places) | JS deploy, loader bump |
| Wallpaper | new SVG in `www/habib/bg/`, theme `lovelace-background` | theme reload |

Light and dark toggle (proposed, three steps, each needs approval):
1. Move semantic tokens into `themes/habib_glass/habib_glass.yaml` as `habib-*` keys under `modes: dark` and `modes: light`. HA publishes every theme key as a CSS variable that reaches into the cards.
2. Change `GLASS` to read them with today's dark values as fallback: `--g-text: var(--habib-text, #eef4ee)`. Replace the remaining literals (white and black alphas) with `well`, `raised`, `track`, `border`. The dark result must be pixel-identical to today.
3. Draw `evergreen-light.svg`, tune the proposed light values in the tokens file against real contrast measurements, then let HA's own profile setting (Auto, Light, Dark) do the switching.

After step 2 a colour-scheme change is a theme edit and a theme reload: no JavaScript, no version bump.
Unverified: that a theme set per view follows the profile's light or dark choice. Check before step 3.
Measured state: the theme "Habib Glass" has 41 keys and no `modes`; HA reports dark mode on; no habib stylesheet has a `prefers-color-scheme` rule. A light preference therefore cannot change the cards today. This is read from the computed styles, not seen: Chrome's light emulation was not available in the audit.
The measured contrast changes step 3: the light palette must be tuned on real card pixels, as the dark one was not.

## 9. Safety and behaviour rules that design may not override

1. Lock and garage: status, or a tap that opens HA's own dialog. A card never calls a lock or cover service.
2. Climate: tap opens HA's dialog. No setpoint call from a card.
3. Adhan: shown, never changed.
4. Nursery lamps are in no floor group.
5. A scroll that starts on a slider must not change the value (`touch-action: pan-y`; only a horizontal drag or a still tap commits).
6. Fold state may be remembered per device; it never calls a service.

## 10. Known gaps against this guide (measured 2026-11-16 unless marked)

Each fix is a change to the cards, the theme or the dashboards, so each needs the owner's go-ahead. None is done.

| # | Gap | Evidence (audit file) | Proposed fix |
|---|---|---|---|
| 1 | No light mode; colours are literals in each shadow root | theme has no `modes`; computed styles | section 8 steps 1 to 3 |
| 2 | Text contrast is below AA. `text-dim` is 2.7 to 5.5, typically 3.2 to 3.6; `text-faint` 1.9 to 3.0; primary text on the hero 4.4 | pixel samples of 7 card areas | dim to about 84% (72% only reaches 3.8); darken the hero surface; keep faint off anything that carries meaning |
| 3 | Seven controls under 44 px: media volume 6, room header 22, `•••` 26, media tabs 28.5, lamp slider 34, avatars 39.8, media buttons 40 | rendered sizes | grow the hit area with padding, keep the visible size |
| 4 | Spacing is not on a single scale (13 distinct steps) | CSS (source, not re-measured) | new work on 4, 8, 12, 16, 24; migrate when a card is next touched |
| 5 | Two warm values (accent 255, 201, 120; lamp fallback 255, 196, 120) | `GLASS` and logic file | leave; documented as separate roles |
| 6 | Type has 27 roles across 16 sizes | section 3.2 | merge 17/18 and 12/13 when cards are next touched (owner call) |
| 7 | Column count: closed. The rule in 6.1 covers every width | 27 measurements | none. Check the tablet with the sidebar hidden when it arrives |
| 8 | habib-mkh is blank between 699 and 700 px wide | seen at 699.09 px | `(max-width: 699.98px)` in `habib-glass-build.py`, regenerate |
| 9 | Dock bars wrap at 430: Climate goes to 2 value lines and 54 px, Listen to 2 lines | zoom screenshot | shorter summaries ("71° · 70°", "Idle") or a smaller value size in the dock |
| 10 | Prayer fold bar reads "Times unavailable" from Isha until the sensors roll over after midnight | all six sensors valid at 21:33 CST | show tomorrow's Fajr, or "Isha done" |
| 11 | Empty 200 px under the hero on wide habib-mkh | section heights 262 and 462 | move a bar under the hero, as on habib-wh |
| 12 | Slider value is a white literal | computed colour | use `text` |
| 13 | No performance budget; three unused resources load on every page | console and resource list | remove `nuvio.js` from resources; decide on Material You Utilities and Material Symbols; set a budget once the tablet model is known |
| 14 | Not verified on real iOS or on the wall tablet | Chrome only | owner checks on iPhone and iPad; tablet when chosen (I5) |
| 15 | Light-mode behaviour not observed, only inferred | emulation unavailable | check when section 8 step 1 is approved |

## 11. Acceptance: when is a build "identical"?

A change passes when all of these hold at 430 × 932, 820 × 1180, 1024 × 1366, 1280 × 720, 1440 × 900, 1920 × 1080 and 2560 × 1440:
1. Every computed `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `border-radius` and colour on a habib element equals a token.
2. No horizontal scroll, no clipped or mid-word-broken text, no overlap.
3. Every new control is at least 44 px; text contrast meets 4.5:1 (3:1 for 18 px and above and for icons).
4. Each of the six states renders with the wording in section 4.
5. Keyboard: Tab reaches every control, the focus ring shows, Enter and Space act.
6. Reduced motion and reduced transparency both render correctly.
7. The lock and garage click test shows zero service calls.
8. Screenshot diff against the previous approved render is empty outside the changed card.
9. `node --test tests/habib-ui/` passes; `ha core check` passes; the config is read back and its hash recorded.

## 12. Sources
- Live configs via ha-mcp, 2026-11-16: habib-wh `95f4c477d92c3e07`, habib-mkh `c0d82737c4398684`.
- `www/habib/habib-glass.js`, `habib-glass-logic.js`, `themes/habib_glass/habib_glass.yaml`, `dashboards/habib-glass-build.py`.
- Mocks in `docs/design/glass-*.png`. Decisions D48, D60, D64, D70, D71, D75, D76.
- Figma, "UI design principles" (section 2). WCAG 2.2 AA for contrast and names; 44 px and 48 px targets follow Apple and Material guidance.
- Medium, Chathurika Wijekoon, "UI/UX Standards" (section 2, rules 8 to 12).
- `docs/design/audit-2026-11-16.md`: every "measured" value in this guide.

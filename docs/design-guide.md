# Habib Glass design guide — Draft v0.1 (2026-11-16)

Audience: any AI tool (or person) that builds or changes a Habib Home Assistant dashboard.
Goal: two builds made from this guide by two different tools look the same: same fonts, sizes, colours, spacing, icons and behaviour.
Status: draft. v1.0 only after the owner's "GREEN LIGHT". Nothing in the dashboards was changed to write it.

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

1. **Nuvio is no longer used on either dashboard.** `habib-wh` and `habib-mkh` contain only `custom:habib-*` cards in a native `sections` view. The Nuvio dashboard `habib-home` is gone; `nuvio-shared` (admin, hidden) and the `nuvio.js` resource are leftovers. The table in `CLAUDE.md` still says "Dashboard: Nuvio"; it is out of date.
2. **Stack:** HA sections view + theme "Habib Glass" (set per view) + custom elements in `www/habib/habib-glass.js` (loader v10) + pure logic in `habib-glass-logic.js` (28 node tests) + a Python generator for both configs.
3. **Look:** translucent glass panels on a dark evergreen wallpaper, drawn lamps that glow in the lamp's real colour, a very thin large clock, wide-tracked small-caps labels, warm amber as the one accent.
4. **Dark only.** There is no light variant, and the cards hard-code their colours inside each shadow root, so the HA theme cannot recolour them. Section 8 gives the path to a light and dark toggle.
5. **Seen so far:** headless Chromium mocks at 430, 1024 and 1440 wide. Not yet measured in the real frontend at the target devices (prompt: `docs/prompts/mac/2026-11-16-design-guide-audit.md`).

## 2. Principles (how to decide when the guide is silent)

From the Figma UI principles article, applied to this house. Each has a testable rule.

| # | Principle | Rule here |
|---|---|---|
| 1 | Hierarchy | One hero per view. Size order is fixed: clock > metrics > titles > body > labels. Never invent a size between two type tokens. |
| 2 | Progressive disclosure | Phone shows state and one-tap actions; detail is one tap down (fold bar, room chevron, `•••` sheet, HA dialog). Never more than 2 levels. |
| 3 | Consistency | A control looks and behaves the same everywhere. New UI is built from section 4 primitives before any new CSS is written. |
| 4 | Contrast | Colour means state: warm = on or next, mint = safe, rose = needs attention. No decorative use of mint or rose. |
| 5 | Accessibility | Text 4.5:1, large text and icons 3:1 (WCAG 2.2 AA). Every control has a name, a focus ring and keyboard activation. State is never colour alone: text always says it. |
| 6 | Proximity | One card per room or function. Risky things (lock, garage) sit apart from lamp toggles and never act on one tap (section 9). |
| 7 | Alignment | Everything sits on HA's 12-column section grid. No absolute positioning of content, no pixel offsets to "nudge". |

"URL 1" (the Medium UI/UX standards article) could not be read from this session (the site refused the request). No rule here is attributed to it. The Mac audit prompt reads it in Chrome and lists any gap.

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
| title-sm | Display 600, 15 | -0.01em | tile name, fold-bar value |
| section | Display 600, 13/16, UPPERCASE | 0.22em | section label |
| section-sm | Display 600, 12/14, UPPERCASE | 0.20em | room header |
| body | Text 500, 15 | 0 | rows, list items |
| label | Text 500 or 600, 13 | 0 | secondary line, item name |
| sub / state | Text 500 / 600, 12/16 | 0 | subtitle, state line |
| eyebrow | Text 600, 11/14, UPPERCASE | 0.14em | card eyebrow, fold-bar label |
| caption / micro | Text 600, 11/13 and 10/12 | 0 | compact chips only |

Rules: numbers use `tabular-nums`. Units (`°`, AM/PM, `%`) are a smaller sibling of the number, about half its size, in `text-dim`. Sentence case everywhere except `section` and `eyebrow`. New components do not go below 12 px; 10 and 11 px are codified only inside `habib-room` chips and dock bars.

### 3.3 Colour (dark, codified)
| Role | Value | Use |
|---|---|---|
| text | `#eef4ee` | primary text |
| text-dim | text at 62% | secondary text, idle icons |
| text-faint | text at 38% | placeholders and notes only, never state |
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

### 3.4 Shape, elevation, blur
Radius steps: 26 card, 30 sheet, 20 tile, 18 panel, 16 item, 14 chip, 12 control, 8 small, 999 pill. A nested shape is always at least 6 px smaller than its parent.
One elevation: `inset 0 1px 0 white 18%` plus `0 18px 40px -18px black 55%`. Active lamps swap the drop shadow colour to the lamp colour. Nothing else casts a shadow except floating art.
Blur: 22 px + saturate 150% on cards, 30 px + 160% on sheets. With `prefers-reduced-transparency`, blur is off and the surface is the solid fallback.

### 3.5 Spacing and size
1. New work uses 4, 8, 12, 16, 24. The dense steps (2, 6, 10, 14, 18, 22) exist today and stay inside compact components.
2. HA owns the outer grid: 12 columns per section, 56 px rows, 8 px between cards, about 24 px between sections. Cards never add outer margin.
3. Card padding: 16 standard; 22 hero; 14 lamp; 6 to 8 compact room.
4. Fixed heights: fold bar 60, dock bar 52, compact hero 130, lamp card 248 (4 rows), wide lamp 184 (3 rows).
5. Touch targets: 44 px minimum for anything new, 48 preferred, 56 on the wall tablet. Known smaller controls today: fold button 30 (22 in compact), `•••` 26, slider 34 tall, media side buttons 40, lamp chip 46. They stay until the owner approves a change; do not copy them.

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
| Bar | `.mini` | 60 high (52 stacked), eyebrow label left, value right, chevron; optional 3 px progress line |
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
3. A fold bar summary is one line: label, value, optional progress. If it needs two lines, the card should not fold.
4. Group lamps (`art: group`) show "n of m on"; a group may mix `light.*` and `switch.*`.

## 6. Responsive layout

### 6.1 Target devices
| Device | CSS viewport | Layout | Verified |
|---|---|---|---|
| iPhone 15 Plus | 430 × 932 (3x) | 1 column; MKH compact on one screen | mock only |
| iPad mini / iPad / Air, portrait | 744 to 820 wide | expanded, 2 columns expected | no |
| iPad Pro portrait, iPad landscape | 1024 to 1180 wide | 2 columns at 1024 | 1024 mock |
| Wall tablet, 1920 × 1080 panel | 1920 × 1080 only at 1x; 1280 × 720 at 1.5x; 960 × 540 at 2x | 4, 3 or 2 columns: depends on the tablet's pixel ratio | no, model not chosen (I5) |
| MacBook Air 13 / Pro 14 / Pro 16 | 1440 to 1470, 1512, 1728 wide | 4 columns | 1440 mock |
| Large monitor | 1920 to 2560 wide | 4 columns (`max_columns: 4`), extra width behaviour unknown | no |

### 6.2 Rules
1. **Mobile first.** Design the 430 px layout, then let HA add columns. The card decides nothing about page columns.
2. **Two breakpoints only.** Phone `(max-width: 699px)`, wide `(min-width: 700px)`, applied with section `visibility`. Column count above that belongs to HA (`max_columns: 4`). Do not add a third query without an owner decision.
3. **Fluid inside the card.** Use `clamp()`, `minmax(0, 1fr)`, `auto-fit` and `min-width: 0`. No fixed widths except art (112 record, 132 dial max). Text wraps at word boundaries, at most 2 lines, never mid-word.
4. **Per-device variants** come from config, not code: `compact: true`, `collapsible: true`, `habib-room` instead of a lamp section.
5. **One phone screen for MKH:** at 430 × 932 the compact section must end above the fold (last mock: about 720 px of content).
6. **Never:** horizontal page scroll, clipped names, more than 4 lamp chips in a row, hover-only information.
7. **Wall tablet:** targets 56 px, no fold bars (cards stay open), no behaviour that needs a long press.

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

## 9. Safety and behaviour rules that design may not override

1. Lock and garage: status, or a tap that opens HA's own dialog. A card never calls a lock or cover service.
2. Climate: tap opens HA's dialog. No setpoint call from a card.
3. Adhan: shown, never changed.
4. Nursery lamps are in no floor group.
5. A scroll that starts on a slider must not change the value (`touch-action: pan-y`; only a horizontal drag or a still tap commits).
6. Fold state may be remembered per device; it never calls a service.

## 10. Known gaps against this guide (found from the source, not yet measured live)

| # | Gap | Evidence | Proposed fix |
|---|---|---|---|
| 1 | No light mode; colours are literals in each shadow root | `GLASS`, theme has no `modes` | section 8 steps 1 to 3 |
| 2 | `text-dim` at 10 to 12 px is about 4:1 on the lightest glass (estimate), `text-faint` about 2.5:1 | computed from token values over the wallpaper's lightest stop | raise dim to about 72%; keep faint off anything that carries meaning |
| 3 | Controls under 44 px (list in 3.5) | CSS sizes | grow the hit area with padding, keep the visible size |
| 4 | Spacing is not on a single scale (13 distinct steps) | CSS | new work on 4, 8, 12, 16, 24; migrate when a card is next touched |
| 5 | Two warm values (accent 255, 201, 120; lamp fallback 255, 196, 120) | `GLASS` and `habib-glass-logic.js` | leave; documented as separate roles |
| 6 | Type has 24 roles across 16 sizes | section 3.2 | merge 17/18 and 12/13 when cards are next touched (owner call) |
| 7 | Column count unknown at 744, 820, 1180, 1280, 1512, 1728, 1920, 2560 | only 430, 1024, 1440 rendered | Mac audit |
| 8 | "URL 1" unread | fetch refused | Mac audit reads it |

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

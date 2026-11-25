# Ultra Card dashboard plan: Draft v0.1 (2026-11-25)

Owner goal: build and change dashboards by hand in a UI (pick components, drag and drop, add and remove items, create tabs), not by YAML or prompting. Owner chose Ultra Card (https://github.com/WJDDesigns/Ultra-Card) for its builder and Liquid Glass theme.

## 1. Findings (read from the repo, docs and Connect source, 2026-11-25)
| Item | Fact |
|---|---|
| Health | MIT, 285 stars, v3.14.6 on 2026-11-23, about weekly releases, active betas. One developer (WJD Designs) |
| Install | HA Marketplace (2026.11+, our version 2026.11.3). Frontend only: browser reload, no restart |
| Card builder | `custom:ultra-card`: Layout Builder (rows, columns, nested modules, drag and drop), 4-tab module editor (General, Actions, Logic, Design), 66 free modules, Template Mode, per-user visibility |
| Third-party cards | Any native or custom card can be embedded, free. Our `ui-prayer` and others can stay during the move |
| FreeSpace | Free-form view layout: drag, resize, rotate, layer, group, lock, align, snap grid, undo; Desktop / Laptop / Tablet / Phone layouts (Phone stacks by default); "Fit to screen" for wall tablets; starter layouts; imports a Sections view |
| FreeSpace needs | Ultra Card Connect integration (`ultra_card_pro_cloud`, 6 stars, needs a restart). Setup option "without an account": then it makes no calls to ultracard.io (signed-out poll returns locally) |
| Ultra Dashboard | One-click generated dashboard from areas (styles glass, bold, monochrome, material); "Take control" turns it into editable Ultra Cards |
| Themes | 15 built-in, including `liquid_glass` (clear glass, blur, refraction, capsule controls, pale blue-to-pink wallpaper, 32 px radius). Hub theme editor can change surfaces and page background |
| Storage | Cards and FreeSpace positions live in the normal Lovelace dashboard config, so they export to git and are in HA backups |
| Pro (paid) | Cloud sync, daily cloud backups, 28 PRO modules. Not needed: git exports and HA backups cover it |
| Privacy | README: no tracking, free tier local-only. Preset Gallery browsing contacts ultracard.io |

## 2. Risks
1. One-developer project with weekly releases: an update can change looks or break a layout. Mitigation: auto-update off, update on purpose after a backup, git export before every update.
2. FreeSpace patches HA's view editor (guarded) and depends on a 6-star integration: an HA update can break the layout picker. Existing FreeSpace views keep rendering without Connect.
3. Lock-in: layouts become `custom:ultra-card` and FreeSpace config, readable only by Ultra Card.
4. Safety: Ultra modules can call `lock.unlock` and `cover.open_cover` in one tap. Our `ui-*` library refused them (D48, D60). New rule needed (decision 4).
5. Editing is a desktop or iPad job; iPhone touch editing is limited.
6. Liquid Glass ships a light pale wallpaper; our scheme is dark evergreen (D78: one scheme, background from one hex).

## 3. Phases
| Phase | Work | Who | Tier |
|---|---|---|---|
| 0 | Owner answers section 4. Claude reviews the release bundle and Connect source in full before install | Claude | 0 |
| 1 | Backup, install Ultra Card from the Marketplace (auto-update off). Install Connect "without an account" and restart in a prayer-safe window | Claude | 3 |
| 2 | Sandbox `uc-lab` (admin only): generate Ultra Dashboard (glass), apply Liquid Glass, add one FreeSpace tab and one Sections tab, embed `ui-prayer`. Owner tries it for 30 min on Mac, iPhone, iPad | Claude sets up, owner tests | 2 |
| 3 | Owner builds the new WH dashboard by hand. Claude supplies a one-page cheat sheet, entity names, lock and garage guards, and exports to git after each owner session | Owner, Claude assists | 2 |
| 4 | MKH dashboard: simple, per-user visibility; Noor's Bedtime, Skip, Pause buttons | Owner, Claude assists | 2 |
| 5 | Kiosk on the Redmi Pad 2 (FreeSpace, Fit to screen); waits for the kiosk scope | Owner, Claude assists | 2 |
| 6 | Cutover: default dashboard per user, keep `habib-*-next` 2 weeks as fallback, then retire the `ui-*` resources | Claude | 3 |

Tabs are ordinary HA views: owner adds them from the dashboard editor (pencil, add view), each with its own layout (FreeSpace or Sections). Suggested: Home, Rooms, Prayer, Media, Nursery, Security, Kiosk.

Claude's role after cutover: entities, automations, safety review, git exports, updates. No more hand-written card JavaScript.

## 4. Owner decisions
1. Look: Liquid Glass as shipped (light, pale blue-pink) or Liquid Glass panes on the dark evergreen background. Recommend: try both in the sandbox.
2. Layout engine per tab: FreeSpace (free-form, separate phone layout) or Sections with Ultra Cards (grid, phone reflows itself). Recommend: FreeSpace for Mac and kiosk tabs; Sections for phone dashboards.
3. Connect without an account, no Pro. Recommend: yes.
4. Lock and garage on the new dashboards: open HA's own dialog (current rule) or an Ultra button with a confirmation step. Recommend: HA dialog.
5. Start from the generated Ultra Dashboard or from blank. Recommend: generate in the sandbox to learn the modules, build the real dashboards blank.
6. Old dashboards stay live until cutover. Recommend: yes.

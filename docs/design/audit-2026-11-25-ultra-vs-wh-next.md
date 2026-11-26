# Audit: Habib Home (Ultra) vs habib-wh-next, end-to-end UI/UX (2026-11-25)

Run from the Mac in Chrome (Claude in Chrome), 18:31–19:27 CST, prompt `docs/prompts/mac/2026-11-25-ultra-uiux-e2e.md` (owner GREEN LIGHT 2026-11-25). Dashboards: `/habib-home-uc` (Ultra Card v3.14.6, FreeSpace, Liquid Glass) and `/habib-wh-next` (custom `ui-*` cards, one `ui-page` in a panel view). Screenshots are in the Mac session scratchpad only (repo is public); file names are given per finding.

## 0. Summary
1. **Blocking defect (new I79):** HA cards embedded in Ultra Cards (`native_card` module) keep the state they had at first render. The Ultra Card gets live state but does not pass it to the embedded tile, grid, thermostat or markdown card. Tiles show stale state and toggles only work once (HA's toggle picks on/off from the stale state). The Front door and Garage tiles can show an old lock or door state.
2. Layout and editing work as promised: move, resize, undo and the Ultra editor are reachable in 1–2 actions; the phone layout follows the desktop layout with no edits.
3. Two more FreeSpace/Liquid Glass bugs: the wallpaper disappears after switching tabs, and hidden tabs keep a stale layout after a window resize.
4. WH-next has no layout defects at any size and all round trips work, but it cannot be edited by hand (one panel card).
5. Nothing was left changed. The only unexpected event (garage opened 18:48:49, closed 18:54:49) did not come from HA (section 6).

## 1. Viewports (Part A)
The Chrome window runs at 110 % zoom and cannot go below about 500 px wide or above 794 CSS px of viewport height on this screen.

| Asked | Got (CSS viewport) |
|---|---|
| 430x932 | 455x686 (width and height not reachable) |
| 393x852 | 455x614 (not reachable; same width as 430) |
| 820x1180 | 745x794 (height not reachable) |
| 1180x820 | 1073x585 |
| 1440x900 | 1309x657 |
| 1920x1080 | 1745x794 (height not reachable) |

Measured with a read-only script through shadow roots at every size and tab (Ultra) or the single page (WH-next).

| Check | /habib-home-uc | /habib-wh-next |
|---|---|---|
| Horizontal page overflow | 0 at all sizes | 0 at all sizes |
| Card overlaps | Hero x Home, 2–3 px, at every two-column width (Hero auto height grows 300 → 327) | none |
| Clipped text | "Skip Evening Lights" truncated at 455 px | none |
| Config error / blank cards | none | none |
| "Cut off" badges | none | none |
| Console (pattern ultra, uc-, lovelace, error) | Ultra Card v3.14.6 banner only, no errors | same banner only (ultra-card.js loads on every dashboard) |

Phone stacking order on `/habib-home-uc` (455 px): Home tab Hero → Prayer → Home → Climate → Outdoor; Lights tab Living Room → Bedroom → Upstairs → Nursery; Media tab Living Room HomePod → Bedroom HomePod. Reads sensibly (reading order of the desktop grid). Tablet portrait (745 px) also stacks into one column.

## 2. Visual quality (Part B)

| Item | /habib-home-uc | /habib-wh-next |
|---|---|---|
| Glass on inner cards | Outer Ultra Card: white 62 % plus radial highlights, 32 px radius, **no backdrop blur**. Embedded tiles, thermostats and markdown: rgba(232,236,248,0.92), so nearly opaque pale panes inside the glass. Media-control cards: solid blue, not glass. Only the weather module has a blur (5 px) | Real glass: backdrop blur 22 px, saturate 1.5, gradient panes on the evergreen wallpaper |
| Wallpaper | Liquid Glass SVG on `hui-view-background`; lost after tab switches (defect 2) | Evergreen image, stable |
| Primary text contrast (estimate) | #10224D on about #E8ECF8: about 13:1 | #EEF4EE on dark green: about 12:1 |
| Secondary text contrast (estimate) | 70 % navy on pale: about 5.6:1 | 84 % white on dark green: about 10:1 |
| Fonts | -apple-system (SF Pro) in cards; sizes 11–57 px (11 px forecast lows) | Habib Display / Habib Text; 11–104 px; many 11–12 px labels |
| Dialogs | HA dark theme (not Liquid Glass) | HA dark dialogs for lock, garage, weather; own drawer for climate |
| Prayer table | Markdown table with grid lines, left-aligned, about 130 px wide in a 576 px card. Times match the sensors (checked 18:38: Fajr 5:56, Sunrise 7:06, Dhuhr 12:18, Asr 3:11, Maghrib 5:30, Isha 6:40). Isha bold before 18:40. After Isha shows "All done today" and no next Fajr | Next prayer with countdown ("Fajr 5:56 AM · 11h 12m") and progress bar |
| Clock, weather | Clean; 48 px clock; 5-day forecast | Hero with clock, Hijri date, persons |

Tap targets (CSS px, flag < 44):

| Target | Ultra | WH-next |
|---|---|---|
| Tiles / buttons | 233x49 | 215x54, 232x64 |
| Tab bar | 174x64 | no tabs |
| Light slider | 37 tall (flag); dragging to the end gave 234 of 255 | 32 tall (flag); right end covered by the 26 px "Colour and details" button, so 100 % cannot be tapped |
| Thermostat +/- | 42x42 (flag) | in drawer |
| More-info ⋮ | thermostat 35 px, media-control about 20 px (flag) | n/a |
| Other | header icons 40 px (HA) | accordion rows 30 px, speaker chips 28 px, avatars 38 px (flag) |

## 3. Function (Part C)

| Check | /habib-home-uc | /habib-wh-next |
|---|---|---|
| Front door | HA dialog, `lock.living_room_front_door`. Tap, icon tap and hold all `more-info` (config read, icon not clicked) | HA dialog, same entity (first click did not open it, second did) |
| Garage | HA dialog, `cover.general_garage_door_garage_door` | HA dialog, same entity |
| Thermostats | Downstairs and Upstairs dialogs correct (via ⋮) | Own drawer, correct entity each; setpoints not touched |
| Weather | `weather.forecast_home` dialog | same |
| HomePods | Both dialogs correct (Living Room, Master Bedroom) | No dialog path; only speaker chips and transport buttons (not clicked) |
| Lamps (12 non-Nursery) | Each tile opens its own dialog (all 12 checked) | Upstairs accordion checked |
| Study Lamp toggle | Off worked (55 ms). **On failed**: tile still thought "on" and sent turn_off. Restored from the HA dialog | Off and on both worked, about 50 ms each |
| Study Lamp slider | Worked; return drag landed on 234, a second drag reached 255 | Mouse drag ignored twice; a tap set 127; 100 % not tappable (button over the end); restored to 255 in the HA dialog |
| Skip Evening Lights | On worked. **Off failed twice** (stale tile). Fixed after a page reload | Round trip worked |
| Tabs, back button | Work; Back from Home to Media works | n/a (one page) |
| Deep links | `/habib-home-uc/lights` and `/media` load directly | n/a |

## 4. Editability (Part D)

| Task (`/habib-home-uc`, desktop, mouse) | Steps | Result |
|---|---|---|
| Enter edit mode | 1 (pencil) | FreeSpace toolbar: undo, redo, Desktop/Laptop/Tablet/Phone, snap, add |
| Move a card | 2 (click to select, drag the centre handle) | A drag on the card body was ignored the first time. Saves to HA on release |
| Resize | 1 (drag the right handle) | Saved on release (w 576 → 488) |
| Open the Ultra editor | 2 (select, double-click) | Rows → Columns → Modules tree with live preview; opens on a "Getting Started" panel that hides the existing rows until you scroll. Cancel worked; Save stayed disabled |
| Find add card / add tab | 0 extra | Add card: + bottom right. Add view: a floating + that sits over the Climate card |
| Undo | 1 click per step on the toolbar undo | **Cmd+Z did nothing.** Two toolbar undos restored the seed exactly |
| Phone layout | none | Editor says "Phone is using the Desktop layout, stacked for readability" |
| Touch drag | not tested | DevTools device mode cannot be reached from the extension |

Total time for move + resize + 2 undos: about 70 s including checks. A saved move rewrites the card's `view_layout` in a flat format (the `desktop` wrapper is dropped) until undone.

`/habib-wh-next`: edit mode shows one card-options frame (1053x1360) around the single `ui-page` in a panel view. Cards cannot be moved or resized in the UI (as expected, I76). Closed with Done; config unchanged.

Restore proof: after all edits, `lovelace/config` for `habib-home-uc` equalled the seed `dashboards/ultra/habib-home-uc-2026-11-25-mvp.json` for every card's `view_layout`, and the full config equalled the pre-test config byte for byte. `habib-wh-next` config also equalled the pre-test copy.

## 5. Scorecard (Part E), 1 to 5

| Criterion | Ultra | WH-next | Evidence |
|---|---|---|---|
| Looks | 3 | 4 | Ultra: pale panes inside glass, no blur, opaque blue media cards, wallpaper drops out. WH-next: consistent glass with 22 px blur |
| Readability | 4 | 4 | Ultra about 13:1 / 5.6:1; WH-next about 12:1 / 10:1 but many 11–12 px labels |
| Layout at phone | 3 | 4 | Ultra stacks sensibly but truncates, and keeps stale layouts on hidden tabs. WH-next: no defects at 455 px |
| Layout at desktop | 3 | 4 | Ultra: fixed 1200 artboard (about 400 px side gutters at 1745), 3 px overlap. WH-next fills 4 columns, no overlap |
| Function | 2 | 4 | Ultra: stale state, one-way toggles. WH-next: all round trips about 50 ms; slider end blocked |
| Speed | 4 | 4 | Same resources load on both (ultra-card.js 968 kB on every dashboard); custom JS done at about 0.39 s vs 0.43 s; FCP 156 vs 212 ms (warm cache) |
| Editability by hand | 4 | 1 | Ultra: 1–2 actions per task, undo works (toolbar). WH-next: only by YAML |
| Safety (lock, garage need a dialog) | 3 | 4 | Both open HA's dialog on every tap. Ultra tiles can show a stale lock or door state |

## 6. Top 10 defects of /habib-home-uc

| # | Defect | Viewport | Screenshot | Cause (if known) | Smallest fix |
|---|---|---|---|---|---|
| 1 | Embedded HA cards never refresh; toggles one-way; lock and garage tiles can show stale state | all | uc-1440-frontdoor-dialog.jpg (no screenshot of the stale tile; measured) | Ultra `native_card` passes `hass` once; `ultra-card` has live state, the inner `hui-grid-card`/`hui-tile-card` stay stale (still stale after 12 s) | Ultra editor: replace the `native_card` tile grids with Ultra's own modules on one card and retest; report upstream with this repro. Do not cut over until fixed (I79) |
| 2 | Liquid Glass wallpaper lost after Home → Lights → Media → Home (real clicks) and after Back; plain #0D0E12 until reload | all | uc-430-home-wallpaper-lost.jpg | Ultra sets the SVG on `hui-view-background` and drops it on view change | Config: set the wallpaper as each view's Background (view settings) so HA draws it |
| 3 | Tabs hidden during a resize keep their old layout (desktop layout at 455 px, cards off-screen) until the next resize | phone, iPad rotation | uc-430-lights-stale-layout.jpg | FreeSpace recalculates only on `resize` while the view is visible | Upstream bug; workaround: reload or rotate again |
| 4 | Hero overlaps Home by 2–3 px | ≥ 1073 px | uc-1920-home.jpg | Hero auto height grows 300 → 327 into a 24 px gap | Drag Home and Outdoor down 16 px (or Climate to match) in edit mode |
| 5 | Prayer table: narrow gridded markdown table; after Isha only "All done today", no next Fajr | all | uc-1440-home.jpg | Template stops at today | Config: add tomorrow's Fajr line to the markdown template, or keep `ui-prayer` embedded |
| 6 | Small targets: media ⋮ about 20 px, thermostat ⋮ 35 px, +/- 42 px, slider 37 px tall; full brightness hard to hit | all | uc-1920-lights.jpg | HA card defaults | Config: larger tiles or Ultra modules with 44 px controls |
| 7 | Media-control cards are solid blue, not glass | all | uc-1920-media.jpg | HA media-control card colours itself from artwork | Ultra editor: swap for a tile with media features or Ultra's media module |
| 8 | Dialogs use HA dark theme, not Liquid Glass | all | uc-1440-frontdoor-dialog.jpg | Liquid Glass styles Ultra Cards, not the HA theme | Accept, or set the Liquid Glass HA theme in the profile |
| 9 | Editor friction: Cmd+Z ignored; first body drag ignored (use the move handle); Add view + floats over the Climate card; editor opens on "Getting Started" | desktop | uc-edit-mode.jpg, uc-ultra-editor.jpg | Ultra UI | How-to note: use the toolbar undo and the centre handle |
| 10 | "Skip Evening Lig…" truncated | 455 px | uc-430-home-2.jpg | Tile width 205 px | Rename the tile "Skip Lights" |

Also noted: the 1200 px desktop artboard leaves about 400 px empty at each side on a 1920 screen (fit width did not scale up); ultra-card.js (968 kB) loads on every dashboard, including MKH and kiosk.

## 7. What was clicked, and the revert of each (times approximate)

| Time (CST) | Action | Reverted |
|---|---|---|
| 18:37–18:46 | More-info dialogs on both dashboards: front door, garage, two thermostats, weather, 12 lamps, two HomePods; WH-next climate drawers | Each closed with Escape; no control inside clicked |
| 18:39:59 | Ultra: Skip Evening Lights on | Second and third taps re-sent "on" (defect 1). Off at 18:40:49 after a reload (on for 50 s, after sunset, no automation affected) |
| 18:41 | Ultra: Study Lamp icon off | Icon tap could not turn it on (defect 1); on again 18:41:52 from the HA dialog (red, 255). Off about 20 s |
| 18:42 | Ultra: Study Lamp slider to 109, back to 234, then 255 | 255 confirmed |
| 18:44 | WH-next: Skip on and off | Off confirmed, both within 1 s |
| 18:45 | WH-next: Study Lamp off and on; slider tap to 127; a tap on the card edge turned it off | Back on, then 255 via the HA dialog (red, 255 confirmed) |
| 18:47–18:49 | Ultra edit: Prayer card moved (y 16 → 104) and resized (w 576 → 488) | Two toolbar undos; layout equals the seed |
| 19:25 | Ultra editor opened on Prayer; Phone preview; WH-next edit mode | Cancel / Desktop / Done; both configs equal their pre-test copies |

Not touched: lock and garage controls, the Nursery, thermostat setpoints and modes, media playback or volume, Pause Prayer, delete, Pro, sign-in, preset gallery.

**Garage event:** `cover.general_garage_door_garage_door` opened at 18:48:49 CST and closed at 18:54:49. The logbook shows no service call, no automation and no user context, and `input_boolean.arrival_garage_live` was off, so it was operated outside HA (remote, keypad, car or the maker's app). It coincided with the undo clicks in the layout editor, which cannot send device commands. The test was paused and the owner told; the owner said to continue.

Final state 19:27: garage closed, front door locked, Skip off, Study Lamp on 255 (red), Pause Prayer off, thermostats 70–76 and 70–78 heat/cool.

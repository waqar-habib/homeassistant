# Dashboard design: Habib Home (wireframes) — DRAFT v0.1

Status: design only. Nothing built. Build starts after the owner approves this file (v1.0 only on "GREEN LIGHT"). Entity IDs below marked `?` are placeholders until `docs/sessions/2026-11-09-entity-inventory.md` lands; never guess an ID (CLAUDE.md rule 9).

## 1. Goal and constraints
1. One Nuvio dashboard that works on iPhone (portrait, ~430 px), laptop (~1440 px) and a wall tablet in kiosk mode (landscape, ~1280x800, 10").
2. Replace the daily Apple Home uses: Favorites, rooms, scenes, summaries, lock, thermostats, HomePods (parity table: `docs/transition-apple-home-to-ha.md`).
3. Built from Nuvio, not stock cards (owner, 2026-11-09). Base: keep the `custom:nuvio` strategy on `habib-home`; add views with `custom:nuvio-*` cards.
4. Never ship unseen: every revision is rendered at 430, 1280x800 and 1440 and checked before the owner looks (see `feedback` rule; Chrome loop works, 2026-11-09).

## 2. What went wrong before (so the design avoids it)
| Failure (2026-11-04 screenshots) | Cause | Design rule |
|---|---|---|
| Light names clipped to one character | Toggle sat inline, name got no width; Nuvio cards hide secondary text under 220 px | R1: a named control is never narrower than 220 px. R2: no inline switch on a narrow card; the whole tile is the tap target |
| Switches cut off the card edge | 3 columns on a phone | R3: phone grids are 1 column, or 2 columns only for icon + short name tiles that pass the 430 px render test |
| Duplicate and truncated titles, orphan tall tiles | Mixed card types in one grid row | R4: one card type per row; cards in a row share a height |
| Flat list of 17 bulbs, no hierarchy | One card per entity | R5: one card per room, lights inside it |

## 3. Principles (from owner goal plus forum research, section 8)
1. **Overview first.** The first screen answers "is the house OK?" in 3 seconds: lock, climate, who is home, next prayer, lights on.
2. **The daily few are one tap.** Favorites and scenes sit on Home. Everything else is one level down.
3. **Rooms, not entities.** A room card shows the name, "2 of 4 on", and toggles the whole room with one tap. Expand for single lights, always with full names.
4. **Same data, three layouts.** Phone: 1 column, bottom navigation. Tablet: landscape grid, bottom navigation, big targets. Laptop: top tabs, 3 to 4 columns.
5. **Safe by default.** Locking is one tap. Unlocking needs a confirm or hold (Nuvio `lock-card` `confirm` or `smartlock-card` `hold`). Front door is Tier 3, so the owner approves how it behaves.
6. **Guest-ready.** A non-admin view (kiosk) shows no settings, no edit pencil, no admin items.
7. **Ambient when idle.** Tablet shows a calm screen (clock, weather, next prayer, lock state) after a timeout and wakes on touch. Details depend on what Nuvio's screensaver tab supports (unverified).

## 4. Information architecture
Bottom navigation (phone, tablet) or top tabs (laptop), 5 destinations:
| Tab | Purpose | Contents |
|---|---|---|
| Home | Overview and daily actions | status chips, Favorites, Scenes, room cards, HomePods strip |
| Rooms | Detail per room | one section per area: lights, climate if present, media |
| Climate | Both thermostats | `climate.downstairs`, `climate.upstairs`, outside weather |
| Media | HomePods | `media_player.living_room_living_room_homepod`, `media_player.master_bedroom_homepod` |
| Family | People, prayer, house status | persons, prayer times (5 + next), Hatch, lock history |
Dropped: the strategy's "Map" tab until geofencing returns (I18, on hold).

## 5. Wireframes
Legend: `[ ]` tap target, `▮` on, `▯` off, `>` expands.

### 5.1 Phone (430 px wide, portrait)
```
┌──────────────────────────────┐
│ Habib Home            ⚙  W   │  header, 56 px
├──────────────────────────────┤
│ ☁ 60° Rain                   │
│ [🔒 Locked][🌡 72/71][👥 2][🕌 Asr 3:45][💡 5 on] →  chips scroll sideways
├──────────────────────────────┤
│ Scenes                       │
│ [Good Night][Leaving][Evening] →  pill buttons, scroll sideways
├──────────────────────────────┤
│ Favorites                    │
│ ┌──────────────────────────┐ │  1 column, full width (~390 px)
│ │ 🔒 Front Door      Locked│ │  tap = lock/unlock with confirm
│ ├──────────────────────────┤ │
│ │ 🌡 Downstairs  72° cool  │ │  tap = more-info
│ │ 🌡 Upstairs    71° cool  │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Rooms                        │
│ ┌──────────────────────────┐ │
│ │ Living Room   ▮ 3 of 4 on >│ │  tap row = toggle room; > = lights
│ ├──────────────────────────┤ │
│ │ Master        ▯ 0 of 3   >│ │
│ ├──────────────────────────┤ │
│ │ Nursery       ▯ 0 of 5   >│ │
│ ├──────────────────────────┤ │
│ │ Game Room     ▯ 0 of 1   >│ │
│ │ Upstairs Guest ▯ 0 of 2  >│ │
│ │ Study         ▯ 0 of 2   >│ │
│ └──────────────────────────┘ │
│ HomePods                     │
│ ┌──────────────────────────┐ │
│ │ ▶ Living Room HomePod  Idle│ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ [Home][Rooms][Climate][Media][Family] │  bottom nav, 64 px
└──────────────────────────────┘
```
Expanded room (tap `>`): single lights as full-width rows, name on the left, a switch on the right, name never truncated. Names longer than 18 characters get a shorter friendly name.

### 5.2 Wall tablet (1280x800, landscape, kiosk)
```
┌────────────────────────────────────────────────────────────────────────┐
│ 3:45 PM  Sun Nov 9     ☁ 60° Rain      🕌 Asr 3:45  Maghrib 5:17      │ status bar, 72 px
├───────────────┬──────────────────────────────────────┬─────────────────┤
│ Front Door    │ Living Room   ▮ 3 of 4   Master  ▯ 0/3│ Scenes          │
│ 🔒 Locked     │ [  toggle room  ] [ lights > ]       │ [Good Night]    │
│ [Lock][Unlock]│ Nursery  ▯ 0/5   Game Room  ▯ 0/1    │ [Leaving]       │
│ ───────────── │ Upstairs Guest ▯ 0/2   Study ▯ 0/2   │ [Evening]       │
│ Downstairs 72°│                                      │ [Welcome Home]  │
│ Upstairs   71°│  rooms: 3 columns, cards ~290 px     │ ─────────────── │
│ ───────────── │                                      │ HomePods        │
│ 👥 2 home     │                                      │ ▶ Living Room   │
├───────────────┴──────────────────────────────────────┴─────────────────┤
│ [Home]   [Rooms]   [Climate]   [Media]   [Family]                      │ nav, 80 px
└────────────────────────────────────────────────────────────────────────┘
```
Touch targets at least 56 px. Idle after 5 minutes (value to confirm): ambient screen with clock, weather, next prayer, lock state; touch wakes.

### 5.3 Laptop (1440 px)
```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Habib Home   Home  Rooms  Climate  Media  Family            ☁ 60°   ⚙  W      │
├────────────────────────────────────────────────────────────────────────────────┤
│ [🔒 Locked][🌡 72/71][👥 2 home][🕌 Asr 3:45][💡 5 on]                          │
│ Scenes: [Good Night][Leaving][Evening][Welcome Home]                            │
│ ┌ Favorites ──────┐ ┌ Living Room ┐ ┌ Master ─────┐ ┌ Nursery ─────┐             │
│ │ Front Door  🔒  │ │ ▮ 3 of 4    │ │ ▯ 0 of 3    │ │ ▯ 0 of 5     │             │
│ │ Downstairs 72°  │ │ lights >    │ │ lights >    │ │ lights >     │             │
│ │ Upstairs   71°  │ └─────────────┘ └─────────────┘ └──────────────┘             │
│ └─────────────────┘ ┌ Game Room ──┐ ┌ Upstairs Guest┐ ┌ Study ─────┐ ┌ HomePods ┐│
│                     │ ▯ 0 of 1    │ │ ▯ 0 of 2      │ │ ▯ 0 of 2   │ │ ▶ Living ││
│                     └─────────────┘ └───────────────┘ └────────────┘ └──────────┘│
└────────────────────────────────────────────────────────────────────────────────┘
```
4 columns from about 1200 px, 3 below, 2 below about 800 px, 1 below about 600 px (Nuvio grid `columns: 0` with `min_width` 260; confirmed by render test, not assumed).

## 6. Component map (Nuvio cards, v2.31.0 docs)
| UI element | Nuvio card | Notes |
|---|---|---|
| Status chips | `nuvio-glance-card` or tab Badge toggles (Settings, Views) | glance: `show_name`, `show_state`; verify chip tap actions |
| Scenes row | `nuvio-actions-card` (`actions: [{ icon, name, service, data }]`) | 5 of 7 scenes unavailable today: fix or hide (I19) |
| Room card | `nuvio-room-compact-card` plus `nuvio-toggle-card` per light inside an expand | the exact expand pattern needs a render test |
| Layout | `nuvio-grid-card` (`columns: 0`, `min_width: 260`), `nuvio-stack-card` (`wrap_below`) | |
| Per-screen differences | `nuvio-conditional-card` with `screen: media_query` | tablet vs phone variants |
| Front door | `nuvio-lock-card` (`confirm`) or `nuvio-smartlock-card` (`hold`, `door`, `battery`) | which lock entity: pending inventory |
| Family | `nuvio-family-card` | |
| Hero and chrome | Nuvio Settings: header, tabs, badges | UI only, owner does it with me advising |
| Idle screen | Nuvio Settings, Screensaver tab | capability unverified |

## 7. Acceptance checks (all rendered, none assumed)
1. At 430, 1280x800 and 1440 widths: no name truncated, no clipped switch or text, no horizontal page scroll.
2. Every tap target at least 44 px (phone) or 56 px (tablet).
3. Daily actions in at most 2 taps: lock, toggle a room, run a scene, change a thermostat.
4. The front door cannot unlock from one accidental tap.
5. Dark and light theme both readable.
6. Non-admin kiosk user sees no edit or settings controls.
7. HA log shows no frontend or card errors after load.

## 8. Research (forums, 2026-11-09; informal sources, check before relying)
- Design for the least technical person; large, rounded, room-based controls; bottom navigation on wall tablets: [HA community, wall tablet design](https://community.home-assistant.io/t/wall-mounted-tablet-dashboard-design-clean-user-interface/1012183), [lazyadmin dashboard examples](https://lazyadmin.nl/smart-home/home-assistant-dashboard-examples/).
- Kiosk: Fully Kiosk Browser, motion wake, photo-frame idle, kiosk only for non-admins: [smarthomejunkie](https://www.smarthomejunkie.net/kiosk-mode-in-home-assistant-the-right-way/), [community: frameless wall tablet](https://community.home-assistant.io/t/my-frameless-wall-mounted-tablet-dashboard/920232).
- Apple Home pattern: Favorites, Status, Rooms, Scenes, Cameras: [Apple Home dashboard strategy](https://tomevault.io/tome/nitaybz/apple-home-dashboard), [HomeKit dashboard thread](https://community.home-assistant.io/t/homekit-dashboard-complete-automatic-dashboards-with-apple-home-look-and-feel/901292).
- Overview first, one-click actions, chips on top, consistent cards: [smartbolig dashboard design](https://smartbolig.pages.dev/en/home-assistant/dashboard-design).
- Note: "HomeDeck" found in searches is an Apple Home app for iPad and Apple TV, and may not be the `homedeck` custom component on the Pi 5 (unverified, see the entity inventory).

## 9. Open questions for the owner
1. Tablet: which model and screen size is planned (I5)? Design assumes 10" landscape 1280x800; wall or stand?
2. Theme: dark only, or follow the system? Keep the hero photo on Home (it is the Nuvio look) or a plain header?
3. Front door on the dashboard: lock-only tap, lock plus confirmed unlock, or status only? (Tier 3.)
4. Which two to four scenes belong on Home? Five of seven are broken today.
5. Cameras (Ring) on the dashboard now, or later?
6. Who else uses it (MKH, guests) and on which device? Drives the non-admin kiosk view.

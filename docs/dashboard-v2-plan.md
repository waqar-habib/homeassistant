# Dashboard v2 plan: Habib WH, Habib MKH, Habib Kiosk (v0.5 draft)

Status: v0.5 draft (v0.4 plus D56: FamFam replaces the CalDAV and HA Family Hub calendar plans), owner collaboration 2026-11-14 to 2026-11-15 (cloud session). Supersedes the Nuvio direction in `docs/dashboard-design.md` for the three new dashboards. `habib-home` (Nuvio) and `nuvio-shared` stay untouched until cutover (P7). Apple Home stays the primary control surface until the owner says otherwise.

## 1. Goal
Three purpose-built dashboards on one design system, easy to change:
1. **habib-wh** (owner iPhone): dashboard layout with the daily controls above the fold.
2. **habib-mkh** (MKH iPhone, also her iPad): stupidly simple, loads at app launch, no admin chrome.
3. **habib-kiosk** (wall tablet, 10.1", Android 16, 1920x1200): key light buttons, Ring camera, prayer times, family calendar, indoor temperature.

## 2. Owner decisions (details in `docs/decisions.md` D52 to D55)
1. Drop Nuvio for the new dashboards. Design language: Material 3 with frosted glass by default on all three, inside a performance budget (section 4).
2. Kiosk lights are buttons by room: Living Room, Bedroom (HA area Master), Nursery (independent), plus two new groups Upstairs and Downstairs that switch their lights together. Nursery and the two Hatch lights are in neither group.
3. Status strip shows current indoor temperature per thermostat (not setpoints). A tap opens the thermostat cards (setpoint, mode).
4. Ring Battery Doorbell Plus, no subscription, signed in to HA. Separate Ring tab on the kiosk and on the WH phone. A doorbell press switches the kiosk to the Ring tab (section 6).
5. Family calendar and grocery: FamFam (D56), the FamFam integration prompt. It replaces the CalDAV plan (C1, D30 "M&W Family") and the HA Family Hub idea unless FamFam fails its pilot. The kiosk calendar card and the grocery tab are source-agnostic (CR1: calendar and todo entity IDs live in dashboard YAML), so swapping the source is a YAML change. Fully Kiosk ($10 one-time, owner's figure, unconfirmed) is bought after the tablet arrives; build now in browser renders.
6. Customizable by design (section 7). The owner can edit by hand or ask Claude on the Pi 5 for simple changes. This is the Nuvio pain point the design must remove.
7. Claude defaults, applied unless the owner objects: groups are dashboard-side (no new HA entities); status strip shows two numbers (Down, Up); Upstairs and Downstairs buttons appear on all three views.

## 3. Architecture (best / base / worst)
**Chosen: a small custom-card library (`habib-ui`) used inside native HA sections views.** Cards are plain custom elements configured in YAML. HA's own editor (drag and drop, Add card, raw YAML) works on the layout. Tabs are ordinary HA views.
- Best: pixel-exact cards, no third-party dependency, every change is a YAML edit.
- Base: sections grid is less exact than a hand-built CSS shell; kiosk fit is proven by render tests.
- Worst: the sections grid cannot hit the kiosk fit. Fallback: a `habib-layout` container card (CSS grid configured in YAML), still editable. Also worst: an HA frontend update changes a `hass` property; mitigation is to use only documented `hass` fields and keep Nuvio live until cutover.
Rejected: button-card or mushroom stacks (templating-heavy, hard to enforce the lock rule; the earlier reason "manual installs since HACS is gone" no longer applies because HA 2026.11 has the built-in Marketplace, see D63); staying on Nuvio (I31, I34, one-tap unlock handler, and the editing pain).

## 4. Design language and performance budget
1. Material 3 tonal surfaces. Dark default on the tablet; phones follow the system. Colours come from the Material You theme's own scheme and variants (D64); the earlier teal `#2EC4D6` was a Claude carry-over from the Nuvio accent, never an owner choice, and is dropped. Roboto, already shipped by HA. 8 px spacing. Touch targets at least 44 px (D47). A named control is at least 220 px wide; no truncated names.
2. Frosted glass: at most 4 blurred surfaces per screen (status bar, Ring card, two large panels). Tiles use a translucent fill with no blur. Blur 16 px on phones and 12 px on the tablet. One token (`data-glass="off"`) disables blur everywhere.
3. Budget, verified at P6 on the real tablet: library at most 150 KB, no web fonts, no image backgrounds over 300 KB, no continuous animation (transitions under 200 ms), 24 h soak with no WebView reload and no downward trend in available RAM (Fully Kiosk exposes an available-RAM sensor; its accuracy on this tablet is unconfirmed). If the budget fails, glass is switched off, not redesigned.

## 5. Views (wireframes v0.4; counts shown as "x of y" are read live)
Kiosk home, 1280x800 CSS px (status bar 56, three columns 296 / 504 / 400, 16 px gaps):
```
┌──────────────────────────────────────────────────────────────────────┐
│ 7:45 AM  Sun 15 Nov  ☁ 55°  Down 72° · Up 71°  🔒 Locked  🚪 Closed │
├──────────────┬─────────────────────────────────┬─────────────────────┤
│ PRAYER       │ ┌─────────────────────────────┐ │ FAMILY CALENDAR     │
│ Next: Dhuhr  │ │  Ring snapshot (tap = Ring) │ │ Today / Tomorrow /  │
│ Fajr ...     │ └─────────────────────────────┘ │ next 7 days         │
│ Isha         │ [Lights on][Lights off][Away]   │                     │
│              │ [Living Room ][Bedroom     ]    │                     │
│              │ [Upstairs    ][Downstairs  ]    │                     │
│              │ [Nursery                   ]    │                     │
└──────────────┴─────────────────────────────────┴─────────────────────┘
```
Height check: Ring 16:9 at 504 wide is 283; three rows of 72 is 216 plus gaps; scenes row 56; 283 + 232 + 56 + 3 x 16 = 619 against 712 available (800 minus 56 bar minus 32 margins). Fits with 93 spare. Key buttons are 246 wide (meets the 220 rule). At 960x600 the left column moves into the top bar and sheets take scenes, lock and thermostat; this is tighter and must be proven by render. The tablet's real CSS width is set and confirmed at T1 (ADB density, `adb shell wm density`).

Ring tab (kiosk 1280x800): video 760x428 left, 440 px side panel: last ring, last motion, battery (if exposed), lock chip (opens HA's dialog only), garage status, Refresh snapshot, Back to Home. No talk button (the one source found reports one-way video).

WH iPhone (430): status chips, Ring snapshot with doorbell badge, scenes, three priority room cards with inline light tiles, then Upstairs and Downstairs and other rooms, thermostats with inline +/-, media, next 3 calendar events. Scrolling below the fold is allowed.

MKH iPhone (430x932), one screen, no scroll for lights: status strip (lock, indoor temps), scenes, priority rooms (Bedroom, Nursery, Living Room) as 2-column tiles of 60 px, an Upstairs and Downstairs button row, bottom nav. Height estimate: 7 tile rows x 60 + 3 headers x 28 = 504; chips 56, scenes 56, strip 72, nav 64, top 48 = 296; total about 800 of roughly 850 usable. Thin margin; the render test decides. MKH has no Ring and no calendar.

## 6. Behaviour rules
1. **Lights:** tap toggles. Long-press opens a brightness sheet only if the light supports brightness (P0 checks). Group buttons: if any member is on, a tap turns all off; if all are off, a tap turns all on. The button shows "x of y on".
2. **Groups are dashboard-side.** The card takes a member list in YAML, counts from member states and calls `light.turn_on` or `light.turn_off` with the list. No new HA entities. Reason: the HomeKit Bridge filter exposes every `light` entity (`docs/entities.md`), so a new HA light group would likely appear in Apple Home.
3. **Memberships (confirm in P0):** Downstairs = Living Room + Master lights. Upstairs = Game Room + Upstairs Guest + Study lights. Nursery alone. Hatch excluded. The Porch light (`light.smart_wi_fi_light_switch`, area Outdoor, added 2026-11-14) is in neither group; the owner chooses where it appears. The 804 lock and its switches are not part of this household and never appear.
4. **Lock:** one tap locks; unlock is two deliberate taps through HA's dialog. No service is ever bound to the lock chip (D48). **Garage:** status only, closed shown as a safe state.
5. **Status strip:** indoor temperature from each thermostat's current temperature; tap opens a sheet with both thermostat cards; when idle it says "Idle", not "Cooling to 78".
6. **Dead devices** show "No response", not a bare "Unavailable".
7. **Doorbell takeover (prompt A1, ships disabled):** trigger is the doorbell ding sensor. Wake the tablet screen, switch to the Ring tab, show a snapshot then live view, return to Home after 60 s (a touch cancels), debounce 120 s. 22:00 to 06:00: minimum brightness, no sound. Send a snapshot notification to the owner's iPhone. The switch uses an in-page helper-driven view change (no reload); `fully_kiosk.load_url` is the fallback. Risk to test first: the only source found says Ring events arrive by cloud polling, "roughly 30 seconds to 2 minutes"; unconfirmed. Decision rule: median press-to-sensor latency under about 5 s, build the takeover; over about 30 s, keep the Ring tab and phone notification only. Battery doorbell: every live view draws battery; live view only on tap or ring, 60 s cap.

## 7. Customization rules (acceptance criteria for every prompt)
1. **CR1.** No entity IDs, labels, icons or group memberships in JavaScript. All of it lives in dashboard YAML.
2. **CR2.** Every card registers in `window.customCards` with a stub config, so it appears in HA's Add card picker; the GUI editor falls back to YAML.
3. **CR3.** Layout is a native HA sections view: drag and drop in the GUI, or edit raw YAML (dashboard menu, Raw configuration editor).
4. **CR4.** A simple change (add a button, move a card, change group membership, add a tab) is config-only: no JS deploy, no resource version bump. Claude on the Pi 5 does it from the template `docs/prompts/templates/pi5-dashboard-change.md`.
5. **CR5.** `docs/dashboard-cookbook.md` holds copy-paste YAML for each common change. `docs/dashboard-config.md` is the single source of truth for entity IDs and group members.
6. **CR6.** JS changes bump `VERSION` in `loader.js`, follow the dev loop (`?dev`), and need a visual check before production.

## 8. Facts and unknowns
Confirmed from sources: Fully Kiosk's HA integration exposes screen on and off, screensaver, brightness, motion detection, load URL, kiosk lock and available RAM, and needs Remote Admin (paid Plus license). CalDAV with iCloud uses `https://caldav.icloud.com` and an app-specific password; calendar entities refresh about every 15 minutes. WallMode (free) is early development, Android 16 unverified. HA Family Hub (JVarhol) was dropped by the owner on 2026-11-15. FamFam (D56), from the integration page and famfam.life: a family organiser app (iOS and Android) with an MIT-licensed HA custom integration (`bencom-tech/famfam-homeassistant`, early development, 13 commits and 0 stars at fetch time, no releases). It polls the FamFam cloud (`famfam.life`) every 60 s by default using a token an organiser creates in the app. Entities: a calendar per member, a family calendar and a read-only meal-plan calendar; one `todo` entity per list (aisle grouping in `categories` and `item_categories` attributes); next-event, tonight's-dinner and dinner-headcount sensors; shopping-trip entities (need Plus). `famfam.add_list_item` takes an aisle category; `todo.add_item` cannot. Calendar window is 7 days back to 28 days forward; writes are single events only. Free plan: 3 lists, 20 items per list, 20 events a month, 3 members; Plus is $2.99 a month per the site (unverified here). Not stated and unconfirmed: sync with iCloud or Google calendars, Siri support, where data is stored, minimum HA version, TLS and retention details.
Unknown until P0 or later: Ring entity names, snapshot age, press latency and live-view wake time for the Battery Doorbell Plus; whether shared iCloud calendars return events through CalDAV; brightness support per light; the tablet's real CSS width.

## 9. Standing GREEN LIGHT (D53)
Owner, 2026-11-15 13:01 CST, in chat: "You can integrate a GREEN LIGHT from me (owner) for any action or tier that may need it so the process doesn't get held back if I step away."
Claude's reading, owner to confirm: it covers the Tier 3 steps this series names: new dashboards, Lovelace resources, helpers, kiosk-mode install, creating the non-admin wall user (the owner still enters any password or token in the HA UI, never in chat or the repo), Ring and CalDAV setup, setting default dashboards, retiring Nuvio after a proven rollback, enabling A1 after its dry run, reloads, and a core restart only if a step cannot work without it and after a backup.
It does NOT cover: any lock, unlock or garage service call or an automation touching the front door (D35); Adhan changes (D34, D49 to D51 stand); enabling the D42 automations (D45); HomeKit Bridge changes; Cloudflare, DNS or network changes; secrets. Design acceptance (v1.0) of each view stays the owner's call.
Still required on every step: backup, `ha core check`, verification, a rollback note, one change per commit.

## 10. Prompt series (Pi 5 unless noted; Mac renders are the visual check, the Pi 5 cannot screenshot)
1. P0 discovery (Tier 0) and P1 foundations and dev loop (Tier 2): committed 2026-11-15.
2. P2 components, P3 MKH view, P4 WH view, P5 kiosk view: written after the P0 report, with real entity IDs.
3. FamFam integration prompt (owner creates the FamFam family and organiser token and pastes it into HA's config flow; C1 CalDAV only if FamFam is not adopted), A1 doorbell takeover: parallel lane. The FamFam integration prompt runs after P0 and not at the same time as P1 (it needs a core restart).
4. After the tablet arrives: T1 tablet setup (owner, ADB, Fully Kiosk, non-admin wall user), P6 soak and glass decision, P7 cutover, P8 QA and docs.
R1 (Ring login) is dropped: the owner signed in; P0 confirms read-only.

## 11. Backlog (ideas only, no wireframes)
- **B1 Grocery tab (now planned through FamFam, D56; the research below applies only if FamFam is not adopted).** HA already has `todo.shopping_list`. Research: whether the shared Apple Reminders list is readable in HA (CalDAV supports to-do items; iCloud's upgraded Reminders may not be exposed, unconfirmed); Hey Siri to HA (Companion app shortcuts or Assist). The owner's current problem: the Siri shortcut adds items unsorted at the bottom. Needs an aisle-categorizing step (rules or a conversation agent). Nice to have: aisle-grouped display, check-off from the tablet.
- **B2 Islamic tab** (MasjidAl style). Prayer times and countdown from the existing sensors; candidates: Hijri date (source to choose), Jumu'ah time, iqamah offsets from the masjid timetable (D28), sunrise, Ramadan mode. Ayah and hadith rotation only from cited, authenticated sources shown with their reference (surah:ayah; collection, number and grading); API licensing unconfirmed. No AI-generated translations. No Adhan playback change (D34).
- **B3 Family tab: full calendar and grocery through FamFam (D56).** Month and week views and the aisle-grouped grocery list as our own cards on FamFam entities. Needs the FF1 pilot results first. Nice to have: dinner check-in and tonight's dinner on the kiosk.
- **B4 One-tap tab switcher and automated rotation.** Idle-timer rotation between tabs, pause on touch, Ring takeover overrides; in-page switching, no reload.
- **B5 Google TV read-only board.** HA Cast needs HTTPS (available) and has no touch input; decide after the kiosk is perfected.

## 12. Sources
- Fully Kiosk Browser integration: https://www.home-assistant.io/integrations/fully_kiosk
- CalDAV integration: https://www.home-assistant.io/integrations/caldav
- Ring with HA, 2026 (third-party, unconfirmed against official docs): https://www.hometechtested.com/blog/ring-cameras-home-assistant-2026
- WallMode: https://community.home-assistant.io/t/wallmode-a-free-open-source-android-kiosk-app-for-home-assistant/1024625
- FamFam integration: https://github.com/bencom-tech/famfam-homeassistant ; FamFam app and plans: https://famfam.life
- HA Family Hub (dropped, D56): https://jvarhol.github.io/HA-Family-Hub/
- Nuvio commands and wall-tablet features (reference for what is dropped): https://github.com/kczepiec/nuvio

## 12. Owner updates after the discovery prompt (2026-11-15 13:38, D60)
- Outdoor group = Porch light, Front Door lock and unlock, Garage Door open and close. On the kiosk and WH only.
- Hatch lights: no control or button anywhere (D61). Optional WH-only brown-noise button, only if a start and stop method is verified in HA; otherwise dropped.
- Lock and garage buttons are built in the component prompts and need the owner's "GREEN LIGHT outdoor controls".
- Arrival automations are a separate prompt (Tier 3, not part of the dashboard series).

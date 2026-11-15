# Session 2026-11-15: Dashboard v2 design collaboration (cloud session, partial stop)

Lane: cloud (Claude chat with the owner; repo attached for push). The owner's computer link was down for most of the session, so no live reads of HA were possible; repo docs were the source.

## Work completed
1. Read CLAUDE.md, HANDOFF.md, docs/ (as of 2026-11-14) and the owner's screenshots: Habib Home on desktop and phone, Apple Home, and three competitor dashboard images.
2. Audit of the current UI: no light on Home (a light takes 3 taps against 1 in Apple Home), three navigations for five views on desktop, hero photo using about 59% of the desktop width, empty room tiles, an unlabeled "Air conditioning: Unavailable" card, garage shown with an open-padlock icon in a warning colour for "Closed", duplicate Living Room TV in Media, thermostat text "Cooling to 78" at 71 indoor.
3. Research: Nuvio wall-tablet and command features, HA default dashboard per user (2025.12 added a default for all users that each user can override; per-device default removed, admin-per-user unconfirmed), HA Cast, Ring in HA, Fully Kiosk integration, WallMode, CalDAV with iCloud, HA Family Hub.
4. Plan v0.4 written: `docs/dashboard-v2-plan.md`. Decisions D52 to D55. Issues I35 to I37. Milestone M19.
5. Prompts committed: `docs/prompts/pi5/2026-11-15-dashboard-p0-discovery.md`, `docs/prompts/pi5/2026-11-15-dashboard-p1-foundations.md`, template `docs/prompts/templates/pi5-dashboard-change.md`.

## Decisions
See D52 to D55 in `docs/decisions.md`. Summary: drop Nuvio for the new dashboards; Material 3 frosted glass inside a performance budget; three dashboards; dashboard-side light groups; Ring tab with doorbell takeover (ships disabled); standing GREEN LIGHT with exclusions; customizability as an acceptance criterion.

## Problems and corrections
1. Earlier in the session the light count was given as 17 (15 plus 2 Hatch). The owner's 2026-11-14 cleanup removed four light entities and added Porch, so that count is stale (I36). The prompts report live counts and hard-code none.
2. Two claims are unconfirmed: Ring press-to-sensor latency (a third-party article says 30 s to 2 min, I35) and Fully Kiosk's price ($10, the owner's figure).

## Resume point
1. Owner runs on the Pi 5: P0, then P1 (pointer in HANDOFF.md).
2. Cloud or Mac session: read `docs/sessions/2026-11-15-dashboard-p0-discovery.md`, then write P2 (components) and P3 to P5 with real entity IDs; C1 CalDAV and A1 doorbell takeover in a parallel lane.
3. Owner: confirm or adjust the Claude defaults in D54 (dashboard-side groups, two temperatures, group buttons on all views), the Porch placement, and the scope reading of the standing GREEN LIGHT (D53).
4. After the tablet arrives: T1, P6, P7, P8.

## Update 13:12 CST: FamFam (D56)
Owner dropped the HA Family Hub link and chose FamFam for calendar and grocery together. Researched the integration page and famfam.life; plan moved to v0.5, the FamFam integration prompt added, issue I38 opened. Resume: owner creates the FamFam family and token, P0 then FF1 on the Pi 5, then the calendar card and grocery tab are built on the FamFam entities.

## Update 13:20 CST: owner answers on FamFam (D57)
Goal is a fully synced household with MKH migrated to Home Assistant; pilot on the free plan; Apple events start fresh for the pilot (Claude default); standing GREEN LIGHT confirmed for the FamFam install steps. FamFam prompt file renamed to `2026-11-15-famfam-integration.md`. Resume: owner runs the discovery prompt, then the foundations prompt; owner creates the FamFam family and token; Pi 5 runs the FamFam integration prompt.

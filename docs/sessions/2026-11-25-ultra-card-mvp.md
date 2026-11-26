# 2026-11-25 (evening, Pi 5): Ultra Card install and MVP dashboard (D86)

## Done
1. Owner answers D86 (Liquid Glass as shipped, FreeSpace, no Pro, lock/garage via HA dialog, Claude builds MVP, cutover needs GREEN LIGHT). Plan `docs/ultra-card-plan.md` v0.2.
2. Targeted code review of Ultra Card v3.14.6 and Ultra Card Connect v1.12.6 (findings in the plan, section 5).
3. Backup `pre-ultra-card` (cbccac46). Marketplace first-run warning: Claude's acceptance was denied by the permission classifier; the owner installed both packages in the UI.
4. Connect entry "Ultra Card (not signed in)" (`sensor.ultra_card_pro_cloud_authentication_status` = disconnected). `ha core check` clean, HA restarted ~18:08 CST (before Isha 18:40). Adhan gate ON, garage live OFF, 804 live ON after the restart.
5. Dashboard `habib-home-uc` "Habib Home (Ultra)", admin only, sidebar. Tabs Home (hero clock + weather, prayer times, home controls incl. door/garage dialog-only tiles, Skip, Pause, Noor's Bedtime, thermostats, outdoor), Lights (Living Room, Bedroom, Upstairs, Nursery), Media (two HomePods). FreeSpace, Desktop 1200 master, Phone stacks. Write verified; no server log errors.
6. Generator `dashboards/ultra/build_habib_home_uc.py`, seed export `dashboards/ultra/habib-home-uc-2026-11-25-mvp.json`, how-to `docs/ultra-card-howto.md`. Merge `d48c28e`.

## Not verified
- Rendering: Claude cannot screenshot (I77). Liquid Glass on native cards inside Ultra Cards, overlap with auto height, and phone stacking order are for the owner to check.

## Rollback
Delete dashboard `habib-home-uc`; remove Ultra Card and Connect in the Marketplace (Connect: delete its integration entry first, then restart); or restore `pre-ultra-card` (cbccac46). Old dashboards were not touched.

## Resume point
Owner reviews `habib-home-uc` on Mac and iPhone and rearranges. Claude next: fix what the owner reports, export the layout to git after owner edits, MKH dashboard (phase 4), kiosk (phase 5) after its scope, cutover only on GREEN LIGHT. Open: I78 unknown HaCasa Nova resource.

# 2026-11-19 Pi 5 overnight: WH-next phone redesign, defects, automation audit

Owner request (2026-11-18 night): 5 defects, 1 design revision (WH-next iPhone only), 3 ideas on hold until GREEN LIGHT.
Backup `pre-overnight-2026-11-19` (slug `089e07f1`). Branch `fix/overnight-2026-11-19`, merged `161f1f0`. Loader v17 live. WH-next config hash `937725e08713bbbb`.

## Done
1. **Home drawer status truncated (defect 1):** collapsed Home now reads "All secure · Down 72° · Up 71°" (only doors that need attention are named; "Porch on" when lit). Summary takes its natural width. Measured: fits at 393 px, including the alert case "Front door Unlocked · Down 72° · Up 72°".
2. **Prayer "All done today" (defect 2):** after Isha the bar counts down to tomorrow's Fajr ("Fajr 5:52 AM · 5h 51m"), estimated as today's Fajr + 1 day until the sensors refresh after midnight. "All done today" can no longer appear; "Times unavailable" stays for a missing sensor. Test updated (75 of 75).
3. **Door and garage in WH-next (defect 3):** not reproduced. Same event as MKH next in the harness, hit test reaches the buttons. Hardening: an open section is no longer rebuilt when a child's summary changes. Design unchanged. Owner check needed (I66).
4. **Audit (defect 4):** `docs/audit-2026-11-19-automations.md`. 12 findings, read only, nothing changed. Top: arrival garage fails every run (A1, I62), activity sensors unavailable (A2), evening lights on all night when away and Porch never off (A3, A4), Adhan startup restore can never run (A5), AiDot login and password logging (A7, A8, I67).
5. **MKH next iOS wallpaper and empty scroll (defect 5):** cause found. The page measured HA's header offset once, too early (0 instead of 56 px in the harness), so the page was one header taller than the screen and the wallpaper sat one header lower (leaves cut off). Now re-measured after HA settles, on resize and on state updates (max once a second); height uses the visible viewport (`dvh`) minus HA's own bottom padding. Measured: MKH page 932 px on a 932 px screen (no scroll). Applies to WH-next too.
6. **WH-next phone redesign:** hero `dense` (all elements kept): 273 to 207 px at 393 wide (-24%), 282 to 189 at 430 (-33%). Prayer and Home open on every launch, collapsible. Porch moved into Home as a third item next to Front door and Garage (tap toggles; items stacked to fit three across); "All secure" unchanged. Floors open as one-tap chips (116 px). Living Room, Bedroom, Nursery, Upstairs in one "Rooms" drawer, closed on launch; open shows each room's chips. Outdoor removed on the phone (Porch is in Home). Listen and Lists unchanged.
7. **Wide screens unchanged:** old vs new code measured equal at 800, 1280 and 1920 px for both dashboards. MKH next config unchanged.
8. Chromium for the render harness was missing after a restart; reinstalled with `persist-install chromium` (`/usr/bin/chromium`).

## Decisions taken without the owner (review)
1. Floors does not fit the first screen (hero + open Prayer + open Home = about 900 px of 700). Included anyway, open, directly under Home. Say "drop Floors" to remove.
2. Rooms drawer shows rooms as chips (one tap per lamp), not Large cards. Say "Large cards" to switch.
3. Porch tap toggles directly (lights are not under D48/D60; lock and garage still only open HA's dialog).

## Not started (wait for GREEN LIGHT)
CalDAV integration, Ring camera tab on large screens, UI dashboard editor.

## Resume point
1. Owner: Reset frontend cache on the iPhone (Settings > Companion App > Reset frontend cache), then check WH-next and MKH next; report I66 result.
2. Owner: answer audit section 6 (A1 "fix A1", A3/A4 behaviour, GREEN LIGHT for A5 and A9, re-login AiDot, enable Activity sensors).
3. Claude next: apply the approved audit fixes on a branch; then the GREEN LIGHT ideas.

Rollback: resource `/local/habib/loader.js?v=16` + `git revert -m 1 161f1f0`; WH-next config from backup `089e07f1` or `dashboards/habib-glass-build.py` at `181a398`.

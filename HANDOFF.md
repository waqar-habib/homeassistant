# HANDOFF

Last updated: 2026-11-16 16:30 CST (Pi 5, habib-mkh compact). Before that: ~02:00 CST (Pi 5, dashboard fold).

## habib-mkh on one iPhone screen (2026-11-16 16:30 CST, Pi 5, D75): live, mock verified
Hero is 130 px (no Hijri date, no avatars, same weather in smaller type). Each room is a `habib-room` card: small lamp chips (tap toggles), and the chevron opens the full lamp cards. Front door, Climate, Listen and Shopping list sit in a `habib-dock` as 52 px bars, 2 per row; tap one to open it. One section. Loader v9, hash `9dac0e9f30284b82`, commit `e5ed62f`, backup `pre-mkh-compact` (`18afddc4`). habib-wh unchanged. Mock at 430x839 ends at ~814 px. **Owner next:** refresh the app on the MKH iPhone (Reset frontend cache if it looks old) and report fit and tap size. Rollback: re-apply `dashboards/habib-mkh-2026-11-16-fold.json`. Note `docs/sessions/2026-11-16-mkh-compact.md`. Earlier today: cloud session, dashboard v2 plan and prompts P0, P1. Previous: 2026-11-14 (Adhan owner confirm), 2026-11-12 (Pi 5, Adhan build), 2026-11-11 (Mac session, Home v2), 2026-11-09 (Mac session end), 2026-11-08 (backup location, partial stop at step 3).

## Pi 5 DNS to 1.1.1.1 (2026-11-16, Pi 5, D74): done, verified
Owner GREEN LIGHT Pi5 DNS. Backup `pre-pi5-dns` (slug `91b983ed`). `end0` IPv4 DNS set to `1.1.1.1`, `9.9.9.9`; method `auto`, address `192.168.1.36/24`, gateway `192.168.1.1` unchanged. The router `192.168.1.1` is still appended by DHCP; a static switch would remove it. Verified: no AdGuard address, public lookup OK, core running, no DNS log errors, cloud connected. Recheck (ha-mcp, 2026-11-16): `hassio.nameservers` still lists `192.168.1.1` and the router IPv6 `2603:8082:d840:62::1`. Not stale. **Router DNS removal: not done.** ha-mcp has no network-config service, so it can't make the static change. **Owner next:** in Pi 5 UI (Settings, System, Network, end0, IPv4) set method Static, address `192.168.1.36/24`, gateway `192.168.1.1`, DNS `1.1.1.1` and `9.9.9.9`, then tell Claude to re-read `hassio.nameservers`. Rollback: method auto, or restore `pre-pi5-dns`. Note `docs/sessions/2026-11-16-pi5-dns-public.md`.

## Fold on habib-wh, no prayer on habib-mkh (2026-11-16 ~02:00 CST, Pi 5, D71)
habib-wh: prayer, climate, HomePod and shopping list cards now fold to a 60 px summary bar (start folded, tap to open, choice remembered per device). habib-mkh: prayer card removed. Loader v8. Kiosk unchanged. Hashes wh `6f28c6e64b4b7e4a`, mkh `cdee379b6b4eda66`. Backup `pre-dashboard-fold` (cb385e06). Rollback: `-glass` exports plus loader `?v=7`. **Owner next:** refresh the app and try it. Note `docs/sessions/2026-11-16-dashboard-fold.md`.

## Glass dashboards live (2026-11-16 00:55 CST, Pi 5, D70)
habib-wh and habib-mkh redesigned to the owner's 2026 reference: glass panels on an evergreen wallpaper, drawn lamps that glow in their real colour with inline brightness, clock and weather hero, prayer countdown, climate dials, security status, HomePod player, shopping list. `habib-glass.js`, loader v7, theme "Habib Glass" per view, fonts self-hosted. Rendered in local Chromium with mock states; not yet seen in the real frontend. **Owner next:** refresh the app, open both dashboards, report issues. Rollback: `-iter1` exports plus loader `?v=6`; backup `pre-dashboard-glass` (c769dd3d). Note: `docs/sessions/2026-11-16-dashboard-glass.md`. Fajr 05:49 check (D69) still pending.

## Dashboard iteration 1 live (2026-11-16, Pi 5)
habib-ui restyled to Material 3 theme tokens (loader v6) and real habib-wh and habib-mkh views are live; hashes wh `b29a354a4958b891`, mkh `5b147c2b63ec0fe5`. Unrendered by Claude. Owner checks the iPhone; Mac session checks breakpoints; iteration 2 follows. Backup `pre-dashboard-iter1`. Note `docs/sessions/2026-11-16-dashboard-iter1.md`.

## Utilities config applied (2026-11-16 00:00 CST, Pi 5)
Adhan gate turned ON 00:16 CST on the owner's instruction (D69); first live run is Fajr 05:49. Check the trace and volume restore afterwards.
Material You Utilities 2.2.0 now loads via `extra_module_url` plus sidebar panel; restart done, backup `pre-material-you-utilities`. Owner checks UI; Claude checks habib-lab tokens. Fajr sensor looked stale after restart: recheck before 05:49. Details: `docs/sessions/2026-11-16-material-you-utilities-config.md`.

## Material You evaluation done (2026-11-15, Pi 5, read only)
Theme 5.0.15, Utilities 2.1.28 and Material Symbols are already installed (18:02 CST); Utilities is a dashboard resource only. No `pre-material-you` backup exists. Findings and owner questions: `docs/sessions/2026-11-15-material-you-evaluation.md`. Part 2 not run.

## Resume here (2026-11-15 late, garage arrival, D68)
1. **Built, dry run:** garage arrival automation for Door A only (`packages/arrival_garage.yaml`, merge `3e35b28`). `input_boolean.arrival_garage_live` is OFF; owner-only switch. `zone.arrival_home` (150 m, passive) created in HA. Session note `docs/sessions/2026-11-15-arrival-garage.md`.
2. **Owner next:** open both companion apps (Activity sensors, Maham's location). Then 3 real arrivals each in dry run; report back for radius tuning (I51). The 804 lock is a separate residence and a separate later build.
3. **Zones done (D65):** Home 100 m, Neighborhood 500 m, Leander 3000 m, Cedar Park 2700 m, Sasural 200 m. I27 closed. Near Home removed; M16 Cool Down needs a new trigger. Door B (shared home) disabled (D66, I50).
4. **Backups (I24, I25 resolved):** nightly copy to networkpi verified, test backup deleted. M4 left: weekly copy (M6) and pruning (I49).

## Resume here (2026-11-15 evening, nursery lamp, I47)
1. **Fixed:** Evening Away no longer touches the Nursery lamp (`e51a4e0`, on main; both evening packages now on main). Automations reloaded 19:33:44 CST. Verify at tomorrow's sunset (about 17:33 CST). Session note `docs/sessions/2026-11-15-nursery-lamp-evening-away.md`.
2. **Why it fired with the owner home:** both persons were `Neighborhood`, not `home`, because `zone.home` is only 10 m (I27, I43). **Owner decision waiting:** GREEN LIGHT to widen the Home zone to about 100 m (recommended), or another option.
3. **Owner decision waiting:** remove Nursery lights from `scene.turn_on_lights` and `scene.turn_off_lights` (manual only).
4. Components work below is unchanged: tablet render check (I46), then P3 to P5.

## Earlier (2026-11-15, after the components run)
1. **Done on the Pi 5 (Sonnet 5.5):** foundation verified (session note `docs/sessions/2026-11-15-dashboard-p1-foundations.md`), I44 closed. New library: `www/habib/habib-logic.js` (pure logic, 19 node tests), `habib-ui.js` with `habib-light-button`, `habib-action-button`, `habib-status-strip`, a shared bottom sheet, and a diag card that no longer redraws on every state change. Loader `VERSION` 5, resource `/local/habib/loader.js?v=5`. Dashboard `habib-lab` (admin only, sidebar) holds every card; export `dashboards/habib-lab-2026-11-15.json`. Cookbook recipes added. Backup `pre-habib-components` (slug `5bcc956c`).
2. **iPhone verified 2026-11-15 (I46 partly closed):** taps, long-press sheet and Add card picker work; layout fixed to Apple Home style half-width tiles (loader v5, `105e11c`). Tablet sizes still unchecked. Original checklist: (1) on the iPhone open habib-lab and tap the single light, the Upstairs group and the scene button; (2) press and hold a light for the brightness sheet; (3) in Edit dashboard, Add card, search "Habib" and confirm the three Habib cards appear; (4) tell the cloud session what looked wrong. The cloud session renders habib-lab at 430x932, 1280x800 and 960x600.
3. **Next after the checks:** the P3 to P5 prompts (real WH, MKH and kiosk views) build on these cards. Lock, garage and outdoor controls still wait for "GREEN LIGHT outdoor controls" (D60); arrival automations for "GREEN LIGHT arrival automations".
4. Session note: `docs/sessions/2026-11-15-dashboard-p2-components.md`.

## Earlier today (2026-11-15, dashboard v2)
1. **Owner standing GREEN LIGHT (D53, 2026-11-15)** for the dashboard series, with exclusions (lock and garage service calls, Adhan, D42 automations, HomeKit Bridge, network and DNS, secrets). Plan: `docs/dashboard-v2-plan.md` (v0.4). Decisions D52 to D55, issues I35 to I37, milestone M19.
2a. **Owner answers D60 (13:38):** Outdoor group on kiosk and WH only; no Hatch light controls (D61; optional WH brown-noise button only if start and stop are verified); arrival automations drafted in `docs/prompts/pi5/2026-11-15-arrival-lock-garage.md` (needs owner phrases "GREEN LIGHT outdoor controls" and "GREEN LIGHT arrival automations"; zones are an owner step).
2d. **Visual design (I48, D63):** owner wants real Material Design 3. Pi 5 next (read only): `docs/prompts/pi5/2026-11-15-material-you-evaluation.md`. The visual pass and the MKH, WH and kiosk view prompts wait for the owner's choice.
2f. **Owner design answers (D67, 2026-11-15):** M3 card 12dp; function buttons stay half width with icon and text; blur backburnered. M3 reading is done on `main` (`docs/design/m3-reference.md`, `m3-components.md`). Next: Pi 5 Material You evaluation, then the visual pass prompt.
2e. **Mac (reads Material Design 3 pages in Chrome, D63):** `docs/prompts/mac/2026-11-15-m3-reference-read.md`; it writes `docs/design/m3-reference.md`. Cloud session reads that file next.
2c. **I45 (14:07, likely resolved 14:29):** the new dashboards showed "Configuration error"; after a refresh habib-kiosk renders (owner screenshot). Confirm habib-wh and habib-mkh, then run the components prompt. The diagnosis prompt `docs/prompts/pi5/2026-11-15-dashboard-p1-diagnose.md` is optional.
2b. **Foundation prompt done (commits 681dfc5 to f1e2a53, Haiku 5.5, gaps in I44).** Pi 5 next: `docs/prompts/pi5/2026-11-15-dashboard-p2-components.md` (components, Tier 2). Owner first checks the three diag cards (viewport, user, Add card picker).
2. **Pi 5 next (P0 done, commit d41abd5, blockers do not stop P1):** run P1. Open items I39 to I42 and D59. Originally: run P0 then P1. Pointer: `git pull; read docs/prompts/pi5/2026-11-15-dashboard-p0-discovery.md then docs/prompts/pi5/2026-11-15-dashboard-p1-foundations.md (commit see git log); run P0, then P1 if P0 has no blockers`.
3. **Then (cloud or Mac session):** read the P0 report, write P2 (components) and P3 to P5 with real entity IDs; C1 CalDAV (owner creates the app-specific password, enters it in HA) and A1 doorbell takeover (ships disabled) in a parallel lane.
4. **Owner:** confirm D54 defaults (dashboard-side groups, two temperatures, group buttons on all views), where the Porch light appears, and the scope reading of D53. Run the Ring press-latency protocol when P0 writes it (I35). After the tablet arrives: T1, P6, P7, P8.
5. **Owner rule (D58):** in every message to the owner, write a step code only with its full phrase, for example "You complete P0 which is the discovery prompt on the Pi 5". Never a bare code.
5a. **FamFam (D56, D57, I38):** owner chose FamFam for family calendar and grocery (replaces CalDAV C1 and HA Family Hub). Pi 5 prompt `docs/prompts/pi5/2026-11-15-famfam-integration.md` runs after P0, not alongside P1 (it needs a core restart in a prayer-safe window). Owner first creates the FamFam family and organiser token and pastes the token into HA's config flow.
6. Session note: `docs/sessions/2026-11-15-dashboard-plan.md`. `habib-home` (Nuvio) stays the live dashboard until cutover.

## Previous (2026-11-14, Adhan owner confirmation)
- **Owner confirmed 2026-11-14: all 5 Adhan automations work as expected.**
- **Toggle `input_boolean.adhan_enabled` is ON** since 2026-11-14 17:41 CST (owner GREEN LIGHT). Earlier OFF at 13:00 CST had no recorded cause. All five `automation.adhan_*` are on.
- Last code change `7c0a2fa` (finish by track length). Post-fix runs in traces: Dhuhr 11-13 and 11-14, Fajr 11-14 05:48 CST, Isha 11-13 18:44 CST. Outcomes of the notices and volume restore not yet read in detail.
- Session note: `docs/sessions/2026-11-14-adhan-owner-confirm.md`.

## Previous (2026-11-12, Adhan build)
- **Adhan enabled 2026-11-12 17:43 (owner GREEN LIGHT).** Toggle ON. Isha 18:44 Central is the first live run, unsupervised. Supervised runs still pending.
- Previously: built with toggle OFF. Branch `feat/adhan-automation` (`bc0b8c5`), pushed, NOT merged. Contents: `packages/adhan.yaml` (helpers, script `adhan_play`, five prayer automations, startup check). Pre-build backup `pre-adhan-build` (slug `b7f421f8`). `ha core check` clean, reloads OK, verified: helpers exist and `input_boolean.adhan_enabled` is off. No playback, no volume change.
- **Prayer times confirmed by owner (2026-11-12):** the times shown in the integration are correct.
- **Next (owner):** supervised runs of `Adhan.mp3` and `Fajr.mp3` on the Living Room HomePod (owner present). Dry-run notice done 2026-11-12. Enabled and merged 2026-11-12.
- Session note: `docs/sessions/2026-11-12-adhan-build.md`. Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
1. **Home v2 is live on habib-home** (2026-11-11, merged to main `5327aa3`): Prayer Times card (five columns from 460 px, list when narrower), slim Front Door bar (`habib-lock-chip`: opens HA's lock dialog, never calls a service), Scenes (Quick actions), both thermostats. Weather stays in the left hero. The Outside card and the big lock card are gone. Files: `www/habib/habib-cards.js` (Lovelace resource `/local/habib/habib-cards.js?v=1`), layout JSON in `dashboards/nuvio-layout-2026-11-11-*.json`. Rendered at 430, 1280x800 and 1440, guarded tap tests pass.
2. **Owner: tell the Pi 5 to return to main.** On the Pi 5 type: `git pull; read docs/prompts/pi5/2026-11-11-return-to-main.md (commit see git log); run it`. It is still on branch `feat/nuvio-home-build`.
3. **Next iteration (owner, 2026-11-11):** Rooms optimization (tiles, empty Kitchen and Formal Living, "No room" cannot be hidden: I34). Then Media, Family and Map polish, the wall tablet (kiosk, screensaver, 5 min idle), MKH view and per-person visibility.
4. **Owner decisions waiting:** presence zone (I27); HomeDeck removal (I28). Please confirm the 13:44 UTC (8:44 AM CST) lock then unlock at the front door was your own test (logbook shows `lock.unlock` then `lock.lock` 8 s apart under your user, before any of my lock-bar tests; my guarded tests made zero lock calls).
5. **Rollback:** backup `pre-nuvio-extend` (slug `82cc58de`, networkpiBackups), `dashboards/nuvio-layout-2026-11-11-pre-build.json` (Nuvio Import, Replace), Lovelace resource id `c62a8173054c4520be6ec44b5f9d5bbf` (delete to unload the cards).
6. **Session note:** `docs/sessions/2026-11-11-mac-nuvio-build.md`. Decisions D47, D48. Issues I30 to I34. Milestone M18 done.

## Networkpi
**AdGuard Home stage 1 running (2026-11-16):** service active, DNS on `192.168.1.39:53`, admin UI on `http://192.168.1.39:3001` (port 3000 failed in the wizard, see the session note). Zero filter lists, DHCP off, no clients. Verified: DNS A and AAAA answers, RSS 47 MB, 224 MB available. Session note `docs/sessions/2026-11-16-adguard-stage1.md`.
- **Decided (D72):** admin port 3001 is standard. `3000/tcp` ufw rule deleted 2026-11-16.
- **Done:** DNSSEC off (owner, 2026-11-16). **Owner next:** keep the sudo rule `/etc/sudoers.d/claude-adguard` until all AdGuard stages are done (owner decision 2026-11-16), then remove it. Check the journal at 24 h (about 2026-11-17 11:30 CST). Stage 2 needs its own GREEN LIGHT.

Baseline 2026-11-08: healthy. Up 15 days, throttle `0x0` (I11 resolved), 389 MB available, disk 15%, no OOM. Phase B (Remote Control, `claude-remote.service`) has run since 2026-10-30, so I12 is closed. Login as `networkpi` (admin), then `sudo -iu claude` for the repo and service.
- **I24/I25 resolved 2026-11-15:** 7 nightly 03:00 backups confirmed (11-09 to 11-15), available memory 305 MB, no OOM, throttle 0x0. New I49: manual backups unpruned (13 files, about 3 GB) and `82cc58de` not found by slug in the share. Next: M6 install needs ntfy topic, healthchecks.io check, runner choice, GREEN LIGHT. Older note follows.
- **I24 backups (old):** HA backs up to the `networkpiBackups` mount (daily 03:00, keep 7). Evidence from HA 2026-11-11: automatic backup `06aa8ab1` (03:00) is listed on `hassio.networkpiBackups`, so the nightly copy works; the disk-side check below is still pending. Pending: confirm the 03:00 run (`sudo ls -la /srv/ha-backups`), then delete test file `2c9d3f0d.tar`, then close I24 and M4.
- **I25 memory:** check after the 03:00 run (`sudo dmesg -T | grep -i -E 'oom|killed process' | tail`, `free -m`). Available memory fell to 250 MB with `smbd` at 179 MB.
- **Monitor and weekly copy (M6):** drafts on `feat/networkpi-monitor` (`ffa5f69`), dry-run tested. Not installed (Tier 3). Needs: ntfy topic, healthchecks.io check, runner decision, GREEN LIGHT.
- **AdGuard (M7, I26):** plan v0.5 in `docs/adguard-plan.md`. Install waits on I25, I24 and M6. I1 answered: router takes two DNS servers; IPv6 on, not changeable in the router app.
- GitHub token (repo-only) expires 2027-04-24.

## Open items
1. Nabu Casa trial: decide keep or cancel by about 2026-11-20 (bills about 2026-11-23). Do not cancel until the tunnel and geofencing are tested.
2. Make the repo private (D25), when the owner chooses.
3. Owner on hold: redact the owner email in the aidot note in `docs/sessions/2026-10-23-pi5-cleanup-handoff.md`.
4. Watch: `vcgencmd get_throttled` on networkpi (I11).
5. I14: no `pre-glass-cards` backup. I16: Rooms layout and thermostat areas (M14).
6. Nuvio vs Glass Cards decision, after the test. Nuvio Settings (header, bottom bar, screensaver 5 min) are owner UI follow-ups.
7. Tablet model (I5). Garage lock and Meross stay in the backlog. Hatch excluded from HomeKit (I23).
8. Adhan (M12, I17): ENABLED 2026-11-12 (owner GREEN LIGHT). Supervised runs still pending.

## Device state
- **Pi 5** (192.168.1.36): HA core 2026.11.0, Nuvio 2.31.0. HACS removed by HA OS, Nuvio and Glass Cards resources still load from `/local/community/`. Dashboards: `habib-home` (main, Home v1 applied 2026-11-11), `nuvio-shared`, `habib-home-new` (deleted by the owner 2026-11-11). Adhan package removed 2026-11-09 (`d6a1d09`); prayer-times sensors kept. Backup `pre-dashboard-build` (slug `e91f5e77`). Cloudflare Tunnel live (D39). Nabu Casa still active.
- **networkpi** (192.168.1.39, wired): see above.
- **Mac:** caffeinate running (background task `bf6ir4abo`, started 2026-11-11). Repo `.git` repaired 2026-11-09 by `git fetch --refetch origin` (I29). Working tree matches `origin/main`.
- **Router:** DHCP reservations done. Two DNS fields available (I1).

## Automations
All four D42 automations are on branch `feat/d42-automations` (`cecf379`), disabled, not merged: `d42_evening_on_sunset`, `d42_away_on_sunset`, `d42_away_off_after_2h`, `d42_notify_lights_and_front_door`. The live HA automation count is unchanged.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Anything Tier 3 (restarts, tunnel, DNS, firewall, credentials, deletions, front door lock, garage door, enabling automations) waits for the owner's "GREEN LIGHT".

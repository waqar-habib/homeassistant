# HANDOFF

Last updated: 2026-11-12 (Pi 5, Adhan build, GREEN LIGHT). Previous: 2026-11-11 (Mac session, Home v2), 2026-11-09 (Mac session end), 2026-11-08 (backup location, partial stop at step 3).

## Resume here (2026-11-12, Adhan build)
- **Adhan built, toggle OFF.** Branch `feat/adhan-automation` (`bc0b8c5`), pushed, NOT merged. Contents: `packages/adhan.yaml` (helpers, script `adhan_play`, five prayer automations, startup check). Pre-build backup `pre-adhan-build` (slug `b7f421f8`). `ha core check` clean, reloads OK, verified: helpers exist and `input_boolean.adhan_enabled` is off. No playback, no volume change.
- **Prayer times confirmed by owner (2026-11-12):** the times shown in the integration are correct.
- **Next (owner):** dry-run notice, supervised runs of `Adhan.mp3` and `Fajr.mp3` on the Living Room HomePod (owner present). Then a separate GREEN LIGHT to enable and to merge the branch to `main`.
- Session note: `docs/sessions/2026-11-12-adhan-build.md`. Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
1. **Home v2 is live on habib-home** (2026-11-11, merged to main `5327aa3`): Prayer Times card (five columns from 460 px, list when narrower), slim Front Door bar (`habib-lock-chip`: opens HA's lock dialog, never calls a service), Scenes (Quick actions), both thermostats. Weather stays in the left hero. The Outside card and the big lock card are gone. Files: `www/habib/habib-cards.js` (Lovelace resource `/local/habib/habib-cards.js?v=1`), layout JSON in `dashboards/nuvio-layout-2026-11-11-*.json`. Rendered at 430, 1280x800 and 1440, guarded tap tests pass.
2. **Owner: tell the Pi 5 to return to main.** On the Pi 5 type: `git pull; read docs/prompts/pi5/2026-11-11-return-to-main.md (commit see git log); run it`. It is still on branch `feat/nuvio-home-build`.
3. **Next iteration (owner, 2026-11-11):** Rooms optimization (tiles, empty Kitchen and Formal Living, "No room" cannot be hidden: I34). Then Media, Family and Map polish, the wall tablet (kiosk, screensaver, 5 min idle), MKH view and per-person visibility.
4. **Owner decisions waiting:** presence zone (I27); HomeDeck removal (I28). Please confirm the 13:44 UTC (8:44 AM CST) lock then unlock at the front door was your own test (logbook shows `lock.unlock` then `lock.lock` 8 s apart under your user, before any of my lock-bar tests; my guarded tests made zero lock calls).
5. **Rollback:** backup `pre-nuvio-extend` (slug `82cc58de`, networkpiBackups), `dashboards/nuvio-layout-2026-11-11-pre-build.json` (Nuvio Import, Replace), Lovelace resource id `c62a8173054c4520be6ec44b5f9d5bbf` (delete to unload the cards).
6. **Session note:** `docs/sessions/2026-11-11-mac-nuvio-build.md`. Decisions D47, D48. Issues I30 to I34. Milestone M18 done.

## Networkpi
Baseline 2026-11-08: healthy. Up 15 days, throttle `0x0` (I11 resolved), 389 MB available, disk 15%, no OOM. Phase B (Remote Control, `claude-remote.service`) has run since 2026-10-30, so I12 is closed. Login as `networkpi` (admin), then `sudo -iu claude` for the repo and service.
- **I24 backups:** HA backs up to the `networkpiBackups` mount (daily 03:00, keep 7). Evidence from HA 2026-11-11: automatic backup `06aa8ab1` (03:00) is listed on `hassio.networkpiBackups`, so the nightly copy works; the disk-side check below is still pending. Pending: confirm the 03:00 run (`sudo ls -la /srv/ha-backups`), then delete test file `2c9d3f0d.tar`, then close I24 and M4.
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
8. Adhan (M12, I17): built on `feat/adhan-automation`, toggle OFF, not merged. Supervised runs and enabling need owner GREEN LIGHT.

## Device state
- **Pi 5** (192.168.1.36): HA core 2026.11.0, Nuvio 2.31.0. HACS removed by HA OS, Nuvio and Glass Cards resources still load from `/local/community/`. Dashboards: `habib-home` (main, Home v1 applied 2026-11-11), `nuvio-shared`, `habib-home-new` (deleted by the owner 2026-11-11). Adhan package removed 2026-11-09 (`d6a1d09`); prayer-times sensors kept. Backup `pre-dashboard-build` (slug `e91f5e77`). Cloudflare Tunnel live (D39). Nabu Casa still active.
- **networkpi** (192.168.1.39, wired): see above.
- **Mac:** caffeinate running (background task `bf6ir4abo`, started 2026-11-11). Repo `.git` repaired 2026-11-09 by `git fetch --refetch origin` (I29). Working tree matches `origin/main`.
- **Router:** DHCP reservations done. Two DNS fields available (I1).

## Automations
All four D42 automations are on branch `feat/d42-automations` (`cecf379`), disabled, not merged: `d42_evening_on_sunset`, `d42_away_on_sunset`, `d42_away_off_after_2h`, `d42_notify_lights_and_front_door`. The live HA automation count is unchanged.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Anything Tier 3 (restarts, tunnel, DNS, firewall, credentials, deletions, front door lock, garage door, enabling automations) waits for the owner's "GREEN LIGHT".

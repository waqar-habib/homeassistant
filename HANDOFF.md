# HANDOFF

Last updated: 2026-11-11 (Mac session, partial stop: waiting on the Pi 5 file drop). Previous: 2026-11-09 (Mac session end), 2026-11-08 (backup location, partial stop at step 3). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
1. **Owner: start the Pi 5 deploy.** On the Pi 5 type: `git pull; read docs/prompts/pi5/2026-11-11-prayer-card-deploy.md (commit 6a4a4e4); run it`. It checks out branch `feat/nuvio-home-build` and confirms `/local/habib/habib-prayer-card.js` is served (Tier 2, no restart). Until then that URL returns 404.
2. **Mac, after the Pi 5 reports 200:** create the Lovelace resource `/local/habib/habib-prayer-card.js?v=1` (module; GREEN LIGHT given, D47) through the HA websocket, add the prayer item to Home through Nuvio's "Card from HA (YAML)" (`type: custom:habib-prayer-card`; the order list already has key `c:hacard:hh0005`), render at 430, 1280x800 and 1440, rerun the guarded tap tests, merge `feat/nuvio-home-build` to main, then tell the Pi 5 to `git checkout main; git pull --rebase`.
3. **habib-home Home v1 is live** (applied 2026-11-11 through Nuvio Layout import, saved in `nuvio-shared`): Front Door lock (compact, confirmed unlock), Outside weather, both thermostats, Scenes (Quick actions: Lights on, Lights off, Away). General and No room hidden on Rooms. Prayer card is the only missing piece. Rollback: backup `pre-nuvio-extend` (slug `82cc58de`, networkpiBackups) and `dashboards/nuvio-layout-2026-11-11-pre-build.json`.
4. **Owner decisions waiting:** check the front door (I30, door sensor reads open while the lock is locked); presence zone (I27); HomeDeck removal (I28); delete `habib-home-new` (Tier 3, I33); keep both weather views on wide screens; Kitchen and Formal Living tiles are empty.
5. **Session note:** `docs/sessions/2026-11-11-mac-nuvio-build.md`. Decision D47. Issues I30 to I33.

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
8. Adhan (M12, I17): owner picks the time. Claude does not run it.

## Device state
- **Pi 5** (192.168.1.36): HA core 2026.11.0, Nuvio 2.31.0. HACS removed by HA OS, Nuvio and Glass Cards resources still load from `/local/community/`. Dashboards: `habib-home` (main, Home v1 applied 2026-11-11), `nuvio-shared`, `habib-home-new` (superseded by D47, admin only, delete pending). Adhan package removed 2026-11-09 (`d6a1d09`); prayer-times sensors kept. Backup `pre-dashboard-build` (slug `e91f5e77`). Cloudflare Tunnel live (D39). Nabu Casa still active.
- **networkpi** (192.168.1.39, wired): see above.
- **Mac:** caffeinate running (background task `bf6ir4abo`, started 2026-11-11). Repo `.git` repaired 2026-11-09 by `git fetch --refetch origin` (I29). Working tree matches `origin/main`.
- **Router:** DHCP reservations done. Two DNS fields available (I1).

## Automations
All four D42 automations are on branch `feat/d42-automations` (`cecf379`), disabled, not merged: `d42_evening_on_sunset`, `d42_away_on_sunset`, `d42_away_off_after_2h`, `d42_notify_lights_and_front_door`. The live HA automation count is unchanged.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Anything Tier 3 (restarts, tunnel, DNS, firewall, credentials, deletions, front door lock, garage door, enabling automations) waits for the owner's "GREEN LIGHT".

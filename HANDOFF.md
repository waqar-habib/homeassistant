# HANDOFF

Last updated: 2026-11-09 (Mac session end). Previous: 2026-11-08 (backup location, partial stop at step 3). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
1. **Dashboard `habib-home-new` (D46, GREEN LIGHT 2026-11-09).** Built by the Pi 5 on branch `feat/habib-home-new` (`9fd25a3`), not merged. Five tabs: Home, Rooms, Climate, Media, Family. Not yet rendered: the Mac must render it at 430, 1280x800 and 1440 in Chrome before the owner judges it. Design: `docs/dashboard-design.md` v1.0. Pi 5 note: `docs/sessions/2026-11-09-dashboard-build.md`.
2. **Owner action (I28):** remove the HomeDeck integration in Settings, Devices and services. The Pi 5 then deletes `custom_components/homedeck` after confirmation. The removal was refused by the automated tool, so it stays a manual step.
3. **Presence fix (I27) before any D42 automation:** `person.waqar_habib` is in zone Sasural, so `home` checks read "nobody home". Owner decision. All four D42 automations stay disabled (D44, D45). MKH still to be added to zones.
4. **Scenes (done, `a673312` on main):** Turn on lights, Turn off lights (15 non-Hatch lights each), Away (empty).
5. **Session note:** `docs/sessions/2026-11-09-mac-prompts-and-handoff.md`.

## Networkpi
Baseline 2026-11-08: healthy. Up 15 days, throttle `0x0` (I11 resolved), 389 MB available, disk 15%, no OOM. Phase B (Remote Control, `claude-remote.service`) has run since 2026-10-30, so I12 is closed. Login as `networkpi` (admin), then `sudo -iu claude` for the repo and service.
- **I24 backups:** HA backs up to the `networkpiBackups` mount (daily 03:00, keep 7). Pending: confirm the 2026-11-09 03:00 run (`sudo ls -la /srv/ha-backups`), then delete test file `2c9d3f0d.tar`, then close I24 and M4.
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
- **Pi 5** (192.168.1.36): HA core 2026.11.0, Nuvio 2.31.0. HACS removed by HA OS, Nuvio and Glass Cards resources still load from `/local/community/`. Dashboards: `habib-home` (main), `nuvio-shared`, `habib-home-new` (new, admin only, from the Pi 5 build). Adhan package removed 2026-11-09 (`d6a1d09`); prayer-times sensors kept. Backup `pre-dashboard-build` (slug `e91f5e77`). Cloudflare Tunnel live (D39). Nabu Casa still active.
- **networkpi** (192.168.1.39, wired): see above.
- **Mac:** caffeinate running (background task `b4tzob6aa`). Repo `.git` repaired 2026-11-09 by `git fetch --refetch origin` (I29). Working tree matches `origin/main`.
- **Router:** DHCP reservations done. Two DNS fields available (I1).

## Automations
All four D42 automations are on branch `feat/d42-automations` (`cecf379`), disabled, not merged: `d42_evening_on_sunset`, `d42_away_on_sunset`, `d42_away_off_after_2h`, `d42_notify_lights_and_front_door`. The live HA automation count is unchanged.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Anything Tier 3 (restarts, tunnel, DNS, firewall, credentials, deletions, front door lock, garage door, enabling automations) waits for the owner's "GREEN LIGHT".

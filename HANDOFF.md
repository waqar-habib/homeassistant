# HANDOFF

Last updated: 2026-11-08 (backup location, partial stop at step 3). Previous: 2026-11-04 late (Pi 5, habib-home redesign: Nuvio-card dashboard rev 2). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
Dashboards (2026-11-04, Pi 5): the owner wants the redesign in the Nuvio look, not stock HA cards. Three dashboards exist: `habib-home` (Nuvio strategy, untouched, still main), `habib-home-v2` (stock HA cards, owner rejected the look, keep or delete: needs owner OK), and **`habib-home-nuvio`** (Nuvio `custom:nuvio-*` cards, static views, admin only). Owner saw rev 1 of `habib-home-nuvio` on the iPhone: toggles had no names and clipped switches, a stretched tile, a duplicated truncated HomePod title. Rev 2 (live, hash `08ade5fb33152df1`, branch `feat/habib-home-nuvio` `ea87ae6`, not merged) uses two columns and separate full-width HomePod and lock cards. Rev 2 has **not** been seen or rendered by anyone. Next: owner reloads and looks at rev 2; owner decides on Nuvio chrome (header, tabs, summary chips) and on default dashboard. Open checks: the lock glance tile must open more-info and not lock or unlock; installed Nuvio is 2.31.0, but the docs used were 2.30.1 (auto-update was meant to be off). Details: `docs/sessions/2026-11-04-habib-home-redesign.md` (section "Nuvio-card instance"). Parity table: `docs/transition-apple-home-to-ha.md`. Cloud planning note: `docs/sessions/2026-11-04-cloud-i18-and-dashboard-plan.md`.
Owner replies of 2026-11-03 are in D38. Session note: `docs/sessions/2026-11-03-owner-replies.md`.
0. **I18 on hold (owner, 2026-11-03):** front-door geofence automation stays disabled. Revisit later.
1. **Dashboards (D38):** delete `nuvio-test` and `prayer-times`. The prayer card goes into `habib-home`. Unknown whether Nuvio accepts a markdown card (I22), so the Pi 5 checks first and deletes `prayer-times` only after the card shows. Prompt: `docs/prompts/pi5/2026-11-03-dashboards-tunnel.md`.
2. **Cloudflare Tunnel (live, D39):** `https://ha.thehabibfam.cc` works with 2FA; app and Safari tested on cellular (owner). Trusted proxy is set in the HA UI. Left: Pi 5 removes ignored `packages/cloudflare.yaml` (branch `feat/cloudflare-tunnel`), then HA 2FA is already on. Nabu Casa stays until geofencing is tested; bills about 2026-11-23. Session note: `docs/sessions/2026-11-03-tunnel-live.md`.
3. **Scenes (M11, I19):** need more work and planning. Not tested. `feat/scenes` stays unmerged.
4. **Adhan (M12, I17):** live test affirmed, pending. Owner picks the time. Claude does not run it.
5. **Hatch (I23):** excluded from the HomeKit Bridge by the owner (not re-verified).
6. **Tablet (I5):** backlog (D41), owner budgeting and researching.
7. **networkpi I12:** owner says no OOM kills, RAM test done. Closed on the owner's word.

## Networkpi
Baseline 2026-11-08 (owner via Pi Connect): healthy. Up 15 days, throttle `0x0` (I11 resolved), 389 MB available, disk 15%, no OOM. Phase B (Remote Control, `claude-remote.service`) has run since 2026-10-30 10:43 CDT, so I12 is closed. ufw: SSH from the LAN, Samba from the Pi 5 only. Login as `networkpi` (admin), then `sudo -iu claude` for the repo and service.

**Gap (I24):** the `ha-backups` share is empty. HA does not back up to it yet (M4). Backup location in progress (GREEN LIGHT given 2026-11-08): `pre-backup-location` created (`744a21ce`). Resume at step 3: owner adds the SMB storage in the HA UI, then steps 4-8 in `docs/prompts/pi5/2026-11-08-backup-location.md`. Session note: `docs/sessions/2026-11-08-backup-location.md`. Then Step 2 drafts (`feat/networkpi-monitor`), then monitoring (D24). Backups: owner added share `networkpiBackups` on the Pi 5, 03:00 daily keep 7, test backup landed in the share ROOT (`docs/sessions/2026-11-08-backup-location.md`); step 7 (check the 03:00 run on 2026-11-09, then close I24, M4) is pending. Drafts on branch `feat/networkpi-monitor` (`9024b0e`: monitor `check.sh`, `weekly-copy.sh`, README), dry runs on networkpi not yet done; install is Tier 3. Open: who runs the weekly copy (recommended: system timer as `habackup`), memory alert floor (200 MB), ntfy topic and healthchecks.io check to be created. Dry runs done 2026-11-08 (`check.sh` OK; `weekly-copy.sh` fixed in `ffa5f69`). **Watch I25:** available memory fell to 250 MB with an `smbd` session at 179 MB (the Pi 5 backup mount); check after the 03:00 backup on 2026-11-09 (`sudo ls -la /srv/ha-backups`, `sudo dmesg -T | grep -i -E 'oom|killed process' | tail`, `free -m`). **AdGuard:** plan v0.5 in `docs/adguard-plan.md` (I26 airline check-in risk, I1 answered: router takes two DNS servers; IPv6 on and not changeable in the router app). Log first (1 to 3 days), replay, one list, per-device before router-wide. Gated on I25, I24, M6. Details: `docs/sessions/2026-11-08-networkpi-baseline.md`. GitHub token (repo-only) expires 2027-04-24.

## Open items
1. Domain: `thehabibfam.cc` bought. Next: tunnel hostname `ha.thehabibfam.cc` (Tier 3, GREEN LIGHT needed). Prompt exists: `docs/prompts/pi5/2026-10-24-cloudflare-tunnel.md`, no GREEN LIGHT.
2. Nabu Casa trial (D26): likely bills around 2026-11-23. Geofencing needs remote access to stay up (location only reaches HA from outside through it), so do not cancel until the tunnel is tested.
3. Make the repo private (D25), when the owner chooses.
4. Owner on hold: redact the owner email in the aidot note in `docs/sessions/2026-10-23-pi5-cleanup-handoff.md`.
5. Watch: `vcgencmd get_throttled` on networkpi (I11).
6. I14: no `pre-glass-cards` backup. I16: Rooms layout and thermostat areas.
7. Nuvio vs Glass Cards decision, after the test.
8. Tablet model (I5). Garage lock and Meross stay in the backlog.

## Pending proposals
- Weekly encrypted backup copy to cloud storage (I9).

## Device state
- **Pi 5** (192.168.1.36) status sync 2026-11-09 (read-only, `docs/sessions/2026-11-08-pi5-status-sync.md`): core 2026.11.0, OS 18.4, add-ons current, config check valid, 0 repairs, 0 ERROR lines. Dashboards: only `habib-home` and `nuvio-shared` exist. Nuvio 2.31.0 installed. Owner deleted the four non-standard dashboards (habib-home kept as sandbox). Adhan package removed on 2026-11-09 (automation, scripts, helper); prayer-times integration and sensors kept. Five no-area scenes removed. Backups: `networkpiBackups` mount live, daily 03:00 schedule set, first scheduled run pending. HA OS and core updated (core 2026.10.4 on 2026-10-30). Claude Terminal and ha-mcp running (ha-mcp reconnected, I15). Glass Cards v1.10.11 and Nuvio v2.30.1 installed via HACS (auto-update off for Nuvio). Dashboard `nuvio-test` live. Scenes on `feat/scenes` (not merged). Adhan package on `main`, switched off (`6316775`). Geofencing not deployed (I18 live automation, see Resume item 0). Backups: `ha-pre-nuvio-backup_10-29` (slug 023157b8). Remote access: Cloudflare Tunnel live (D39); Nabu Casa trial still active.
- **networkpi** (192.168.1.39, wired): see Networkpi above.
- **Mac**: caffeinate running (started 2026-11-08); the Mac was off the home network this session.
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order after the open items
1. Phase B of networkpi Remote Control.
2. Point HA's backup location at the Samba share (daily, keep 7) plus a weekly copy on networkpi (keep 4).
3. Cloudflare Tunnel on the Pi 5, HA 2FA, `http` trusted proxy settings.
4. Monitoring (D24).
Then AdGuard Home (I1), voice feasibility F4, F1, F2, F3, Ring events and the garage.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`, with the permissions above. Anything else Tier 3 (restarts, tunnel, DNS, firewall, credentials, deletions, front door lock, garage door) waits for the owner's "GREEN LIGHT".

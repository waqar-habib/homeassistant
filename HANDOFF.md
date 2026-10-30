# HANDOFF

Last updated: 2026-10-30 ~10:30 CDT (parallel Pi 5 lane run). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
0. **I18 is OFF** (owner disabled it in HA, 2026-10-30). REVISIT: keep as notify-only, rewrite under D32 and commit, or delete. Next: run `docs/prompts/pi5/2026-10-30-pi5-resume.md` (zone, areas, Hatch bridge exclusion, prayer dashboard). Owner replies are in D37.
0a. **Parallel lane (2026-10-30), status:** step 1 baseline OK (backup `pre-parallel-2026-10-30`, slug `02d37f95`). Step 2 I18 disable blocked. Step 3 Hatch refresh pushed (`25cbb1b`). Step 4 Movie Night removed on `feat/scenes` (`4cb5cee`, pushed, not merged). Step 5 zone blocked by I18; area audit reported (I21). Step 6 `habib-home` created (I22; prayer card and rooms layout pending). Step 7 Cloudflare waiting on owner. Step 8 skipped: no MKH person entity. Step 9 not run. Step 10 Remote Control blocked by the classifier (I20). See `docs/sessions/2026-10-30-parallel-pi5.md`.
1. **Geofence automation needs an owner decision (I18).** `automation.front_door_geofence_auto_lock_unlock` is loaded and unlocks the front door on zone entry. It is in an uncommitted `automations.yaml` change. Claude has not changed it.
2. **Adhan (M12, I17):** package on `main` (`6316775`), toggle OFF, verified. Live test (play, volume, enabling the toggle) is held for a separate GREEN LIGHT with the baby awake. See `docs/sessions/2026-10-30-adhan-setup.md`.
3. **Scenes (M11, I19):** on `feat/scenes` (`02588c7`), not merged. Owner tests pending (Welcome Home, Movie Night, Evening, Good Night with the lock). Then fast-forward merge to `main`.
4. **Nuvio test (M9, I16):** owner reviewing `nuvio-test`. Rooms layout to polish.

## Networkpi
Where it stands: bootstrap done 2026-10-24 (ufw, SSH keys only, watchdog, Samba share `ha-backups`, `claude` user). Claude Code 2.1.310 is installed and signed in as `claude`, repo cloned. Phase 0 and Phase A passed with no out-of-memory kills (available memory 486 to 699 MB, swap 0). Phase B (Remote Control, always-on) has its GREEN LIGHT (2026-10-24). The owner chose to wait until 2026-10-25. There is no record since, so it is unknown whether Phase B ran.

Unit file: `networkpi/claude-remote.service` on branch `feat/networkpi-claude-remote` (`2110302`). It starts `claude remote-control --name networkpi` in a tmux session `claude-rc` with a restart loop (30 s). Not merged, not enabled.

Steps when the owner gives the word:
1. `~/.local/bin/claude doctor` as `claude`. Remote Control should show as available.
2. Review the unit and merge it to `main` if good.
3. Enable: copy to `~/.config/systemd/user/`, `systemctl --user daemon-reload`, `systemctl --user enable --now claude-remote.service`. Check `tmux -L default attach -t claude-rc` and a Remote Control session from claude.ai/code or the phone.

I12 (RAM: 905 MB against Claude's 4 GB minimum) stays open until Phase B has run stably for a day. Fallback: keep Claude on the Pi 5 and the Mac; networkpi stays the backup, monitoring and DNS host. GitHub token (repo-only, Contents read and write) expires 2027-04-24.

Owner to report: did Phase B run, and is networkpi's throttle status still `0x0` (I11)?

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
- **Pi 5** (192.168.1.36): HA OS and core updated (core 2026.10.4 on 2026-10-30). Claude Terminal and ha-mcp running (ha-mcp reconnected, I15). Glass Cards v1.10.11 and Nuvio v2.30.1 installed via HACS (auto-update off for Nuvio). Dashboard `nuvio-test` live. Scenes on `feat/scenes` (not merged). Adhan package on `main`, switched off (`6316775`). Geofencing not deployed (I18 live automation, see Resume item 0). Backups: `ha-pre-nuvio-backup_10-29` (slug 023157b8). Remote access: Nabu Casa trial; Cloudflare Tunnel not started.
- **networkpi** (192.168.1.39, wired): see Networkpi above.
- **Mac**: this session; caffeinate running for 8 hours from about 01:10 CDT.
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order after the open items
1. Phase B of networkpi Remote Control.
2. Point HA's backup location at the Samba share (daily, keep 7) plus a weekly copy on networkpi (keep 4).
3. Cloudflare Tunnel on the Pi 5, HA 2FA, `http` trusted proxy settings.
4. Monitoring (D24).
Then AdGuard Home (I1), voice feasibility F4, F1, F2, F3, Ring events and the garage.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`, with the permissions above. Anything else Tier 3 (restarts, tunnel, DNS, firewall, credentials, deletions, front door lock, garage door) waits for the owner's "GREEN LIGHT".

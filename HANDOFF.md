# HANDOFF

Last updated: 2026-10-30 ~01:20 CDT (Mac session closed; owner signing off). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
Adhan (M12, D34). Partial GREEN LIGHT: setup only, toggle OFF, no playback. Integration loaded (ISNA, Shafi), sensors and HomePod volume checked read-only, backup `pre-adhan` (slug `b4a1a3aa`). Waiting for today's masjid times to compare. Full notes in `docs/sessions/2026-10-30-adhan-setup.md`. Prompt: `docs/prompts/pi5/2026-10-30-adhan-setup.md` (commit `2729082`).

Resume steps, in order:
1. Owner gives the five masjid times. Compare with the sensors (within 2 minutes or stop).
2. Write `packages/adhan.yaml` on `feat/adhan` (toggle OFF), validate, reload, verify nothing played.
3. Owner confirms, then merge to `main`. Live test needs a separate GREEN LIGHT.

Scenes (M11): branch `feat/scenes` at `02588c7`, owner tests pending. Nuvio `nuvio-test` (M9): owner reviewing.

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
- **Pi 5** (192.168.1.36): HA OS and core updated (core 2026.10.4 on 2026-10-30). Claude Terminal and ha-mcp running (ha-mcp reconnected, I15). Glass Cards v1.10.11 and Nuvio v2.30.1 installed via HACS (auto-update off for Nuvio). Dashboard `nuvio-test` live. No scenes, Adhan or geofencing yet. Backups: `ha-pre-nuvio-backup_10-29` (slug 023157b8). Remote access: Nabu Casa trial; Cloudflare Tunnel not started.
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

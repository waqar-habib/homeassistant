# HANDOFF

Last updated: 2026-10-24 (after networkpi bootstrap). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
HA core restarted 2026-10-23 (backup `pre-restart`, slug c38f7133). HA, ha-mcp, Matter, Apple TV, and both HomeKit entries are loaded. System health no longer lists the stale wlan0 address, so I8 is closed.

Cross-device prompts now live in `docs/prompts/<target>/` (see `docs/prompts/README.md` and CLAUDE.md "Cross-device prompts", D27). The owner runs a short pointer, not a pasted prompt.

networkpi bootstrap ran 2026-10-24 and passed Verify (ufw, SSH keys only, watchdog, Samba share, `claude` user). Samba password set, reboot done, Pi Connect reconnected. Details in `docs/sessions/2026-10-24-networkpi-bootstrap.md`.

## Open items
1. Domain: `thehabibfam.cc` bought through Cloudflare Registrar (owner, 2026-10-23). Next: tunnel hostname `ha.thehabibfam.cc` (step 3 of the build order; Tier 3).
2. Nabu Casa trial (1 month, D26): remote link set up and validated working by the owner (2026-10-23). Cancel before it bills once the Cloudflare Tunnel is tested.
3. Make the repo private on GitHub (D25), when the owner chooses.
4. Owner on hold: redact the owner email in the aidot note in `docs/sessions/2026-10-23-pi5-cleanup-handoff.md`.
5. Watch: `vcgencmd get_throttled` on networkpi was `0x50000` during the first upgrade and `0x0` after reboot. Re-check if the Pi drops or misbehaves.

## Pending proposals
- Weekly encrypted backup copy to cloud storage (I9).

## Device state
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. Wi-Fi (wlan0) disabled; Ethernet `end0` only. The stale wlan0 health entry was cleared by the 2026-10-23 restart (I8 closed). Remote access: Nabu Casa 1-month trial (D26); Cloudflare Tunnel not started.
- **networkpi** (192.168.1.39, wired): Raspberry Pi OS Lite 64-bit, Debian 13.5 (trixie), 905 MB RAM, 29.1 GB SD (25 GB free), reachable through Raspberry Pi Connect. Bootstrapped 2026-10-24: ufw (deny in; SSH from LAN; SMB from the Pi 5 only), SSH keys only, watchdog, Samba share `ha-backups` (user `habackup`), unprivileged `claude` user, auto security updates (reboot 04:30 if needed). Claude Code CLI not installed yet. DHCP reservation created.
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order after the open items
1. Claude Code CLI as the `claude` user under tmux and systemd with `/remote-control`; sign in once (OAuth) through Raspberry Pi Connect; test by hand first; give it its own fine-grained token; clone this repo.
2. Point HA's backup location at the Samba share (daily, keep 7) plus a weekly copy job on networkpi (keep 4).
3. Cloudflare Tunnel on the Pi 5 with the domain, HA 2FA, and `http` trusted proxy settings.
4. Monitoring (D24): check script, ntfy, healthchecks.io heartbeat.
Then AdGuard Home (depends on I1), the voice feasibility tests F4, F1, F2, F3, then Ring events and the garage (Meross MSG100HK; the earlier failure was physical wiring to the Chamberlain controller).

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Tier 3 actions (restarts, tunnel, DNS, firewall, credentials, deletions, garage door) wait for the owner's "GREEN LIGHT".

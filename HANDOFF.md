# HANDOFF

Last updated: 2026-10-23. Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
Build Phase A on networkpi. Blocked only on owner inputs listed below. Nothing has been changed on either device yet.

## Owner inputs needed
1. Run `cat /etc/os-release` on networkpi (I3) and confirm the SD card size (I2).
2. Check the router for DHCP reservation, DNS setting and DHCP pool range (I1).
3. Choose the domain name to buy through Cloudflare Registrar.
4. Report the size of one HA backup (Settings, System, Backups).
5. Provide the device list by ecosystem and how Apple Home devices reach HA today (voice feasibility, I7).

## Device state
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. No remote access yet.
- **networkpi** (192.168.1.39, wired): Raspberry Pi OS 64-bit, reachable through Raspberry Pi Connect. Nothing installed beyond the base OS.

## Build order (Phase A, no router dependency)
1. networkpi hardening: stable IP, SSH keys only, firewall, automatic security updates, log rotation to RAM, unprivileged `claude` user.
2. Claude Code CLI under tmux and systemd with `/remote-control`; clone this repo.
3. Samba share on networkpi; set it as HA's backup location; verify a restore path.
4. Cloudflare Tunnel on the Pi 5 with the new domain, HA 2FA, and `http` trusted proxy settings.
5. Uptime Kuma and ntfy on networkpi, plus an external monitor on the public HA URL.
Then Phase B: AdGuard Home (depends on I1). Phase C: voice feasibility tests.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Tier 3 actions (restarts, tunnel, DNS, credentials, deletions) wait for the owner's "GREEN LIGHT".

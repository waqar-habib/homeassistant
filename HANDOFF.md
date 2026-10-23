# HANDOFF

Last updated: 2026-10-23. Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
Review the networkpi bootstrap script on branch `feat/networkpi-bootstrap` (`networkpi/bootstrap.sh`). It is Tier 3 (firewall, SSH, Samba): do not run it until the owner says "GREEN LIGHT". Nothing has been changed on either device yet.

## Owner inputs and approvals needed
1. "GREEN LIGHT" on the bootstrap script, and whether the repo is public or private (decides how networkpi clones it; a private repo needs a read-only token).
2. Choice of monitoring approach (see Open in `docs/decisions.md`).
3. Domain name, pending an availability check on Cloudflare Registrar (D22).
4. Optional: check for a 64 GB high-endurance SD card (I2).
5. Run setup.md step 1.6 on the Pi 5 to produce `docs/entities.md`.

## Approved, not yet done
- Turn off Wi-Fi on the Pi 5 (I8). Approved 2026-10-23. Run it from the Pi 5's Claude Terminal before the networkpi Samba share goes live.

## Pending proposals
- Weekly encrypted backup copy to cloud storage (I9).

## Device state
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. Listed on the router as both Home Assistant-WiFi and Home Assistant-Eth. No remote access yet.
- **networkpi** (192.168.1.39, wired): Raspberry Pi OS Lite 64-bit, Debian 13.5 (trixie), 905 MB RAM, 29.1 GB SD (25 GB free), reachable through Raspberry Pi Connect. Nothing installed beyond the base OS. DHCP reservation created.
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order (Phase A, no router dependency)
1. Pi 5: Wi-Fi off (approved).
2. networkpi hardening: `networkpi/bootstrap.sh` (SSH keys only, firewall, automatic security updates, journal cap, watchdog, Samba share, `claude` user). Run it at home, then reboot and confirm Raspberry Pi Connect reconnects from the iPhone.
3. Claude Code CLI as the `claude` user under tmux and systemd with `/remote-control`; test by hand first; clone this repo.
4. Point HA's backup location at the Samba share (daily, keep 7) plus a weekly copy job on networkpi (keep 4).
5. Cloudflare Tunnel on the Pi 5 with the new domain, HA 2FA, and `http` trusted proxy settings.
6. Monitoring and alerts.
Then Phase B: AdGuard Home (depends on I1). Phase C: setup.md step 1.6 inventory, then voice feasibility tests F4, F1, F2, F3. Ring events and the garage after that.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Tier 3 actions (restarts, tunnel, DNS, firewall, credentials, deletions, garage door) wait for the owner's "GREEN LIGHT".

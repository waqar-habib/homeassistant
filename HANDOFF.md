# HANDOFF

Last updated: 2026-10-23. Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
Draft the networkpi bootstrap (hardening, Claude Code CLI) for the owner's review as soon as `cat /etc/os-release` output arrives. Nothing has been changed on either device yet.

## Owner inputs needed
1. `cat /etc/os-release` from networkpi (I3). The screenshot sent on 2026-10-23 was the router's device list, not this.
2. Domain name to buy through Cloudflare Registrar (D22).
3. Garage opener brand, model and age, to pick ratgdo or Meross.
4. Optional: check for a 64 GB high-endurance SD card (I2). Capacity is not a constraint.

## Pending approvals (Tier 3)
- Turn off Wi-Fi on the Pi 5 so only Ethernet is used (I8).
- Weekly encrypted backup copy to cloud storage (I9).

## Device state
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. Listed on the router as both Home Assistant-WiFi and Home Assistant-Eth. No remote access yet.
- **networkpi** (192.168.1.39, wired): 64-bit Raspberry Pi OS, 905 MB RAM, 29.1 GB SD (25 GB free), reachable through Raspberry Pi Connect. Nothing installed beyond the base OS. DHCP reservation created.
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order (Phase A, no router dependency)
1. networkpi hardening: SSH keys only, firewall, automatic security updates, log rotation to RAM, unprivileged `claude` user.
2. Claude Code CLI under tmux and systemd with `/remote-control`; clone this repo.
3. Samba share on networkpi; set it as HA's backup location (7 daily + 4 weekly, about 2.9 GB); verify a restore path.
4. Cloudflare Tunnel on the Pi 5 with the new domain, HA 2FA, and `http` trusted proxy settings.
5. Uptime Kuma and ntfy on networkpi, plus an external monitor on the public HA URL.
Then Phase B: AdGuard Home (depends on I1). Phase C: setup.md step 1.6 inventory, then voice feasibility tests F4, F1, F2, F3. Ring and garage after that.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md` (on `main` since 2026-10-23). Tier 3 actions (restarts, tunnel, DNS, credentials, deletions, garage door) wait for the owner's "GREEN LIGHT".

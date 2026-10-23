# HANDOFF

Last updated: 2026-10-23 (night). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
The networkpi bootstrap is approved (GREEN LIGHT, 2026-10-23) and waits for the owner to run it in the morning. Claude cannot reach networkpi, so the owner runs the commands below once. Nothing has been changed on either device yet.

## Owner's morning checklist (in this order)
1. **Pi 5, Claude Terminal:** turn Wi-Fi off (I8, approved). Prompt: back up with `ha backups new --name "pre-wifi-off"`; confirm Ethernet holds 192.168.1.36 with `ha network info`; disable wlan0; verify HA and ha-mcp; close I8; commit. Do this first because the networkpi share allows only 192.168.1.36.
2. **Pi 5, Claude Terminal:** run setup.md step 1.6 to produce `docs/entities.md`, commit it.
3. **networkpi via Raspberry Pi Connect, at home.** The repo is public, so no token. Run inside tmux so a dropped phone session does not kill the upgrade:
   ```
   sudo apt-get update && sudo apt-get install -y git tmux
   tmux new -s bootstrap
   git clone -b feat/networkpi-bootstrap https://github.com/waqar-habib/homeassistant.git ~/homeassistant
   bash ~/homeassistant/networkpi/bootstrap.sh
   ```
   If the session drops: `tmux attach -t bootstrap`.
4. `sudo smbpasswd -a habackup`; save the password in Apple Keychain.
5. Reboot networkpi. Confirm Raspberry Pi Connect reconnects from the iPhone within about 2 minutes with nobody logged in.
6. Paste the bootstrap's "Verify" output into the next session.
7. Check the domain on Cloudflare Registrar and tell Claude the name.
8. After step 3 succeeds: make the repo private on GitHub (D25).

## Pending proposals
- Weekly encrypted backup copy to cloud storage (I9).

## Device state
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. Listed on the router as both Home Assistant-WiFi and Home Assistant-Eth. No remote access yet.
- **networkpi** (192.168.1.39, wired): Raspberry Pi OS Lite 64-bit, Debian 13.5 (trixie), 905 MB RAM, 29.1 GB SD (25 GB free), reachable through Raspberry Pi Connect. Nothing installed beyond the base OS. DHCP reservation created.
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order after the morning checklist
1. Claude Code CLI as the `claude` user under tmux and systemd with `/remote-control`; sign in once (OAuth) through Raspberry Pi Connect; test by hand first; give it its own fine-grained token; clone this repo.
2. Point HA's backup location at the Samba share (daily, keep 7) plus a weekly copy job on networkpi (keep 4).
3. Cloudflare Tunnel on the Pi 5 with the domain, HA 2FA, and `http` trusted proxy settings.
4. Monitoring (D24): check script, ntfy, healthchecks.io heartbeat.
Then AdGuard Home (depends on I1), the voice feasibility tests F4, F1, F2, F3, then Ring events and the garage (Meross MSG100HK; the earlier failure was physical wiring to the Chamberlain controller).

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Tier 3 actions (restarts, tunnel, DNS, firewall, credentials, deletions, garage door) wait for the owner's "GREEN LIGHT".

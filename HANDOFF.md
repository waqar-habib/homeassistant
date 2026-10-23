# HANDOFF

Last updated: 2026-10-23 (end of session). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
Next session: Pi 5 Claude Terminal. Restart HA core (GREEN LIGHT given 2026-10-23, backup first with `ha backups new --name "pre-restart"`, `ha core check` before, verify HA and ha-mcp after), then confirm system health no longer lists wlan0 192.168.1.37 and close the I8 follow-up. The restart has not been run yet: this Mac session has no `ha` CLI or ha-mcp.

The full networkpi setup is deferred to a later, separate session (owner, 2026-10-23). The bootstrap stays approved (GREEN LIGHT) but has not been run.

## Open items
1. HA core restart and I8 recheck (above).
2. Domain: Cloudflare Registrar purchase in progress. Tell Claude the name when done.
3. Nabu Casa trial (1 month, D26): cancel before it bills once the Cloudflare Tunnel is tested.
4. networkpi setup, in a later session, in this order:
   - Run the bootstrap inside tmux via Raspberry Pi Connect:
     ```
     sudo apt-get update && sudo apt-get install -y git tmux
     tmux new -s bootstrap
     git clone -b feat/networkpi-bootstrap https://github.com/waqar-habib/homeassistant.git ~/homeassistant
     bash ~/homeassistant/networkpi/bootstrap.sh
     ```
   - `sudo smbpasswd -a habackup`; save the password in Apple Keychain.
   - Reboot networkpi; confirm Raspberry Pi Connect reconnects from the iPhone within about 2 minutes.
   - Paste the bootstrap's "Verify" output into the session.
   - Make the repo private on GitHub (D25).

## Pending proposals
- Weekly encrypted backup copy to cloud storage (I9).

## Device state
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. Wi-Fi (wlan0) disabled; Ethernet `end0` only. System health still lists the stale wlan0 address 192.168.1.37 until the next core restart (I8). Remote access: Nabu Casa 1-month trial (D26); Cloudflare Tunnel not started.
- **networkpi** (192.168.1.39, wired): Raspberry Pi OS Lite 64-bit, Debian 13.5 (trixie), 905 MB RAM, 29.1 GB SD (25 GB free), reachable through Raspberry Pi Connect. Nothing installed beyond the base OS. DHCP reservation created.
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order after the open items
1. Claude Code CLI as the `claude` user under tmux and systemd with `/remote-control`; sign in once (OAuth) through Raspberry Pi Connect; test by hand first; give it its own fine-grained token; clone this repo.
2. Point HA's backup location at the Samba share (daily, keep 7) plus a weekly copy job on networkpi (keep 4).
3. Cloudflare Tunnel on the Pi 5 with the domain, HA 2FA, and `http` trusted proxy settings.
4. Monitoring (D24): check script, ntfy, healthchecks.io heartbeat.
Then AdGuard Home (depends on I1), the voice feasibility tests F4, F1, F2, F3, then Ring events and the garage (Meross MSG100HK; the earlier failure was physical wiring to the Chamberlain controller).

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Tier 3 actions (restarts, tunnel, DNS, firewall, credentials, deletions, garage door) wait for the owner's "GREEN LIGHT".

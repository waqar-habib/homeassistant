# HANDOFF

Last updated: 2026-10-23 (afternoon). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
Done 2026-10-23: Pi 5 Wi-Fi off (I8 closed), `docs/entities.md` built (M2 done). The networkpi bootstrap is approved (GREEN LIGHT, 2026-10-23) and waits for the owner to run it. Claude cannot reach networkpi, so the owner runs the commands below once. Nothing has been changed on networkpi yet.

## Owner's open checklist (in this order)
1. **networkpi via Raspberry Pi Connect, at home.** The repo is public, so no token. Run inside tmux so a dropped phone session does not kill the upgrade:
   ```
   sudo apt-get update && sudo apt-get install -y git tmux
   tmux new -s bootstrap
   git clone -b feat/networkpi-bootstrap https://github.com/waqar-habib/homeassistant.git ~/homeassistant
   bash ~/homeassistant/networkpi/bootstrap.sh
   ```
   If the session drops: `tmux attach -t bootstrap`.
2. `sudo smbpasswd -a habackup`; save the password in Apple Keychain.
3. Reboot networkpi. Confirm Raspberry Pi Connect reconnects from the iPhone within about 2 minutes with nobody logged in.
4. Paste the bootstrap's "Verify" output into the next session.
5. Domain: purchase on Cloudflare Registrar is in progress (owner, 2026-10-23). Tell Claude the name when done.
6. After step 1 succeeds: make the repo private on GitHub (D25).
7. Decide Nabu Casa: the owner started a trial (2026-10-23) for remote access, which conflicts with D6 (Nabu Casa rejected for the recurring cost; Cloudflare Tunnel chosen). Either keep D6 and cancel the trial before it bills, or record a new decision.

## Pending proposals
- Weekly encrypted backup copy to cloud storage (I9).

## Device state
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. Wi-Fi (wlan0) disabled; Ethernet `end0` only. System health still lists the stale wlan0 address 192.168.1.37 until the next core restart (I8). Remote access: Nabu Casa trial being set up; Cloudflare Tunnel not started.
- **networkpi** (192.168.1.39, wired): Raspberry Pi OS Lite 64-bit, Debian 13.5 (trixie), 905 MB RAM, 29.1 GB SD (25 GB free), reachable through Raspberry Pi Connect. Nothing installed beyond the base OS. DHCP reservation created.
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order after the open checklist
1. Claude Code CLI as the `claude` user under tmux and systemd with `/remote-control`; sign in once (OAuth) through Raspberry Pi Connect; test by hand first; give it its own fine-grained token; clone this repo.
2. Point HA's backup location at the Samba share (daily, keep 7) plus a weekly copy job on networkpi (keep 4).
3. Cloudflare Tunnel on the Pi 5 with the domain, HA 2FA, and `http` trusted proxy settings.
4. Monitoring (D24): check script, ntfy, healthchecks.io heartbeat.
Then AdGuard Home (depends on I1), the voice feasibility tests F4, F1, F2, F3, then Ring events and the garage (Meross MSG100HK; the earlier failure was physical wiring to the Chamberlain controller).

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Tier 3 actions (restarts, tunnel, DNS, firewall, credentials, deletions, garage door) wait for the owner's "GREEN LIGHT".

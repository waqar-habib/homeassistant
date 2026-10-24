# HANDOFF

Last updated: 2026-10-23 (after HA core restart). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
HA core restarted 2026-10-23 (backup `pre-restart`, slug c38f7133). HA, ha-mcp, Matter, Apple TV, and both HomeKit entries are loaded. System health no longer lists the stale wlan0 address, so I8 is closed.

Cross-device prompts now live in `docs/prompts/<target>/` (see `docs/prompts/README.md` and CLAUDE.md "Cross-device prompts", D27). The owner runs a short pointer, not a pasted prompt.

The full networkpi setup is deferred to a later, separate session (owner, 2026-10-23). The bootstrap stays approved but has not been run.

## Open items
1. Domain: `thehabibfam.cc` bought through Cloudflare Registrar (owner, 2026-10-23). Next: tunnel hostname `ha.thehabibfam.cc` (step 3 of the build order; Tier 3).
2. Nabu Casa trial (1 month, D26): remote link set up and validated working by the owner (2026-10-23). Cancel before it bills once the Cloudflare Tunnel is tested.
3. networkpi setup (owner started it in parallel via Raspberry Pi Connect, 2026-10-23), in this order:
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
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. Wi-Fi (wlan0) disabled; Ethernet `end0` only. The stale wlan0 health entry was cleared by the 2026-10-23 restart (I8 closed). Remote access: Nabu Casa 1-month trial (D26); Cloudflare Tunnel not started.
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

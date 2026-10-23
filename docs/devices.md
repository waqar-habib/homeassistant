# Devices

Facts only. Unknowns are tracked in `docs/decisions.md` under Open and in `docs/issues.md`.

## Pi 5 (Home Assistant)
- Hardware: Raspberry Pi 5, 8 GB RAM, SD card
- OS: Home Assistant OS 2026.10.2
- Address: 192.168.1.36
- Role: Home Assistant, Claude Terminal add-on, ha-mcp add-on, `/config` linked to GitHub
- Planned: cloudflared add-on for remote access (D6)
- Break-glass: HA OS cannot run Raspberry Pi Connect. Route is iPhone, Raspberry Pi Connect to networkpi, then SSH to the Pi 5's SSH add-on over the LAN. Second route: HA web terminal through the Cloudflare URL

## networkpi (always-on backend)
- Hardware: Raspberry Pi 3B+, wired Ethernet
- OS: 64-bit (`uname -m` = aarch64), boots from `/boot/firmware`, zram swap. Release name not yet captured (I3)
- Hostname and user: `networkpi`
- Address: 192.168.1.39 (confirmed in Raspberry Pi Connect's remote terminal)
- Memory: 905 MB total, 151 MB used and 753 MB available at idle, 904 MB zram swap
- Storage: SD card, `lsblk` reports 29.1 GB (root partition 29 GB, 2.8 GB used, 25 GB free). The owner believes it is a 64 GB card, see I2
- Remote access: Raspberry Pi Connect (iPhone-capable)
- Planned services (D7, D8):
  - AdGuard Home (DNS and ad blocking), after the router check in I1
  - Claude Code CLI in tmux under systemd, with `/remote-control` so sessions show in the Claude iOS app
  - Samba share as Home Assistant's backup location
  - Uptime monitoring and alerts for HA, networkpi, DNS, and internet
- Not planned: Home Assistant itself (RAM)

## Network
- Router: Spectrum SBE1V1R, managed through the My Spectrum app. No admin console known. DHCP reservation and custom DNS support unverified (I1)

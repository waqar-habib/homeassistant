# Devices

Facts only. Unknowns are tracked in `docs/decisions.md` under Open.

## Pi 5 (Home Assistant)
- Hardware: Raspberry Pi 5, 8 GB RAM, SD card
- OS: Home Assistant OS 2026.10.2
- Role: Home Assistant, Claude Terminal add-on, ha-mcp add-on, `/config` linked to GitHub
- Planned: cloudflared add-on for remote access (D6)

## networkpi (always-on backend)
- Hardware: Raspberry Pi 3B+, 1 GB RAM
- Network: wired Ethernet, 192.168.1.39 (confirmed by the owner with `ifconfig` in Raspberry Pi Connect's remote terminal)
- Remote access: Raspberry Pi Connect (iPhone-capable)
- Planned services (D7, D8):
  - AdGuard Home (DNS and ad blocking)
  - Claude Code CLI in tmux under systemd, with `/remote-control` so sessions show in the Claude iOS app
  - Samba share as Home Assistant's backup location
  - Uptime monitoring and alerts for HA, networkpi, DNS, and internet
- Not planned: Home Assistant itself (RAM)

# Decisions & Backlog

## Decided
| # | Decision | Rationale |
|---|---|---|
| D1 | Dashboard: **Nuvio** (HACS, `strategy: type: custom:nuvio`) | Auto-builds from the 8 existing areas; built-in wall-tablet mode (screensavers, PIN) |
| D2 | Design direction: "Minimalist Glass": clock/weather/next-prayer left, room tiles centre, scenes + Adhan toggle bottom, calendar right | Hide detail until tapped; keeps blur load low for the tablet |
| D3 | Claude Code runs on the Pi as an HA add-on (Claude Terminal Pro) + ha-mcp | Always on; Mac may sleep. Automations run in HA regardless |
| D4 | Asr: standard/Shafi (1x shadow) | Matches Hanbali position |
| D5 | Stay on SD card for the pilot | Low write load; revisit before camera AI / long history |
| D6 | Remote access to HA: **Cloudflare Tunnel** (cloudflared add-on on Pi 5) + own domain (~$10-15/yr accepted) + HA login with 2FA. No client software on phones/tablets | Wall tablet and family profiles need an always-on public path. Tailscale rejected (breaks randomly, locks owner out); Nabu Casa rejected (recurring subscription) |
| D7 | **networkpi** (Raspberry Pi 3B+, 192.168.1.39, wired) is the always-on support backend: AdGuard Home, Claude Code CLI (tmux + systemd, `/remote-control`), Samba share as HA backup target, uptime monitoring + alerts | Offloads always-on work from the MacBook. HA stays on the Pi 5 (3B+ has 1 GB RAM, too small for HA) |
| D8 | DNS / ad blocking: **AdGuard Home** (not Pi-hole) | Friendlier UI, built-in DoH/DoT, free |
| D9 | Operating rule: nothing may depend on the MacBook, being on the home network, or hand-typed terminal commands. Break-glass is iPhone-only via Raspberry Pi Connect to networkpi | Owner is often away; manual upkeep is the failure mode being designed out |
| D10 | Git is the source of truth: core config, handoff notes, session summaries, milestones, issue logs for both devices live in the repo | A fresh Claude session (terminal or cloud) must resume from the last stopping point without being re-briefed |
| D11 | One agentic pipeline: Claude Code manages Pi 5 and networkpi together; playbooks, status, issue logs and configs for both are kept in sync | Both devices operate as one smart-home system |

## Open (blocking)
- Calendar source: Apple (CalDAV) / Google / both
- Tablet model + OS
- Masjid timetable / calculation method
- HomePod entity IDs and routing (Fajr in bedroom/nursery?)
- HACS installed? (check in docs/setup.md 1.2)

### Open: networkpi / remote-access pipeline (raised 2026-10-23)
- Domain name for Cloudflare Tunnel (own one, or buy via Cloudflare Registrar) and Cloudflare account status
- Repo layout: keep both devices in this repo vs. a separate ops repo
- Commit policy for handoff/status/log files: direct to `main` vs. branch + review
- Autonomy tiers: what Claude may change unattended vs. what needs iPhone approval (CLAUDE.md rule 6 paths: adhan, lock, climate, restarts)
- Alert channel when HA or networkpi is down
- Claude auth on networkpi: subscription (OAuth) vs. API key with a monthly cap
- Tailscale: dropped entirely, or kept as optional admin path
- Pi 5 break-glass: HA OS cannot run Raspberry Pi Connect, so confirm the hop networkpi -> Pi 5 (SSH add-on) or HA web terminal via Cloudflare
- Dashboard users: MKH, owner, guests; kiosk account and permissions
- Router model, DHCP reservations for both Pis, Pi 5 address
- networkpi image/OS, SD card size, and whether a USB SSD is available
- HA backup retention and where the backup encryption key is kept

## Backlog (parked, revisit later)
- Martin Argalas "liquid glass" dashboard: unreleased as of 2026-10-21; he plans a custom-HACS repo. Re-evaluate vs Nuvio when published (github.com/martinargalas).
- ha-arr-stack-card: only relevant if a Sonarr/Radarr stack exists. Not in pilot.
- Photo room tiles, 3D house view, Energy tab.
- Claude as Assist voice agent (Anthropic API key available).
- Morning brief spoken on HomePod; bedtime check automation.

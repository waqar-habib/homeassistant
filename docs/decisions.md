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
| D12 | Tailscale dropped | Cloudflare Tunnel (HA) and Raspberry Pi Connect (networkpi) are two independent paths with no client software to break |
| D13 | Single repo (this one) for both devices: `HANDOFF.md`, `docs/sessions/`, `docs/milestones.md`, `docs/issues.md`, `networkpi/` | A fresh session reads one place |
| D14 | Session end is automatic: summary, `HANDOFF.md`, milestones/issues, commit and push to `main`, no prompt (CLAUDE.md "Session protocol") | Resume without re-briefing, even after a partial stop |
| D15 | Autonomy tiers 0-3 (CLAUDE.md rule 6). Tier 2 proceeds if `ha core check` is clean. Tier 3 needs the owner's "GREEN LIGHT" | Minimal upkeep without unattended risk |
| D16 | Alerts: ntfy.sh with a private topic, plus an external uptime monitor on the public HA URL | Works even when the Pi 5 or networkpi is down |
| D17 | Claude on networkpi: OAuth for interactive use; a dedicated API key (cap on file, about $10/mo) for scheduled runs. Key never goes in chat or the repo | Keeps unattended spend bounded |
| D18 | HA users: owner (admin); MKH (just below admin, simple view); guests (simplified dashboard, access granted when needed). Dashboards limit what users see; they are not a permission boundary | MKH is used to Apple Home simplicity |
| D19 | HA backups to networkpi's Samba share: target 7 daily + 4 weekly, subject to the size check. Encryption key stored in Apple Keychain | Automatic, off-device, recoverable |
| D20 | Domain bought through Cloudflare Registrar (name not chosen) | One vendor for domain, DNS and tunnel |
| D21 | Voice control: feasibility test before any build (`docs/voice-feasibility.md`) | Avoid building something that does not work |

## Open (blocking)
- Calendar source: Apple (CalDAV) / Google / both
- Tablet model + OS
- Masjid timetable / calculation method
- HomePod entity IDs and routing (Fajr in bedroom/nursery?)
- HACS installed? (check in docs/setup.md 1.2)

### Open: networkpi / remote-access pipeline (updated 2026-10-23)
- Domain name to buy through Cloudflare Registrar; Cloudflare account status
- Router (Spectrum SBE1V1R, My Spectrum app): can it reserve DHCP addresses or set the DNS server handed to clients? DHCP pool range. See `docs/issues.md` I1
- networkpi: `cat /etc/os-release` output (first attempt had a typo) and SD capacity (reported 29.1 GB vs. 64 GB stated). See I2, I3
- HA backup file size, to confirm the 7 daily + 4 weekly retention fits on networkpi
- Display for the common area: tablet, or ESP32 touchscreen (ESP32 cannot run Nuvio). See I5
- Voice feasibility inputs: full device list by ecosystem (Apple Home, Aidot, Tapo, Google Home) and how Apple Home devices reach HA today. See `docs/voice-feasibility.md`
- Pi 5 break-glass hop (networkpi to Pi 5 over SSH add-on) is confirmed in principle; set up with the networkpi runbook

## Backlog (parked, revisit later)
- Martin Argalas "liquid glass" dashboard: unreleased as of 2026-10-21; he plans a custom-HACS repo. Re-evaluate vs Nuvio when published (github.com/martinargalas).
- ha-arr-stack-card: only relevant if a Sonarr/Radarr stack exists. Not in pilot.
- Photo room tiles, 3D house view, Energy tab.
- Claude as Assist voice agent (Anthropic API key available).
- Morning brief spoken on HomePod; bedtime check automation.

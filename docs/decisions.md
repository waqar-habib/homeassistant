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
| D19 | HA backups to networkpi's Samba share: 7 daily + 4 weekly. Backup size is 254-260 MB, so 11 backups is about 2.9 GB against 25 GB free. Encryption key stored in Apple Keychain | Automatic, off-device, recoverable |
| D20 | Domain bought through Cloudflare Registrar (name not chosen) | One vendor for domain, DNS and tunnel |
| D21 | Voice control: feasibility test before any build (`docs/voice-feasibility.md`) | Avoid building something that does not work |
| D22 | Domain is location-neutral (family name, no city or address). One subdomain per service and site, for example `ha.<domain>`. The tunnel is outbound, so moving house means moving the Pi and reconnecting; the hostname stays | Scales to a new home or a second site |
| D23 | Device onboarding: manufacturer app, then an official HA integration discovers the device as entities, then HA exposes it to Apple Home through HomeKit Bridge. Matter-only devices (for example Linkind plugs) pair to Apple Home and are added to HA through Matter multi-admin. Never bridge a device back into Apple Home when it already lives there natively | One controller (HA), Apple Home as the front end, no duplicate or looping devices |

## Open (blocking)
- Calendar source: Apple (CalDAV) / Google / both
- Tablet model + OS
- Masjid timetable / calculation method
- HomePod entity IDs and routing (Fajr in bedroom/nursery?)
- HACS installed? (check in docs/setup.md 1.2)

### Open: networkpi / remote-access pipeline (updated 2026-10-23)
- Domain name to buy through Cloudflare Registrar (see D22); Cloudflare account status
- Router: can it set the DNS server handed to clients? DHCP reservations are done. See `docs/issues.md` I1
- networkpi: SD card endurance rating. See I2
- networkpi bootstrap script is drafted on branch `feat/networkpi-bootstrap`, awaiting the owner's "GREEN LIGHT" (Tier 3: firewall, SSH, Samba). Repo visibility (public or private) decides how networkpi clones it
- Monitoring approach: proposed a lightweight script plus ntfy plus an external heartbeat instead of Uptime Kuma, to save RAM on the 3B+
- Display for the common area: tablet, or ESP32 touchscreen (ESP32 cannot run Nuvio). See I5
- Device inventory: run setup.md step 1.6 (`docs/entities.md`) and compare it with the router client list. See `docs/voice-feasibility.md`
- The Pi 5 appears on the router twice (Home Assistant-WiFi and Home Assistant-Eth). See I8
- Garage (lower priority): the owner has a Meross MSG100HK (HomeKit) that did not work correctly at the previous house with the same myQ opener. Retry through HA and record what failed; ratgdo remains the fallback. The garage door is Tier 3 when onboarded
- Ring: events and alerts first. Video into Apple Home is low priority
- Pi 5 break-glass hop (networkpi to Pi 5 over SSH add-on) is confirmed in principle; set up with the networkpi runbook

## Backlog (parked, revisit later)
- Martin Argalas "liquid glass" dashboard: unreleased as of 2026-10-21; he plans a custom-HACS repo. Re-evaluate vs Nuvio when published (github.com/martinargalas).
- ha-arr-stack-card: only relevant if a Sonarr/Radarr stack exists. Not in pilot.
- Photo room tiles, 3D house view, Energy tab.
- Claude as Assist voice agent (Anthropic API key available).
- Morning brief spoken on HomePod; bedtime check automation.

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
| D20 | Domain bought through Cloudflare Registrar: `thehabibfam.cc` (bought 2026-10-23) | One vendor for domain, DNS and tunnel |
| D21 | Voice control: feasibility test before any build (`docs/voice-feasibility.md`) | Avoid building something that does not work |
| D22 | Domain is location-neutral (family name, no city or address). One subdomain per service and site, for example `ha.<domain>`. The tunnel is outbound, so moving house means moving the Pi and reconnecting; the hostname stays | Scales to a new home or a second site |
| D23 | Device onboarding: manufacturer app, then an official HA integration discovers the device as entities, then HA exposes it to Apple Home through HomeKit Bridge. Matter-only devices (for example Linkind plugs) pair to Apple Home and are added to HA through Matter multi-admin. Never bridge a device back into Apple Home when it already lives there natively | One controller (HA), Apple Home as the front end, no duplicate or looping devices |
| D24 | Monitoring: a lightweight check script on networkpi, alerts through ntfy, and an external heartbeat (healthchecks.io) so networkpi's own death is noticed. Uptime Kuma only if a status page is wanted later | Saves RAM on the 3B+; fewer moving parts |
| D25 | Repo visibility: the repo is public today. networkpi clones it once while public, then the owner makes it private. The `claude` user on networkpi gets its own fine-grained read/write token. The Pi 5's existing token keeps working | The repo records home layout and security design; networkpi needs no token for the bootstrap clone |
| D26 | Nabu Casa: 1-month free trial only (owner, 2026-10-23), used for remote access until the Cloudflare Tunnel is tested. D6 stands; no paid subscription | Bridge while the domain and tunnel are set up; avoids the recurring cost rejected in D6. Cancel the trial before it bills |
| D27 | Cross-device prompts live in `docs/prompts/<target>/` and are committed to `main`. The owner runs a short pointer (`git pull`, file path, short commit ID) instead of pasting prompts. Committing a prompt does not authorize running it (tiers still apply) | Works from mobile terminals where paste is unavailable; one source of truth in git |
| D28 | Prayer times: `islamic_prayer_times` integration, calculation method ISNA, Asr standard/Shafi (D4). Owner also named the fiqh as Hanbali (2026-10-30); HA has no Hanbali option and standard Asr is the matching setting. At setup, compare the integration's times with the masjid timetable and reopen this if they differ | Owner choice. Closes the open masjid timetable and method item, subject to that check |
| D29 | Adhan playback (owner, 2026-10-30): files `Adhan.mp3` and `Fajr.mp3` already in HA media. Volume 20% until a live test. Fajr only on `media_player.living_room_living_room_homepod`. Dhuhr, Asr, Maghrib and Isha on that and `media_player.master_bedroom_homepod`. Restore the previous volume and notify on failure. Test HomePod playback before building the automation | Past attempts failed; the playback path is the likely weak point. Closes HomePod routing |
| D30 | Calendar: Apple Calendar "M&W Family" through CalDAV (owner, 2026-10-30). The owner creates the app-specific password and enters it in HA. It never goes in chat or the repo | Closes the calendar source item. Credential step is Tier 3 |
| D31 | MKH becomes an HA admin user (owner, 2026-10-30). Amends D18, which had her below admin. She still gets a simple Nuvio layout. Admin means full control of HA; dashboards are not a permission boundary | Owner wants her to move from Apple Home to the HA app. Tradeoff: an admin can change or break any config |
| D32 | Geofencing automations, designs approved in concept 2026-10-30. "Everyone" is the owner and MKH. Away Evening: select lights on for 3 hours when both are away. Away AC: both thermostats to 78F when both are away. Cool Down: downstairs thermostat to 75F on entering a 3 mile (about 4,828 m) zone. Evening: all lights on when at least one of us is home. Each is Tier 3 and is deployed by the owner. Needs MKH's phone as a person (M15) and remote access kept up (D26) | Location only reaches HA while the phone can reach HA from outside. Dry run first (notify only) before real actions |
| D33 | Scenes: owner gave GREEN LIGHT 2026-10-30 to create simple scenes at Claude's discretion, including ones that lock the front door. No Unlock scene unless asked. The owner also wrote "GREEN LIGHT to make the changes at your discretion" on 2026-10-30 after plan v0.1; Claude reads that as covering the doc changes and prompt drafts, not Tier 3 deployment | Recorded as given |

## Open (blocking)
- Tablet model + OS
- Cool Down trigger: first of us entering the 3 mile zone while the house is empty (proposed), or both (owner to confirm)
- Evening trigger: sunset (proposed) and when the lights go off (owner to confirm)

### Open: networkpi / remote-access pipeline (updated 2026-10-23)
- Domain: **thehabibfam.cc**, bought through Cloudflare Registrar 2026-10-23 (D20, D22). Closed. Next: Cloudflare Tunnel with `ha.thehabibfam.cc` (Tier 3, needs GREEN LIGHT)
- Router: can it set the DNS server handed to clients? DHCP reservations are done. See `docs/issues.md` I1
- networkpi: SD card endurance rating. See I2
- networkpi bootstrap (`networkpi/bootstrap.sh` on branch `feat/networkpi-bootstrap`): approved 2026-10-23; the full networkpi setup moves to a later, separate session. See `HANDOFF.md`
- Display for the common area: tablet, or ESP32 touchscreen (ESP32 cannot run Nuvio). See I5
- Device inventory: run setup.md step 1.6 (`docs/entities.md`) and compare it with the router client list. See `docs/voice-feasibility.md`
- HA core restart (GREEN LIGHT given 2026-10-23) to clear the stale wlan0 health entry. See I8
- Garage (lower priority): the owner has a Meross MSG100HK (HomeKit) that did not work at the previous house with the same myQ opener because of the physical wiring to the Chamberlain controller, not software. Recheck the wiring when retrying; ratgdo remains the fallback. The garage door is Tier 3 when onboarded
- Ring: events and alerts first. Video into Apple Home is low priority
- Pi 5 break-glass hop (networkpi to Pi 5 over SSH add-on) is confirmed in principle; set up with the networkpi runbook

## Backlog (parked, revisit later)
- Martin Argalas "liquid glass" dashboard: unreleased as of 2026-10-21; he plans a custom-HACS repo. Re-evaluate vs Nuvio when published (github.com/martinargalas).
- ha-arr-stack-card: only relevant if a Sonarr/Radarr stack exists. Not in pilot.
- Photo room tiles, 3D house view, Energy tab.
- Claude as Assist voice agent (Anthropic API key available).
- Morning brief spoken on HomePod; bedtime check automation.

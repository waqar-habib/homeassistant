# Decisions & Backlog

## Decided
| # | Decision | Rationale |
|---|---|---|
| D1 | Dashboard: **Nuvio** (HACS, `strategy: type: custom:nuvio`) | Auto-builds from the 8 existing areas; built-in wall-tablet mode (screensavers, PIN) |
| D2 | Design direction: "Minimalist Glass": clock/weather/next-prayer left, room tiles centre, scenes + Adhan toggle bottom, calendar right | Hide detail until tapped; keeps blur load low for the tablet |
| D3 | Claude Code runs on the Pi as an HA add-on (Claude Terminal Pro) + ha-mcp | Always on; Mac may sleep. Automations run in HA regardless |
| D4 | Asr: standard/Shafi (1x shadow) | Matches Hanbali position |
| D5 | Stay on SD card for the pilot | Low write load; revisit before camera AI / long history |

## Open (blocking)
- Calendar source: Apple (CalDAV) / Google / both
- Tablet model + OS
- Masjid timetable / calculation method
- HomePod entity IDs and routing (Fajr in bedroom/nursery?)
- HACS installed? (check in docs/setup.md 1.2)

## Backlog (parked, revisit later)
- Martin Argalas "liquid glass" dashboard: unreleased as of 2026-10-21; he plans a custom-HACS repo. Re-evaluate vs Nuvio when published (github.com/martinargalas).
- ha-arr-stack-card: only relevant if a Sonarr/Radarr stack exists. Not in pilot.
- Photo room tiles, 3D house view, Energy tab.
- Claude as Assist voice agent (Anthropic API key available).
- Morning brief spoken on HomePod; bedtime check automation.

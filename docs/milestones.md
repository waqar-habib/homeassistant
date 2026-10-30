# Milestones

| ID | Milestone | Status | Date |
|---|---|---|---|
| M0 | Phase 1 foundation: backup, HACS, Claude Terminal, ha-mcp, repo link (setup.md 1.1-1.5) | Done | 2026-10-22 |
| M1 | Remote-access and networkpi decisions recorded (D6-D21), session protocol and autonomy tiers adopted | Done | 2026-10-23 |
| M2 | Phase 1 step 1.6: `docs/entities.md` entity inventory | Done | 2026-10-23 |
| M3 | networkpi base: hardening, stable IP, Claude Code CLI with `/remote-control`, repo clone | In progress: hardening and stable IP done 2026-10-24; Claude Code 2.1.310 installed; Phase 0 and Phase A passed 2026-10-24 (signed in, repo cloned, loaded session with no OOM). Phase B (Remote Control, systemd) to do (I12) | |
| M4 | HA backups to networkpi Samba share, automatic | To do | |
| M5 | Cloudflare Tunnel live for HA, with 2FA and an external uptime monitor | To do | |
| M6 | Alerts: Uptime Kuma and ntfy for HA, networkpi, DNS, internet | To do | |
| M7 | AdGuard Home live (depends on I1) | To do | |
| M8 | Voice control feasibility tests F1-F4 | To do | |
| M9 | Dashboard (Nuvio) with owner, MKH and guest views | In progress: Nuvio v2.30.1 installed on `nuvio-test` (2026-10-30), owner viewed on Mac and iOS and likes it. Glass Cards v1.10.11 also installed (I14). Views present: Home, Rooms, Media, Family, Map. Gaps vs D2: next prayer, calendar, scenes, Adhan toggle. Rooms layout to polish (M14, I16). Nuvio vs Glass Cards decision pending | 2026-10-30 |
| M10 | Ring in HA and a local garage controller (ratgdo or Meross) | To do | |
| M11 | Scenes: simple scenes in `packages/` (Good Night, Leaving, Lock Up, Welcome Home, Evening; Movie Night removed by owner 2026-10-30; Nursery excluded from Evening), shown in Nuvio | To do. GREEN LIGHT given 2026-10-30 (D33) | |
| M12 | Adhan: prayer integration (D28), one automation for 5 prayers (D29), shipped switched off (D34). Live test later, separate GREEN LIGHT | To do. Tier 3 | |
| M13 | Calendar: Apple CalDAV "M&W Family" (D30) | To do. Tier 3 (credential) | |
| M14 | Rooms layout: smaller tiles, areas fixed, layout JSON exported to `dashboards/` | To do | |
| M15 | MKH onboarding: simple (non-admin) user, app on iPhone and iPad, location permission, simple view (D31) | To do. Tier 3 (credentials) | |
| M16 | Geofencing: 3 mile zone, "everyone away" rule, Away AC, Cool Down and Evening (D32); Away Evening waits for the owner's light picks | To do. GREEN LIGHT given 2026-10-30 (D35). Depends on M15 (MKH person) and on the owner creating the zone. Ships notify-only first | |
| M17 | Wall tablet: wall-tablet mode and kiosk-mode (I5) | To do. After the tablet is bought | |

# CLAUDE.md — Habib Home (Home Assistant config)

This repo **is** the Home Assistant `/config` directory on a Raspberry Pi 5.
Claude Code runs on the Pi as an HA add-on (Claude Terminal) and edits this directory directly.
GitHub (`waqar-habib/homeassistant`) is the version history and rollback point.

## Environment

| Item | Value |
|---|---|
| Host | Raspberry Pi 5, 8 GB RAM, SD card (SSD upgrade planned if write load grows) |
| OS | Home Assistant OS 2026.10.2 |
| Device source | Apple Home (HomeKit) devices already exposed to HA |
| Speakers | HomePods (entity IDs: see `docs/entities.md`) |
| Live access | `ha-mcp` add-on (MCP server) + `ha` CLI |
| Dashboard | Nuvio (HACS, `strategy: type: custom:nuvio`) |

Areas — Downstairs: Living Room, Kitchen, Master, Nursery, Formal Living. Upstairs: Game Room, Upstairs Guest, Study.

## Repo layout

```
configuration.yaml   # HA root config (owned by the Pi; must include packages, see below)
packages/            # one YAML package per feature (adhan.yaml, ...). Preferred place for new config.
dashboards/          # exported Nuvio layout backups (JSON) + any YAML dashboards
docs/                # setup runbook, entity inventory, decisions
secrets.yaml.example # names of required secrets (real secrets.yaml is gitignored)
```

`configuration.yaml` must contain:

```yaml
homeassistant:
  packages: !include_dir_named packages
```

## Rules (non-negotiable)

1. **Validate before restart.** Run `ha core check` after every YAML change. Never restart on a failed check.
2. **Prefer reload over restart.** Use `ha core reload` style service calls (automation/script/template reload) when possible.
3. **Never edit `.storage/` directly.** UI-managed config (dashboards, helpers, integrations) changes only through ha-mcp / HA APIs.
4. **Never read or print `secrets.yaml`.** Reference secrets as `!secret name`; add new names to `secrets.yaml.example`.
5. **One change, one commit.** Conventional message (`feat(adhan): ...`, `fix(dashboard): ...`). Push to a branch; `main` = known-good.
6. **Ask before touching critical paths:** adhan automations, door lock, climate setpoints, anything that restarts HA.
7. **Back up first** (`ha backups new --name "pre-<change>"`) before multi-file or risky changes.
8. **Verify, don't assume.** After a change, confirm via ha-mcp that the entity/automation exists and behaves (check traces).
9. **Entity IDs come from `docs/entities.md` or ha-mcp** — never guess an entity ID.

## Adhan feature rules

- Prayer times: official `islamic_prayer_times` integration.
- Asr: **standard / Shafi school** (shadow = 1× object length). This matches the Hanbali position; do not switch to Hanafi.
- Calculation method: must match the household's masjid timetable (recorded in `docs/decisions.md`).
- Fajr uses a separate audio file (includes *aṣ-ṣalātu khayrun min an-nawm*).
- Audio files live in HA's `/media` folder (not in git).
- Every playback must restore the speaker's previous volume and notify on failure.

## Owner preferences

- Structured, numbered, quantified answers. No filler.
- Show assumptions and tradeoffs (best / base / worst case) for design decisions.
- Draft → revise → final (v1.0 only on explicit "GREEN LIGHT").

# CLAUDE.md — Habib Home (Home Assistant config)

This repo **is** the Home Assistant `/config` directory on a Raspberry Pi 5.
Claude Code runs on the Pi as an HA add-on (Claude Terminal) and edits this directory directly.
GitHub (`waqar-habib/homeassistant`) is the version history and rollback point.
A second host, **networkpi** (Raspberry Pi 3B+), is the always-on support backend. Both devices are managed as one system; see `docs/devices.md`.

## Environment

| Item | Value |
|---|---|
| Host | Raspberry Pi 5, 8 GB RAM, SD card (SSD upgrade planned if write load grows) |
| OS | Home Assistant OS 2026.10.2 |
| Device source | Apple Home (HomeKit) devices already exposed to HA |
| Speakers | HomePods (entity IDs: see `docs/entities.md`) |
| Live access | `ha-mcp` add-on (MCP server) + `ha` CLI |
| Dashboard | Nuvio (HACS, `strategy: type: custom:nuvio`) |
| Support host | networkpi, Raspberry Pi 3B+, 192.168.1.39 (wired). Planned: AdGuard Home, Samba backup share, uptime monitoring, Claude Code CLI |
| Remote access | Planned: Cloudflare Tunnel for HA. Raspberry Pi Connect for networkpi (break-glass, iPhone-capable) |

Areas — Downstairs: Living Room, Kitchen, Master, Nursery, Formal Living. Upstairs: Game Room, Upstairs Guest, Study.

## Repo layout

```
configuration.yaml   # HA root config (owned by the Pi; must include packages, see below)
packages/            # one YAML package per feature (adhan.yaml, ...). Preferred place for new config.
dashboards/          # exported Nuvio layout backups (JSON) + any YAML dashboards
HANDOFF.md           # current state and resume point for both devices (read first)
docs/                # setup runbook, devices, decisions, issues, milestones, voice feasibility
docs/sessions/       # one summary per session: YYYY-MM-DD-<slug>.md
networkpi/           # networkpi configs and runbook (planned)
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
5. **One change, one commit.** Conventional message (`feat(adhan): ...`, `fix(dashboard): ...`). Config changes go to a branch; `main` = known-good. Docs-only handoff, status and log files (Tier 1) go straight to `main`.
6. **Autonomy tiers.**
   - **Tier 0:** read-only checks and monitoring. No approval.
   - **Tier 1:** docs, status and log commits (`HANDOFF.md`, `docs/sessions/`, `docs/milestones.md`, `docs/issues.md`, `docs/decisions.md`). No approval.
   - **Tier 2:** config changes. Back up first (rule 7) and run `ha core check`. If it returns no errors or issues, proceed without approval and notify the owner afterwards.
   - **Tier 3:** anything that can cause problems, break the pipeline or create headaches (adhan automations, door lock, climate setpoints, HA or Pi restarts, DNS, tunnel or network changes, credentials, deletions, irreversible actions). Stop, explain the impact and the rollback, and wait for the owner's explicit "GREEN LIGHT".
   - Automations, agents and device control the owner has already approved do not need re-approval.
7. **Back up first** (`ha backups new --name "pre-<change>"`) before multi-file or risky changes.
8. **Verify, don't assume.** After a change, confirm via ha-mcp that the entity/automation exists and behaves (check traces).
9. **Entity IDs come from `docs/entities.md` or ha-mcp** — never guess an entity ID.

## Cross-device prompts

Prompts for another device or session live in `docs/prompts/<target>/`, where `<target>` is `pi5`, `networkpi`, `mac` or `cloud`. Filename: `YYYY-MM-DD-<slug>.md`. Each file has a header (target, date, tier, GREEN LIGHT status) and the prompt body in a code block. See `docs/prompts/README.md`.

- When the owner needs another device or session to run something, Claude commits the prompt file and pushes to `main` (Tier 1, docs only). Claude never asks the owner to copy and paste a full prompt.
- Claude replies with a short pointer (`git pull` and the file path, plus the short commit ID) that fits in a mobile terminal.
- Committing a prompt does not authorize running it. The receiving device follows the tier rules. A Tier 3 action needs a GREEN LIGHT, and the file may record only a GREEN LIGHT the owner actually gave.
- Prompts contain no secrets, tokens or passwords. The repo is public until D25.

## Session protocol (hardened)

**Start of every session:** read `HANDOFF.md`, then the open items in `docs/issues.md` and `docs/decisions.md`. Resume from the recorded point. Do not ask the owner to re-explain prior work.

**End of every session or partial stop**, including "end at step 1.5, resume 1.6 later". Do all of this without being asked:
1. Write `docs/sessions/YYYY-MM-DD-<slug>.md`: work completed up to the last finished step, decisions, problems, and the exact resume point.
2. Rewrite `HANDOFF.md`: state of both devices, last completed step, next step, blockers.
3. Update `docs/milestones.md` and `docs/issues.md` where they changed.
4. Commit as `docs(session): <summary>` and push to `main` (Tier 1). Retry on network failure. If the push still fails, say so in the reply.
5. Never put secrets, tokens or API keys in any of these files.

This applies on both devices. If sessions overlap, `git pull --rebase` before pushing. Never force-push.

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

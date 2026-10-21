# Phase 1 Runbook — Claude Code ↔ Home Assistant ↔ Pi 5 ↔ GitHub

Status legend: ☐ to do · ☑ done

## 1.1 Backup ☐
Settings → System → Backups → **Back up now** (full). Download a copy off the Pi.

## 1.2 HACS ☐
**Check (any one is conclusive):**
1. Sidebar shows **HACS**.
2. Settings → Devices & services → Integrations → search `HACS`.
3. In a terminal: `ls /config/custom_components/hacs` (or `/homeassistant/...`) returns files.

**If not installed:**
1. Settings → Apps → ⋮ → Repositories → add `https://github.com/hacs/addons`.
2. Install **Get HACS** → Start → open Logs, wait for "finished".
3. Settings → System → Restart Home Assistant.
4. Settings → Devices & services → Add integration → **HACS** → tick all boxes → authorize with the GitHub device code.

## 1.3 Claude Code add-on ☐
1. Settings → Apps → ⋮ → Repositories → add `https://github.com/ESJavadex/claude-code-ha`.
2. Install **Claude Terminal Pro** → Start → enable **Show in sidebar**.
3. Open it from the sidebar → sign in with the Claude account (Pro, OAuth). No API key needed here.
4. Confirm the config path: `ls /config/configuration.yaml || ls /homeassistant/configuration.yaml`. Use whichever exists as `$HA` below.

## 1.4 ha-mcp add-on ☐
1. Settings → Apps → ⋮ → Repositories → add `https://github.com/homeassistant-ai/ha-mcp`.
2. Install **Home Assistant MCP Server** → Start → Logs → copy the unique MCP URL. Treat it like a password.
3. In Claude Terminal: `claude mcp add --transport http ha-mcp "<MCP URL>"` then `claude mcp list` → expect `ha-mcp: connected`.

## 1.5 Link `/config` to GitHub ☐
**Token:** GitHub → Settings → Developer settings → Fine-grained tokens → new token.
Repository access: **only** `waqar-habib/homeassistant`. Permissions: **Contents: Read and write**. Expiry: 90 days.

In Claude Terminal (replace `$HA` with the path from 1.3):

```bash
cd $HA
git config --global user.name  "Waqar Habib"
git config --global user.email "<your GitHub email>"
gh auth login --with-token   # paste token, then Ctrl-D
gh auth setup-git

git init -b main
git remote add origin https://github.com/waqar-habib/homeassistant.git
git fetch origin
git reset origin/main                       # adopt remote history; leaves Pi files untouched
git checkout origin/claude/pilot-foundation -- \
  README.md LICENSE .gitignore CLAUDE.md secrets.yaml.example .claude packages dashboards docs

git status                                  # STOP if secrets.yaml or .storage/ appear
git add -A
git commit -m "chore: baseline Pi /config + pilot foundation"
git push -u origin main
```

Then add packages support to `configuration.yaml` (if not already present):

```yaml
homeassistant:
  packages: !include_dir_named packages
```

Run `ha core check` → expect success → restart HA once.

## 1.6 Entity inventory ☐
In Claude Terminal, run `claude` inside `$HA` and ask:
> Using ha-mcp, generate docs/entities.md: every entity grouped by area, with entity_id, friendly name, domain, and integration. Flag unavailable entities. Commit it.

## Phase 1 exit criteria
- [ ] `claude mcp list` shows ha-mcp connected
- [ ] `docs/entities.md` lists HomePod `media_player.*` entities
- [ ] `ha core check` passes with packages enabled
- [ ] Commit from the Pi visible on GitHub `main`

## Storage note (SD card)
Pilot scope (config edits, Nuvio, adhan) adds negligible writes. The main SD-wear driver is the HA recorder database.
Upgrade to NVMe (Pi 5 M.2 HAT) before adding camera AI, long history retention, or heavy agent workloads.

# Prompt: Install Nuvio on a test dashboard (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-10-30
Tier: 2 (HACS install and one new dashboard; no restart, no automation or device changes)
GREEN LIGHT: not needed (Tier 0-2)

## Owner steps (manual, before running)

1. All pending HA OS updates applied (done 2026-10-30).
2. Manual full backup created in HA (Settings, System, Backups), named `ha-pre-nuvio-backup_10-29` (done 2026-10-29).

## Source facts (read from the repo on 2026-10-30, not from memory)

| Item | Value |
|---|---|
| Repo | `https://github.com/kczepiec/nuvio` (HACS custom repository, category **Dashboard**) |
| Version | v2.30.1 (2026-10-28). README badge says v2.26.1; trust the release |
| Requires | HA 2024.8.0 or newer (we run 2026.10.2) |
| License | MIT (LICENSE file; GitHub metadata shows "Other") |
| HACS resource | `/hacsfiles/nuvio/nuvio.js` (added by HACS) |
| Dashboard config | `strategy:` then `type: custom:nuvio`. No options needed |
| Entities | None hard-coded. Reads areas, devices and entities from HA on first run |
| Maintainer | Single maintainer, young project. Test only until it runs stably |

## Assumptions and risks

| # | Item | Risk |
|---|---|---|
| 1 | Third-party frontend JS runs in the HA UI for every user once the resource loads | A bad release can break the frontend. Mitigated by the backup and by removal through HACS (rollback below) |
| 2 | Fast release cadence (several per week) | HACS may offer updates that change behavior. Do not enable auto-update for Nuvio |
| 3 | Nuvio and Glass Cards both installed | Possible overlap or conflicts. They are separate resources; test Nuvio on its own dashboard only |
| 4 | HACS UI steps may not be reachable through ha-mcp | Claude hands those steps to the owner instead of editing `.storage/` (rule 3) |

Outcomes:
- **Best:** Nuvio installed at v2.30.1, resource loaded, new `Nuvio test` dashboard builds all 8 areas, nothing else changed.
- **Base:** installs, but some views are empty or entities are mis-grouped. Record in `docs/issues.md`; fix areas in HA, not in Nuvio.
- **Worst:** frontend errors or a blank UI. Remove Nuvio in HACS (or remove the resource in Settings, Dashboards, Resources), hard-refresh the app, restore `ha-pre-nuvio-backup_10-29` only if removal does not fix it.

Rollback: delete the `Nuvio test` dashboard, uninstall Nuvio in HACS, refresh the browser or app cache. The `ha-pre-nuvio-backup_10-29` backup is the last resort.

## Prompt body

```
Resume from HANDOFF.md. Task: install Nuvio (HACS) on its own test dashboard. Tier 2.
Do only the steps below. No restarts, no automation changes, no changes to the existing
Nuvio-named or any other dashboard. Never read or print secrets.yaml. Never edit .storage/.
If any step fails or surprises you, stop and report; do not improvise.

1. Pre-checks (Tier 0):
   - git pull; confirm HEAD includes this prompt file.
   - ha core info and ha core check. Core must be running and the check must report no errors.
     (HA OS was just updated; if the check fails, stop.)
   - Via ha-mcp, confirm HACS is loaded.

2. Close I14 (Glass Cards), read-only:
   - Confirm the Glass Cards resource is loaded (Settings, Dashboards, Resources; or ha-mcp
     if it exposes resources) and which version HACS reports.
   - Check ha backups list for a backup named pre-glass-cards. Record whether it exists.
   - Do not change Glass Cards.

3. Back up first:
   - Run ha backups list and confirm a backup named "ha-pre-nuvio-backup_10-29" exists
     (the owner created it manually). Record its slug. Do not create another.
   - If it is missing, stop and ask the owner. Do not proceed without a backup.
   - Confirm it exists before continuing.

4. Install Nuvio through HACS:
   - Add https://github.com/kczepiec/nuvio as a custom repository, category Dashboard.
   - Install Nuvio, version v2.30.1 (not a branch, not "latest" if it differs; report the
     version HACS offers).
   - Do not enable auto-update for Nuvio.
   - If HACS cannot be driven through ha-mcp, give the owner the exact UI steps
     (HACS, three-dot menu, Custom repositories, paste URL, choose Dashboard, Add; then find
     Nuvio, Download) and wait for the owner to say done. Then verify.
   - Verify the resource /hacsfiles/nuvio/nuvio.js is registered as a JavaScript module.

5. Create the test dashboard (UI-managed; through ha-mcp / HA API only):
   - Title: Nuvio test. URL path: nuvio-test. Admin only. Show in sidebar: yes.
   - Config:
       strategy:
         type: custom:nuvio
   - Do not touch any other dashboard.

6. Verify (rule 8):
   - Confirm via ha-mcp the dashboard exists with the strategy above.
   - Check HA logs for frontend or resource errors related to nuvio since the install.
   - Ask the owner to open /nuvio-test on the iOS Companion app and a browser, and run the
     first-run wizard. Ask what they see: which views appear (Home, Rooms, Media, Cameras,
     Family, Energy), whether all 8 areas show, and whether the glass look matches D2.
   - Note what is missing for D2: next prayer, calendar, scenes + Adhan toggle.

7. Record (Tier 1, straight to main), then follow the session protocol:
   - docs/issues.md: close I13 (repo is kczepiec/nuvio, v2.30.1). Update I14 with step 2 results.
     Add new issues for anything found in step 6.
   - docs/milestones.md: M9 status (Nuvio installed on test dashboard, date, version).
   - docs/decisions.md: do NOT record a Nuvio vs Glass Cards decision. That waits for the
     owner's review of the test.
   - docs/sessions/2026-10-30-nuvio-install.md and HANDOFF.md with the exact resume point.
   - Commit as docs(session): ... and push to main. git pull --rebase first. Never force-push.

Report back: backup name, Nuvio version installed, resource status, dashboard URL, what the
owner saw, and the exact resume point. Notify the owner when done (Tier 2).
```

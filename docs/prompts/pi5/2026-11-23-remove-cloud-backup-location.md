# Prompt: remove Nabu Casa (HA Cloud) as a backup location (D26, D39)

Target: pi5
Date: 2026-11-23
Tier: 3 (backup schedule change)
GREEN LIGHT: not given. Do not run until the owner writes GREEN LIGHT for this file.

## Why
The Nabu Casa trial ends about 2026-11-23 with no payment method, so it lapses on its own (owner, 2026-11-20). The automatic backup set on 2026-11-08 writes to three locations: `hassio.local`, `hassio.networkpiBackups` and `cloud.cloud`. Once the subscription ends, uploads to `cloud.cloud` will fail every night and raise a failed-location warning. Remote access is the Cloudflare Tunnel (D39, companion app Cloud URL off), so this change does not touch remote access.

## Impact (assumptions marked A)
1. Only the location list changes. Schedule (daily 03:00), keep 7 and encryption stay as they are. No restart, no reload.
2. Nightly backups keep landing on the Pi 5 SD card and the networkpi share (two copies).
3. A: the backup copy held by Nabu Casa may be removed when the subscription ends. Not verified; not needed for recovery.
4. A: if the subscription has already ended, HA may show the cloud location as unavailable rather than listed. The step still applies.

## Best / base / worst
- Best: location removed, next 03:00 run lands on local and networkpiBackups with no warnings.
- Base: a failed-upload warning from a cloud attempt before the change stays in Repairs or notifications; the owner dismisses it.
- Worst: the save also changes another location or setting by mistake. The step 4 check catches it; restore from the step 1 record.

## Rollback
Settings, System, Backups, Backup settings: tick Home Assistant Cloud again (works only while the subscription is active). Any other setting changed by mistake: restore it from the step 1 record. No data is deleted by this change; the 7 nightly backups remain the recovery points.

## Prompt
```
Read HANDOFF.md, docs/decisions.md (D26, D39) and docs/prompts/pi5/2026-11-23-remove-cloud-backup-location.md. The owner must have written GREEN LIGHT for this file. If there is none, stop.

1. Record the current automatic backup config via ha-mcp (backup/config/info): schedule, retention, locations (agent IDs), encryption on/off, last completed and next run. Never print the encryption key. If cloud.cloud is not listed, report that and skip to step 5.
2. Confirm remote access does not depend on HA Cloud: report the external URL and whether cloud remote is in use. If the external URL is not https://ha.thehabibfam.cc, STOP and report.
3. Ask the owner to change it in the HA UI: Settings, System, Backups, Backup settings, Locations. Untick Home Assistant Cloud only. Leave This system and networkpiBackups ticked. Change nothing else. Save.
4. Re-read backup/config/info. Confirm the locations are exactly hassio.local and hassio.networkpiBackups, and schedule, retention and encryption match step 1. If anything else differs, STOP and report.
5. Next morning (after 03:00): ha backups list. Confirm the new automatic backup exists on hassio.local and hassio.networkpiBackups only, last_completed is after 03:00 today, and no new backup error or failed-location warning appears in Repairs or notifications.
6. Write docs/sessions/YYYY-MM-DD-remove-cloud-backup.md, add one line to D26 in docs/decisions.md and update the Nabu Casa item in HANDOFF.md. Commit as docs(session): removed Nabu Casa backup location, git pull --rebase, push to main (Tier 1). No secrets.
Stop and report on any error. Do not restart HA or the Pi. Do not delete any backup.
```

Target: pi5
Date: 2026-11-15
Tier: 3 (custom integration install, a core restart, a credential entered by the owner)
GREEN LIGHT: yes. Standing owner GREEN LIGHT 2026-11-15 13:01 CST (D53) plus the owner's request at 13:12 CST to integrate FamFam (D56). The restart is allowed only after the backup and only in the prayer-safe window in step 5. The owner enters the token; Claude never sees, stores or prints it.

```
Read HANDOFF.md, docs/dashboard-v2-plan.md (sections 2, 8, 9, 11), D56 and I38 in docs. Preconditions: P0 is done (docs/dashboard-config.md exists), P1 is not running now, the working tree is clean, ha core check is valid. Stop and report if any fails. Never print or write the FamFam token. Do not touch Adhan, the HomeKit Bridge, any lock, or habib-home.

Goal: FamFam (family calendar and grocery lists) as HA entities, so the habib dashboards can show them. FamFam is a third-party cloud service (famfam.life) and the integration is early development (0 stars, no releases at 2026-11-15), so this is a pilot that must be reversible.

1. git pull --rebase. Clean tree. ha core check valid.
2. Source review, read-only. Clone https://github.com/bencom-tech/famfam-homeassistant into the scratchpad directory, not into /config. Record the commit hash. Read manifest.json (domain, version, requirements, minimum HA version). List every outbound host and URL in the code. Search for eval, exec, subprocess, os.system, pickle, writes outside the integration's own storage, and any read of other config entries, secrets or files. Report all findings. STOP and report if any outbound host other than famfam.life appears, if any of those patterns is found and is not clearly benign, or if it requires packages you cannot account for.
3. Install route. Report whether HACS is available on this Pi 5. If yes, use HACS, Custom repositories, category Integration. If no, plan a manual install of the pinned commit: copy only the integration folder to /config/custom_components/famfam and record the commit hash and a sha256 of the copied tree. Check the HA version against the minimum.
4. Baseline: note current custom-integration warnings in the HA log.
5. Prayer-safe window. Read the prayer sensors. Do not restart within 15 minutes before or after any prayer time; the Adhan automations (D49 to D51) must not be disturbed. Choose a window and record it.
6. Backup: ha backups new --name "pre-famfam". Verify the name with ha backups list.
7. Install per step 3. ha core check, then restart in the window from step 5. After the restart verify the Adhan startup check (D51): speaker volumes restored, no error in the log.
8. Ask the owner (SendUserMessage or the reply) to add the integration: Settings, Devices and services, Add integration, FamFam, paste the token (created in the FamFam app: Settings, Your Family, Connected services, organisers only). Wait for confirmation. If the owner is away, finish the written report so far, push it, and stop here.
9. Verify through ha-mcp: calendars (per member, family, meal plan), one todo entity per list, sensors, binary sensors, the shopping-trip button. Record the entity IDs in docs/dashboard-config.md under a "FamFam" heading. Report the polling interval and how many lists and events exist against the free-plan limits (3 lists, 20 items per list, 20 events a month, 3 members).
10. Safe tests with throwaway data only, never real lists or events: (a) todo.add_item "HA test item" on a test list, and famfam.add_list_item with an aisle category; read item_categories; report whether todo.add_item lands uncategorized and whether anything sorts it later; then remove both. (b) famfam.add_event "HA test" for tomorrow, read it back from the calendar entity, then delete it. (c) Ask the owner to add one item in the FamFam app and report the clock time; report the seconds until HA shows it.
11. Write docs/sessions/2026-11-15-famfam-ff1.md (findings, hashes, entity IDs, test results, and what is still unconfirmed from I38). Commit as docs(session): FamFam integration; git pull --rebase, push to main, never force-push. Reply with the short commit ID, a 10-line summary and any blockers only.

Rollback: delete the FamFam config entry, remove /config/custom_components/famfam (or HACS uninstall), restart in a prayer-safe window or reload, restore backup pre-famfam if needed. The owner revokes the token in the FamFam app (Connected services; it can take about a minute).
```

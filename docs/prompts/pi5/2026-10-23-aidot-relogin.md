# Prompt: aidot cloud re-login (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-10-23
Tier: 3
GREEN LIGHT: yes (2026-10-23)

```
Resume from HANDOFF.md. Task: restore the aidot integration after its cloud login expired (401 "Please login again").
The owner gave GREEN LIGHT for this re-login on 2026-10-23 (Tier 3, credential action, approved).
Do only this re-login; no other changes.

1. Inspect first (read-only):
   - Use ha-mcp to list config entries for the aidot integration and note its state (expected: setup_error or needs reauth).
   - Check ha core logs for the aidot error. Do not print tokens or credentials.
   - List the aidot lights from docs/entities.md (light.buffet, light.console_lamp, light.floor_lamp, light.side_table, light.bookshelf, light.game_room, light.upstairs_guest, light.study_lamp) and record which are unavailable.

2. Back up first:
   ha backups new --name "pre-aidot-relogin"
   Confirm the backup exists before continuing.

3. Re-login:
   - Never read or ask for the password, and never write it anywhere. The owner enters the aidot credentials in the HA UI.
   - Start the reauth or reconfigure flow for the aidot config entry (Settings > Devices & services > aidot > Reconfigure or Re-authenticate). If ha-mcp can start the flow, start it; otherwise tell the owner exactly where to click, then wait.
   - Do not delete and re-add the integration. Deleting the entry can change entity IDs. Stop and ask if reauth is not offered.

4. Verify:
   - The aidot config entry is loaded with no error.
   - All 8 aidot lights above exist with the same entity IDs and are no longer unavailable.
   - ha core logs show no new aidot errors.
   - `ha core check` is still valid. Do not restart HA unless the entry will not load; a restart is a separate Tier 3 action and needs its own GREEN LIGHT.

5. Close out:
   - Remove the aidot item from the open items in HANDOFF.md, and note the result in the latest file in docs/sessions/.
   - Commit as `docs(session): aidot re-login` and push to main (Tier 1). Run git pull --rebase first. Never force-push.
   - Report back a numbered summary: what ran, what you verified, anything unexpected.

Rules: do not read secrets.yaml or edit .storage/. If any step fails, stop and report; do not retry on your own.
```

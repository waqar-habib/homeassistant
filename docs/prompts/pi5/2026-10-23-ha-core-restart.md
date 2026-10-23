# Prompt: HA core restart and I8 close-out (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-10-23
Tier: 3
GREEN LIGHT: yes (2026-10-23)

```
Resume from HANDOFF.md. Task: restart HA core and close the I8 follow-up.
The owner gave GREEN LIGHT for this restart on 2026-10-23 (Tier 3, approved).
Do only this restart; no other changes.

1. Back up first:
   ha backups new --name "pre-restart"
   Confirm the backup exists before continuing.

2. Validate:
   ha core check
   If it returns any error or issue, stop and report. Do not restart.

3. Restart HA core:
   ha core restart
   Wait until HA responds again. If it has not come back after 5 minutes, stop and report.

4. Verify after the restart:
   - HA core and ha-mcp respond.
   - 192.168.1.36 answers, and `ha network info` shows end0 up and wlan0 disabled.
   - ha_get_system_health no longer lists wlan0 192.168.1.37.
   - Config check is still valid.
   - Check ha core logs for new errors.
   - HomeKit Bridge "HASS Bridge:21064" and the Matter and Apple TV integrations are loaded, and the bridge still exposes its 16 entities.

5. Close out:
   - If the stale 192.168.1.37 entry is gone, close the I8 follow-up in docs/issues.md. If it is still there, record that and leave it open.
   - Update HANDOFF.md (remove the restart from the open items) and add a short note to the latest file in docs/sessions/.
   - Commit as `docs(session): HA core restart, I8 follow-up` and push to main (Tier 1). Run git pull --rebase first. Never force-push.
   - Report back a numbered summary: what ran, what you verified, anything unexpected.

Rules: do not read secrets.yaml or edit .storage/. If any step fails, stop and report; do not retry a restart on your own.
```

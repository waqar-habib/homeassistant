# Session 2026-11-24: remove Nabu Casa backup location (partial stop at step 3)

Prompt: `docs/prompts/pi5/2026-11-23-remove-cloud-backup-location.md` (commit `c943964`, on main). Owner sent GREEN LIGHT in chat on 2026-11-24. The prompt file still says "GREEN LIGHT: not given"; it was not edited.

## Done (read-only, Tier 0)
1. **Step 1, backup config recorded** (`backup/config/info`):
   - Schedule: daily 03:00. Retention: 7 copies, no day limit. Include database: yes. Folders: `media`. Add-ons: all.
   - Locations: `hassio.local`, `cloud.cloud`, `hassio.networkpiBackups`.
   - Encryption: on (password set; not recorded here).
   - Last attempt 2026-11-24 03:00 CST, last completed 03:01:35 (432.7 MB). Next run 2026-11-25 03:00.
2. **Step 2, remote access check:** `external_url` = `https://ha.thehabibfam.cc/`, which matches. HA Cloud remote is disconnected (`remote_connected` false, `remote_domain` null). Cloud subscription reports `active_subscription: true`, which differs from the prompt's assumption that the trial had lapsed. The step 3 change is still needed.
3. **Backup list check** (`snapshot list`, read-only):
   - Automatic backup `d98b253c` (2026-11-24 03:00) landed on `hassio.local` and `cloud.cloud`. No failed agents. `agent_errors` is empty.
   - `hassio.networkpiBackups` is **not** listed as an agent on the 2026-11-24 backup. It is also absent from the 2026-11-23 backup (`de3be299`, `hassio.local` only). Cause not checked. Needs a look before step 5.

## Not done
- **Step 3 (owner UI change) is not done.** The prompt requires the owner to untick Home Assistant Cloud in Settings, System, Backups, Backup settings, Locations, and to leave the other two ticked. Claude does not make this change.
- Steps 4, 5 and 6 depend on step 3 and are not started.

## Resume point
1. Owner: change the backup location in the HA UI (step 3).
2. Claude: re-read `backup/config/info` (step 4). Expect locations exactly `hassio.local` and `hassio.networkpiBackups`; schedule, retention and encryption unchanged.
3. After 03:00 on 2026-11-25: `ha backups list` (step 5). Expect the new backup on `hassio.local` and `hassio.networkpiBackups` only, with no failed-location warning.
4. Step 6: session note, D26 line, HANDOFF item.

## Open questions
- Why `hassio.networkpiBackups` does not appear as a copy target in the last two automatic backups, although HA lists it as a location. Check the networkpi share (`/srv/ha-backups`) and the mount.
- The Nabu Casa subscription is still active, so the step 3 change is what stops cloud uploads. Owner decides when to cancel the subscription (D26, D39).

## Rollback
Backup settings, Locations: tick Home Assistant Cloud again. No backups were deleted or changed in this session.

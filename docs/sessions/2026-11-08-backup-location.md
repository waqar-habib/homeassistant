# Session 2026-11-08: backup location (I24, M4, D19), partial stop

Prompt: `docs/prompts/pi5/2026-11-08-backup-location.md` (GREEN LIGHT given by owner in chat, 2026-11-08).

## Done
- Step 1 (partial): current backup config recorded from ha-mcp and CLI. Automatic backup runs daily around 05:18 with settings on; last completed 2026-11-08 05:18:59; next 2026-11-09 05:17. Current locations: `hassio.local` (local) and `cloud.cloud` (Nabu Casa). Schedule, retention and encryption UI values NOT read: a read of the Supervisor backup storage was blocked by the permission classifier. Owner to confirm from Settings, System, Backups, Configure.
- Step 2: `pre-backup-location` created, slug `744a21ce`, local, about 305 MB, database and folders included. Confirmed via ha-mcp list.

## Stopped at step 3
Owner must add network storage in the HA UI (Settings, System, Storage, Add network storage): usage Backup, SMB, server 192.168.1.39, share `ha-backups`, habackup credentials typed by owner. Not done by Claude. No password in chat, command, file or log.

## Open decisions for owner
1. Keep the Nabu Casa (`cloud.cloud`) location? Prompt says "local plus network mount" which would drop it. Recommended: keep it until the tunnel test (D26), since it is a third copy and costs nothing to keep.
2. Confirm the current schedule, retention and encryption state from the HA UI so the rollback record is complete.

## Not done
Steps 4 to 8 (mount check, schedule change, test backup, next-morning check, final I24/M4/D19 update).

## Resume point
After owner confirms the storage is added: check `ha mounts list` (or ha-mcp), then step 4.
Side note: during this session the Claude Terminal and ha-mcp add-ons updated (2.5.3 and 9.1.1). Not triggered by this work.

## Update: steps 3 to 6 (same session)
- Step 3: owner added the storage in the HA UI. Mount name `networkpiBackups` (server 192.168.1.39, share `ha-backups`, CIFS, usage backup). Owner entered the habackup password in the UI only.
- Step 4: confirmed active and not read-only with `ha mounts info`. It is now the default backup mount.
- Step 5 (owner-set in UI, per owner's discretion): daily at 03:00, keep 7, locations local + `networkpiBackups` + Nabu Casa (kept until the planned phase-out, per owner). Encryption left on. Confirmed: next automatic backup 2026-11-09 03:00 (-06:00).
- Step 6: test backup `test-networkpi-location` (slug `2c9d3f0d`) landed on `hassio.networkpiBackups`, 304,855,040 bytes. Not on local storage. Waiting on owner to check networkpi.
- Rollback names: mount `networkpiBackups`; test backup `2c9d3f0d` on the share; safety backup `744a21ce` local.
- Resume at step 6 check on networkpi (root or `daily/`), then step 7 next morning.

## Update: step 6 result (networkpi check, owner-reported)
- Test file `2c9d3f0d.tar` is in the share ROOT, not `daily/`. Size 304,855,040 bytes, matching HA. Owner `habackup`, mode rw-r-----.
- `daily/` and `weekly/` are empty. Nothing in them is needed for HA.
- Decision: HA writes to the root. `networkpi/health.sh` reads the root (path from testparm), so no change needed. `weekly-copy.sh` is not in the repo yet; when it is written, read from the root.
- Open: step 7 (next morning, 2026-11-09): confirm the 03:00 scheduled backup in `ha backups list` and on the share. Then update I24, M4, D19 to done.

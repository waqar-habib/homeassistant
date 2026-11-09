# Prompt: HA backups to the networkpi Samba share (I24, M4, D19)

Target: pi5
Date: 2026-11-08
Tier: 3 (network storage mount, backup schedule, credential entry)
GREEN LIGHT: NOT GIVEN. Do not run until the owner writes "GREEN LIGHT" for this file.

## Why
`/srv/ha-backups/daily` and `weekly` on networkpi are empty (baseline 2026-11-08). HA backups exist only on the Pi 5 SD card (I9). D19: 7 daily on the share, 4 weekly copies.

## Impact (assumptions marked A)
1. A new CIFS network mount appears in HA OS (Settings, System, Storage). No HA core restart, no Pi restart, no reload needed.
2. The backup schedule changes to daily, keep 7, locations: local plus the network mount. Local copies stay as a second copy (7 x ~260 MB = 1.8 GB on the SD card).
3. Each backup takes minutes of extra CPU and SD write on the Pi 5 (~260 MB). Schedule at 03:00, away from Fajr and the Adhan test window.
4. networkpi: +1.8 GB daily, +1.0 GB weekly (D19 total ~2.9 GB against 24 GB free). ufw already allows 445 from 192.168.1.36 only; no firewall change.
5. A (unverified): HA writes backups to the share root, not to `daily/`. Decide after the test backup whether `weekly-copy.sh` and `networkpi/health.sh` read the root. A: the Samba share is `ha-backups` owned by user `habackup`; the owner confirms the share name and user.
6. A: backup encryption is on and the key is in Apple Keychain (D19). Verify encryption is still on. Never print the key.

## Best / base / worst
- Best: mount connects, test backup lands (~260 MB), scheduled run lands the next night.
- Base: mount works but the path or permission needs one fix (share root vs `daily/`, habackup write access), found by the test backup. Nothing else is affected.
- Worst: networkpi is down or the mount drops. HA backups to that location fail and notify; HA core and the local copy are unaffected. A bad schedule could fill the SD card; capped at 7 backups.

## Rollback
1. Settings, System, Backups, Configure: restore the recorded old schedule and remove the network location.
2. Settings, System, Storage: remove the network storage entry (or `ha mounts delete <name>`).
3. On networkpi: `sudo rm` the test backup file in `/srv/ha-backups`. Nothing else was changed there.
4. `pre-backup-location` backup (local) remains for a full restore if needed.

## Prompt
```
Read HANDOFF.md, docs/issues.md (I24) and docs/prompts/pi5/2026-11-08-backup-location.md. The owner must have written GREEN LIGHT for this file. If there is none, stop.

1. Record the current backup config (schedule, retention, locations, encryption on/off) in the session note. Never print the encryption key.
2. ha backups new --name "pre-backup-location". Confirm it exists.
3. Ask the owner to add the network storage in the HA UI themselves (Settings, System, Storage, Add network storage): usage Backup, protocol SMB, server 192.168.1.39, share ha-backups, the habackup credentials. The owner types the password in the UI. Never ask for it in chat, never put it in a command, file or log.
4. Confirm the mount is connected (ha mounts list, or ha-mcp). Report the mount name and state.
5. Set the schedule: daily at 03:00, keep 7, locations local plus the network mount, encryption unchanged (on). One change at a time.
6. Run one manual backup to the network location. Ask the owner to run on networkpi: sudo ls -la /srv/ha-backups /srv/ha-backups/daily and report size (~260 MB) and whether the file is in the root or in daily/.
7. Next morning: confirm the scheduled backup (ha backups list) and the file on the share.
8. Record in docs/sessions/YYYY-MM-DD-backup-location.md; update I24, M4, D19 status; commit docs to main (Tier 1). Config notes only; no secrets.
Stop and report on any error. Do not restart HA or the Pi.
```

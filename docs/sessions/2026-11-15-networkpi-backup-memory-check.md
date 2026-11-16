# 2026-11-15 networkpi backup and memory check

Run by the owner on networkpi (Tier 0, read only); Claude read the output from the Mac.

## Results
1. `/srv/ha-backups` root: 20 .tar files, 5.2 GB. Automatic backups 2026-11-09 to 2026-11-15, one per night at 03:00, 305 to 310 MB, no gaps (7 kept, matches D19 daily).
2. `daily/` and `weekly/` empty (created 2026-10-23, never written). Backups land in the root.
3. Memory: 905 MB total, 305 MB available, swap 83 MB. dmesg: no oom or killed-process lines. `smbd`: no warnings since 2026-11-09. Throttle `0x0`.
4. Manual and `pre-*` backups (13 files, about 3 GB) are not pruned by keep-7. `82cc58de` (pre-nuvio-extend) not present by slug; `pre_nuvio_extend_2026-11-11_07.32_49000162.tar` is 14 MB.

## Decisions and status
- I24 and I25 resolved. M4 daily part done. New I49.
- Nothing deleted. `2c9d3f0d.tar` kept (deletion is Tier 3).

## Resume point
1. Owner: `df -h /srv` on networkpi; `ha backups list` on the Pi 5 to confirm `82cc58de`.
2. M6 install: owner supplies ntfy topic, healthchecks.io check and runner choice, then GREEN LIGHT.
3. M7 AdGuard after M6.

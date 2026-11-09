# 2026-11-08 networkpi baseline (Mac session, owner via Pi Connect)

The Mac was off the home network (its 192.168.1.65 address was a different LAN), so the owner ran the Tier 0 checks on networkpi through Raspberry Pi Connect and pasted the output. Claude did not touch networkpi.

## Results
| Check | Result |
|---|---|
| Uptime | 15 d 22 h, load 0.42 |
| Throttle | `0x0` (I11 resolved) |
| Memory | 389 MB available of 905, swap 82 of 904 MB |
| Disk `/` | 15% used, 24 GB free |
| dmesg oom, under-voltage, throttle | no matches |
| claude-remote.service | enabled, tmux `claude-rc` up since 2026-10-30 10:43 CDT, linger yes (8+ days) |
| Claude Code | 2.1.310 |
| ssh, smbd | active |
| ufw | active: 22/tcp from 192.168.1.0/24, 445/tcp from 192.168.1.36 only |
| Pi 5 HA | HTTP 200 |
| `ha-backups` share | `daily/` and `weekly/` both empty (I24) |

No stop condition tripped. Login user is `networkpi` (admin); `claude` is reached with `sudo -iu claude`. `claude` has no sudo and cannot read `/srv/ha-backups` (owner `habackup`, mode 750).

## Decisions
- I11 resolved, I12 closed (Phase B stable 8+ days).
- New I24: HA backups never reach the share. Fix needs a GREEN LIGHT.

## Resume point
1. Owner decides on the Pi 5 backup location change (M4, I24).
2. Step 2 drafts (`feat/networkpi-monitor`: monitor `check.sh`, README, `weekly-copy.sh`) not started. Draft only, do not install.
3. Watch memory (389 MB available with Phase B running).

## Update (Mac session, later same day)
- Backup location run happened on the Pi 5 (see `2026-11-08-backup-location.md`); test backup 305 MB landed in the share root. HA backups are ~305 MB, so 7 + 4 is about 3.4 GB against 24 GB free.
- Drafted `networkpi/monitor/check.sh`, `networkpi/monitor/README.md`, `networkpi/backup/weekly-copy.sh` on `feat/networkpi-monitor` (`9024b0e`, pushed, not merged, not installed). Only `bash -n` was run; the scripts use GNU tools, so no Mac test.
- Owner moved to iPhone only; dry runs on networkpi via Pi Connect are the next test.

## Resume point
1. Owner runs the two dry runs (commands in the reply of this session; README has them) and reports output.
2. 2026-11-09 after 03:00: Pi 5 step 7, then mark I24, M4, D19 done and delete the test file `2c9d3f0d.tar`.
3. Owner decisions: weekly copy runner, memory floor, ntfy topic, healthchecks.io check. Install is Tier 3 (GREEN LIGHT).

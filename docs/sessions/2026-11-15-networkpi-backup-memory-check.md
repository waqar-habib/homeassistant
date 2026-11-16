# 2026-11-15 networkpi backup and memory check (I24, I25)

Prompt: `docs/prompts/networkpi/2026-11-15-backup-memory-check.md` (commit 6cf0cb7). Run on networkpi as the `claude` user (Tier 0, read only). Haiku 5.5 session. No changes made on networkpi.

## Results
| Step | Check | Result |
|---|---|---|
| 1 | Backup share `/srv/ha-backups` (I24) | **Not checked.** `claude` has no read access (`Permission denied`), and `sudo` needs a password. Count, newest files, retention and the 2026-11-09 to 11-15 nightly gaps are unknown. |
| 2 | Uptime | 22 d 22 h, load 2.21 / 1.10 / 0.58 at the first check |
| 2 | Memory | 468 MB available of 905 (first check), 300 MB available at the later check. Swap 50 of 904 MB used. The 200 MB floor was not reached. |
| 2 | Throttle | **Not checked.** `vcgencmd get_throttled` fails for `claude` (`/dev/vcio_gencmd`). |
| 2 | dmesg oom, killed process, under-voltage, throttle | No matches (`dmesg` is readable, `dmesg_restrict=0`). The kernel ring buffer may not reach back 22 days, so this does not prove there was no event since 2026-11-09. |
| 2 | Disk `/` | 35% used, 18 GB free (threshold 70%: OK) |
| 2 | Processes (RSS) | `claude` (this session) 372 MB at first check; `smbd` client `[192.168.1.36]` 24 MB, 4 d 12 h old; `smbd` main 18 MB; `winbindd` 18 MB; `rpi-connectd` 17 MB |
| 2 | `journalctl -u smbd` warnings since 2026-11-09 | **Not checked.** The `claude` user is not in `adm` or `systemd-journal`. |
| 3 | `claude-remote.service` | Loaded and enabled. The unit shows `active (exited)` because the tmux server is detached. The tmux session `claude-rc` was created 2026-10-30 10:43 and is still running. Remote Control ran at 22 d 22 h of host uptime. |

## Comparison with 2026-11-08 baseline
- Available memory was 389 MB (2026-11-08 baseline) and 250 MB during the first backup mount. It is now 300 to 468 MB, so the mount has not caused a sustained drop in this check.
- The `smbd` client that was 179 MB resident on 2026-11-08 is now a 24 MB session, 4 d old. Its size has changed, so the earlier figure no longer applies.
- Throttle `0x0` on 2026-11-08 has not been re-checked.

## Recommendation (for owner decision)
1. **I24: keep open.** Evidence that the nightly backup reaches the share is still missing (the 2026-11-11 HA listing showed `06aa8ab1` on `networkpiBackups`, but the disk-side check is still pending). Close only after `sudo ls -la --time-style=long-iso /srv/ha-backups/daily` shows one file per night since 2026-11-09 and retention at 7. Then delete test file `2c9d3f0d.tar` (owner action, Tier 3 deletion) and close M4 with it.
2. **I25: can move to watch, not closed.** Available memory is above the 200 MB floor, dmesg shows no OOM, and disk is at 35%. Still open: the throttle reading and the post-03:00 `smbd` log, both of which need the owner's access. Keep I25 open until one owner check (`sudo vcgencmd get_throttled` or the Raspberry Pi Connect shell, plus `sudo journalctl -u smbd -p warning --since 2026-11-09`) comes back clean.
3. **Access gap:** the `claude` user cannot run any of the sudo-only checks. Either the owner runs the step 1 and throttle commands through Raspberry Pi Connect and pastes the output, or a sudo rule for these read-only commands is added (Tier 3, owner decision).

## Resume point
- Step 1 (backup share) and the throttle and smbd checks: run by the owner with sudo, or via a Pi Connect shell. Record in a follow-up session note.
- Then close or keep I24 and M4, and close or keep I25 per the recommendation above.

## Follow-up: owner output from networkpi (sudo, same day)
| Check | Result |
|---|---|
| `sudo ls -la /srv/ha-backups/daily` | **Empty.** Only `.` and `..`. The folder's own timestamp is 2026-10-23 23:33, so nothing has been written there since it was created. |
| Parent `/srv/ha-backups` | Modified 2026-11-15 22:06 (the folder entry changed, contents not shown). |
| `sudo vcgencmd get_throttled` | `throttled=0x0` (clean) |
| `sudo journalctl -u smbd -p warning --since 2026-11-09` | No entries (clean) |

### What this means
1. **I25 (memory and stability): evidence now clean.** Throttle `0x0`, no smbd warnings, no OOM in dmesg, available memory above the 200 MB floor. Recommend closing I25, with the caveat that the owner should confirm `free -m` once more after the next 03:00 run.
2. **I24 (backups): still open, and the daily folder is the concern.** No nightly file has landed in `daily/` since the folder was created on 2026-10-23. Either HA writes to the share root (the prompt's Step 1 expected the root, not `daily/`), or the nightly backup is not reaching the share. The 2026-11-11 HA listing of `06aa8ab1` on `networkpiBackups` is consistent with the root location. The next check is the share root and `weekly/`:
   - `sudo ls -la --time-style=long-iso /srv/ha-backups`
   - `sudo ls -la --time-style=long-iso /srv/ha-backups/weekly`
   - `sudo du -sh /srv/ha-backups`
   On the Pi 5, `ha backups list` shows whether the 2026-11-09 to 11-15 backups exist and where HA says they are.
3. **Do not delete `2c9d3f0d.tar` yet.** Its location is unknown until the root listing comes back.

### Resume point
- Owner: paste the three root and weekly commands above, plus `ha backups list` from the Pi 5 (or the HA backup page).
- Then decide I24 and M4 (close if nightly files appear in the root with retention 7), and close I25.

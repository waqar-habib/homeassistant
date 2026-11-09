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

## Update (23:17 CST): dry runs and memory
- `check.sh` dry run on networkpi: OK (HA 200, internet, DNS, disk 16%, memory 252 MB).
- `weekly-copy.sh` first dry run exited silently: `habackup` could not read the caller's cwd (`/home/networkpi`), `find` failed under `set -e`. Fixed with `cd /` on the branch (`ffa5f69`). Second dry run correct: `copy 2c9d3f0d.tar (290 MB) -> weekly/weekly-2026-W45-2c9d3f0d.tar`, nothing pruned, nothing written.
- Memory: available 250 MB (was 389), used 654 MB. `ps`: `smbd` client session 179 MB resident (22 min old, almost certainly the Pi 5 backup mount); Phase B `claude` processes ~440 MB, unchanged. Logged as I25.
- Owner is on Pi Connect and will recheck `free -m` and `ps` at about 23:27 CST. If `smbd` has dropped, the memory was held only while connected.
- Nothing on networkpi was changed except the temp folder `/home/claude/np-test` (owner removes it with `sudo rm -r /home/claude/np-test`) and `chmod a+x /home/claude` (needed so `habackup` could read the test file; owner may revert with `chmod o-x /home/claude`).

## Resume point
1. Read the 23:27 CST recheck, update I25.
2. 2026-11-09 after 03:00: owner's three commands (ls, dmesg oom, free). Pi 5 step 7 closes I24, M4, D19. Delete test file `2c9d3f0d.tar` after that.
3. If clean: owner decisions on weekly-copy runner, memory floor, ntfy topic, healthchecks check, then GREEN LIGHT to install.

## Update (about 23:40 CST): recheck
- `free -m`: available 260 MB, used 644 MB, swap 81 MB. `ps`: `smbd` client session still 179 MB resident after 38 min, idle. It does not release while the Pi 5 mount is connected. New baseline with the mount active: about 260 MB available.
- Owner removed `/home/claude/np-test` (`sudo rm -r`). `chmod a+x /home/claude` is still in place (revert: `chmod o-x /home/claude`).
- AdGuard plan drafted this session: `docs/adguard-plan.md` v0.3 (I26, I1 update). Router allows two DNS servers; IPv6 is on and not changeable in the router app (matters only for router-wide stage 4). Method is log first, replay, then one list; no hand-written allowlist.
- Resume point unchanged: 03:00 check on 2026-11-09 (`sudo ls -la /srv/ha-backups`, `sudo dmesg -T | grep -i -E 'oom|killed process' | tail`, `free -m`).

## Session end summary (networkpi lane, 2026-11-08, Mac then iPhone/Pi Connect)
Done:
1. Baseline: healthy; I11 resolved (`0x0`), I12 closed (Phase B stable 9 days).
2. Found HA was not backing up to the share (I24); Pi 5 session mounted `networkpiBackups`, daily 03:00 keep 7, test backup landed in the share root.
3. Drafted `check.sh`, `weekly-copy.sh`, README on `feat/networkpi-monitor` (`9024b0e`, fix `ffa5f69`); dry runs passed on networkpi. Not merged, not installed.
4. Opened I25 (memory: `smbd` 179 MB held while the mount is connected, baseline 260 MB available) and I26 (airline check-in failure under the old Pi-hole).
5. Wrote the AdGuard plan to v0.5 (shorter windows, log-first method, IPv6 caveat for stage 4).

Decisions: weekly copy reads the share root; HA backups are ~305 MB; no hand-written allowlist (log, replay, then block); Nabu Casa kept as a third backup location until phase-out (owner).

Problems: `weekly-copy.sh` first run exited silently (cwd), fixed. I25 open.

Still on networkpi (owner may revert): `chmod a+x /home/claude` (revert `chmod o-x /home/claude`). Test folder removed.

Exact resume point:
1. 2026-11-09 after 03:00, owner on Pi Connect: `sudo ls -la /srv/ha-backups`, `sudo dmesg -T | grep -i -E 'oom|killed process' | tail`, `free -m`. Report back. Pi 5 step 7 then closes I24, M4, D19; delete test file `2c9d3f0d.tar`.
2. Owner decisions for monitoring: weekly-copy runner (recommended system timer as `habackup`), memory alert floor (200 MB vs the new 260 MB baseline), create ntfy topic and healthchecks.io check. Install needs GREEN LIGHT (Tier 3).
3. AdGuard stage 0 gates: I25 clean, I24 done, monitor installed. Then stage 1 (GREEN LIGHT).
Blockers: none that stop work; Phase B and the share share one 905 MB box.

# Prompt: networkpi backup and memory check (I24, I25)

Target: networkpi
Date: 2026-11-15
Tier: 0 (read only). Step 4 is Tier 1 (docs).
GREEN LIGHT: not needed

Closes the evidence gap for I24 (nightly HA backups reaching the share) and I25 (memory with the Pi 5 mount active). Run one command at a time; RAM is 905 MB.

```
Read HANDOFF.md, docs/issues.md (I24, I25) and docs/sessions/2026-11-08-networkpi-baseline.md. Read only, no changes.

Step 1 Backups (I24).
- sudo ls -la --time-style=long-iso /srv/ha-backups /srv/ha-backups/daily /srv/ha-backups/weekly
- Count the .tar files in the share root, list newest 10 with size and date, and total size (du -sh).
- Expected: one new file per night around 03:00 since 2026-11-09, at most 7 kept (D19). Test file 2c9d3f0d.tar should still be there. Do NOT delete it.
- Report gaps (nights with no file) and whether retention is working.

Step 2 Memory and stability (I25).
- uptime; free -m; vcgencmd get_throttled; df -h /
- sudo dmesg -T | grep -i -E 'oom|killed process|under-voltage|throttl' | tail
- ps -eo pid,etime,rss,cmd --sort=-rss | head -8 (smbd and the claude processes)
- journalctl -u smbd --since "2026-11-09" -p warning --no-pager | tail -20
- Stop and report if: available memory under 200 MB, any OOM line, throttled not 0x0, disk over 70%.

Step 3 Phase B health.
- systemctl --user status claude-remote.service; tmux ls. Report uptime of the service.

Step 4 Record (Tier 1).
- Write docs/sessions/2026-11-15-networkpi-backup-memory-check.md with the results and a recommendation: close I24 and M4 (or list what is missing), close or keep I25.
- Edit nothing else. Commit as docs(session): networkpi backup and memory check, git pull --rebase, push to main.
```

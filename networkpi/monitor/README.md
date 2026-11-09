# networkpi monitoring and weekly copy (DRAFT)

Status: drafts on `feat/networkpi-monitor`. Not installed, not enabled, not merged. Installing is Tier 3 (it adds a timer and external alerts) and needs a GREEN LIGHT.

## What it does
`monitor/check.sh` (every 5 minutes) checks:
1. HA answers at `http://192.168.1.36:8123/` (2xx or 3xx).
2. Internet (ping 1.1.1.1) and DNS (lookup of cloudflare.com), reported separately.
3. Own disk at `/` at most 80% and available memory at least 200 MB (Phase B baseline is about 390 MB; the 300 MB rule from the October tests is for baselines, so this alert floor is lower. Owner may change it).

On failure it posts to ntfy, once per new problem and again after 6 hours if unchanged, and pings healthchecks `/fail`. On success it pings healthchecks. If networkpi or its internet dies, healthchecks.io notices the missing ping, which a script on the dead box cannot do itself.

`backup/weekly-copy.sh` copies the newest HA backup (`<slug>.tar` in the share root) to `weekly/` as `weekly-<ISO week>-<slug>.tar` and keeps 4 (D19). Dry run unless `--apply`. It never edits or deletes the source files.

## What the owner supplies (kept out of the repo)
| File on networkpi | Content |
|---|---|
| `~/.config/ntfy/topic` | a long random ntfy topic name; subscribe to it in the ntfy iPhone app |
| `~/.config/healthchecks/url` | the healthchecks.io ping URL; set the check's period to 5 min, grace 10 min |

Use `chmod 600` on both. Anyone who knows the ntfy topic can read and post to it.

## Open decision: who runs the weekly copy
`/srv/ha-backups` is owned by `habackup`, mode 750. The `claude` user cannot read it, so a user timer for `claude` fails. Options:
1. System timer running as `habackup` (best/base: least privilege, one unit file; needs `sudo` to install).
2. Add `claude` to the `habackup` group (widens `claude`'s access; not recommended).
`check.sh` needs no share access, so it can run as a `claude` user timer.

## Test without installing (Tier 0, from the repo root)
```
DRY_RUN=1 bash networkpi/monitor/check.sh
sudo -u habackup bash networkpi/backup/weekly-copy.sh        # dry run, prints only
```
Expect `OK: ...` from the first. Expect from the second a copy line for the newest backup and no changes.

## Install sketch (do not run without GREEN LIGHT)
1. `check.sh`: user service plus timer `OnCalendar=*:0/5`, as `claude`.
2. `weekly-copy.sh --apply`: system service plus timer `OnCalendar=Sun 04:00`, `User=habackup`.
3. Rollback: `systemctl disable --now <timer>`, remove the unit files, delete the two config files. Nothing else changes.

## Known limits
- The weekly copy treats every top-level `.tar` in the share root as an HA backup. The test file `2c9d3f0d.tar` counts until deleted.
- It does not verify archive contents, only size. A restore test is a separate task.
- ntfy.sh is a public service. A self-hosted ntfy would need the tunnel or LAN-only alerts (not planned).

# Prompt: Parallel lane, networkpi (Claude on the Pi 3B+)

Target: networkpi
Date: 2026-10-30
Tier: 0 and 1 (Step 3 is Tier 3 and is gated)
GREEN LIGHT: not needed for Steps 1-2. Step 3: the Phase B GREEN LIGHT of 2026-10-24 exists. On 2026-10-30 the owner said they are ready to run networkpi commands themselves in a Pi Connect session. Phase B runs only if the Step 1 baseline passes.

Runs in parallel with the Pi 5 and Mac lanes. networkpi owns `networkpi/`. RAM is 905 MB: run one thing at a time, no builds, no package upgrades. Pull with rebase before every push.

```
Read HANDOFF.md, docs/issues.md and docs/devices.md. Run this lane in order. One short report block per step.

Step 1 (Tier 0) Health baseline. Read only.
- uptime; vcgencmd get_throttled (I11: 0x0 is good; report anything else with the dmesg lines); free -m; df -h /; dmesg | grep -i -E 'oom|under-voltage|throttl'.
- systemctl --user status claude-remote.service; tmux ls. This tells us whether Phase B ever ran. Say plainly: ran / not installed.
- ~/.local/bin/claude doctor. Record the version and whether Remote Control is available.
- ufw status; systemctl is-active smbd ssh. List the ha-backups share directory: file count, newest file date, total size. Do not print Samba credentials.
- Write the results to docs/sessions/2026-10-30-parallel-networkpi.md.
- STOP and report if: throttled is not 0x0, available memory is under 300 MB, any OOM line appears, or the disk is over 70% used.

Step 2 (Tier 1, draft only) Monitoring and backup scripts for D24 and D19.
- Branch feat/networkpi-monitor. Create networkpi/monitor/check.sh: checks HA at 192.168.1.36:8123, internet, DNS, own disk and memory. On failure it posts to ntfy, reading the topic from a file outside the repo (~/.config/ntfy/topic). It pings a healthchecks.io URL read from ~/.config/healthchecks/url on success.
- Create networkpi/monitor/README.md with install steps (systemd user timer, every 5 minutes) and what the owner must supply (ntfy topic, healthchecks.io URL). No secrets in the repo.
- Create networkpi/backup/weekly-copy.sh: copies the newest HA backup from the share to a weekly folder and keeps 4 (D19). Dry-run flag by default.
- Do NOT install, enable or run any of these. Run shellcheck if it is already installed; do not install it. Commit as feat(networkpi): monitoring and weekly copy drafts. Do not merge.

Step 3 (Tier 3, GATED) Phase B, always-on Remote Control. Only after the owner says "run Phase B" and Step 1 passed.
- Branch feat/networkpi-claude-remote (2110302) has networkpi/claude-remote.service. Review it: restart loop 30 s, tmux session claude-rc, runs as the claude user.
- Copy to ~/.config/systemd/user/, systemctl --user daemon-reload, systemctl --user enable --now claude-remote.service.
- Verify: tmux -L default attach -t claude-rc; a Remote Control session named networkpi appears on claude.ai/code; free -m stays above 300 MB available for 10 minutes.
- Rollback: systemctl --user disable --now claude-remote.service; remove the unit file.
- Record in I12. I12 closes only after a full day of stable running.

End: session protocol from CLAUDE.md (docs/sessions/2026-10-30-parallel-networkpi.md, HANDOFF.md networkpi section only, issues I11 and I12). git pull --rebase, then push to main.
```

## Owner-run version (Pi Connect terminal, in order)

Run as the `claude` user (`su - claude` or `sudo -iu claude` if you land as another user). The repo is at `~/homeassistant`.

```
# A. Baseline (read only). Stop and paste the output back if any STOP condition in Step 1 trips.
cd ~/homeassistant && git pull --rebase && bash networkpi/health.sh

# B. Publish the baseline so the Mac session can read it
git add docs/sessions && git commit -m "docs(session): networkpi health baseline" && git pull --rebase && git push

# C. Phase B, only if A is clean. Reads the unit from its branch without switching branches.
git fetch origin feat/networkpi-claude-remote
mkdir -p ~/.config/systemd/user
git show origin/feat/networkpi-claude-remote:networkpi/claude-remote.service > ~/.config/systemd/user/claude-remote.service
loginctl show-user claude -p Linger        # if Linger=no: sudo loginctl enable-linger claude
systemctl --user daemon-reload
systemctl --user enable --now claude-remote.service

# D. Verify after 30 seconds, again after 10 minutes
systemctl --user status claude-remote.service --no-pager | head -8; tmux ls; free -m
tmux attach -t claude-rc                   # detach with Ctrl-b d. Then open claude.ai/code on the phone: session "networkpi"

# Rollback
systemctl --user disable --now claude-remote.service && rm ~/.config/systemd/user/claude-remote.service
```

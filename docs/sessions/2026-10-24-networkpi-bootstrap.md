# Session 2026-10-24: networkpi bootstrap

## Completed
- Ran `networkpi/bootstrap.sh` (branch `feat/networkpi-bootstrap`, `d83a735`) on networkpi via Raspberry Pi Connect. Owner-approved 2026-10-23. Completed on the third attempt (see Problems).
- Verify output reviewed, all pass: ufw active, default deny incoming, only 22/tcp from 192.168.1.0/24 and 445/tcp from 192.168.1.36; sshd `permitrootlogin no`, `passwordauthentication no`; `/dev/watchdog` present; America/Chicago, clock synchronized; `smbd` active; 905 MB RAM, 672 MB available.
- `sudo smbpasswd -a habackup` done by the owner; password saved in Apple Keychain.
- Rebooted. Raspberry Pi Connect reconnected from the iPhone.
- Post-reboot: `vcgencmd get_throttled` = `0x0`; no voltage or throttling lines in `dmesg`; `unattended-upgrade --dry-run` reports all upgrades installed.
- Domain `thehabibfam.cc` recorded (D20, `bc2eee8`). Nabu Casa remote link validated by the owner (D26).
- aidot: the Pi 5 session found the entry already `loaded` and did not re-login (`0857dd2`).

- Drafted the networkpi Claude Code CLI runbook v0.1 (`docs/prompts/networkpi/2026-10-24-claude-code-cli.md`, `d4aed80`): Phase 0 feasibility, Phase A sign-in and repo, Phase B (Remote Control, systemd) not drafted, rollback. Not approved to run.

## Decisions
- Cloudflare agent-setup prompt (skills plugin, MCP, `cf` CLI with OAuth) not run. Owner declined; the tunnel is set up manually. Reason: broad Cloudflare account access (Tier 3) and global config edits.

- The runbook stays DRAFT: GREEN LIGHT not given. The owner paused for the night and will start with the Phase 0 feasibility check in the morning.

## Problems
- Claude Code's documented minimum is 4 GB RAM; networkpi has 905 MB plus 904 MB swap on SD. Logged as I12. Phase 0 is the test; rollback is in the runbook.
- First attempt: the two-line paste ran as one command, so apt tried to install packages named `new` and `bootstrap`. Harmless.
- Second attempt: the Pi Connect session dropped during step 1 and tmux died with it (linger was not yet enabled). No reboot (uptime 1 day). The script had stopped before ufw. Fix: `sudo dpkg --configure -a`, `sudo loginctl enable-linger $USER`, then re-run with `tee ~/bootstrap.log`.
- The first Verify showed `throttled=0x50000` (under-voltage and throttling had occurred since boot). Cleared after the reboot (`0x0`). Watch only; log as an issue if it recurs.
- Not done, owner on hold: redact the owner email shown in the aidot entry title in `2026-10-23-pi5-cleanup-handoff.md` (public repo until D25).

## Resume point
Morning: owner records "GREEN LIGHT" in the runbook header (or says it in the session), then runs Phase 0 on networkpi (`sudo -iu claude`, install, `claude --version`, `claude doctor`, watch `free -m` and `dmesg`) and pastes the results. If it passes, Phase A. If out-of-memory kills, roll back and keep Claude on the Pi 5 and the Mac.
Then, in order: tunnel prompt draft for the Pi 5 (Tier 3), HA backups to the Samba share (M4). Waiting on the owner: email redaction in the aidot note; an aidot light toggle test on the Pi 5.

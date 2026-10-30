# HANDOFF

Last updated: 2026-10-30 (Nuvio installed on nuvio-test; owner test pending). Read this first, then `docs/issues.md` and the Open list in `docs/decisions.md`.

## Resume here
Dashboard work. Nuvio v2.30.1 is installed through HACS (custom repo `kczepiec/nuvio`, auto-update off). Test dashboard `nuvio-test` (admin only, sidebar) uses `strategy: custom:nuvio`. Full notes in `docs/sessions/2026-10-30-nuvio-install.md`.

Resume steps, in order:
1. Owner opens `/nuvio-test` on the iOS Companion app and a browser (hard-refresh the browser first). Owner reports: views shown, whether all 8 areas appear, glass look vs D2. Then record in I13, M9, and the session note (prompt step 7).
2. I14: Glass Cards resource is loaded (v1.10.11), but no `pre-glass-cards` backup exists. Decide whether that matters.
3. Gaps for D2 after the test: next prayer, calendar, scenes and Adhan toggle.
4. Decide the tablet after the test (I5, tablet model still open).

## Networkpi
Phase B (Remote Control, always-on) has its GREEN LIGHT but was due 2026-10-25. No record since 2026-10-24. Owner to report whether it ran.

Steps when the owner gives the word:
1. `~/.local/bin/claude doctor` as `claude`. Remote Control should show as available.
2. Review `networkpi/claude-remote.service` on branch `feat/networkpi-claude-remote` (`2110302`). Decide whether to merge it to `main`.
3. On the owner's word, enable it: copy the unit to `~/.config/systemd/user/`, `systemctl --user daemon-reload`, `systemctl --user enable --now claude-remote.service`. Check `tmux -L default attach -t claude-rc` and a Remote Control session from claude.ai/code or the phone.

GitHub token: fine-grained, repo `waqar-habib/homeassistant` only, Contents read and write, Metadata read, expires 2027-04-24. Renew before expiry. I12 stays open until Phase B has run stably.

## Open items
1. Domain: `thehabibfam.cc` bought (2026-10-23). Next: tunnel hostname `ha.thehabibfam.cc` (Tier 3, needs GREEN LIGHT).
2. Nabu Casa trial (1 month, D26): remote link working. Trial likely bills around 2026-11-23. Cancel before it bills once the tunnel is tested.
3. Make the repo private on GitHub (D25), when the owner chooses.
4. Owner on hold: redact the owner email in the aidot note in `docs/sessions/2026-10-23-pi5-cleanup-handoff.md`.
5. Watch: `vcgencmd get_throttled` on networkpi (I11).
6. Draft the Cloudflare Tunnel prompt for the Pi 5 (Tier 3). Prompt file exists at `docs/prompts/pi5/2026-10-24-cloudflare-tunnel.md`, no GREEN LIGHT.
7. aidot: optional light toggle test on the Pi 5.
8. Dashboard: see Resume here (I13, I14).

## Pending proposals
- Weekly encrypted backup copy to cloud storage (I9).

## Device state
- **Pi 5** (192.168.1.36): HA OS 2026.10.2, Claude Terminal and ha-mcp running, `/config` linked to GitHub. Wi-Fi disabled; Ethernet `end0` only. Glass Cards (v1.10.11) installed via HACS by owner, 2026-10-30. Nuvio not installed. Remote access: Nabu Casa 1-month trial (D26); Cloudflare Tunnel not started.
- **networkpi** (192.168.1.39, wired): bootstrapped 2026-10-24. Claude Code CLI 2.1.310 installed and signed in as `claude`, repo cloned. Phase B pending (see above).
- **Router**: DHCP reservations done. Custom DNS unverified (I1).

## Build order after the open items
1. Claude Code CLI as the `claude` user under tmux and systemd with `/remote-control` (Phase B pending).
2. Point HA's backup location at the Samba share (daily, keep 7) plus a weekly copy job on networkpi (keep 4).
3. Cloudflare Tunnel on the Pi 5 with the domain, HA 2FA, and `http` trusted proxy settings.
4. Monitoring (D24): check script, ntfy, healthchecks.io heartbeat.
Then AdGuard Home (depends on I1), the voice feasibility tests F4, F1, F2, F3, then Ring events and the garage.

## Rules in force
Autonomy tiers 0-3 and the session protocol in `CLAUDE.md`. Tier 3 actions (restarts, tunnel, DNS, firewall, credentials, deletions, garage door) wait for the owner's "GREEN LIGHT".

# Prompt: AdGuard Home stage 1, install on networkpi (log only, no clients)

Target: networkpi
Date: 2026-11-15
Tier: 3 (new DNS service, firewall rules). Step 0 is Tier 0.
GREEN LIGHT: yes (2026-11-15, owner: "GREEN LIGHT AdGuard stage 1"). Covers stage 1 only: install, LAN-only firewall rules, zero lists, no clients. Stages 2 to 4 each need their own GREEN LIGHT.

Implements stage 1 of `docs/adguard-plan.md`. Zero filter lists (the plan's section 2a: observe first, no blocking). No client uses it yet, so nothing in the house can break. The monitor (M6) is tabled by the owner; stage 1 has no clients, so a DNS outage affects nobody.

```
Read HANDOFF.md, docs/issues.md (I25, I26), docs/adguard-plan.md (sections 2, 2a, 3, 4). RAM is 905 MB with about 300 MB available: one command at a time, no builds.

Step 0 (Tier 0) Preflight. Read only.
- free -m (stop if available is under 250 MB), df -h / , uname -m (expect aarch64), cat /etc/os-release.
- ss -lntup | grep -E ':(53|3000|80|443)\b' : report anything already on these ports (systemd-resolved stub on 53 would conflict). Report, do not change.
- ip -4 addr show eth0 (confirm 192.168.1.39), sudo ufw status numbered.
- Stop and report if any check fails. Wait for "GREEN LIGHT AdGuard stage 1" before Step 1.

Step 1 (Tier 3) Download and verify. No curl-pipe-sh.
- In a new empty directory under ~/ (not the repo): fetch the latest release of AdguardTeam/AdGuardHome for linux_arm64 and its checksums file from the GitHub releases page. Record the version.
- Verify the tarball sha256 against the checksums file. Stop if it does not match.

Step 2 (Tier 3) Install under its own user.
- sudo useradd --system --home /opt/adguardhome --shell /usr/sbin/nologin adguard; extract to /opt/adguardhome; chown to adguard.
- systemd unit /etc/systemd/system/adguardhome.service: User=adguard, WorkingDirectory=/opt/adguardhome, ExecStart=/opt/adguardhome/AdGuardHome --no-check-update, AmbientCapabilities=CAP_NET_BIND_SERVICE, MemoryMax=200M, Restart=on-failure, NoNewPrivileges=yes.
- Save a copy of the unit to networkpi/adguard/adguardhome.service in the repo (branch feat/networkpi-adguard).

Step 3 (Tier 3) Firewall, LAN only.
- sudo ufw allow from 192.168.1.0/24 to any port 53 proto tcp; same for udp; sudo ufw allow from 192.168.1.0/24 to any port 3000 proto tcp.
- Show ufw status numbered afterwards. Rollback: delete these three rules by number.

Step 4 (owner in browser) First-run wizard.
- Start the service. The owner opens http://192.168.1.39:3000 on the home Wi-Fi and sets: DNS listen on 192.168.1.39 only (not all interfaces), admin UI on 192.168.1.39:3000, and the admin username and password. The owner types the password; it never goes in chat, a file or the repo and goes in Apple Keychain.
- Claude then sets (UI or AdGuardHome.yaml): filter lists = NONE; DHCP server OFF; block AAAA OFF; query log retention 72 h; statistics 7 days; upstream DNS tls://1.1.1.1 and tls://9.9.9.9 (parallel). Do not enable safe browsing, parental control or safe search.

Step 5 (Tier 0) Verify.
- dig @192.168.1.39 example.com and dig @192.168.1.39 AAAA example.com from networkpi; from the Mac the owner runs dig @192.168.1.39 delta.com.
- systemctl is-active adguardhome; free -m; ps RSS of AdGuardHome. Exit criteria for the 24 h mark: service stable, available memory over 200 MB, no OOM lines.

Step 6 (Tier 1) Record.
- docs/sessions/2026-11-15-adguard-stage1.md, update I26 in docs/issues.md and M7 in docs/milestones.md, rewrite the networkpi block of HANDOFF.md. Never write the password or any token. Commit the unit file on feat/networkpi-adguard and the docs on main. git pull --rebase before push; never force-push.

Rollback: sudo systemctl disable --now adguardhome; delete the three ufw rules; sudo rm -rf /opt/adguardhome and the unit file; sudo userdel adguard. No client depends on it at this stage.
```

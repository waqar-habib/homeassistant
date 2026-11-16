# 2026-11-16 AdGuard Home stage 1 (install and first run on networkpi)

Prompt: `docs/prompts/networkpi/2026-11-15-adguard-stage1.md` (GREEN LIGHT 2026-11-15, stage 1 only). Owner ran the sudo and browser steps in Pi Connect; Claude ran the checks as the `claude` user with the narrow sudo rule `/etc/sudoers.d/claude-adguard` (exact commands only, see below). Unit file on branch `feat/networkpi-adguard` (`a708356`), merged to main with this note.

## Result: stage 1 running, log only, no clients

| Step | Status | Notes |
|---|---|---|
| 0 Preflight | Done 2026-11-15 | RAM 299 MB available, aarch64, Debian 13, 192.168.1.39 on eth0 |
| 1 Download and verify | Done, re-verified 2026-11-16 | AdGuard Home v0.107.80, sha256 `d5e17d0d...a3d8f` matches `checksums.txt`. Tarball at `/home/claude/adguard-stage1/`, outside the repo |
| 2 Install | Done, with one fix | `adguard` user already existed (uid 997). Archive nested the binary one level deep, so the owner moved it to `/opt/adguardhome/AdGuardHome`. Directory set to `0700` (AdGuard permcheck warning). Unit installed to `/etc/systemd/system/adguardhome.service`. Service not enabled at boot |
| 3 Firewall | Done, with a port change | `22/tcp` and `445/tcp` were already allowed before. Added `53/tcp` and `53/udp` from `192.168.1.0/24`, and `3000/tcp` from `192.168.1.0/24`. Then added `3001/tcp` from `192.168.1.0/24` (see deviation) |
| 4 First-run wizard | Done by owner, on port 3001 | Admin UI on `192.168.1.39:3001`. DNS on `192.168.1.39:53` only. Admin password set by the owner, not recorded here |
| 5 Verify | Done 2026-11-16 | See below |
| 6 Record | This note | |

## Deviation: admin port 3001, not 3000

The wizard refused port 3000 with `address already in use`. The installer already listens on 3000 during setup, so the check conflicts with itself. The owner approved port 3001 (GREEN LIGHT given 2026-11-16) and added `ufw allow from 192.168.1.0/24 to any port 3001 proto tcp`. The prompt still says 3000. Decided (D72): 3001 is the standard port.

Unused rule `3000/tcp` is still in ufw. Delete it (Tier 3, owner runs it, number from `ufw status numbered`).

## Verification (Step 5, 2026-11-16)

- Listeners: `192.168.1.39:53` (tcp and udp) and `192.168.1.39:3001`. Not on all interfaces.
- Service: `active`. RSS 47 MB (limit 200 MB).
- Memory: 224 MB available (exit criterion for 24 h: over 200 MB). Watch this, since it was 290 MB before install.
- DNS, raw query from networkpi to `192.168.1.39:53`: A and AAAA for `example.com` both return rcode 0 with answers, so block AAAA is off.
- Logs: at install the only warning was `permcheck` on `/opt/adguardhome` (0755). Fixed to 0700. The `claude` user cannot read the journal, so the owner should check it at the 24 h mark.
- Settings verified in the browser (Claude in Chrome session, 2026-11-16): DNS filter lists none (the 190,451-rule list was disabled), upstream `tls://1.1.1.1` and `tls://9.9.9.9` in parallel mode, query log retention 72 h, DHCP off, Safe Browsing, Parental control, Safe Search and Block AAAA off, protection on.

## Not yet verified

- Statistics retention 7 days: saved, not re-checked after reload.
- DNSSEC: enabled in the wizard. Not in the prompt. Owner decision needed (keep or turn off).
- Dig from the Mac (prompt Step 5, owner's part): not run.
- 24 h stability check: due about 2026-11-17 11:30 CST.

## Cleanup pending (owner)

- Remove the temporary sudo rule: `sudo rm /etc/sudoers.d/claude-adguard`. It is still installed. It allows only the exact stage 1 commands.
- Install and rule files: the draft is `/home/claude/adguard-stage1/claude-adguard.sudoers`. Keep it until the rule is removed.

## Resume point

Per D72 (owner chose the recommendations on 2026-11-16):
1. Owner: turn DNSSEC OFF in the AdGuard UI (Settings, DNS settings).
2. Owner: delete the unused `3000/tcp` ufw rule (number from `sudo ufw status numbered`).
3. Owner: remove the sudo rule `sudo rm /etc/sudoers.d/claude-adguard`.
4. Owner: at the 24 h mark, check the journal: `sudo journalctl -u adguardhome --since "-24h" | grep -iE 'error|fatal|oom'`.
5. Owner: confirm the statistics setting after a reload. Optionally run `dig @192.168.1.39 delta.com` from the Mac (read only).
6. Claude: merge `feat/networkpi-adguard` into main (done with this session's commit).
7. Stage 2 (clients) and later stages each need their own GREEN LIGHT. Not started.

## Rollback (not needed; stage 1 is running but has no clients)

Per the prompt: `sudo systemctl disable --now adguardhome`; delete the `53`, `3000` and `3001` ufw rules; `sudo rm -rf /opt/adguardhome`; `sudo rm /etc/systemd/system/adguardhome.service`; `sudo userdel adguard`; `rm -rf /home/claude/adguard-stage1`.

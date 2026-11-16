# 2026-11-15 AdGuard Home stage 1 (partial stop after step 1)

Prompt: `docs/prompts/networkpi/2026-11-15-adguard-stage1.md` (commit 4a48f1a, GREEN LIGHT recorded for stage 1). Run on networkpi as the `claude` user. Haiku 5.5 session.

## Done
- **Step 0 preflight (Tier 0):** passed.
  - Available memory 299 MB (threshold 250 MB).
  - Disk `/` 34%.
  - `aarch64`, Debian 13 (trixie).
  - eth0 is 192.168.1.39/24.
  - Nothing listening on 53, 80, 443 or 3000.
  - `systemd-resolved` inactive, so no port 53 conflict.
  - **Not checked:** `ufw status numbered` (needs sudo).
- **Step 1 download and verify (Tier 3, no system change):**
  - Version v0.107.80 (latest release at run time).
  - Tarball `AdGuardHome_linux_arm64.tar.gz` in `~/adguard-stage1/`, not in the repo.
  - sha256 `d5e17d0d724418ddef8b7723ed8ade7eef4e621ec5b0e43a341859cca71a3d8f` matches `checksums.txt`.

## Not done (blocked)
- **Steps 2 and 3 (Tier 3):** need sudo. The `claude` account needs a password for sudo, so I cannot create the `adguard` user, install to `/opt/adguardhome`, write the systemd unit, or add the three ufw rules. Nothing on the system was changed.
- **Steps 4 to 6:** depend on steps 2 and 3. Not started.

## Resume point
1. Owner runs steps 2 and 3 with sudo (Pi Connect or a root shell). Commands are in the prompt. Or grant the `claude` account a sudo rule for these commands (Tier 3 owner decision).
2. Owner shows `sudo ufw status numbered` before the rules, so the baseline is on record.
3. Step 4 (browser wizard) is the owner's; the password goes in Keychain, never in chat or the repo.
4. Then Steps 5 and 6 as written in the prompt.

## Rollback (if the install goes ahead and is abandoned)
Per the prompt: disable the service, delete the three ufw rules, remove `/opt/adguardhome`, the unit file and the `adguard` user. Also `rm -rf ~/adguard-stage1`.

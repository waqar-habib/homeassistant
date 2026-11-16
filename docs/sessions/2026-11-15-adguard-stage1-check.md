# 2026-11-15 AdGuard stage 1 check (read only, Tier 0)

Prompt: read-only verification of AdGuard stage 1, run on networkpi (hostname `networkpi`, branch `main`). Expected state is in `docs/prompts/networkpi/2026-11-15-adguard-stage1.md` (commit 4a48f1a). No restart, reload, edit or install was done.

## Result: FAIL at Step 1 (service)

Stage 1 was never installed. The check stopped at Step 1 as the prompt requires ("if something is wrong, report and stop").

## Findings

| Step | Check | Result |
|---|---|---|
| 1 Service | `systemctl is-active adguardhome` | `inactive`. `Unit adguardhome.service could not be found.` |
| 1 Service | `systemctl show adguardhome -p NRestarts` | `NRestarts=0` (no unit, so no restart loop) |
| 1 Service | `/opt/adguardhome/AdGuardHome --version` | Not run: binary missing (`No such file or directory`) |
| 2 Ports | `ss` on 53, 3000 | Not run (stopped at Step 1) |
| 3 Firewall | `ufw status numbered` | Not run (stopped at Step 1) |
| 4 DNS | `dig @192.168.1.39` | Not run (stopped at Step 1) |
| 5 Filters | `AdGuardHome.yaml` and HTTP check | Not run (no config file, since the binary is missing) |
| 6 Memory and logs | `free`, `ps`, OOM, journal | Not run (stopped at Step 1) |
| 7 Query log | API query count | Skipped: nothing to query |

## Why the install is missing

Per `docs/sessions/2026-11-15-adguard-stage1.md` (commit c2ed001), the run stopped after Step 1 (download and verify). Steps 2 and 3 need sudo, and the `claude` account has no passwordless sudo. Nothing was installed or changed on the system.

The verified tarball should still be in `~/adguard-stage1/` (outside the repo). The sha256 check recorded in that note (`d5e17d0d...a3d8f`) was not re-run here.

## Resume point

1. Owner runs Steps 2 and 3 with sudo (Pi Connect or a root shell). Commands are in the stage 1 prompt. Alternatively, the owner grants a narrow sudo rule for these commands (a Tier 3 owner decision).
2. Owner records `sudo ufw status numbered` before adding the rules.
3. Owner runs the Step 4 browser wizard. The password goes in Keychain, never in chat or the repo.
4. Re-run this check (Steps 1 to 7) after Step 4.

## Rollback

Nothing to roll back from this check. Nothing was changed.

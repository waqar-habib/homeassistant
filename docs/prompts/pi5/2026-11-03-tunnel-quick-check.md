# Prompt: tunnel quick check (read-only)

Target: pi5
Date: 2026-11-03
Tier: 0 (read-only, no approval, no restart, no changes)
GREEN LIGHT: not needed

```
Read-only check after the tunnel cleanup (D39). Change nothing. Do not restart or reload anything.

1. git pull, then git log --oneline -5. Confirm f1b38ba (remove ignored package) and cac9df1 (merge) are on main, and report the current branch and whether the working tree is clean (automations.yaml may still show its old uncommitted change; just report it).
2. ls packages/. Confirm cloudflare.yaml is absent.
3. ha core check. Report the result and any warnings verbatim (include the http: warning text, so we have the exact wording for D39).
4. Cloudflared app: report running state and the last 5 log lines. Redact any token.
5. curl -s -o /dev/null -w "%{http_code}" https://ha.thehabibfam.cc/ . Expect 200 or 302. A 400 means the UI trusted-proxy entry is missing.
6. In the HA UI trusted proxy setting, if readable through ha-mcp, report that 172.30.33.0/24 is present. If it is not readable, say so; do not guess.
7. Reply with a short table: item, result (pass, fail, not checked). Say "not checked" where you could not verify.
```

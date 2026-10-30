# Prompt: Cloudflare Tunnel for HA (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-10-24
Tier: 3 (tunnel, credentials, public exposure of HA)
GREEN LIGHT: yes, 2026-10-30. Owner replied "GREEN LIGHT" to the tunnel item of the 2026-10-30 plan. It covers this prompt as written. The HA restart in step 6 still needs a live "restart OK" from the owner. Start only after the owner finishes the Cloudflare steps below.

## Owner steps (manual, not for Claude)

These need your Cloudflare login. Claude does not touch the Cloudflare account (see the 2026-10-24 decision: the agent-setup route was declined).

1. Cloudflare dashboard, Zero Trust, Networks, Tunnels: create a tunnel named `ha-pi5`. Choose the Cloudflared connector. Copy the tunnel token. Do not paste it into chat or the repo.
2. Public hostname: `ha.thehabibfam.cc` to `http://homeassistant.local:8123` (or the Pi 5 IP `192.168.1.36:8123`, whichever the add-on can reach; check first).
3. Add the token to the add-on options yourself in HA (step 2 of the prompt below), not in any file.

## Assumptions and risks

| # | Item | Risk |
|---|---|---|
| 1 | Tunnel exposes HA to the internet | Brute-force and login attacks. Mitigated by HA login with 2FA (step 4) and no open router ports |
| 2 | HA behind a proxy without trusted proxies returns 400 errors | Login fails. Mitigated by `http:` settings in step 5 |
| 3 | The token grants tunnel control | Leak lets someone run a tunnel to your HA. Keep it in add-on options only; rotate in Cloudflare if exposed |
| 4 | Nabu Casa trial runs out (D26) | Remote link stops at the end of the trial. Cancel only after this tunnel is verified |

Outcomes:
- **Best:** `https://ha.thehabibfam.cc` loads the HA login, 2FA is enforced, the app works on cellular, and the add-on restarts clean.
- **Base:** the login page loads but needs a trusted proxy fix. Fix and retest before trusting it.
- **Worst:** no route. Disable the add-on, delete the tunnel, keep Nabu Casa until a fix is ready. Local access is unaffected.

## Prompt body

```
Resume from HANDOFF.md. Task: set up the Cloudflare Tunnel for HA at ha.thehabibfam.cc.
The owner gave GREEN LIGHT for this on 2026-10-30 (Tier 3). If no GREEN LIGHT line is recorded
in docs/prompts/pi5/2026-10-24-cloudflare-tunnel.md, stop and report.
Do only the steps below; no other changes. Never read or print secrets.yaml. Never put the tunnel token in any file.

1. Back up first:
   ha backups new --name "pre-cloudflare-tunnel"
   Confirm the backup exists before continuing.

2. Owner adds the tunnel token in the Cloudflare Tunnel add-on options. Claude does not
   read or write the token. Confirm with the owner that the token is saved, then continue.

3. Install and start the Cloudflare Tunnel add-on (official add-on from the HA add-on store).
   Confirm it reports "connected" in its log. If not connected within 5 minutes, stop and report.
   Check the add-on's internal IP (ha addons info <slug>, or from its logs).

4. HA login 2FA: confirm the owner's HA user has TOTP MFA enabled (Profile, Multi-factor
   authentication). Do not change users or passwords. Report status only.

5. Trusted proxy settings in a package file (packages/cloudflare.yaml), not configuration.yaml:
   http:
     use_x_forwarded_for: true
     trusted_proxies:
       - <add-on internal IP range found in step 3, e.g. 172.30.33.0/24>
   Run: ha core check. If any error, stop and report. Do not restart if the check fails.

6. Reload config (not a restart, if the change allows; the http block needs a restart).
   If a restart is needed: Tier 3, wait for the owner's confirmation in this file.
   After restart, wait until HA responds. If not back after 5 minutes, stop and report.

7. Verify:
   - Open https://ha.thehabibfam.cc in a browser: login page loads, valid TLS.
   - Log in with 2FA, confirm the dashboard loads.
   - Check ha-mcp still responds locally.
   - Report results. Do not claim success unless each check passed.

8. Owner tests on cellular (Wi-Fi off). Only after this passes, the owner may cancel the Nabu Casa trial (D26).

Commit the result as docs(session): ... to main (Tier 1). Update HANDOFF.md and docs/issues.md.
```

## Rollback

1. Stop and disable the Cloudflare Tunnel add-on in HA.
2. Delete the `ha-pi5` tunnel in the Cloudflare dashboard.
3. Remove `packages/cloudflare.yaml` if it was created, then `ha core check`, then reload or restart per the rule above.
4. Restore from `pre-cloudflare-tunnel` if anything else changed.
5. Keep Nabu Casa until the tunnel works again.

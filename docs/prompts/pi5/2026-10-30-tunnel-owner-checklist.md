# Owner checklist: Cloudflare Tunnel for `ha.thehabibfam.cc`

Target: owner (manual steps), then pi5
Date: 2026-10-30
Tier: 3 (GREEN LIGHT given by the owner 2026-10-30, see `2026-10-24-cloudflare-tunnel.md`)

Deadline: the Nabu Casa trial bills about **2026-11-23** (D26). Finish the tunnel and the cellular test by **2026-11-16**, so there is a week to fix problems. Do not cancel Nabu Casa before the cellular test passes.

## Stale or unverified in the 2026-10-24 prompt (checked 2026-10-30, not against a live HA)

| # | Prompt says | Problem | Fix |
|---|---|---|---|
| 1 | "Official add-on from the HA add-on store" | The common Cloudflared add-on is a community add-on (repository by brenner-tobias), not in the default store | Add its repository in Settings, Add-ons, Add-on store, three dots, Repositories. Read the add-on's Documentation tab first and follow it where it differs from the prompt |
| 2 | Target `http://homeassistant.local:8123` | `.local` names may not resolve inside the add-on | Use `http://homeassistant:8123` and check it from the add-on log, or the Pi 5 address `http://192.168.1.36:8123` |
| 3 | Cloudflare path "Zero Trust, Networks, Tunnels" | Cloudflare has renamed menus before. The tunnel list may sit under Networks, Connectors | Use whatever label leads to creating a Cloudflared tunnel |
| 4 | "Profile, Multi-factor authentication" | Menu wording in HA 2026.10 not verified | Open your HA profile and look for the Security or MFA section |
| 5 | `trusted_proxies` network `172.30.33.0/24` | Typical for add-ons, but the lane must read the real add-on network | Pi 5 lane step G reads it from the add-on, not from this file |

## Your steps (click-path, about 15 minutes)

1. **Cloudflare dashboard**, account that holds `thehabibfam.cc`. Open Zero Trust, then Networks, then Tunnels or Connectors.
2. **Create a tunnel**: connector type Cloudflared, name `ha-pi5`. On the next screen copy the token. Keep it on the clipboard only. Never paste it into chat, a file or the repo.
3. **Public hostname**: subdomain `ha`, domain `thehabibfam.cc`, service type HTTP, URL `homeassistant:8123` (see row 2).
4. **In HA** (Settings, Add-ons): add the Cloudflared repository, install the add-on, open Configuration, paste the token into the tunnel token option, save. Do not start it yet if the Documentation tab says to set other options first.
5. **Tell the Pi 5 session**: "Cloudflare steps done." It then runs step G. It will ask for a live "restart OK" before restarting HA.
6. **Turn on 2FA** for your HA user (Profile, Multi-factor authentication or Security). Claude only checks the status.
7. **Cellular test**: turn Wi-Fi off on your iPhone. Open `https://ha.thehabibfam.cc`. Expected: valid HTTPS, login page, 2FA prompt, then the dashboard. Then open the HA app with Wi-Fi off and add `https://ha.thehabibfam.cc` as the external URL.
8. **Report** pass or the exact error. Only then consider cancelling Nabu Casa.

## Cases
- **Best:** the page loads on cellular, 2FA works, the add-on log says connected.
- **Base:** the page loads but shows a 400 error. Cause: trusted proxy not set. The Pi 5 lane fixes `packages/cloudflare.yaml` and restarts once more.
- **Worst:** no route. Stop the add-on, delete the `ha-pi5` tunnel, keep Nabu Casa. Local access is unaffected.

## Security notes
- Do not open any router ports. The tunnel is outbound only (I1).
- Rotate the token in Cloudflare if it is ever pasted anywhere.
- Geofencing needs this tunnel to stay up (D32, D26).

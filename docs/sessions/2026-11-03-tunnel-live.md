# Session 2026-11-03: Cloudflare Tunnel live

## Done
1. Route `ha.thehabibfam.cc` to `http://192.168.1.36:8123` saved on tunnel `ha-pi5` (Cloudflare dashboard, Routes tab; the old "Public Hostname" tab is now Routes).
2. Cloudflared app installed from `https://github.com/homeassistant-apps/repository`, token mode, started. Log shows registered connection, tunnel Healthy.
3. HA restarted once (owner "restart OK"). Public URL returned 400: HA logged a request from 172.30.33.2 and was not set up for reverse proxies.
4. Pi 5 session found `packages/cloudflare.yaml` valid but ignored. Cause (from its `ha core check` warning, not independently verified): `http:` is imported into the UI once and YAML edits are ignored.
5. Owner added `172.30.33.0/24` as trusted proxy in the HA UI. URL works, 2FA prompt shown (owner).
6. Owner set the companion app external URL and turned off the Cloud URL. App and Safari work on cellular (owner).

## Decisions
D39. Milestone M5 in progress (uptime monitor remains).

## Problems
- Checklist had stale rows (repo, service URL, menu names). Fixed in `docs/prompts/pi5/2026-10-30-tunnel-owner-checklist.md`.

## Resume point
1. Pi 5: remove ignored `packages/cloudflare.yaml` on `feat/cloudflare-tunnel` (owner said yes to removal only once the fix works; confirm), merge or drop the branch.
2. Dashboard cleanup (D38): prayer card into `habib-home`, then delete `prayer-times` and `nuvio-test`.
3. Nabu Casa: keep until geofencing is tested. Bills about 2026-11-23.

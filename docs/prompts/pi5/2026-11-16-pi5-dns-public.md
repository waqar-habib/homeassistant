# Prompt: Pi 5 DNS to public resolver (D74), check then change, verify

Target: pi5
Date: 2026-11-16
Tier: 3 (network change on the HA host, DNS). Step 0 and step 1 are Tier 0.
GREEN LIGHT: pending. Owner decision D74 (2026-11-16) is the intent, but Tier 3 needs the owner's explicit "GREEN LIGHT Pi5 DNS". Do not change anything until it is given in this session.

Context: the router's DNS now points at AdGuard on networkpi (`192.168.1.39`) as primary, and public as secondary (router change made by the owner 2026-11-16). The Pi 5 must NOT use AdGuard, so Home Assistant never depends on networkpi for name resolution (prayer times, Adhan, remote access). Target: DNS server `1.1.1.1` on the Pi 5's network connection (IPv4). Pi 5 address: `192.168.1.36`.

Background: `docs/decisions.md` D74, `docs/sessions/2026-11-16-adguard-stage1.md`, `docs/devices.md`.

```
Read HANDOFF.md and docs/decisions.md D74. git checkout main; git pull --rebase. Never print secrets or tokens. Step codes to the owner only with their full phrase (D58). One change at a time; stop on any failed check.

Step 0 (Tier 0) Read only, no change.
- Report the current DNS for the Pi 5's network connection: `ha network info` (or the equivalent ha-mcp read), and `cat /etc/resolv.conf` if available. Record the current IPv4 method (auto or static), the address, the gateway and the DNS servers. Save the exact values to the session note as the rollback record.
- Report whether the Pi 5 currently resolves through 192.168.1.39 (AdGuard). If it does, that is the reason for this change.
- Check the Adhan and prayer-time sensors are updating (entity IDs from docs/entities.md or ha-mcp; never guess an ID). Check core logs for DNS or name-resolution errors in the last hour (`ha core logs`, grep for "resolve", "dns", "name or service").
- Stop and report. Wait for the owner's "GREEN LIGHT Pi5 DNS" before step 1.

Step 1 (Tier 3) Backup, only after the GREEN LIGHT.
- `ha backups new --name "pre-pi5-dns"`. Confirm it exists before continuing.

Step 2 (Tier 3) Change the DNS.
- Set the IPv4 DNS server to `1.1.1.1` only (no AdGuard address, no secondary needed unless the owner asks for `9.9.9.9` as the second). Keep the IPv4 address, gateway and method as recorded in step 0. Use the HA UI path (Settings, System, Network, IPv4) or the `ha network` command if `ha network --help` shows an option for it. If the method is "auto" (DHCP) and the router hands out AdGuard, a static DNS setting on the Pi 5 is still the goal; say which way you did it.
- After saving, wait for the network to settle before the next step.

Step 3 (Tier 0) Verify.
- `cat /etc/resolv.conf` (or `ha network info`) must show `1.1.1.1` and NOT `192.168.1.39`.
- Name resolution from the Pi 5: a lookup of a public host succeeds (for example `ha dns info` if it exists, or a lookup from the HA terminal). Do not block on a missing command; report what is available.
- HA is reachable (web UI loads, `ha core info` shows running).
- Prayer and Adhan sensors still update within their normal interval. No new DNS or name-resolution errors in `ha core logs` since the change.
- Cloud integrations still show "connected" in Settings, Devices and services (spot-check the ones that use the internet).

Step 4 (Tier 1) Record.
- Write `docs/sessions/2026-11-16-pi5-dns-public.md`: before and after values, the backup name, each check result and any errors. No secrets.
- Update HANDOFF.md (Pi 5 block) and docs/decisions.md D74 status. Commit as `docs(session): pi5 DNS to 1.1.1.1` and push to main. git pull --rebase before push; never force-push.

Rollback (if any check fails, or the owner asks): restore the step 0 network settings exactly (the recorded method, address, gateway and DNS), or restore backup `pre-pi5-dns`. Report what was restored and re-run step 3.

Stop and report at once on: HA not reachable, prayer or Adhan sensors stop updating, any cloud integration disconnects, or any error that names DNS after the change.
```

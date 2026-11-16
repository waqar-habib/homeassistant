# Session 2026-11-16: Pi 5 DNS to 1.1.1.1 (prompt step 0 only, partial stop)

Prompt: `docs/prompts/pi5/2026-11-16-pi5-dns-public.md` (commit 4c9fee4). Decision D74.
Stopped after step 0 (Tier 0, read only). **No change made.** Steps 1 to 4 wait for the owner's exact phrase "GREEN LIGHT Pi5 DNS".

## Step 0 results (rollback record)

Network, interface `end0` (Pi 5, Home Assistant OS, core 2026.11.1, supervisor 2026.11.0):

| Item | Value |
|---|---|
| IPv4 method | auto (DHCP) |
| IPv4 address | 192.168.1.36/24 |
| IPv4 gateway | 192.168.1.1 |
| IPv4 nameservers | 192.168.1.1 |
| IPv6 method | auto |
| IPv6 nameservers | 2603:8082:d840:62::1 |
| Docker DNS (internal) | 172.30.32.3 |

`/etc/resolv.conf` (inside the HA container) shows `nameserver 127.0.0.11` with external servers `172.30.32.3`. It does not show the host resolver.

**Does the Pi 5 resolve through AdGuard (192.168.1.39)?** Indirectly, likely yes. The Pi uses the router (192.168.1.1) as its DNS. The owner set the router's primary DNS to AdGuard on 2026-11-16. `nslookup example.com 192.168.1.39` answers from AdGuard. The router's forwarding was not checked. This is the reason for D74.

Health check (`ha_get_system_health`):
- Host connectivity true, supervisor connectivity true, NTP synchronized.
- Cloud: logged in, relayer connected, remote connected.
- Core 2026.11.1 running.

Adhan sensors (ha-mcp, from search):
- `sensor.living_room_adhan_fajr_prayer` state 2026-11-16T11:49 (last_updated 2026-11-16 00:16 CST).
- Other sensors present: `sensor.living_room_adhan_dhuhr_prayer`, `_asr_`, `_maghrib_`, `_isha_`.
- Fajr `last_updated` was 00:16 CST and has not changed since. Prayer-time sensors update on a schedule, so this is expected, not a fault.

Logs: `ha core logs` contained 0 lines matching resolve, dns, name or service, getaddrinfo or nameresolution.

Not checked:
- `getent hosts api.nabu.casa` failed on the host. The reason is unknown (probably the tool, not DNS). A direct public lookup from the Pi 5 must be done in step 3.
- `ha dns info` shows `servers: []`, `locals: dns://192.168.1.1`, `fallback: true`.

## Open for the owner before step 1
1. Confirm the target: `1.1.1.1` only, or `1.1.1.1` plus `9.9.9.9`. The prompt says `1.1.1.1` only unless asked.
2. Confirm the method: static DNS on the Pi 5 while keeping DHCP (auto) for the address. The prompt requires a static DNS setting.
3. Reply with the exact phrase "GREEN LIGHT Pi5 DNS" to run steps 1 to 4.

## Resume point
Step 1 (backup `pre-pi5-dns`), then step 2, after the owner's GREEN LIGHT.

## Steps 1 to 3 (owner GREEN LIGHT Pi5 DNS, 2026-11-16)

**Step 1 backup:** `ha backups new --name "pre-pi5-dns"`, slug `91b983ed`, listed by name.

**Step 2 change:** `ha network update end0 --ipv4-method auto --ipv4-nameserver 1.1.1.1 --ipv4-nameserver 9.9.9.9`. Method, address and gateway unchanged (`auto`, `192.168.1.36/24`, `192.168.1.1`). Only the IPv4 DNS list changed.
- Result, `ha network info`: nameservers `1.1.1.1`, `9.9.9.9`, `192.168.1.1`.
- `192.168.1.1` is still there because `auto` keeps the DHCP-supplied DNS appended. The `ha network update` CLI has no switch to ignore DHCP DNS. Removing it needs `static` and an address, so I did not do it.
- Supervisor `ha dns info`: locals `dns://1.1.1.1`, `dns://9.9.9.9`, `dns://192.168.1.1`. No AdGuard address.

**Step 3 verify:**

| Check | Result |
|---|---|
| Does not list `192.168.1.39` | Pass (Supervisor and network info) |
| Shows `1.1.1.1` | Pass in Supervisor and network info. Container `/etc/resolv.conf` still shows only `127.0.0.11` (the Docker resolver), as before the change |
| Public lookup | `nslookup example.com 1.1.1.1` returns AAAA `2606:4700:10::6814:179a` |
| HA running | core 2026.11.1, `ha core check` passes |
| Prayer sensor | `sensor.living_room_adhan_fajr_prayer` unchanged since 00:16 CST (same as step 0; normal for this entity) |
| DNS errors in core logs | 0 matching lines |
| Cloud | logged in, relayer and remote connected, IoT connected |
| Host | host and supervisor connectivity true, NTP synced |

**Open item:** `ha_get_system_health` still lists `hassio.nameservers` as `192.168.1.1, 2603:8082:d840:62::1`. It may be a cached value; check again on the next session.

**Rollback (not used):** `ha network update end0 --ipv4-method auto` with the nameserver list cleared, or restore backup `pre-pi5-dns` (slug `91b983ed`).

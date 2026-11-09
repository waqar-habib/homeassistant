# AdGuard Home plan (D8, I1, M7) — DRAFT v0.3

Status: plan only. Nothing installed. Install is Tier 3 (DNS, firewall, new service on networkpi) and needs a GREEN LIGHT per stage.

## 1. Lesson from the old Pi-hole (owner, 2026-11-08)
1. First run blocked everything useful; fixed by pushing an allowlist. Fix here: start with ONE conservative list, not a pile of aggregated lists.
2. Even after the fix, airline check-in on delta.com and aa.com failed while on the home Wi-Fi, and worked on cellular or another Wi-Fi. Cause never found.

### Hypotheses for the check-in failure (ranked, all testable from the query log)
| # | Hypothesis | Why plausible | How to test |
|---|---|---|---|
| 1 | A blocklist entry hit a third-party domain the check-in page needs: bot/fraud detection (Akamai, device fingerprinting), analytics or tag managers the form waits on, queue or captcha services | Check-in pages gate the submit button on those scripts; the page "loads" but the action fails | Reproduce the failure, then read the query log filtered to the client for that minute; look for Blocked rows |
| 2 | Upstream resolver returns an IP for a CDN edge that the airline's bot protection distrusts (different resolver or region than the carrier's) | Works on cellular because the carrier resolver gives a "normal" answer | Compare `dig delta.com` answers from AdGuard vs the carrier; test with a different upstream |
| 3 | IPv6 or AAAA handling (Pi-hole answering only IPv4, or blocking AAAA, while the network has IPv6) | Partial IPv6 gives hangs and timeouts rather than clean failures | Check the router for IPv6; query AAAA for the failing hosts; test with IPv6 off on the client |
| 4 | DNSSEC or slow upstream timeouts | Page timeouts on multi-domain sites | Look at AdGuard's upstream response times in the log |
Hypothesis 1 is the likely one. None is confirmed; the old Pi-hole logs are gone.

## 2. Safeguards built in from day one
1. **Lists:** AdGuard DNS filter only at first. Add one list at a time, a week apart. No "ultimate" lists.
2. **No hand-written allowlist (owner, 2026-11-08).** Banks, portals and major sites must never break, and the owner will not write that list. Instead the household's own traffic builds it, see 2a. The repo file `networkpi/adguard/allowlist.txt` holds only a small system seed (Apple and iCloud, Ring, Nest, Hatch, Cloudflare, HA, `delta.com`, `aa.com`) plus whatever the replay below flags.
3. **Pre-travel test (the airline check):** before each stage, and after any list change, open the check-in flow for Delta and American (view only, stop before confirming), on the filtered network. The failure must not appear.
4. **Instant bypass:** AdGuard's "disable protection for 5 minutes" button on the owner's phone. Use it as the first step when anything breaks, then read the log to find the domain, then allowlist it.
5. **Per-client exemption:** a persistent client entry with filtering off, ready for any device that cannot cope.
6. **Query log:** 24 hours, in memory or short retention, to limit SD writes. Statistics 7 days.

## 2a. Log first, replay, then block (replaces the pre-written allowlist)
Goal: avoid ads, never create a failed check-in at a critical time. So the filter starts empty and earns its lists.
1. **Observe (no blocking).** AdGuard runs with ZERO filter lists on the Mac, then the iPhone, for 5 to 7 days of normal use (including a check-in or two, banking, portals). Only the query log fills. Nothing can break except by AdGuard being down or the IPv6 leak.
2. **Replay.** I match the logged domains against the candidate list offline (the list file is plain text, no network access needed to AdGuard) and produce the report: "these N domains you actually used would be blocked". Domains tied to a critical site (the site itself, its login, payment, bot-protection or captcha hosts) go to the allowlist. The owner reviews only the short report, not a list of banks.
3. **Enable one list.** Turn on the AdGuard DNS filter alone. Keep the 5-minute pause button. Expected: a few ads still show; that is the accepted trade.
4. **Never enable:** telemetry or "tracker" lists, Apple or Microsoft telemetry blocking, "ultimate" aggregates, safe browsing for now (false positives). These cause most breakage per ad removed.
5. **Check-in day runbook (documented, 10 seconds):** (a) do the check-in at the 24 h mark as soon as it opens, not at the airport; (b) if the page stalls or errors, turn Wi-Fi off and use cellular, which already worked; (c) afterwards, read the log for that minute and allowlist the blocked domain; (d) optional: set the iPhone's Wi-Fi DNS back to Automatic for travel days (stage 3 only; rollback is one setting).
Per-client settings in AdGuard cannot choose different lists per device (filtering can only be on, off or global), so a "safe profile" for the phone is just filtering off for that client.

## 3. Design risks
| Risk | Impact | Mitigation |
|---|---|---|
| networkpi is the only DNS: it goes down, the whole home loses name resolution | HomeKit, Ring, streaming, phones all fail | Router hands out AdGuard first and a public resolver second (fail-open, with some leakage past the filter). If the router allows only one DNS, do not roll out router-wide; use per-device DNS instead |
| Pi 5 depends on networkpi for DNS | The Cloudflare Tunnel (remote access) dies with networkpi | Keep the Pi 5, and networkpi itself, on public resolvers |
| Memory on networkpi: 250 MB available (I25), Phase B holds about 440 MB | OOM kills | AdGuard idles at tens of MB, but wait for I25's overnight result before installing |
| Router cannot set DNS (I1, Spectrum SBE1V1R) | No network-wide filtering | Per-device DNS (iPhone Wi-Fi settings), or the owner's own router later. Do NOT turn on AdGuard's DHCP server: it would replace the router's reservations |
| Apple features bypass DNS: iCloud Private Relay, "Limit IP Address Tracking", DoH profiles | iPhone ads still show | Turn those off on the home Wi-Fi for tested devices, or accept it |
| Install method | A `curl \| sh` installer is a supply chain risk | Download the release tarball, verify its checksum, install under a systemd unit |
| Web UI exposure | Admin takeover | UI on the LAN only, strong password in Keychain, no tunnel, ufw limits 53 and the UI port to 192.168.1.0/24 |

## 4. Rollout stages (each stage is its own GREEN LIGHT, each can stop)
| Stage | What | Exit criteria | Rollback |
|---|---|---|---|
| 0 | Prerequisites: I25 clean, backups running (I24), monitor installed (M6), router DNS question answered (I1) | All true | n/a |
| 1 | Install AdGuard on networkpi, one list, no clients. ufw allows 53 and UI from the LAN | Service stable 24 h, memory above 200 MB, `dig @192.168.1.39` works | Stop and disable the unit, remove the ufw rules |
| 2 | Mac only: set DNS manually, ZERO lists (log only) 5 to 7 days, airline view-only check in IPv6 on and off. Then replay (2a), then enable one list for 3 days | Airline flows fine, no unexplained blocks | Reset the Mac DNS to automatic |
| 3 | Owner's iPhone on home Wi-Fi: manual DNS, log-only first, replay, then the list. Another week. Add the second list if wanted | Same, plus Apple Home and Ring fine | Reset the iPhone DNS |
| 4 | Router-wide (only if I1 permits two DNS servers): AdGuard primary, public secondary | Household uses it for a week with no complaints | Router DNS back to automatic (one setting) |
| 5 | Pi 5 and HA stay on public DNS. Revisit only with a reason | n/a | n/a |

Best / base / worst: best: stages 1 to 4 in about 3 weeks with no breaks. Base: one or two allowlist additions per week early on. Worst: airline or another critical site breaks, or the router blocks custom DNS; stay at stage 3 (per-device) and keep the rest.

## 4a. Owner answers, 2026-11-08 (v0.2)
1. **Router (I1):** My Spectrum shows two DNS fields, both "Spectrum DNS" now. So router-wide is possible: stage 4 can hand out two servers. Not tested yet; the fields are assumed to be IPv4 and to apply to DHCP clients (verify at stage 4).
2. **IPv6 is on** (public IPv6 address in the UI). This raises hypothesis 3 from "possible" to "likely contributor" and adds a leak path, see below.

### Consequences
| Item | Detail | Handling |
|---|---|---|
| IPv6 DNS leak | The router can advertise its own IPv6 DNS (RDNSS / DHCPv6). Clients that prefer it skip AdGuard entirely, so ads still show and the filter looks flaky | At stage 2 check which resolver the Mac actually uses (`scutil --dns`). If the app lets you set or disable the IPv6 DNS, do so. If not, the choice is: accept leakage, or disable IPv6 on the LAN side (Tier 3, may break some services) |
| AAAA answers | AdGuard must answer AAAA for allowed hosts and block it for blocked ones, consistently. Airline failure fits a half-blocked dual-stack | Keep "block AAAA" OFF; test airline flows with IPv6 on and off in stage 2 |
| Second DNS server | Clients with two servers do not strictly use the first; some alternate or pick the fastest, so queries leak past the filter and the log shows only part of the traffic | Option A (simple): secondary = public resolver, fail-open, accept leakage. Option B (better filtering, more work, Tier 3): secondary = a second AdGuard on the Pi 5 (HA add-on) with synced rules; failover keeps filtering. Pi 5 itself stays on public DNS. Decide at stage 4 |
| Best-case stage 4 setting | Primary 192.168.1.39, secondary per A or B | Rollback: set both fields back to Spectrum DNS (one change, the router app) |

## 5. Needed from the owner
1. ~~I1: can DNS be changed, can two be set?~~ Answered: two fields, yes.
2. ~~IPv6~~ Answered: on. Still open: does the app let you set or disable IPv6 DNS? (look next to the same DNS fields)
3. ~~Banks and services~~ Answered: no list from the owner; the log-and-replay method (2a) replaces it.
4. Approval of this plan as v0.1 (revise, then v1.0 on "GREEN LIGHT").

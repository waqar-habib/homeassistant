# AdGuard Home plan (D8, I1, M7) — DRAFT v0.1

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
2. **Allowlist file in the repo** (`networkpi/adguard/allowlist.txt`, drafted next), pre-seeded with first-party domains the household uses: Apple and iCloud, Ring, Google Nest, Hatch, Cloudflare, `delta.com`, `aa.com`, banks the owner names. First-party only; third-party scripts are found through the log, not guessed.
3. **Pre-travel test (the airline check):** before each stage, and after any list change, open the check-in flow for Delta and American (view only, stop before confirming), on the filtered network. The failure must not appear.
4. **Instant bypass:** AdGuard's "disable protection for 5 minutes" button on the owner's phone. Use it as the first step when anything breaks, then read the log to find the domain, then allowlist it.
5. **Per-client exemption:** a persistent client entry with filtering off, ready for any device that cannot cope.
6. **Query log:** 24 hours, in memory or short retention, to limit SD writes. Statistics 7 days.

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
| 2 | Mac only: set DNS manually. Run the airline check and daily use for 3 days | Airline flows fine, no unexplained blocks | Reset the Mac DNS to automatic |
| 3 | Owner's iPhone on home Wi-Fi: manual DNS. Another week. Add the second list if wanted | Same, plus Apple Home and Ring fine | Reset the iPhone DNS |
| 4 | Router-wide (only if I1 permits two DNS servers): AdGuard primary, public secondary | Household uses it for a week with no complaints | Router DNS back to automatic (one setting) |
| 5 | Pi 5 and HA stay on public DNS. Revisit only with a reason | n/a | n/a |

Best / base / worst: best: stages 1 to 4 in about 3 weeks with no breaks. Base: one or two allowlist additions per week early on. Worst: airline or another critical site breaks, or the router blocks custom DNS; stay at stage 3 (per-device) and keep the rest.

## 5. Needed from the owner
1. **I1:** open My Spectrum, Advanced settings, look for DNS or LAN settings for the SBE1V1R. Report whether DNS servers can be changed and whether two can be set.
2. Does the household use IPv6 on the router? (Check if listed in the app.)
3. Which banks and services must always work (for the allowlist)?
4. Approval of this plan as v0.1 (revise, then v1.0 on "GREEN LIGHT").

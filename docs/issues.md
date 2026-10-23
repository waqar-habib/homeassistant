# Issues

| ID | Raised | Issue | Impact | Status / next step |
|---|---|---|---|---|
| I1 | 2026-10-23 | Spectrum SBE1V1R is managed only through the My Spectrum app. DHCP reservation and custom DNS are unverified | Samba backups and AdGuard need stable addresses. Network-wide ad blocking needs the router to hand out AdGuard as DNS | Open. Owner checks the app and the router web page (try 192.168.1.1) for reservation, DNS and DHCP pool range. Fallbacks: static IPs on each Pi outside the pool; per-device DNS; own router. AdGuard is built last |
| I2 | 2026-10-23 | `lsblk` shows networkpi's SD card at 29.1 GB; the owner believes it is 64 GB | Backup retention math and headroom (25 GB free) | Open. Owner checks the card label or purchase record |
| I3 | 2026-10-23 | `cat /etc/os-release` was mistyped as `/cat/etc/os-release`, so the OS release was not captured | Image version drives package and hardening steps | Open. Owner re-runs `cat /etc/os-release` |
| I4 | 2026-10-23 | HA OS cannot run Raspberry Pi Connect | No direct iPhone terminal to the Pi 5 | Mitigated by the networkpi hop and the HA web terminal via Cloudflare. Set up with the runbook |
| I5 | 2026-10-23 | Nuvio is a web dashboard. An ESP32 touchscreen runs ESPHome firmware and cannot render it | A wall display needs a tablet for Nuvio. An ESP32 panel can still serve as a simple control panel for MKH and guests | Open. Display decision pending |
| I6 | 2026-10-23 | The API key cap on file (about $10/mo) may be low for scheduled agent runs | Scheduled runs could stall when the cap is reached | Open. Start with interactive OAuth, measure usage for 2 weeks, then size the cap |
| I7 | 2026-10-23 | How Apple Home devices reach HA today is not recorded (direct HomeKit Device pairing vs. Matter) | Exposing HA back to Apple Home via HomeKit Bridge can duplicate or loop devices | Open. Resolve before voice feasibility test F1 |

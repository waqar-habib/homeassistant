# Session 2026-10-23: remote access and networkpi planning

## Completed
- Pulled `main` (`7ed942d`). Nothing new to fetch afterwards.
- Evaluated remote-access options. Tailscale and Nabu Casa rejected by the owner. Chose Cloudflare Tunnel plus an owned domain (D6, D12).
- Defined networkpi as the always-on backend (D7) and chose AdGuard Home over Pi-hole (D8).
- Adopted the operating rules: iPhone-only break-glass (D9), git as source of truth (D10, D13), one agentic pipeline for both devices (D11).
- Adopted the autonomy tiers (D15), the automatic session-end protocol (D14), alerts (D16), Claude auth (D17), HA user roles (D18), backup plan (D19), domain purchase path (D20), and voice feasibility first (D21).
- Recorded networkpi facts from the owner's terminal output: aarch64, 905 MB RAM, SD reported at 29.1 GB (I2), IP 192.168.1.39. The `os-release` command had a typo (I3).
- Created `docs/devices.md`, `docs/issues.md`, `docs/milestones.md`, `docs/voice-feasibility.md`, `HANDOFF.md`.
- Owner approved the merge. `main` fast-forwarded to `cf00c01`, so the tiers and session protocol are now in force.
- Owner answers recorded: DHCP reservations done; backup size 254-260 MB (retention fits, D19); domain must be location-neutral (D22); onboarding flow (D23); partial device list from the router app added to `docs/devices.md`.

## Findings
- HA OS cannot run Raspberry Pi Connect (I4).
- Nuvio cannot run on an ESP32 display (I5).
- The Pi 5 appears on the router on both Wi-Fi and Ethernet (I8).
- myQ has no HA support. Local options are ratgdo or Meross, pending the opener model.
- Devices that live natively in Apple Home must not be bridged back from HA (D23).

## Resume point
Draft the networkpi bootstrap once the owner supplies `cat /etc/os-release`. Then Phase A as listed in `HANDOFF.md`.

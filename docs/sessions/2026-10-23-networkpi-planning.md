# Session 2026-10-23: remote access and networkpi planning

## Completed
- Pulled `main` (`7ed942d`). Nothing new to fetch afterwards.
- Evaluated remote-access options. Tailscale and Nabu Casa rejected by the owner. Chose Cloudflare Tunnel plus an owned domain (D6, D12).
- Defined networkpi as the always-on backend (D7) and chose AdGuard Home over Pi-hole (D8).
- Adopted the operating rules: iPhone-only break-glass (D9), git as source of truth (D10, D13), one agentic pipeline for both devices (D11).
- Adopted the autonomy tiers (D15), the automatic session-end protocol (D14), alerts (D16), Claude auth (D17), HA user roles (D18), backup plan (D19), domain purchase path (D20), and voice feasibility first (D21).
- Recorded networkpi facts from the owner's terminal output: aarch64, 905 MB RAM, SD reported at 29.1 GB (I2), IP 192.168.1.39. The `os-release` command had a typo (I3).
- Created `docs/devices.md`, `docs/issues.md`, `docs/milestones.md`, `docs/voice-feasibility.md`, `HANDOFF.md`.

## Findings
- HA OS cannot run Raspberry Pi Connect (I4).
- The Spectrum router may not support DHCP reservation or custom DNS (I1). AdGuard is built last for this reason.
- Nuvio cannot run on an ESP32 display (I5).

## Resume point
Phase A build, once the owner closes the open items in `HANDOFF.md`: networkpi hardening and stable IP, then Claude Code CLI with `/remote-control`, then the Samba backup target, Cloudflare Tunnel, and monitoring.

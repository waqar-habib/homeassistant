# Session 2026-10-30: dashboard review (Glass Cards, Nuvio) and close

## Completed
- Reviewed the project docs for the custom dashboard goal. Status: decided (D1 Nuvio, D2 Minimalist Glass, D18 views), not started. M9 was "To do", `dashboards/` empty, no Nuvio install recorded.
- Researched Martin Argalas's Glass Cards (`martinargalas/glass-cards`, MIT, HA 2025.1+, latest release v1.10.11). README lists 27 cards: Clock and weather, Calendar, Room, Lights, Thermostat, Dock, and others. No prayer card. The `glass.argalas.org` site and its `/docs/demo` page are client-rendered; only the title could be read.
- Owner viewed the live demo in the HA iOS Companion app (sample data, not our entities). Layout matches D2 except calendar and next prayer.
- Owner installed Glass Cards through HACS on the Pi 5 (UI change, not in repo). Sidebar shows a "Glass demo" item. Not verified from this session: the Pi 5 is not reachable from here, and the repo is a clone, not the live `/config`.
- Answered: Claude in Chrome is a desktop Chrome extension and does not run on iOS (no official source confirmed).
- Searched for Nuvio's HACS repository. Not found. Nuvio's repo URL is not recorded anywhere in the repo.

## Decisions
- No change to D1 (Nuvio is the planned engine) or D2 (Minimalist Glass). Glass Cards is a test candidate, not yet a decision. Record the outcome as a new decision after the test.

## Problems
- Nuvio's source is unknown (I13).
- Glass Cards install on the Pi 5 is owner-reported only: resource load and pre-install backup are unconfirmed (I14).
- Phase B (networkpi Remote Control) was due 2026-10-25. No record since 2026-10-24. Status unknown.

## Resume point (CLI)
1. Confirm Glass Cards on the Pi 5: resource loaded in Settings → Dashboards → Resources, and a `pre-glass-cards` backup exists. Record the result in I14.
2. Owner supplies Nuvio's GitHub URL. Read its README and check install steps and requirements before installing.
3. Install Nuvio via HACS (Tier 2: backup `pre-nuvio` first, `ha core check` after). Keep it on its own test dashboard. Do not change the Nuvio dashboard.
4. Draft the throwaway test dashboard on our real entities (`docs/entities.md`): clock and weather, rooms, lights, thermostat, calendar, next prayer gap.
5. Owner reports networkpi Phase B status (ran or not). Then continue with I12.

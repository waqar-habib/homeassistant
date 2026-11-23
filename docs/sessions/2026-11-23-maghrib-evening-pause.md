# Session 2026-11-23: Maghrib and evening lights paused

**Owner GREEN LIGHT (Tier 3):** disable Adhan Maghrib and the two evening light automations until 23:59 CST 2026-11-23; re-enable them at 00:00 CST 2026-11-24.

## Done
1. Backup `pre-pause-maghrib-evening-2026-11-23` (slug `73f936a4`). `ha core check` passed.
2. Turned off at 17:13 CST (Maghrib due about 17:31): `automation.adhan_maghrib`, `automation.evening_all_lights_on_at_sunset_except_nursery`, `automation.evening_away_lights_on_for_2_hours_when_no_one_is_home`.
3. One-time resume package `packages/maghrib_evening_resume_2026_11_24.yaml` (commit `9cc6699`, branch `chore/pause-maghrib-evening-2026-11-23`). It turns the three back on at 00:00:00 on 2026-11-24, then turns itself off. Entity `automation.one_time_re_enable_maghrib_and_evening_lights_on_2026_11_24` loaded after reload.

## Decisions
- "Evening lights automation" read as both evening light automations, matching the 2026-11-18 precedent.
- "Re-enable all automations" read as the three turned off. Two expired 2026-11-18 one-time automations stay off on purpose. No other automation was off.

## Resume point
- Next: at 00:00 CST 2026-11-24, confirm the three automations are on and the one-time automation is off (`automation.one_time_re_enable_maghrib_and_evening_lights_on_2026_11_24`).
- Cleanup: remove the expired 2026-11-18 one-time packages in a later Tier 2 change.

# 2026-11-15 Nursery lamp at sunset (I47) and presence question

## Done
1. Owner report: the Nursery lamp turned on at sunset while the baby slept. Checked all automations and groups. No HA groups exist (Upstairs, Downstairs, Nursery are dashboard-only).
2. Cause: `automation.evening_away_lights_on_for_2_hours_when_no_one_is_home` (id `evening_away_lights_120_min`) listed `light.nursery_floor_lamp` (owner request 2026-11-14). It ran 17:33:37 CST; lamp on 17:33:38, off 17:33:46. The other evening automation excludes the Nursery and did not touch it.
3. Both evening packages existed only on branch `feat/evening-lights`; HA ran them from memory (`automations.yaml` is `[]`).
4. Fix: backup `pre-evening-nursery-fix` (slug 384f9774). Branch `fix/evening-away-no-nursery` restored both packages and removed the lamp from the turn_on and turn_off lists (four lights remain: console lamp, game room, dresser, side table). `ha core check` clean, merged to main (`e51a4e0`, merge `752fa57`), pushed. I47 logged (`5f62b1d`).
5. Live: a background job reloaded automations at 19:33:44 CST after the 2 h run ended. The automation is `on`, `current: 0`. Not yet confirmed by a real sunset run.

## Presence finding (owner question: why did "Evening Away" fire with the owner home?)
- Condition counts `person` states exactly `home`. At 17:33:37 both persons were `Neighborhood`.
- `zone.home` radius is 10 m; `zone.neighborhood` is 1000 m. Phone GPS drift inside the house resolves to Neighborhood. Owner history shows `home` to `Neighborhood` flips all day.
- This is I27 and I43 in practice. Options offered: (1) widen `zone.home` to about 100 m (recommended, Tier 3, needs GREEN LIGHT); (2) count Neighborhood as home (poor fit); (3) add Wi-Fi presence as a second signal.

## Decisions pending (owner)
1. GREEN LIGHT to widen the Home zone, or choose another option.
2. Remove Nursery lights from `scene.turn_on_lights` and `scene.turn_off_lights` (manual scenes, still include them).

## Resume point
- Watch tomorrow's sunset run (about 17:33 CST): confirm the Nursery lamp stays off.
- After the owner's choice on presence, update the Evening Away condition or zone; record the decision in `docs/decisions.md`.
- Unchanged: tablet render of `habib-lab` (I46), then P3 to P5.

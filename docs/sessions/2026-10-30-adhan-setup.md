# Session 2026-10-30: Adhan setup (M12, D28/D29/D34), partial stop before masjid comparison

Ran `docs/prompts/pi5/2026-10-30-adhan-setup.md` (committed as `2729082`; the request named `2029082`, which does not exist; the file matches `2729082`). Tier 3, partial GREEN LIGHT (setup only, toggle OFF), quoted in the header.

## Completed
- Pre-checks: HA 2026.10.4, no update. `ha core check` clean. ha-mcp connected.
- Backup: `pre-adhan`, slug `b4a1a3aa`, confirmed.
- Integration: `Islamic Prayer Times` is already loaded (entry `01M5P8SA1MQ8N7TG5SSE10YCCV`). Options: `calculation_method` isna, `school` shafi, `midnight_mode` standard, `latitude_adjustment_method` middle_of_the_night. The owner did steps 1 and 2 (not verified by the owner's words, only the entry).
- Read-only step 5:
  - a. Prayer sensors: `sensor.living_room_adhan_fajr_prayer`, `..._dhuhr_prayer`, `..._asr_prayer`, `..._maghrib_prayer`, `..._isha_prayer`.
  - b. `/media/Adhan.mp3` and `/media/Fajr.mp3` exist with that spelling.
  - c. `media_player.living_room_living_room_homepod` and `media_player.master_bedroom_homepod` both report `volume_level` (0.55 and 0.592). `supported_features` 448439 includes VOLUME_SET (bit 4).
  - d. `notify.waqars_iphone` exists.

## Times (read-only, from the sensors; Chicago local, CDT)
| Prayer | Sensor state (UTC) | Local |
|---|---|---|
| Fajr | 2026-10-30 11:37 | 06:37 |
| Dhuhr | 2026-10-30 18:15 | 13:15 |
| Asr | 2026-10-30 21:22 | 16:22 |
| Maghrib | 2026-10-30 23:45 | 18:45 |
| Isha | 2026-10-31 00:52 | 19:52 |

Masjid comparison (step 4) is not done. The owner has not given today's masjid times.

## Not done
- Step 4 (masjid comparison). Step 6 (write `packages/adhan.yaml` on `feat/adhan`). Step 7 (validate and load, with the toggle OFF).
- Nothing played. No `media_player` action, script call, or toggle change. No notifications sent.
- HomePods are playing unrelated media at the time (Living Room "Bubble Pop", Bedroom "Hello Song"). This is not an Adhan concern.

## Resume point
1. Owner gives today's masjid times (five prayers). Claude compares against the table above. If any prayer is more than 2 minutes off, stop and report; do not change offsets.
2. Then continue at prompt step 6 (branch `feat/adhan`, `packages/adhan.yaml` with the real sensor IDs above, toggle created OFF), step 7 (`ha core check`, reload input_boolean, script and automation, check the toggle is OFF, nothing played), and step 8.
3. Owner confirms steps 4 and 7 before the merge to `main`. The live test needs its own GREEN LIGHT.

## Completed after owner GREEN LIGHT (all create, read and update; live tests held)
- Owner verified all five prayer times and integration settings (ISNA, Shafi, standard midnight).
- Branch `feat/adhan`, commit `6316775` `feat(adhan): add prayer-time Adhan package, switched off`, fast-forwarded to `main` and pushed.
- `packages/adhan.yaml`: `input_boolean.adhan_enabled` (created OFF, `initial: false`), `script.adhan_play`, `script.adhan_play_one`, `automation.adhan_prayer_times` (five time triggers on the real sensors, guarded by the toggle).
- `ha core check`: clean before reload.
- Reloaded `input_boolean`, `script`, `automation` through ha-mcp. No restart.
- Verify: `input_boolean.adhan_enabled` OFF. Scripts exist (off, never triggered). `automation.adhan_prayer_times` on, never triggered. HomePods and `notify.waqars_iphone` unchanged since before the reload.
- Not done (held by owner): no play, no volume set, no script call, no toggle change, no live test. The toggle stays OFF.

## Problems
- **Geofence automation is live and unlocks the door.** `automation.front_door_geofence_auto_lock_unlock` is loaded. Its config is in an uncommitted `automations.yaml` change, which Claude did not make. Reloading automations did not change it (loaded config matches the file), and it was not triggered. It needs an owner decision (I18).
- The package's automation config can't be read with `ha_config_get_automation` (that tool only reads UI-stored automations). The trigger sensors and the load were verified by the entity state and by `ha core check`.
- The commit ID in the prompt header (`2029082`) was wrong; the prompt file is `2729082`.

## Resume point
1. Owner decides on the geofence automation (I18).
2. Live Adhan test (I17) waits for a separate GREEN LIGHT, with the baby awake and the owner in the room. Outline in the prompt file's "Later: live test" section.
3. Scenes (M11): owner tests, then merge `feat/scenes` (I19).

# 2026-11-25 Automation cleanup and entity check (Pi 5)

Backup `pre-automation-cleanup` (slug `34e7962a`). Branch `fix/automation-cleanup`, merged to `main` as `60c1fd5`. Owner answers recorded as D82.

## 1. Entity check (read only, 359 entities, 35 domains)
- Full listings read: 42 switches, 7 `unavailable`, 12 `unknown` sensors, 48 integrations, system health, repairs. Not read: error log contents.
- About 20 switches were missing from `docs/entities.md` (3 TP-Link KS205, 8 Rain Bird, GE and LG appliances, Ring). Addendum written (I72).
- Core 2026.11.3 current; disk 19.6 of 56.6 GB; recorder 18.6 MB; both persons home.
- Pending updates: Claude Terminal Pro 2.5.8 to 2.5.10 (auto-update, restarts this terminal), Hatch integration v1.32.6 to v1.34.0 (needs a restart). Neither applied.

## 2. Changes made (one commit each, all `ha core check` clean, reloads only, no restart)
| Commit | Change | Verified |
|---|---|---|
| `6447677` | Garage arrival notices: `notify.send_message` with `target: entity_id` (I62) | Test notice: `notify.waqars_iphone` and `notify.mahams_iphone` timestamps both updated at 19:43:46 UTC |
| `635be55` | `packages/outdoor_lights.yaml`: `switch.outdoor_porch` and `switch.outdoor_driveway` on at sunset, off at sunrise, no presence condition, resync on HA start and on return from `unavailable` | Manual trigger ran and finished (state stayed off, sun above horizon). **Sunset 2026-11-25 about 17:30 CST and sunrise 2026-11-26 07:06 CST not yet observed** |
| `8674078` | `packages/location_refresh.yaml`: `request_location_update` to both iPhones every 30 minutes | Manual trigger ran and finished. Not yet confirmed that the device trackers updated |
| `95cf070` | Evening all-lights: only when `zone.home` count above 0, Matter Porch excluded; Evening Away uses native `zone.home` below 1 (A3, A4, A11) | Reload clean; first run at sunset |
| `ffe0b1f` | `packages/arrival_804_lock.yaml`: dry run, `input_boolean.arrival_804_live` OFF; low-battery notice below 20% (I70) | Entities exist, all off. No arrival yet |
| `14df0bf` | Deleted `adhan_maghrib_reenable_2026_11_18.yaml`, `evening_reenable_2026_11_18.yaml`; removed 3 `automation.one_time_re_enable_*` registry entries (owner GREEN LIGHT) | 15 automations, all `on`, none `unavailable` |
| `254ab88` | `logger: logs: aidot: error` in `configuration.yaml`; also set live with `logger.set_level` | File takes effect at the next restart |

Also: garage `service_not_found` repair ignored (cause fixed).

## 3. Not fixed, and why
1. **Activity sensors `unavailable` (I51):** needs the iPhones. Guide given in chat.
2. **Cloud subscription repair (I69):** cannot be fixed. Backups already skip `cloud.cloud` (03:00 backup on 11-25).
3. **Living Room TV:** unplugged, backlog (I10). Ping to 192.168.1.208 fails.
4. **Matter Porch flakiness (I71):** ignored by owner decision.
5. **804 lock battery 27% (I70):** notice automation added; the owner replaces batteries.
6. **Router DNS `192.168.1.1` still in Pi nameservers:** owner UI step (D74).
7. **A5, A6 (Adhan, Tier 3), A7 (AiDot re-login), A10 (scenes):** not part of this request.

## 4. Resume point
1. After sunset (about 17:30 CST) read the traces of `automation.outdoor_porch_and_driveway_on_at_sunset_off_at_sunrise`, `automation.evening_all_lights_on_at_sunset_except_nursery`; confirm Porch and Driveway are on, and that the Matter Porch no longer comes on from the evening automation.
2. After sunrise 2026-11-26 confirm both are off (and whether the Matter 07:05 off conflicts).
3. Confirm the 30 minute location requests move `device_tracker` timestamps.
4. Owner: Activity and Motion & Fitness, then 3 real arrivals per person (I51); decide on the evening plug lamps (I53); 804 live switch only with an explicit GREEN LIGHT.

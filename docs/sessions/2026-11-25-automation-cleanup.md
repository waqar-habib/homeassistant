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

## 5. Afternoon: phone sensors, cloudhook, cloud logout (partial stop, 2026-11-25 about 15:30 CST)
1. **Activity sensor:** unavailable since 11-15 and `unknown` in the app. Owner turned on Fitness Tracking and Motion & Fitness; the app still said `unknown`. Other phone sensors were disabled in HA (`disabled_by: integration`); Claude enabled 9 on `waqars_iphone` (D83 list).
2. **Root cause of no data (I73):** the Webhook screen showed Currently used = Cloudhook (`hooks.nabu.casa`). With Cloud lapsed the cloudhook is dead, so nothing from the app reached HA after about 11-24 13:05. Dashboard still loaded because the WebSocket uses the tunnel URL.
3. **Fix (owner GREEN LIGHT, D83):** backup `pre-cloud-logout` (3d31a84b); owner logged HA Cloud out, tapped Sync, saw Webhook switch to the External URL, set the home Wi-Fi for the Internal URL and switched the sensors on in the app. HA restarted 15:14 CST (not by Claude). After: 15 automations all on, live switches OFF.
4. **Verified 15:25:** Activity `Stationary` (High), Audio Output `Built-in Speaker`, Focus `off`, Connection `Wi-Fi`, Location permission `Authorized Always`, Steps 632, Last Update Trigger `Periodic`, tracker `home` (accuracy 12 m, report 15:24).
5. **Maham (I74):** no location since 2026-11-15 23:43. Earlier claim "home since 11-21" was wrong: the history window was 4 days. Owner configures her phone when she returns.
6. **Resume:** (a) car test when the owner next leaves: Activity should read `Automotive`, Audio Output should change to the car or CarPlay; then Claude recommends the final garage rule (Activity or Audio Output); `arrival_garage_live` stays OFF; (b) Maham's phone (I74); (c) the sunset and sunrise checks from section 4; (d) optional 6 hour silent-tracker alert; (e) the two pending updates (Hatch v1.34.0, Claude Terminal Pro 2.5.10) wait for a prayer-safe restart window.
7. **Reminders sync (owner, 2026-11-25 15:00 CST):** the owner enabled two-way sync between the Home Assistant app and iOS Reminders for the shopping list, for later dashboard work. HA wrote `.shopping_list.json` (9 items); it is now in `.gitignore` (`e46886e`) because the repo is public until D25. To confirm when the dashboard work resumes: one list only (`todo.shopping_list`), edits both ways, and whether Maham's phone needs the same setup (I74).

## 8. End of session state (2026-11-25, Pi 5)
- `main` and `origin/main` match; branch `fix/automation-cleanup` is merged (`60c1fd5`) and can be deleted later.
- Backups: `pre-automation-cleanup` (34e7962a), `pre-cloud-logout` (3d31a84b).
- Live switches `arrival_garage_live` and `arrival_804_live`: OFF. Nothing was opened or unlocked.
- Not yet observed: first sunset and sunrise runs of the outdoor lights (section 4), the 30 minute location refresh over several cycles, and the car test.


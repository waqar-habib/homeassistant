# Transition: Apple Home to Home Assistant

Status as of 2026-11-04. Facts come from `docs/entities.md`, the HomeKit Bridge facts in D38/I7, the Nuvio review in `docs/sessions/2026-11-04-habib-home-redesign.md`, and read-only HA checks. Anything not visible from here is marked **unknown**.

| Apple Home feature | HA equivalent | Status | Owner action |
|---|---|---|---|
| Room tiles (lights per room) | `habib-home-v2`, rooms section with tiles for each light | Needs test (built 2026-11-04, not yet tested on devices) | Run the morning checklist in the session note |
| Favorites | `habib-home-v2`, Favorites section (both thermostats, Front Door) | Needs test | Same checklist |
| Summary chips (climate, lights, security, speakers) | `habib-home-v2`, one markdown summary line (not a chip row) | Partial (shows the values, no tap-through) | Say if the line is enough |
| Scenes (Bedtime, Turn Off Lights) | None live. Scenes on `feat/scenes` (Good Night, Leaving, Lock Up, Welcome Home, Evening, Movie Night) are not merged; Hatch scenes are in HA but not on the dashboard | Gap | Planning session for scenes (M11, I19) before any merge |
| Automations in Apple Home that HA does not replace | **Unknown.** Not listed in the repo. The Apple Home automation list is not visible from here | Unknown | Owner lists the Apple Home automations |
| Presence and geofencing (arrive home, unlock) | None. The I18 geofence automation was deleted 2026-11-04 (D40) | Gap | Decide whether to rebuild (notify-only, D32) |
| HomePod control (Living Room, Bedroom) | `media_player.living_room_living_room_homepod`, `media_player.master_bedroom_homepod` (Apple TV integration), tiles open more-info | Partial (play or pause state and more-info; not tested from the dashboard) | Test on the iPhone |
| Adhan (prayer call) | Automations, scripts and the `input_boolean.adhan_enabled` toggle were deleted (2026-11-08). Prayer-time sensors (`sensor.living_room_adhan_*`) stay live for the prayer card. Live test not done | Gap (no playback path) | Owner picks the time for the live test (M12, I17) |
| Front door lock | `lock.living_room_front_door` (Z-Wave, Zooz stick). Dashboard tile opens more-info; no one-tap lock or unlock. Apple Home also shows it as an accessory | Works in HA | Owner confirms the more-info tile behaviour |
| Thermostats (downstairs, upstairs) | `climate.downstairs`, `climate.upstairs` (Matter, shared with Apple Home). Dashboard tiles show temperature and open more-info | Works in HA (set from more-info) | Test setpoint changes from more-info |
| Hatch lights (Nursery) | `light.nursery_hatch_light`, `light.nursery_hatch_clock` in HA and on the dashboard. Excluded from the HomeKit Bridge (owner, D38) | Works in HA only, not in Apple Home (by choice) | None unless the owner wants them in Apple Home |
| Notifications | `notify.waqars_iphone` (mobile app) exists. Household notifications and their routing are **unknown** | Unknown | Owner says what Apple Home notifies about today |
| Home app widgets | None on HA side for the Home app. The HA Companion app has widgets, not tested | Unknown | Owner checks the Companion app widgets |
| Siri | Not set up. Voice feasibility (F1 to F4) not done | Gap | Voice feasibility tests (backlog) |
| Apple Home access for guests (MKH) | Dashboard works on the same URL, but MKH's account and permissions are not set up | Gap | Owner decides when MKH onboards (D41) |

## Notes
- The HomeKit Bridge (HA to Apple Home) exposes lights and the lock, as of 2026-10-30 (`docs/entities.md`). Nothing in this table changes the bridge.
- Remote access works through `https://ha.thehabibfam.cc` (D39). Nabu Casa stays until geofencing is decided.
- "Works in HA" means the entity is present and reports state. It does not mean the owner has tested it from the dashboard.

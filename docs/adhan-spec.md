# Adhan automation spec (confirmed 2026-11-12)

Status: specs confirmed by owner, 2026-11-12. Build and enable are separate steps (D34). Owner GREEN LIGHT needed for enabling and any live playback.
Milestone: M12. Issue: I17. Decisions: D29 (volume and schedule, updated by D49), D34 (ships OFF, fail closed), D50 (helper).

## Confirmed specs

| # | Item | Confirmed spec |
|---|---|---|
| 1 | Production volume | **0.35** for every Adhan. Supersedes the 20% in D29. Owner heard 0.35 on the Bedroom HomePod in the passed run 2 and 0.592 was too loud |
| 2 | Restore target | The speaker's `volume_level` read at trigger time, before the change. Not a fixed number |
| 3 | Schedule and speakers | Fajr: `media_player.living_room_living_room_homepod` only, with `Fajr.mp3`. Dhuhr, Asr, Maghrib, Isha: `media_player.living_room_living_room_homepod` and `media_player.master_bedroom_homepod`, each with `Adhan.mp3` |
| 4 | Prayer-time source | `islamic_prayer_times` integration, ISNA method, standard (Shafi) Asr (D28). Before go-live, compare the five times with the masjid timetable for the day. Do not adjust offsets without the owner |
| 5 | Gate | `input_boolean.adhan_enabled` recreated, **OFF**. Only the owner switches it on |
| 6 | Quiet or baby rules | None built. Owner decides later; nothing is added without a stated rule |
| 7 | Failure behavior | On failure: stop playback (`media_player.media_stop`), restore the saved volume, notify via `notify.send_message` to `notify.waqars_iphone`. Dry-run the notice before go-live |
| 8 | Restart gap | Accepted, with a startup check: store the saved volume in `input_number.adhan_saved_volume` before the change. On HA start, if the stored value is set, restore it and clear the helper |
| 9 | Test before go-live | One supervised run each of `Adhan.mp3` and `Fajr.mp3` on the Living Room HomePod, with the owner present |
| 10 | Build path | New branch `feat/adhan-automation`. One commit. `ha core check` must pass. Toggle left OFF. Enabling is a separate GREEN LIGHT |

## Fail-closed rules (D34)

- If the current volume cannot be read, or the set to 0.35 does not read back within 0.02, do not play. Notify.
- If the prayer-time sensor is unavailable or unknown, do not play.
- If `input_boolean.adhan_enabled` is OFF, do nothing.

## Playback sequence (per trigger)

1. Gate and sensor checks above. Stop if any fails.
2. Read `volume_level` as V0. Write V0 to `input_number.adhan_saved_volume`.
3. Set volume to 0.35. Read back. Fail closed if not 0.35 within 0.02.
4. `media_player.play_media` with `media-source://media_source/local/<file>`, `media_content_type: music`, `wait: false`.
5. Wait for state `playing` (timeout 30 s), then for not `playing` (timeout 900 s). The tested file is 150.9 s.
6. Restore V0. Read back. Clear `input_number.adhan_saved_volume`. Retry once on mismatch.
7. On any failure in 2 to 6: `media_player.media_stop`, restore V0 if known, notify.
8. On success: notify "Adhan <file> ran on <speakers>, volume restored" (owner request, 2026-11-12, so the owner knows each run executed).

## Helpers (created by the build, OFF or at 0)

- `input_boolean.adhan_enabled`: OFF.
- `input_number.adhan_saved_volume`: min 0, max 1, step 0.01, initial 0.

## Open items after build

- Masjid timetable comparison (spec 4), done by owner or Claude with owner present.
- Dry-run notice (spec 7).
- Supervised runs for `Adhan.mp3` and `Fajr.mp3` on the Living Room HomePod (spec 9).
- Owner GREEN LIGHT to enable (D34).
- Quiet-hours rules, if the owner wants any (spec 6).
- The repo copy of the test script (`docs/prompts/pi5/2026-11-12-adhan-e2e-test.md`) still has the old 0.2 and old notify path. Update it to match the passed run 2 version, or retire it.

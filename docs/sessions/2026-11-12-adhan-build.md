# Session 2026-11-12: Adhan build (Pi 5, toggle OFF)

Prompt: `docs/prompts/pi5/2026-11-12-adhan-build.md` (commit `a65926e`). Owner GREEN LIGHT given in the session to execute all actions in the prompt. Milestone M12, issue I17, decisions D34, D49, D50.

## Pre-flight (read-only)
- Speakers exist and are idle: `media_player.living_room_living_room_homepod` (volume 0.55), `media_player.master_bedroom_homepod` (volume 0.592).
- `notify.waqars_iphone` and `notify.send_message` exist.
- Prayer sensors (timestamp, `islamic_prayer_times`): `sensor.living_room_adhan_fajr_prayer`, `..._dhuhr_prayer`, `..._asr_prayer`, `..._maghrib_prayer`, `..._isha_prayer`.
- `input_boolean.adhan_enabled` and `input_number.adhan_saved_volume` did not exist.
- `configuration.yaml` already has `homeassistant: packages: !include_dir_named packages`. `packages/` held only `.gitkeep`. No config change needed.

## Backup and branch
- Backup `pre-adhan-build`, slug `b7f421f8`, listed by `ha backups list`.
- Branch `feat/adhan-automation` from `main`.

## Build
- `packages/adhan.yaml` written. Commit `bc0b8c5`, `feat(adhan): build automation with toggle OFF (D49, D50)`, pushed to origin. Not merged.
- Contents: helpers (`adhan_enabled` off, `adhan_saved_volume` 0, slider 0 to 1 step 0.01); script `adhan_play` (fields `media_file`, `speakers`; gate, V0 read with fail-closed, save V0, set 0.35 with read-back, play, wait for playing 30 s, wait for not playing 900 s, stop on failure, restore per speaker with one retry, outcome notify); automations `adhan_fajr` (Living Room only, Fajr.mp3), `adhan_dhuhr`, `adhan_asr`, `adhan_maghrib`, `adhan_isha` (both HomePods, Adhan.mp3), each gated by the toggle and a non-unknown sensor; `adhan_startup_restore` (trigger `homeassistant` start).

## Validation and reload
- `ha core check`: command completed successfully.
- Reload only: `input_booleans`, `input_numbers`, `scripts`, `automations`. All succeeded. No restart.

## Verification (read-only)
- `input_boolean.adhan_enabled` exists, state `off`.
- `input_number.adhan_saved_volume` exists, state `0.0`.
- `script.adhan_play` exists, state off, mode single.
- `automation.adhan_fajr`, `_dhuhr`, `_asr`, `_maghrib`, `_isha` exist, state on. Their gate is the toggle (off), so they will not fire.
- `automation.adhan_restore_stuck_volume_on_start` exists, state on (the entity ID comes from its alias, not its config id).
- Trigger sensors checked against the file and the sensor list: each matches its prayer.
- No media call was made. Speaker volumes unchanged: 0.55 and 0.592.

## Deviations from the prompt and spec
- `media_player.play_media` has no `wait` field, so `wait: false` was not written. The action returns without blocking; the script's explicit waits handle the rest.
- The prayer automations call `script.adhan_play` directly, so each automation run stays open for the length of playback (single mode).
- The startup check clears the helper after notifying, as the spec says. If the restore did not read back, the notice says so, but the helper is cleared anyway. This is the spec's order; the owner can change it.
- Two speakers share one saved-volume helper. Only the first speaker's V0 is written to it (spec). The other speaker's V0 is held in script memory, so a restart mid-Adhan can restore only the first speaker.

## Not done (needs owner)
- Masjid timetable comparison (spec 4): owner confirmed on 2026-11-12 that the prayer times shown in the integration are correct. No day-by-day comparison was recorded.
- Dry-run of the failure notice (spec 7): DONE 2026-11-12 at 17:39 Central, owner GREEN LIGHT B. Toggle ON for about one second, then OFF. `script.adhan_play` called with `Fajr.mp3` and a nonexistent speaker (`media_player.dryrun_no_such_speaker`). Trace (run `292dc240...`): gate passed, "volume unreadable" fail, playback and volume steps skipped, failure notice sent: "Adhan Fajr.mp3 FAILED on media_player.dryrun_no_such_speaker: volume unreadable. Check the speakers." No audio, no volume change. Speakers after: 0.55 and 0.592, unchanged. Toggle confirmed OFF. Notice delivery to the iPhone not visually confirmed by Claude; owner to confirm receipt.
- Supervised runs of `Adhan.mp3` and `Fajr.mp3` on the Living Room HomePod (spec 9).
- GREEN LIGHT to enable the toggle (D34), and to merge `feat/adhan-automation` to `main`.

## Resume point
Owner to plan the supervised runs. Enabling and merging need a separate GREEN LIGHT.

## Enabled (owner GREEN LIGHT, 2026-11-12, 17:43 Central)
- Owner GREEN LIGHT to enable now, after an end-to-end check (clean `ha core check`, 6 automations loaded, failure path dry-run clean). Owner was told that tonight's Isha (18:44) would play `Adhan.mp3` on both HomePods at 0.35 without a supervised run first.
- `input_boolean.adhan_enabled` set to ON at 17:43. Speakers at 0.55 and 0.592 at enable time.
- Still open: supervised runs of `Adhan.mp3` and `Fajr.mp3` (D49 spec 9, not yet done). Owner to record the outcome of tonight's Isha.
- Merge: the feature commit is on `main` as `6818808` (replayed, not a merge commit; package identical to `feat/adhan-automation` `bc0b8c5`).

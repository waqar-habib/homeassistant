# Prompt: Adhan HomePod playback test (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-11-12
Tier: 0 for Part A (read-only). Tier 3 for Part B (plays audio on the HomePods).
GREEN LIGHT: Part A not needed. Part B **not given**. Do not run Part B until the owner gives a GREEN LIGHT in chat, with the baby awake and the owner in the room (I17). Record the owner's exact words and the date in the results file, not here.

Milestone: M12. Issue: I17. Decisions: D29, D34.

## Purpose

The earlier Adhan automations never played on the HomePods, and they were deleted untested. This test answers three questions before any automation is rebuilt:

1. Can HA play a local MP3 on each HomePod through the `apple_tv` integration?
2. Can the speaker's previous volume be read, set to 20%, and restored afterward?
3. Does `music_assistant.play_announcement` (if Music Assistant has a HomePod player) play a URL on the HomePod?

The test does **not** build or enable any automation. It does not touch `input_boolean.adhan_enabled`, any script, or the Adhan package.

## Hard rules

- Do not play `Adhan.mp3` or `Fajr.mp3`. Test audio is `test-tone.mp3` only (see Part B, step 1).
- Do not enable `input_boolean.adhan_enabled`. Do not create, edit or enable any automation or script.
- Do not call any `lock.*` service. Do not touch `lock.living_room_front_door` or any `switch.804_*` entity.
- Do not restart HA or the Pi. Do not reload the HomePod integration.
- No YAML changes in this run, so `ha core check` is not needed. If you change any YAML, stop and tell the owner.
- No secrets, tokens or passwords in any file or commit. Do not print `secrets.yaml`.
- Entity IDs come from `docs/entities.md` or the registry. Do not guess them.
- If a step fails, stop that test, record the error text, and continue only with the tests that do not depend on it. Do not retry a failed playback more than once.

## Part A: Read-only checks (Tier 0, run now)

1. Read the state and attributes of these entities and record them:
   - `media_player.living_room_living_room_homepod`
   - `media_player.master_bedroom_homepod`
   Record `state`, `volume_level`, `is_volume_muted`, `supported_features` (decode the bits: VOLUME_SET, PLAY_MEDIA, MEDIA_ANNOUNCE, BROWSE_MEDIA), and `media_content_type`.
2. Check whether the media folder has the test inputs. Do not play anything:
   - `/media/Adhan.mp3` and `/media/Fajr.mp3` exist (record size only)
   - `/config/www/` exists and is writable
3. Check whether Music Assistant is installed and lists a HomePod player (`music_assistant` integration, or entities whose names match the HomePods). Record the entity ID if found, or "not found".
4. Read the `apple_tv` integration's recent log lines for media errors (last 200 lines of the HA log, filtered on `apple_tv` and `media`). Record any "media streaming" errors with timestamps.
5. Stop here and write the Part A results. Do not continue to Part B on your own.

**Decision point A (owner):** If `volume_level` is missing on either HomePod, or `VOLUME_SET` is not in `supported_features`, report that. Part B can still run as a read test, but the fail-closed rule in D34 means no Adhan can play on that speaker. Ask the owner before going on.

## Part B: Live playback test (Tier 3, needs GREEN LIGHT)

Only run this after the owner's GREEN LIGHT in chat. Tell the owner before each audio step, and wait for their reply that it is safe to play.

1. Create `test-tone.mp3`: a 3-second tone at low level. Use `ffmpeg` if installed (`-f lavfi -i "sine=frequency=440:duration=3" -af volume=0.2`). Save it to `/media/test-tone.mp3` and copy it to `/config/www/test-tone.mp3`. If `ffmpeg` is missing, ask the owner to supply a short MP3 and stop until they do.
2. Read `volume_level` on `media_player.living_room_living_room_homepod` and record it as `V0`.
3. Set that HomePod to 0.2 with `media_player.volume_set`. Read it back and record it as `V1`. If `V1` is not 0.2, stop Part B and record why.
4. **Test B1 (`/media` path):** call `media_player.play_media` on the Living Room HomePod with `media-source://media_source/local/test-tone.mp3`, `media_content_type: music`. Ask the owner whether they heard it. Record: service call result, errors, time to start, owner's answer.
5. **Test B2 (`/local` path):** same call with `media-source://media_source/local/test-tone.mp3` only if B1 failed. Otherwise skip and say why. Use the `www` copy (`/local/test-tone.mp3`) if the media_source name differs. Record the same fields.
6. **Test B3 (Music Assistant):** only if Part A step 3 found a HomePod player. Call `music_assistant.play_announcement` with `url` set to the test file's URL on the Pi (`http://192.168.1.36:8123/local/test-tone.mp3`) and `announce_volume: 20`. Record the same fields. Skip with a reason if MA has no HomePod player.
7. **Restore check (for each test that played):** after the tone ends (about 5 s), read `volume_level` again. Record `V2`. Pass only if `V2` equals `V0` within 0.02. If not, set the speaker back to `V0` with `media_player.volume_set`, read it again, and record that as the restore result. Report the mismatch to the owner.
8. **Failure notice:** if any test errors, confirm the failure notice would go to `notify.waqars_iphone`. Do not send a test notification unless the owner asks.

## Results to record

Write `docs/sessions/2026-11-12-adhan-playback-test.md` (Tier 1 notes). Include:

| Test | Entity | Path | Played (owner) | Error | V0 | V1 | V2 | Restored | Notes |
|---|---|---|---|---|---|---|---|---|---|
| A1 | both HomePods | read | n/a | | | | | n/a | attributes |
| B1 | Living Room HomePod | apple_tv, `/media` | | | | | | | |
| B2 | Living Room HomePod | apple_tv, `/local` | | | | | | | or skipped and why |
| B3 | HomePod via MA | `play_announcement` | | | | | | | or skipped and why |

Also record: the owner's GREEN LIGHT text and date, which steps the owner allowed, and the final volume on each HomePod.

Then update `docs/issues.md` I17 with the result, and say which path (if any) passed the restore check. Do not change `docs/decisions.md` in this run.

## Output to the owner

Reply with: the results table, the pass or fail verdict for each test, the decision point answer from Part A, and the next step. Keep it short. Do not propose rebuilding the automations until the owner has read the result.

## Commit

Tier 1 commit: `docs(session): Adhan HomePod playback test results`. Push to the branch the owner names. Do not push to `main` unless the owner asks.

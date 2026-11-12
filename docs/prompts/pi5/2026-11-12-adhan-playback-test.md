# Prompt: Adhan HomePod playback test (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-11-12
Tier: 3 (plays audio on the HomePods)
GREEN LIGHT: yes (2026-11-12). Owner's words in chat: "GREEN LIGHT". Scope: this combined test as written in this file, nothing else. Not covered: enabling `input_boolean.adhan_enabled`, any automation or script, the Adhan package, or any change to the front door lock. The owner still confirms each audio step in chat (step 6).

Milestone: M12. Issue: I17. Decisions: D29, D34.

## Purpose

The earlier Adhan automations never played on the HomePods, and they were deleted untested. This test answers three questions before any automation is rebuilt:

1. Can HA play a local MP3 on each HomePod through the `apple_tv` integration?
2. Can the speaker's previous volume be read, set to 20%, and restored afterward?
3. Does `music_assistant.play_announcement` play a URL on a HomePod, if Music Assistant has a HomePod player?

The test does not build or enable any automation.

## Hard rules

- Do not play `Adhan.mp3` or `Fajr.mp3`. Test audio is `test-tone.mp3` only.
- Do not enable `input_boolean.adhan_enabled`. Do not create, edit or enable any automation or script.
- Do not call any `lock.*` service. Do not touch `lock.living_room_front_door` or any `switch.804_*` entity.
- Do not restart HA or the Pi. Do not reload the HomePod integration.
- No YAML changes, so `ha core check` is not needed. If you find you must change YAML, stop and tell the owner.
- No secrets, tokens or passwords in any file or commit. Do not print `secrets.yaml`.
- Entity IDs come only from ha-mcp (step 1). Do not guess them or use IDs from memory.
- If a step fails, record the error text and stop that test. Do not retry a failed playback more than once.

## Step 1: Confirm entity IDs with ha-mcp (required first)

Use the ha-mcp entity search or registry tool for each item and record the exact ID returned:

- HomePod media players: search "homepod" and "media_player". Confirm `media_player.living_room_living_room_homepod` and `media_player.master_bedroom_homepod`. If either is missing or renamed, match on area and the `apple_tv` integration. If the match is unclear, stop and ask the owner.
- Matching remote entities (`remote.living_room_living_room_homepod`, `remote.master_bedroom_homepod`): confirm they exist and record them. They are not used in this test.
- Music Assistant player entities: search "music_assistant" and "media_player". List any HomePod player IDs. This decides whether step 6 (B3) runs.
- `notify.waqars_iphone`: confirm it exists. Do not send anything.
- `input_boolean.adhan_enabled`: confirm it exists and is `off`. Read only.

Compare the ha-mcp results with `docs/entities.md` and record any difference. Use only the IDs ha-mcp confirms for the rest of the run.

## Step 2: Read-only checks (no sound)

1. Read the confirmed HomePod media players and record `state`, `volume_level`, `is_volume_muted`, `supported_features` (decode VOLUME_SET, PLAY_MEDIA, MEDIA_ANNOUNCE, BROWSE_MEDIA), and `media_content_type`.
2. Check the inputs exist without playing anything:
   - `/media/Adhan.mp3` and `/media/Fajr.mp3` exist (record size only)
   - `/config/www/` exists and is writable
3. Read the last 200 HA log lines filtered on `apple_tv` and `media`. Record any "media streaming" errors with timestamps.

**Decision point A:** If `volume_level` is missing on either HomePod, or `VOLUME_SET` is not in `supported_features`, stop before the audio steps. The D34 fail-closed rule means no Adhan could play on that speaker. Report to the owner and wait.

## Step 3: Create the test tone

Create a 3-second low-level tone with `ffmpeg` (`-f lavfi -i "sine=frequency=440:duration=3" -af volume=0.2`). Save it as `/media/test-tone.mp3` and copy it to `/config/www/test-tone.mp3`. If `ffmpeg` is missing, stop and ask the owner for a short MP3.

## Step 4: Record the starting volume

Read `volume_level` on `media_player.living_room_living_room_homepod` and record it as `V0`.

## Step 5: Set the test volume

Set that HomePod to 0.2 with `media_player.volume_set`. Read it back and record it as `V1`. If `V1` is not 0.2, stop and record why.

## Step 6: Audio tests (owner confirms each one)

Before each audio call, tell the owner which test is next and wait for their reply in chat that it is safe to play. Do not play without it.

- **B1 (`/media` path):** `media_player.play_media` on the Living Room HomePod with `media-source://media_source/local/test-tone.mp3` and `media_content_type: music`. Ask the owner whether they heard it. Record the service result, any error, time to start and the owner's answer.
- **B2 (`/local` path):** run only if B1 failed. Use `/local/test-tone.mp3` (the `www` copy) with the same fields. Otherwise record "skipped, B1 passed".
- **B3 (Music Assistant):** runs only if step 1 found a Music Assistant HomePod player. Call `music_assistant.play_announcement` with `url: http://192.168.1.36:8123/local/test-tone.mp3` and `announce_volume: 20`. Record the same fields. Otherwise record "skipped, no MA HomePod player".

## Step 7: Restore check

After each test that played, wait about 5 seconds for the tone to end, then read `volume_level` again and record it as `V2`. Pass only if `V2` equals `V0` within 0.02. If it does not, set the speaker back to `V0` with `media_player.volume_set`, read it again, and report the mismatch to the owner.

## Step 8: Failure notice

If any test errored, confirm that the failure notice would go to `notify.waqars_iphone`. Do not send a test notification unless the owner asks.

## Results to record

Write `docs/sessions/2026-11-12-adhan-playback-test.md` with:

| Test | Entity | Path | Played (owner) | Error | V0 | V1 | V2 | Restored | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Step 2 | both HomePods | read | n/a | | | | | n/a | attributes |
| B1 | Living Room HomePod | apple_tv, `/media` | | | | | | | |
| B2 | Living Room HomePod | apple_tv, `/local` | | | | | | | or skipped and why |
| B3 | HomePod via MA | `play_announcement` | | | | | | | or skipped and why |

Also record the ha-mcp confirmed IDs, the owner's GREEN LIGHT text and date, the owner's answer for each audio step, and the final volume on each HomePod.

Then update `docs/issues.md` I17 with the result and state which path (if any) passed the restore check. Do not change `docs/decisions.md`.

## Output to the owner

Reply with the results table, the verdict for each test, the answer at decision point A, and the next step. Keep it short. Do not propose rebuilding the automations until the owner has read the result.

## Commit

Tier 1 commit: `docs(session): Adhan HomePod playback test results`. Push to `main` only if the owner asks.

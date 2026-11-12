# Session: Adhan HomePod playback test (partial stop at step 6)

Date: 2026-11-12
Device: Pi 5 (Claude Terminal)
Prompt: `docs/prompts/pi5/2026-11-12-adhan-playback-test.md` (commit 44b81f6)
GREEN LIGHT: yes (2026-11-12), scope = this combined test only
Milestone M12, Issue I17, Decisions D29, D34

## Completed

- **Step 1 (entity IDs, ha-mcp):**
  - Confirmed `media_player.living_room_living_room_homepod` (Living Room HomePod)
  - Confirmed `media_player.master_bedroom_homepod` (Bedroom HomePod)
  - Confirmed `remote.living_room_living_room_homepod` and `remote.master_bedroom_homepod` (not used)
  - Confirmed `notify.waqars_iphone` exists. Nothing sent.
  - No Music Assistant player entities found. Step 6 B3 will be skipped unless the owner asks otherwise.
  - `input_boolean.adhan_enabled`: **not found (404). Expected.** The owner confirmed the toggle was deleted. The 2026-11-08 status sync records the removal of `packages/adhan.yaml` and its helper (`docs/sessions/2026-11-08-pi5-status-sync.md`). The prompt's step 1 check is moot. Not created, not changed.
- **Step 2 (read-only, no sound):**
  - Living Room HomePod: `paused`, `volume_level` 0.55, `supported_features` 448439 (VOLUME_SET and PLAY_MEDIA present; no MEDIA_ANNOUNCE bit)
  - Bedroom HomePod: `idle`, `volume_level` 0.592, same `supported_features`
  - `/media/Adhan.mp3` (2,425,393 bytes) and `/media/Fajr.mp3` (5,418,931 bytes) exist. Not played.
  - `/config/www/` exists and is writable.
  - HA error log search for `apple_tv` and system log search for `media` returned no entries in the bounded window.
- **Decision point A:** passed.
- **Step 3 (test tone):** ffmpeg 8.1.3 installed via `persist-install` (persists under `/data/packages`). Created a 3.000 s, 440 Hz tone at volume 0.2 and saved to `/media/test-tone.mp3` (24,468 bytes) and `/config/www/test-tone.mp3` (same size).
- **Step 4 (V0):** Living Room HomePod `volume_level` = **0.55**.
- **Step 5 (set test volume):** `media_player.volume_set` to 0.2 on the Living Room HomePod. Read back **V1 = 0.2**.

**The Living Room HomePod is currently at 0.2 (V1), not its starting 0.55 (V0). It must be restored (step 7) if no further test runs.**

## B1 result (2026-11-12)

- Owner confirmed "safe to play" in chat before the call.
- `media_player.play_media` on `media_player.living_room_living_room_homepod`, `media-source://media_source/local/test-tone.mp3`, `media_content_type: music`, `wait: false`. Service returned success. State went `playing`, then `idle` (about 3 s).
- Path: `/media`. Error: none.
- V2 after the tone: **0.2**. Not equal to V0 (0.55). The restore check failed (the playback did not restore the volume).
- Restore: `media_player.volume_set` to 0.55. Read back **0.55**. Restored.
- Owner's answer on whether the tone was heard: **pending** (not yet asked in chat).
- B2: not run. Owner decision needed (B1 played without error, so per the prompt B2 is skipped: "skipped, B1 passed"). B1 passed the playback step, but the restore step failed, so the result is mixed.

## Not done (waiting on owner)

- Step 6: no audio played yet. Each audio call needs the owner's "safe to play" in chat first.
  - B1 (`/media` path) is next. Owner confirmation pending.
  - B2 runs only if B1 fails.
  - B3 (Music Assistant) is skipped, no MA HomePod player found.
- Step 7: restore check not run (nothing played yet).
- Step 8: not applicable until a test errors.
- Results table: partial (Step 2 row and the step 3 to 5 facts only).
- `docs/issues.md` I17: needs the final result.

## Problems

- `input_boolean.adhan_enabled` missing in HA. Expected, the helper was deleted. Docs that still name it as live are stale: `docs/prompts/pi5/2026-11-12-adhan-playback-test.md` (step 1 and hard rules), `docs/decisions.md` D34 and D35, and `docs/entities.md` if it lists it.
- `ffmpeg` was missing; resolved by `persist-install ffmpeg`.
- `ha_call_service` needs `data` (not `service_data`) for the volume payload.

## Resume point

1. Owner says "safe to play" for B1. Then call `media_player.play_media` on `media_player.living_room_living_room_homepod` with `media-source://media_source/local/test-tone.mp3`, `media_content_type: music`. Wait about 5 s, read `volume_level` as V2.
2. If B1 errors, ask before B2 (`/local/test-tone.mp3`).
3. Step 7: V2 must equal V0 (0.55) within 0.02. If not, set back to 0.55 and report.
4. Docs cleanup for the deleted toggle: done (owner GREEN LIGHT, see the cleanup commit). `docs/decisions.md` left unchanged as the decision history.

# Session: Adhan end-to-end test, Bedroom HomePod (FAILED)

Date: 2026-11-12
Device: Pi 5 (Claude Terminal)
Prompt: `docs/prompts/pi5/2026-11-12-adhan-e2e-test.md` (commit 3c84476)
Milestone M12, Issue I17, Decisions D29, D34

## Owner GREEN LIGHT

- Owner typed "GREEN LIGHT." in this session, after being told the script would set 20%, play the full Adhan once, and restore V0. Owner confirmed they were next to the speaker (per prior step 3 request). Time: about 14:06 CST (script started 14:07:00).

## Pre-flight (read-only, passed)

- `media_player.master_bedroom_homepod`: state `idle`, V0 = **0.592**
- `/media/Adhan.mp3`: 2,425,393 bytes, duration **150.861655 s**
- Add-on token present (value not printed)
- `input_boolean.adhan_enabled`: 404 (expected, deleted)
- `notify.waqars_iphone`: exists

## Run (once)

```
14:07:00 start state=idle V0=0.5920000000000001
14:07:02 V1 after set=0.2
14:07:32 ERROR: timed out
14:07:33 restore to V0=0.5920000000000001: read 0.5920000000000001 -> OK
RESULT {"entity": "media_player.master_bedroom_homepod", "media": "media-source://media_source/local/Adhan.mp3", "V0": 0.5920000000000001, "test_volume": 0.2, "played": false, "restored": true, "pass": false}
14:07:33 could not send failure notice: HTTP Error 400: Bad Request
EXIT=1
```

## What happened

- The `play_media` call did not return within the script's 30 s HTTP timeout. The script treated it as an error.
- The Adhan had already started (HA state `playing`, `media_title` Adhan, started 14:07:03). Playback did not stop when the script failed.
- The script's restore then ran **while the file was playing**, so the volume went from 0.2 back to **0.592 (about 59%)**. D29 says 20%. The Adhan therefore played at full test-restore volume for about 40 s.
- Found by a ha-mcp state read at 14:07:32. Owner in the room.
- **Action taken:** `media_player.media_stop` on the Bedroom HomePod (read-back: `idle`, volume 0.592 at 14:07:44). Playback lasted about 41 s and was not completed. The full file was not heard end to end.
- Failure notice to `notify.waqars_iphone` failed with HTTP 400 (the notify call's payload or service form needs checking). The owner was in the room.
- Did not re-run the script (per prompt).

## Script defects (for the next version, not changed in this run)

1. The `play_media` call blocks until playback ends or times out. Use `wait: false` (as in the earlier tests) or a longer timeout.
2. The `finally` restore runs even while playback is still going. Restore must wait for `idle` after the file ends, or stop playback first.
3. On failure, the script does not stop playback. A failed run can still play at full volume.
4. The failure notice returns HTTP 400. Check the notify service call form.

## Result

- **FAILED.** `played=false`. The file was not completed. Volume was not 20% during playback.
- Final volume: **0.592 (V0)**, read back at 14:07:44.
- Owner's answer on whether the Adhan was heard in full: not asked. The run stopped at about 41 s.

## Next step

- Owner decides: fix the script (defects above), then re-run with a new GREEN LIGHT. Or hold the Adhan rebuild.
- Do not enable any automation (D34). The script at `/data/adhan_test.py` is outside the repo and not committed.

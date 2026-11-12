# Prompt: Adhan end-to-end test, Bedroom HomePod, real Adhan.mp3, restore in script (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-11-12
Tier: 3 (plays the real Adhan file on a HomePod)
GREEN LIGHT: **not given in this file.** Committing this prompt does not authorize the run. The owner is physically at the Bedroom HomePod and must type "GREEN LIGHT" in the Pi 5 session before step 4. Record the owner's exact words and time in the session note.

Milestone: M12. Issue: I17. Decisions: D29 (Adhan.mp3 at 20%), D34 (fail closed, restore volume, notify on failure).
Builds on: `docs/sessions/2026-11-12-adhan-playback-test.md` (`/media` path passed on both HomePods with a 3-second tone; restore was manual).

## Purpose

One full run with the real `/media/Adhan.mp3` on `media_player.master_bedroom_homepod`. The script sets 20%, plays, waits for the player to finish, and restores the starting volume itself. Nothing is restored by hand unless the script fails.

## Hard rules

- Only `media_player.master_bedroom_homepod` is used. Do not touch the Living Room HomePod.
- Only `Adhan.mp3`. Do not play `Fajr.mp3`, `test-tone.mp3`, or anything else.
- Run the script **once**. If it fails, do not run it again. Go to step 6.
- Do not enable `input_boolean.adhan_enabled` (it is deleted; see the session note). Do not create, edit or enable any automation or script in HA. Do not edit YAML, so `ha core check` is not needed.
- Do not call any `lock.*` service. Do not touch `switch.804_*`.
- Do not restart HA, the add-on or the Pi.
- The script lives at `/data/adhan_test.py` (add-on data, outside the git repo). Do not commit it.
- No secrets. Do not print `SUPERVISOR_TOKEN`, `secrets.yaml` or any token.
- Entity IDs come from ha-mcp (step 1). Do not guess them.

## Step 1: Pre-flight (read-only)

1. Confirm the IDs with ha-mcp and record them: `media_player.master_bedroom_homepod`, `notify.waqars_iphone`. Confirm `input_boolean.adhan_enabled` is absent (404 is expected).
2. Read `media_player.master_bedroom_homepod`. Record `state` and `volume_level` as `V0`. Expected from the last test: about 0.592.
   - If `state` is `playing`, or `volume_level` is missing, stop and tell the owner.
3. Check the file exists: `ls -l /media/Adhan.mp3` (expected 2,425,393 bytes).
4. Check the add-on token is present without printing it: `test -n "$SUPERVISOR_TOKEN" && echo token-present`. If absent, stop. Do not work around it.
5. Read the duration (for the record only): `ffprobe -v error -show_entries format=duration -of csv=p=0 /media/Adhan.mp3`.

## Step 2: Write the script

Write this exact content to `/data/adhan_test.py`:

```python
#!/usr/bin/env python3
# Adhan end-to-end test. Bedroom HomePod, real Adhan.mp3, volume restore in-script.
# One run. Exit 0 = played and restored. Exit 1 = failed (restore attempted).
import json, os, sys, time, urllib.request

BASE = "http://supervisor/core/api"
TOKEN = os.environ.get("SUPERVISOR_TOKEN", "")
ENTITY = "media_player.master_bedroom_homepod"
NOTIFY = "notify/waqars_iphone"
MEDIA = "media-source://media_source/local/Adhan.mp3"
TEST_VOL = 0.2      # D29: 20% for the test
TOL = 0.02
START_TIMEOUT = 30  # seconds to see "playing" after the call
PLAY_TIMEOUT = 900  # seconds max for the whole file
POLL = 2

def log(msg):
    print(time.strftime("%H:%M:%S"), msg, flush=True)

def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method, headers={
        "Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        txt = r.read().decode()
        return json.loads(txt) if txt else None

def state():
    return call("GET", f"/states/{ENTITY}")

def set_volume(v):
    call("POST", "/services/media_player/volume_set",
         {"entity_id": ENTITY, "volume_level": v})
    time.sleep(1.5)
    return state()["attributes"].get("volume_level")

def notify_failure(text):
    try:
        call("POST", f"/services/{NOTIFY}", {"message": text})
        log("failure notice sent to notify.waqars_iphone")
    except Exception as e:
        log(f"could not send failure notice: {e}")

def main():
    if not TOKEN:
        log("FAIL: no SUPERVISOR_TOKEN")
        return 1
    v0 = None
    changed = False
    played = False
    restored = None
    ok = False
    try:
        s = state()
        v0 = s["attributes"].get("volume_level")
        log(f"start state={s['state']} V0={v0}")
        if v0 is None or s["state"] in ("unavailable", "unknown", "off", "playing"):
            raise RuntimeError(f"not safe to start: state={s['state']} V0={v0}")

        changed = True
        v1 = set_volume(TEST_VOL)
        log(f"V1 after set={v1}")
        if v1 is None or abs(v1 - TEST_VOL) > TOL:
            raise RuntimeError(f"volume did not reach {TEST_VOL} (read {v1})")

        call("POST", "/services/media_player/play_media", {
            "entity_id": ENTITY, "media_content_id": MEDIA, "media_content_type": "music"})
        log("play_media sent")

        t0 = time.time()
        seen = False
        while True:
            elapsed = time.time() - t0
            st = state()["state"]
            if st == "playing":
                if not seen:
                    log(f"playing after {round(elapsed)} s")
                seen = True
            elif seen:
                log(f"playback ended (state={st}) after {round(elapsed)} s")
                break
            if not seen and elapsed > START_TIMEOUT:
                raise RuntimeError("never entered playing state")
            if elapsed > PLAY_TIMEOUT:
                raise RuntimeError("playback timeout")
            time.sleep(POLL)
        played = True
        time.sleep(2)
    except Exception as e:
        log(f"ERROR: {e}")
    finally:
        if changed and v0 is not None:
            vr = set_volume(v0)
            if vr is None or abs(vr - v0) > TOL:
                log(f"restore read {vr}, retrying once")
                vr = set_volume(v0)
            restored = vr is not None and abs(vr - v0) <= TOL
            log(f"restore to V0={v0}: read {vr} -> {'OK' if restored else 'MISMATCH'}")

    ok = played and restored is True
    result = {"entity": ENTITY, "media": MEDIA, "V0": v0, "test_volume": TEST_VOL,
              "played": played, "restored": restored, "pass": ok}
    print("RESULT " + json.dumps(result), flush=True)
    if not ok:
        notify_failure(f"Adhan test FAILED on bedroom HomePod. played={played} restored={restored}. Check volume.")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

## Step 3: Confirm with the owner

Tell the owner in chat: the script will set the Bedroom HomePod to 20%, play the full Adhan once, and restore the starting volume (V0 from step 1). Ask them to confirm they are next to the speaker and say **"GREEN LIGHT"**. Do not continue without that exact confirmation in chat.

## Step 4: Run once

```
python3 /data/adhan_test.py
```

The owner stays by the speaker. Do not interrupt the run unless the owner asks. Record the full output, including the `RESULT` line and exit code.

## Step 5: Verify (ha-mcp, read-only)

1. Read `media_player.master_bedroom_homepod` and record `volume_level` as the final volume.
2. Pass only if it equals V0 from step 1 within 0.02.
3. Ask the owner: did the full Adhan play, with no cut-off and no distortion? Record the answer.

## Step 6: If anything failed

- The script already tries to restore V0 and sends a failure notice. Check the script's `restore` line.
- If the final volume is not V0, set it back with ha-mcp (`media_player.volume_set` to V0) and read it back. Do not re-run the script.
- Report to the owner: the exit code, the `RESULT` line, the final volume, and what the owner heard.

## Output to the owner

Reply with: the `RESULT` line and exit code, the start and end volumes, playback duration, whether the owner heard the full file, and the next step. Keep it short. Do not propose enabling the automation until the owner has read the result.

## Records (Tier 1)

- Write `docs/sessions/2026-11-12-adhan-e2e-test.md` with the results, the owner's GREEN LIGHT text and time, the file duration, and the owner's answer.
- Update `docs/issues.md` I17 with the pass or fail result and whether the restore happened without a manual step.
- Commit as `docs(session): Adhan end-to-end test, bedroom HomePod` and push to `main`. Do not commit `/data/adhan_test.py`.
- Do not change `docs/decisions.md` in this run. Enabling Adhan needs a separate GREEN LIGHT (D34).

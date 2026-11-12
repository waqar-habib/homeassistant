# Prompt: Install ffmpeg for the Adhan playback test (Pi 5, Claude Terminal)

Target: pi5
Date: 2026-11-12
Tier: 2 (package install in the Claude Terminal add-on; no HA config, no restart)
GREEN LIGHT: yes (2026-11-12). Owner's request in chat: "Install ffmpeg". Scope: install ffmpeg and nothing else. Not covered: running the Adhan playback test, playing any audio, or changing HA config.

Related: `docs/prompts/pi5/2026-11-12-adhan-playback-test.md` (step 3 needs ffmpeg). Issue I17.

## Rules

- Install only ffmpeg. Do not install other packages, change HA config, restart HA or the add-on, or touch the HomePods.
- Do not run the playback test. Do not play any audio.
- No secrets, tokens or passwords in any file or commit.
- If any command fails, record the exact error and stop. Do not try other package managers.

## Step 1: Check whether ffmpeg is already present

```
which ffmpeg && ffmpeg -version | head -1
```

If it prints a version, record it and skip to step 4.

## Step 2: Identify the OS

```
cat /etc/os-release | head -3
```

Record the `ID` and `VERSION_ID`. Claude Terminal runs on Alpine (`apk`). If the OS is Debian-based, use `apt-get` instead.

## Step 3: Install ffmpeg

- Alpine: `apk add --no-cache ffmpeg`
- Debian-based: `apt-get update && apt-get install -y ffmpeg`

Then check:

```
ffmpeg -version | head -1
```

Record the version line.

**Persistence check:** a package installed inside the add-on may not survive an add-on restart or update. Record whether it is still present after the next add-on restart (the owner will tell you). Do not restart the add-on yourself.

## Step 4: Fallback if the install fails or does not persist

Do not install anything else. Instead, make the test tone with Python's standard library (no install needed). Save it as WAV, which HA can play:

```
python3 - <<'PY'
import math, struct, wave
rate, secs, freq, amp = 22050, 3, 440, 0.2
with wave.open('/config/www/test-tone.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
    for i in range(rate * secs):
        w.writeframes(struct.pack('<h', int(32767 * amp * math.sin(2 * math.pi * freq * i / rate))))
PY
cp /config/www/test-tone.wav /media/test-tone.wav
```

Record that the WAV fallback was used. The playback test prompt uses `test-tone.mp3`, so the owner must decide whether to change it to `.wav` before the test runs.

## Output to the owner

Reply with: which path was used (already present, apk or apt install, or WAV fallback), the ffmpeg version line or the error text, and whether ffmpeg is still present after restart (or "not yet checked").

## Commit

Tier 1 note: write `docs/sessions/2026-11-12-install-ffmpeg.md` with the result above, then commit as `docs(session): install ffmpeg for Adhan test` and push to `main`.

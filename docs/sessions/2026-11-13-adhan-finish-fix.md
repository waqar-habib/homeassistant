# 2026-11-13 Adhan finish fix

## Problem
- Fajr run 05:47 local (11:47 UTC) on the Living Room HomePod: track (225 s) played to the end, HomePod stayed `playing` (no idle reported), script waited the full 900 s, sent a FAILED notice. Volume restored to 0.55.
- Manual Fajr run 03:17 UTC went idle after ~22 s and reported success. Cause not in the logs.
- `input_number.adhan_saved_volume` stayed at 0.55 after the failed run (the failure branch does not reset it).

## Change (packages/adhan.yaml, script adhan_play only)
- Records play start time; finish is judged by track length: `media_duration` at start, else table (Fajr 225 s, Adhan 151 s), plus 10 s, capped at 900 s from start.
- Stops playback if speakers still show playing; playing past track length is not a failure. No track length known: 900 s timeout as before.
- Start check: passes if a speaker is playing or the call ran at least 20 s.
- Automations and startup check unchanged.

## Verification
- Backup `pre-adhan-duration-fix` (slug 08f6f42b) before the edit.
- `ha core check` passed; YAML parses; diff limited to the script section.
- Reloaded scripts and automations. script.adhan_play loaded; all five prayer automations and the startup check on; toggle still on.
- Saved-volume helper set to 0.
- NOT tested: no playback, no adhan automation or script run (per owner: no Dhuhr/Asr/Maghrib/Isha tests this round).

## Open
- Next real run: Dhuhr (today, about 6 h after 06:43 local). Check its trace after it runs.
- Living Room HomePod still reports `playing` now; not yet cleared.
- Owner decision: toggle stays ON as instructed.

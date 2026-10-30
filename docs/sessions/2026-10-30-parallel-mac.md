# Session: parallel Mac lane, 2026-10-30

Prompt: `docs/prompts/mac/2026-10-30-parallel-mac.md`. Steps 1 to 5 done. Step 6 (merge point) is open.

## Step 2: networkpi unit review
Result: pass, and it is running. Paths use `%h`; tmux session `claude-rc` matches the attach command; 30 s restart loop; `Type=oneshot` with `RemainAfterExit=yes` is right for a detached tmux session (status shows `active (exited)`, which is normal); no token printed. One fix applied: `--spawn=same-dir` pinned so a restart never waits on a prompt (`a6c69a5`). Merged to `main` (`66f17d5`).

## Step 3: scenes review (`feat/scenes`, `4cb5cee`)
Five scenes in `packages/scenes.yaml`: Good Night, Leaving, Lock Up, Welcome Home, Evening. Movie Night is gone. All 16 light and lock entity IDs exist in `docs/entities.md`.

Findings:
1. Good Night, Leaving and Lock Up set `lock.living_room_front_door: locked`. That is the lock scene approved in D33. Nothing unlocks.
2. Good Night and Leaving turn off the Nursery lights (`light.changing_table`, `light.nursery_floor_lamp`). Evening and Welcome Home never turn them on. Hatch lights appear in no scene.
3. Evening includes `light.dresser`, `light.mahams_lamp` and `light.waqars_lamp`. `docs/entities.md` does not show which room Dresser belongs to; confirm it is not a Nursery light.
4. Welcome Home turns on four Living Room lights without brightness; Evening the same plus 8 more.
5. Good Night and Leaving are identical (same 15 lights off, door locked). Keep both or merge them; owner will rename.

### Owner test checklist (5 scenes)
| # | Scene | Run it | Expect | Undo |
|---|---|---|---|---|
| 1 | Welcome Home | Home dashboard or Developer Tools, Actions, `scene.turn_on`, `scene.welcome_home` | 4 Living Room lights on | Turn the lights off, or run Good Night |
| 2 | Evening | `scene.evening` | 12 lights on (Living Room, Master, Game Room, Upstairs Guest, Study). Nursery stays off. Check where Dresser is | Run Good Night |
| 3 | Good Night | `scene.good_night` | All 15 lights off, front door locks (you hear the bolt) | Turn lights on; unlock by hand or app |
| 4 | Leaving | `scene.leaving` | Same as Good Night | Same |
| 5 | Lock Up | `scene.lock_up` | Door locks, lights unchanged | Unlock by hand or app |

Run 3 to 5 only with the door closed and a key or code in reach. Expected time: 10 minutes. After you are happy, tell Claude to merge `feat/scenes` to `main` (I19).

## Step 5: I9 proposal, weekly off-site copy of an encrypted HA backup
Size: about 260 MB per backup, 4 weekly copies is about 1 GB.

| Option | How | Cost | Pros | Cons |
|---|---|---|---|---|
| A. Cloudflare R2 | HA S3-compatible backup location or a networkpi script | $0 inside the free tier (10 GB) | Same vendor as domain and tunnel (D20), no egress fees | Needs a payment method on the Cloudflare account; API token to store |
| B. Google Drive | HA Google Drive backup location or networkpi `rclone` | $0 inside 15 GB | Familiar, no new account | Token expiry and re-auth; shares quota with mail and photos |
| C. Nabu Casa cloud backup | Built in | Paid subscription | Zero setup | Rejected in D6, not accepted |

Best case: weekly copy runs unattended and a restore test works. Base case: one token renewal per year. Worst case: the token leaks, so the copy is encrypted (key in Apple Keychain, D19), which keeps the data unreadable.
Recommendation: A, with the copy made from networkpi's share (D19) so the Pi 5 stays untouched. Tier 3 when built (credential). Verify the HA backup-location options in 2026.10 at setup time; I did not check them live.

## Decisions and notes
- D37 recorded (owner replies after the Pi 5 lane).
- The tunnel prompt has stale items; see `docs/prompts/pi5/2026-10-30-tunnel-owner-checklist.md`.

## Resume point
Step 6: after the Pi 5 resume run (`docs/prompts/pi5/2026-10-30-pi5-resume.md`) and the owner's scene tests, reconcile HANDOFF.md, milestones and issues.

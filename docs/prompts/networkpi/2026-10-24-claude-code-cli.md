# Runbook: Claude Code CLI on networkpi (DRAFT v0.1)

Target: networkpi
Date: 2026-10-24
Tier: 3 (credentials, new software, OAuth sign-in)
GREEN LIGHT: Phase 0 only, given by the owner 2026-10-24. Phase A and Phase B are not approved; each needs its own GREEN LIGHT.
Run by: the owner, by hand, in the Raspberry Pi Connect terminal. There is no Claude on networkpi yet, so this cannot be a prompt for an agent. Each command is one line in its own block so a paste cannot merge lines.

## Assumptions and risks

| # | Item | Risk |
|---|---|---|
| 1 | Claude Code's documented minimum is **4 GB RAM**. networkpi has 905 MB RAM plus 904 MB swap on an SD card | High. Tool runs may be killed by the out-of-memory killer, or swap heavily and wear the SD card |
| 2 | Remote Control needs a Pro, Max, Team or Enterprise **claude.ai login**. API keys are not supported | Uses the owner's plan limits |
| 3 | The token is a GitHub fine-grained token stored on the Pi in plaintext (`~/.config/gh/hosts.yml`, mode 600) | A stolen SD card exposes it. Scope and expiry limit the damage |
| 4 | The repo is public until D25, so any commit is public | No secrets in commits |

Outcomes:
- **Best:** it runs for light docs and status work, and memory stays under about 700 MB.
- **Base:** it starts, but long sessions hit swap. Use it only for short check-ins.
- **Worst:** out-of-memory kills. Remove it (rollback) and keep Claude on the Pi 5 (Claude Terminal) and the Mac. networkpi then stays as the backup, monitoring and DNS host (M4, M6, M7).

## Phase 0: feasibility (no accounts, nothing stored)

Run as the `claude` user:

```
sudo -iu claude
```

```
curl -fsSL https://claude.ai/install.sh | bash
```

```
~/.local/bin/claude --version
```

```
~/.local/bin/claude doctor
```

In a second Pi Connect window, watch memory while you start it:

```
free -m
```

STOP if `claude --version` fails or `dmesg` shows an out-of-memory kill:

```
sudo dmesg | grep -i -E "oom|killed process"
```

(Run that one as `networkpi`, not `claude`; `claude` has no sudo.) If either check fails, go to Rollback, report the output, and stop.

## Phase A: sign-in and repo (manual test)

1. Create a GitHub fine-grained token at github.com/settings/personal-access-tokens. Name `networkpi-claude`. Repository access: only `waqar-habib/homeassistant`. Permissions: Contents read and write, Metadata read. Expiry: 90 days. Do not paste the token into the chat or the repo.
2. As the `claude` user, sign in to GitHub. Choose GitHub.com, HTTPS, then "Paste an authentication token":
```
gh auth login
```
3. Let git use that login:
```
gh auth setup-git
```
4. Set the git identity (not your own):
```
git config --global user.name "networkpi-claude"
```
```
git config --global user.email "networkpi-claude@users.noreply.github.com"
```
5. Clone the repo. Do not work from the home directory, because workspace trust is never saved there:
```
git clone https://github.com/waqar-habib/homeassistant.git ~/homeassistant
```
6. Start Claude in the repo and sign in with `/login`. Open the URL it prints on your iPhone, approve, and paste the code back:
```
cd ~/homeassistant && ~/.local/bin/claude
```
7. Accept the one-time workspace trust prompt for `~/homeassistant` only.
8. First task, read-only: ask it to read `HANDOFF.md` and summarize the open items. Watch `free -m` in the second window.

Pass criteria:
1. `claude --version` and `claude doctor` run clean.
2. The session reads `HANDOFF.md` and answers without an out-of-memory kill.
3. `free -m` available memory stays above about 150 MB and swap use stays under about 600 MB.
4. `git pull` works as `claude`. Do not test `git push` yet.

## Phase B: Remote Control and always-on (second GREEN LIGHT, not drafted yet)

Only after Phase A passes and has run stably for about a day. Planned: start `claude remote-control --name networkpi` in the repo, test from the iPhone, then wrap it in tmux under a systemd user unit for the `claude` user (linger is already enabled). The unit file will be drafted on its own branch and reviewed first.

## Rollback

As `claude`: run `claude`, then `/logout`, then exit.

```
rm -f ~/.local/bin/claude && rm -rf ~/.local/share/claude ~/.claude ~/.claude.json
```

```
gh auth logout
```

Then revoke the token at github.com/settings/personal-access-tokens, and remove the session at claude.ai if it is listed. To drop the clone: `rm -rf ~/homeassistant`. Nothing else on networkpi depends on it.

## Close-out

Paste the output of `claude --version`, `free -m` and the Phase A pass criteria into the session. The session then updates `HANDOFF.md`, `docs/milestones.md` (M3) and `docs/sessions/`, and commits to `main` (Tier 1).

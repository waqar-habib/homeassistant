# Cross-device prompts

Prompts the owner runs on another device or session. Each prompt is committed to `main` so the receiving device reads it from the repo. The owner does not paste full prompts.

## Layout

```
docs/prompts/
  pi5/        Claude Terminal on the Pi 5
  networkpi/  Claude on networkpi (Raspberry Pi 3B+)
  mac/        Claude on the Mac
  cloud/      Claude Code cloud sessions
```

Filename: `YYYY-MM-DD-<slug>.md`.

## File header

```
Target: pi5 | networkpi | mac | cloud
Date: YYYY-MM-DD
Tier: 0 | 1 | 2 | 3
GREEN LIGHT: yes (date) | not needed (Tier 0-2)
```

Then the prompt in one code block.

## Pointer (what the owner types)

Keep it short so it can be typed on a phone. Template:

```
git pull; read docs/prompts/<target>/<file>.md (commit <short-id>); run it
```

Use the short commit ID from the reply, not the full hash.

## Rules

- Committing a prompt does not authorize running it. Tier 3 still needs a GREEN LIGHT.
- No secrets, tokens or passwords in prompt files.

# Prompt: resume the design guide on the Mac (audit, then v0.2)

Target: mac
Date: 2026-11-16
Tier: 0 (read only on the dashboards) plus Tier 1 docs commits.
GREEN LIGHT: not needed for this prompt. It does not cover any change to Home Assistant, the theme or the card code.

The owner moved the whole design guide process to the Mac so Chrome is available for live testing (2026-11-16). This prompt replaces running the audit prompt on its own.

```
You are the Mac Claude Code session and you now own the Habib Glass design guide. Step codes only with full phrases (D58).

1. git checkout main && git pull --rebase. Read HANDOFF.md, docs/sessions/2026-11-16-design-guide.md, docs/design-guide.md and docs/design/habib-tokens.yaml fully, then D77, I54 and I55.
2. Run docs/prompts/mac/2026-11-16-design-guide-audit.md exactly as written (Claude in Chrome, read only, never click a dashboard control, never type a password). It writes docs/design/audit-2026-11-16.md.
3. Write Draft v0.2 of docs/design-guide.md and docs/design/habib-tokens.yaml from the audit: replace every "estimate", "unverified" and "mock only" with the measured value; fix any token that does not match the computed style; fill the column counts for every viewport; fold in what the Medium article adds; update section 10 (known gaps). Keep dark values equal to what is live: the guide codifies, it does not redesign. Light values stay "proposed".
4. Do not start the light-mode path (guide section 8) or change the theme, card code or dashboards. The owner has not decided this ("TBD until we resume on Mac"). Ask the owner at the end: only measurements in v0.2, or also step 1 of the light-mode path (config change, needs the owner's go-ahead).
5. Session protocol: session note, HANDOFF, issues I54 and I55 updated, commit docs(session): design guide v0.2, git pull --rebase, push to main. Reply with the short commit ID, the mismatches found, and the question from step 4. v1.0 only on the owner's "GREEN LIGHT".
```

# Helpers

Layer: helpers · Status: Draft · All in the shared stylesheet (base.js), adopted by every component.

| Helper | Class / function | What it does |
|---|---|---|
| Hit area | `.tap` | a control smaller than 44 px gets an invisible 44 px target, centred; visible size unchanged |
| Focus ring | `:focus-visible` | 2 px warm ring (`--g-ring`) |
| Press | `.press` | scale 0.97 on press, spring 0.18 s |
| Hover | `@media (hover: hover)` only | raised fill lightens; never on touch screens (wall tablet needs no hover) |
| Text fit | `fitText()` | a name is never broken inside a word (`hyphens: manual`); if its longest word overflows, the type steps down one role |
| Container queries | `.chipbox` and others | components size from their own width, never the screen |
| Reduced motion | `prefers-reduced-motion` | all animation off |
| Reduced transparency | `prefers-reduced-transparency` | blur off, solid surface |
| Feedback | `_begin()` | pending 2.5 s, then the real state and "No response" for 4 s |

# Safety rules

Status: **Locked**. No component, wireframe or config option may override these.

1. **Locks, garage and covers:** no card calls a lock or cover service. A tap opens Home Assistant's own dialog (two deliberate taps to unlock or open).
2. **Adhan:** shown, never changed, by any card. The Adhan automations and the playback switch change only through the Adhan package and the owner's GREEN LIGHT.
3. **Climate:** only the climate drawer of `ui-climate` may call `climate.set_hvac_mode` and `climate.set_temperature` (owner GREEN LIGHT climate controls, 2026-11-17), within the thermostat's own limits and a 3° heat/cool gap. No other component calls a climate service.
4. **Alarm and media:** `ui-button` refuses alarm and media_player entities.
5. **Nursery** lamps stay out of floor groups.
6. **Entity IDs** come from `docs/entities.md` or ha-mcp; never guessed. No entity IDs in JavaScript.
7. **Never edit `.storage/`**; dashboards change through ha-mcp. Live dashboards change only at cutover, on the owner's word.
8. **Nothing unseen ships:** every layout is rendered and measured (no broken words, 44 px targets, contrast 4.5:1, no sideways scroll, no console error) before it reaches a device.

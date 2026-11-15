// habib-logic: pure logic for the Habib cards. No DOM, no HA globals, no entity IDs (CR1).
// Everything takes plain objects shaped like Home Assistant's `hass.states` map.
// Tested by tests/habib-ui/logic.test.mjs (node --test).

export const DEAD_STATES = ["unavailable", "unknown"];

// Service domains the action button refuses. `homeassistant` is included because
// homeassistant.turn_on reaches locks and covers (D60: outdoor controls wait for the owner).
export const BLOCKED_DOMAINS = [
  "lock",
  "cover",
  "climate",
  "alarm_control_panel",
  "media_player",
  "homeassistant",
];

export const TONES = ["ok", "warn", "neutral"];
export const LONG_PRESS_MS = 500;
export const PENDING_MS = 3000;
export const BRIGHTNESS_MIN = 10;
export const BRIGHTNESS_MAX = 100;

export function domainOf(entityId) {
  return String(entityId || "").split(".")[0];
}

// "missing": no such entity. "dead": unavailable or unknown. "ok": usable.
export function entityStatus(states, id) {
  const s = states && states[id];
  if (!s) return "missing";
  if (DEAD_STATES.includes(s.state)) return "dead";
  return "ok";
}

export function humanize(value) {
  const t = String(value).replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function asList(value) {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value).split(",").map((v) => v.trim()).filter(Boolean);
}

// ---- Render gate ---------------------------------------------------------------------
// A card renders only when the signature of the states it uses changes (rule from I44).

export function entitiesSignature(hass, ids, attributes = []) {
  const states = (hass && hass.states) || {};
  return ids
    .map((id) => {
      const s = states[id];
      if (!s) return `${id}|missing`;
      const attrs = attributes.map((a) => JSON.stringify(s.attributes ? s.attributes[a] : undefined));
      return [id, s.state, ...attrs].join("|");
    })
    .join("§");
}

export function createRenderGate(signatureFn, renderFn) {
  let last = null;
  return {
    // Called on every hass update. Renders only if the signature changed.
    update(hass) {
      const sig = signatureFn(hass);
      if (sig === last) return false;
      last = sig;
      renderFn(hass, sig);
      return true;
    },
    // Called on setConfig, resize and similar: render regardless.
    force(hass) {
      last = signatureFn(hass);
      renderFn(hass, last);
    },
  };
}

// ---- Lights --------------------------------------------------------------------------

export function supportsBrightness(stateObj) {
  const modes = stateObj && stateObj.attributes && stateObj.attributes.supported_color_modes;
  return Array.isArray(modes) && modes.some((m) => m !== "onoff");
}

export function lightView(states, ids) {
  const usable = [];
  const missing = [];
  const dead = [];
  for (const id of ids) {
    const st = entityStatus(states, id);
    if (st === "ok") usable.push(id);
    else if (st === "missing") missing.push(id);
    else dead.push(id);
  }
  const onCount = usable.filter((id) => states[id].state === "on").length;
  const total = usable.length;
  const multi = ids.length >= 2;
  const notes = [];
  let kind = "ok";
  let label;

  if (ids.length === 0) {
    kind = "missing";
    label = "No entities set";
  } else if (total === 0) {
    if (missing.length) {
      kind = "missing";
      label = `Not found: ${missing[0]}`;
    } else {
      kind = "dead";
      label = "No response";
    }
  } else {
    label = multi ? `${onCount} of ${total} on` : onCount ? "On" : "Off";
    for (const id of missing) notes.push(`Not found: ${id}`);
    if (dead.length) notes.push(`No response: ${dead.length}`);
  }
  return { kind, usable, missing, dead, onCount, total, anyOn: onCount > 0, label, notes };
}

// What a tap does. Null when nothing is usable.
export function tapPlan(view) {
  if (!view.usable.length) return null;
  return view.anyOn
    ? { service: "turn_off", ids: view.usable.slice() }
    : { service: "turn_on", ids: view.usable.slice() };
}

export function brightnessTargets(states, ids) {
  return ids.filter((id) => entityStatus(states, id) === "ok" && supportsBrightness(states[id]));
}

export function clampPct(pct) {
  const n = Math.round(Number(pct));
  if (!Number.isFinite(n)) return BRIGHTNESS_MAX;
  return Math.min(BRIGHTNESS_MAX, Math.max(BRIGHTNESS_MIN, n));
}

// Starting slider value: average of the targets that are on, else 100.
export function brightnessStart(states, targets) {
  const levels = targets
    .map((id) => states[id])
    .filter((s) => s && s.state === "on" && Number.isFinite(Number(s.attributes && s.attributes.brightness)))
    .map((s) => Number(s.attributes.brightness));
  if (!levels.length) return BRIGHTNESS_MAX;
  const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
  return clampPct((avg / 255) * 100);
}

// ---- Action button -------------------------------------------------------------------

// Returns { ok, domain, service, blocked, entityIds, reason }.
export function checkAction(action) {
  const raw = action && typeof action.service === "string" ? action.service.trim().toLowerCase() : "";
  const m = /^([a-z0-9_]+)\.([a-z0-9_]+)$/.exec(raw);
  if (!m) return { ok: false, blocked: false, reason: "invalid", entityIds: [] };
  const [, domain, service] = m;
  const data = (action && action.data) || {};
  const target = (action && action.target) || {};
  const entityIds = [...asList(data.entity_id), ...asList(target.entity_id)];
  const blocked =
    BLOCKED_DOMAINS.includes(domain) ||
    entityIds.some((id) => BLOCKED_DOMAINS.includes(domainOf(id)));
  return { ok: !blocked, blocked, domain, service, entityIds, reason: blocked ? "blocked" : "" };
}

// ---- Status strip --------------------------------------------------------------------

// Returns { kind: "ok" | "missing" | "dead", text, tone }.
export function itemStatus(states, item) {
  const id = item.entity;
  const st = entityStatus(states, id);
  if (st === "missing") return { kind: "missing", text: `Not found: ${id}`, tone: "warn" };
  if (st === "dead") return { kind: "dead", text: "No response", tone: "warn" };
  const s = states[id];
  const unit = item.unit || "";

  if (item.attribute) {
    const v = s.attributes ? s.attributes[item.attribute] : undefined;
    if (v === undefined || v === null || v === "") {
      return { kind: "dead", text: "No response", tone: "warn" };
    }
    const shown = typeof v === "number" ? Math.round(v * 10) / 10 : v;
    return { kind: "ok", text: `${shown}${unit}`, tone: "neutral" };
  }

  const map = item.states || {};
  const entry = map[s.state];
  if (entry !== undefined && entry !== null) {
    const e = typeof entry === "string" ? { text: entry } : entry;
    const tone = TONES.includes(e.tone) ? e.tone : "neutral";
    return { kind: "ok", text: e.text !== undefined ? String(e.text) : humanize(s.state), tone };
  }
  const numeric = s.state !== "" && Number.isFinite(Number(s.state));
  return { kind: "ok", text: numeric ? `${s.state}${unit}` : humanize(s.state), tone: "neutral" };
}

export function stripIds(items) {
  return (items || []).filter((i) => i && i.entity).map((i) => i.entity);
}

export function stripSignature(hass, items) {
  const states = (hass && hass.states) || {};
  return (items || [])
    .filter((i) => i && i.entity)
    .map((i) => {
      const s = states[i.entity];
      if (!s) return `${i.entity}|missing`;
      return [i.entity, s.state, i.attribute ? JSON.stringify(s.attributes && s.attributes[i.attribute]) : ""].join("|");
    })
    .join("§");
}

// Milliseconds until the next minute boundary (for the clock timer).
export function msToNextMinute(now) {
  return 60000 - (now % 60000) + 50;
}

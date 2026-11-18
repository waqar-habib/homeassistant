// habib-glass-logic: pure logic for the glass cards. No DOM, no entity IDs (CR1).
// Tested by tests/habib-ui/glass-logic.test.mjs (node --test).

export const PRAYERS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

const DAY_MS = 86400000;

// Prayer sensors hold the NEXT occurrence of each time (a passed prayer rolls to tomorrow).
// Input: { fajr: Date|null, ... }, now: Date, sameDay(a, b) -> bool in local time.
// Output: rows in fixed order with passed/next flags, plus the countdown and progress.
export function prayerPlan(times, now, sameDay) {
  const rows = PRAYERS.filter((k) => times[k] !== undefined).map((key) => {
    const at = times[key];
    const valid = at instanceof Date && !Number.isNaN(at.getTime());
    return { key, at: valid ? at : null, passed: valid ? !sameDay(at, now) && at > now : false, next: false };
  });
  const upcoming = rows.filter((r) => r.at && r.at > now && r.key !== "sunrise");
  if (!upcoming.length) return { rows, next: null, msLeft: null, progress: 0 };
  const next = upcoming.reduce((a, b) => (b.at < a.at ? b : a));
  next.next = true;
  // Previous prayer = the latest (time - 1 day) that is before now, among real prayers.
  const prevCandidates = rows
    .filter((r) => r.at && r.key !== "sunrise")
    .map((r) => new Date(r.at.getTime() - DAY_MS))
    .filter((d) => d <= now);
  const prev = prevCandidates.length ? new Date(Math.max(...prevCandidates.map((d) => d.getTime()))) : null;
  const msLeft = next.at - now;
  const span = prev ? next.at - prev : 0;
  const progress = span > 0 ? Math.min(1, Math.max(0, (now - prev) / span)) : 0;
  return { rows, next, msLeft, progress };
}

export function formatCountdown(ms) {
  if (ms === null || ms === undefined || ms < 0) return "";
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

// Kelvin to an approximate sRGB triple (Tanner Helland's fit), for the lamp glow.
export function kelvinToRgb(k) {
  const t = Math.min(40000, Math.max(1000, Number(k) || 2700)) / 100;
  let r, g, b;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = (v) => Math.round(Math.min(255, Math.max(0, v)));
  return [c(r), c(g), c(b)];
}

const WARM = [255, 196, 120];

// The glow of a set of lights: colour, intensity 0..1, how many are on.
export function lightGlow(states, ids) {
  const live = ids.map((id) => states[id]).filter(Boolean);
  const on = live.filter((s) => s.state === "on");
  if (!on.length) return { on: 0, total: live.length, rgb: WARM, level: 0, pct: 0 };
  // Colour comes from the first lit lamp that reports one (plugs and on/off lights report none).
  let rgb = WARM;
  for (const s of on) {
    const c = glowColor(s.attributes || {});
    if (c) { rgb = c; break; }
  }
  // Brightness averages the dimmable lamps only; plugs and on/off lights do not pull it to 100%.
  const bri = on.map((s) => s.attributes && s.attributes.brightness).filter((b) => typeof b === "number");
  const avg = bri.length ? bri.reduce((a, b) => a + b, 0) / bri.length : 255;
  const pct = Math.max(1, Math.round((avg / 255) * 100));
  return { on: on.length, total: live.length, rgb, level: 0.35 + 0.65 * (avg / 255), pct };
}

const COLOR_MODES = ["hs", "rgb", "rgbw", "rgbww", "xy"];

// The colour one light shows, or null when it reports none. White (colour temperature)
// wins unless HA says the light is in a colour mode; an RGBW colour whose white channel
// dominates is drawn as warm white, because that is what the lamp emits.
export function glowColor(a) {
  const k = typeof a.color_temp_kelvin === "number" ? a.color_temp_kelvin : null;
  const mode = a.color_mode;
  if (mode === "color_temp" && k) return kelvinToRgb(k);
  // AiDot lamps report rgbw [255, 0, 0, 0] (pure red, no white) after a brightness-only turn-on
  // while the bulb shines white (I52, measured 2026-11-17). The colour sheet never sends pure red,
  // so this exact report is a placeholder, not a colour: draw it as white.
  if (mode === "rgbw" && Array.isArray(a.rgbw_color) && a.rgbw_color.join(",") === "255,0,0,0") return k ? kelvinToRgb(k) : WARM;
  if (COLOR_MODES.includes(mode) && Array.isArray(a.rgb_color)) {
    const w = Array.isArray(a.rgbw_color) ? a.rgbw_color[3] : Array.isArray(a.rgbww_color) ? Math.max(a.rgbww_color[3], a.rgbww_color[4]) : 0;
    if (w && w >= Math.max(...a.rgb_color.slice(0, 3)) * 0.5) return k ? kelvinToRgb(k) : WARM;
    return a.rgb_color;
  }
  if (k) return kelvinToRgb(k);
  return null;
}

// A short text of what HA reports, shown in the lamp sheet (helps check the colour).
export function colorLabel(a) {
  if (!a || !a.color_mode) return "";
  if (a.color_mode === "color_temp" && a.color_temp_kelvin) return `White ${a.color_temp_kelvin} K`;
  if (COLOR_MODES.includes(a.color_mode) && Array.isArray(a.rgb_color)) return `Colour (${a.color_mode}) rgb ${a.rgb_color.join(", ")}`;
  return a.color_mode === "onoff" ? "" : a.color_mode;
}

// Split entity ids by domain, for turn_on/turn_off on mixed groups (lights and plug switches).
export function byDomain(ids) {
  const out = {};
  for (const id of ids) { const d = String(id).split(".")[0]; (out[d] = out[d] || []).push(id); }
  return out;
}

// Soften a glow colour so saturated colours still read as light, not paint.
export function glowRgb(rgb) {
  return rgb.map((v) => Math.round(v * 0.85 + 255 * 0.15));
}

export const WEATHER_LABELS = {
  "clear-night": "Clear",
  cloudy: "Cloudy",
  exceptional: "Alert",
  fog: "Fog",
  hail: "Hail",
  lightning: "Storms",
  "lightning-rainy": "Storms",
  partlycloudy: "Partly cloudy",
  pouring: "Heavy rain",
  rainy: "Rain",
  snowy: "Snow",
  "snowy-rainy": "Sleet",
  sunny: "Sunny",
  windy: "Windy",
  "windy-variant": "Windy",
};

// Which layers the weather illustration draws.
export function weatherLayers(condition, isNight) {
  const c = String(condition || "");
  const sky = c === "clear-night" || (isNight && (c === "sunny" || c === "partlycloudy")) ? "moon" : "sun";
  return {
    orb: ["sunny", "clear-night", "partlycloudy"].includes(c) ? sky : null,
    cloud: !["sunny", "clear-night"].includes(c),
    dark: ["pouring", "lightning", "lightning-rainy", "hail"].includes(c),
    rain: ["rainy", "pouring", "lightning-rainy", "snowy-rainy"].includes(c),
    snow: ["snowy", "snowy-rainy", "hail"].includes(c),
    bolt: ["lightning", "lightning-rainy"].includes(c),
    fog: c === "fog",
  };
}

// Daypart decides the ambient tint of the hero card.
export function daypart(hour) {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

// ---- Prayer bar wording (I57) -----------------------------------------------------------
// "next": a prayer is still ahead. "done": every configured time is valid and none is left
// today. "unavailable": no prayer ahead and at least one sensor is missing, unknown or unavailable.
export function prayerStatus(plan) {
  if (plan && plan.next) return "next";
  const real = ((plan && plan.rows) || []).filter((r) => r.key !== "sunrise");
  return real.length && real.every((r) => r.at) ? "done" : "unavailable";
}

// ---- Adhan status badge (2026-11-17) ----------------------------------------------------
// Shown, never changed. "on": playback gate on, every listed Adhan automation on, no recorded
// failure. "off": gate off. "error": gate on but an automation is off or unavailable, the gate
// itself is unavailable, or the last playback recorded a failure (input_text.adhan_last_error).
// gate/error/automations are HA state strings (null = entity not found).
export function adhanStatus({ gate, error = null, automations = [] }) {
  if (gate == null || gate === "unavailable" || gate === "unknown") return "error";
  if (gate !== "on") return "off";
  if (automations.some((s) => s !== "on")) return "error";
  if (error != null && !["", "unknown", "unavailable"].includes(String(error).trim())) return "error";
  return "on";
}

// ---- Climate drawer: setpoint steps (owner GREEN LIGHT climate controls, 2026-11-17) ----
// Which setpoints a thermostat mode shows: heat_cool -> low and high; heat or cool -> one.
export function climateTargets(mode, a = {}) {
  if (mode === "heat_cool" || mode === "auto") {
    if (a.target_temp_low != null && a.target_temp_high != null) return { kind: "range", low: a.target_temp_low, high: a.target_temp_high };
  }
  if ((mode === "heat" || mode === "cool") && a.temperature != null) return { kind: "single", value: a.temperature };
  return { kind: "none" };
}
// One step of a setpoint. Clamped to min/max; in a range the two ends keep `gap` degrees apart
// (Nest refuses a closer pair). Returns the new target object (same shape as climateTargets).
export function stepTarget(t, which, dir, { step = 1, min = 50, max = 90, gap = 3 } = {}) {
  const clamp = (v) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  if (t.kind === "single") return { ...t, value: clamp(t.value + dir * step) };
  if (t.kind !== "range") return t;
  let { low, high } = t;
  if (which === "low") low = Math.min(clamp(low + dir * step), high - gap);
  else high = Math.max(clamp(high + dir * step), low + gap);
  return { kind: "range", low: clamp(low), high: clamp(high) };
}
// The service data that sets a target.
export function targetData(t) {
  if (t.kind === "single") return { temperature: t.value };
  if (t.kind === "range") return { target_temp_low: t.low, target_temp_high: t.high };
  return null;
}

// ---- habib-layout: packed columns (D79) -------------------------------------------------
// How many columns fit: min(max_columns, floor((width + gap) / (min_column + gap))), at least 1.
// Under compact_below the answer is always 1 (the caller also swaps in compact cards).
export function columnCount(width, { maxColumns = 4, minColumn = 320, gap = 32, compactBelow = 700 } = {}) {
  if (!(width > 0) || width < compactBelow) return 1;
  return Math.max(1, Math.min(maxColumns, Math.floor((width + gap) / (minColumn + gap))));
}

// Each group, in config order, goes into the column that is currently shortest; ties go left.
// heights: px per group (null or 0 = hidden, takes no room). Returns per group { col, top }
// (null for hidden groups), the column heights and the tallest column.
export function packGroups(heights, columns, gap = 0) {
  const n = Math.max(1, Math.floor(columns) || 1);
  const colHeights = new Array(n).fill(0);
  const place = heights.map((h) => {
    if (!(h > 0)) return null;
    let col = 0;
    for (let i = 1; i < n; i++) if (colHeights[i] < colHeights[col]) col = i;
    const top = colHeights[col] ? colHeights[col] + gap : 0;
    colHeights[col] = top + h;
    return { col, top };
  });
  return { place, colHeights, height: Math.max(0, ...colHeights) };
}

// ---- Fluid packing (ui-page packing: fluid, 2026-11-17) -----------------------------------
// The rule that places sections on wide screens (phones keep config order):
//   1. A group with `with: <id>` stays directly under that group, in its column (a chain).
//   2. A chain with `column: n` is pinned: 1 = leftmost, -1 = rightmost (clamped to the count).
//   3. The other chains go tallest first into the column that is currently shortest (ties go
//      left), which balances the columns better than config order.
//   4. Inside a column, chains are stacked in config order, so the top-left stays the top-left.
//   5. Columns are assigned once per column count; when a section opens or closes only the
//      tops in its column move (nothing jumps sideways under the finger). Pass `assign` back in.
// heights: px per group (0 or null = hidden). meta[i]: { with: index of the anchor or null,
// column: n or null }. Returns { place: [{ col, top } | null], assign: [col | null], colHeights }.
export function fluidPack(heights, columns, meta = [], assign = null) {
  const n = Math.max(1, Math.floor(columns) || 1);
  const shown = (i) => heights[i] > 0;
  // Chains: an anchor and the groups that follow it (transitively), in config order.
  const anchorOf = (i) => { let a = i, guard = 0; while (meta[a] && meta[a].with != null && meta[a].with !== a && guard++ < heights.length) a = meta[a].with; return a; };
  const chains = new Map();
  heights.forEach((h, i) => { if (!shown(i)) return; const a = anchorOf(i); if (!chains.has(a)) chains.set(a, []); chains.get(a).push(i); });
  for (const [a, list] of chains) { const rest = list.filter((i) => i !== a); chains.set(a, shown(a) ? [a, ...rest] : rest); }
  const units = [...chains.entries()].map(([a, list]) => ({ a, list, h: list.reduce((t, i) => t + heights[i], 0), pin: meta[a] && meta[a].column != null ? Number(meta[a].column) : null }));
  const colOf = new Map();
  if (assign) {
    for (const u of units) colOf.set(u.a, Math.min(n - 1, assign[u.list[0]] ?? 0));
  } else {
    const load = new Array(n).fill(0);
    const pinned = units.filter((u) => u.pin != null && u.pin !== 0);
    for (const u of pinned) { const c = u.pin > 0 ? Math.min(n, u.pin) - 1 : Math.max(0, n + u.pin); colOf.set(u.a, c); load[c] += u.h; }
    const free = units.filter((u) => !colOf.has(u.a)).sort((x, y) => y.h - x.h || x.a - y.a);
    for (const u of free) { let c = 0; for (let i = 1; i < n; i++) if (load[i] < load[c]) c = i; colOf.set(u.a, c); load[c] += u.h; }
  }
  const place = heights.map(() => null);
  const outAssign = heights.map(() => null);
  const colHeights = new Array(n).fill(0);
  for (const u of [...units].sort((x, y) => x.a - y.a)) {
    const c = colOf.get(u.a);
    for (const i of u.list) { place[i] = { col: c, top: colHeights[c] }; outAssign[i] = c; colHeights[c] += heights[i]; }
  }
  return { place, assign: outAssign, colHeights, height: Math.max(0, ...colHeights) };
}

// ---- habib-button: which service a generic button may call ------------------------------
// Only these domains. Lock, cover, climate, alarm and media_player are refused on purpose
// (design guide section 9): a generic button must never be able to move them.
export const BUTTON_DOMAINS = ["switch", "light", "input_boolean", "scene", "script"];
export const BUTTON_REFUSED = ["lock", "cover", "climate", "alarm_control_panel", "media_player"];

export function buttonAction(entityId, state) {
  const domain = String(entityId || "").split(".")[0];
  if (BUTTON_REFUSED.includes(domain)) throw new Error(`habib-button never controls ${domain} entities`);
  if (!BUTTON_DOMAINS.includes(domain)) throw new Error(`habib-button takes ${BUTTON_DOMAINS.join(", ")} (got ${domain || "no entity"})`);
  if (domain === "scene" || domain === "script") return { domain, service: "turn_on", stateful: false };
  return { domain, service: state === "on" ? "turn_off" : "turn_on", stateful: true };
}

// Fold-bar summaries are HTML; the aria-label needs the same words as plain text.
export function plainText(html) {
  return String(html || "").replace(/<[^>]*>/g, "").replace(/&ensp;|&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

// ---- Single-hex colour (D78 item 3) -----------------------------------------------------
// Everything that is "the background colour" is derived from one hex, the theme key habib-base.
// Colour math is OKLab (Björn Ottosson), the same space CSS color-mix(in oklab, ...) uses.

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgbToHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");

const toLinear = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toGamma = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklab([r, g, b]) {
  r = toLinear(r); g = toLinear(g); b = toLinear(b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
export function oklabToRgb([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((v) => Math.round(Math.min(255, Math.max(0, toGamma(v)))));
}

// WCAG 2.x relative luminance and contrast ratio of two opaque sRGB colours.
export const luminance = ([r, g, b]) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
// Source-over: colour `fg` at opacity `alpha` on `bg`.
export const blend = (fg, bg, alpha) => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha));

// The recipes. One table, read by the cards (as CSS color-mix), by the layout card (wallpaper)
// and by dashboards/habib-theme-build.py (HA chrome keys), so the three can never disagree.
//   ["black" | "white", pct, alpha?]  = color-mix(in oklab, base (100 - pct)%, black|white pct%)
//   ["lch", lightness, chromaFactor, alpha?] = base hue, the given OKLCH lightness, base chroma x factor
// With the default base (#1c3226) every entry lands within 5/255 of the value it replaced.
// PALETTE-BEGIN (JSON between the markers; keep it valid JSON)
export const PALETTE = {
  "default-base": "#1c3226",
  "clamp": { "min-lightness": 0.16, "max-lightness": 0.36 },
  "css": {
    "page": ["black", 19],
    "page-deep": ["black", 27],
    "dialog": ["black", 0],
    "sheet-a": ["white", 16.5, 0.88],
    "sheet-b": ["black", 12.5, 0.94],
    "surface-solid": ["black", 0, 0.92],
    "scrim": ["black", 52.5, 0.45],
    "rim": ["white", 3.5],
    "ink": ["black", 16],
    "shade": ["black", 40, 0.45],
    "shade-hero": ["black", 40, 0.58]
  },
  "wall": {
    "sky-0": ["white", 9.5],
    "sky-1": ["black", 0],
    "sky-2": ["black", 30],
    "glow-a": ["lch", 0.71, 2.2, 0.34],
    "glow-b": ["lch", 0.49, 1.7, 0.5],
    "canopy": ["lch", 0.26, 1.1, 0.85],
    "ground": ["black", 38],
    "stem": ["lch", 0.41, 1.9],
    "leaf-a0": ["lch", 0.52, 2.9],
    "leaf-a1": ["lch", 0.29, 1.5],
    "leaf-b0": ["lch", 0.62, 3.1],
    "leaf-b1": ["lch", 0.33, 1.5]
  },
  "chrome": {
    "primary-background-color": ["black", 27],
    "secondary-background-color": ["black", 6],
    "sidebar-background-color": ["black", 27],
    "ha-dialog-surface-background": ["black", 0],
    "mdc-theme-surface": ["black", 0],
    "code-editor-background-color": ["black", 20],
    "app-header-background-color": ["black", 27, 0.55],
    "card-background-color": ["white", 0.5, 0.72],
    "rgb-card-background-color": ["white", 0.5],
    "text-primary-color": ["black", 16],
    "rgb-text-primary-color": ["black", 16],
    "state-icon-color": ["lch", 0.89, 0.7],
    "sidebar-text-color": ["lch", 0.89, 0.7]
  }
};
// PALETTE-END

// Keep a chosen base inside the dark range the light text was designed for.
export function clampBase(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const lab = rgbToOklab(rgb);
  const { "min-lightness": lo, "max-lightness": hi } = PALETTE.clamp;
  const L = Math.min(hi, Math.max(lo, lab[0]));
  if (L === lab[0]) return rgbToHex(rgb);
  // Scale chroma with lightness so the hue and saturation impression hold.
  const k = lab[0] > 0 ? L / lab[0] : 1;
  return rgbToHex(oklabToRgb([L, lab[1] * Math.min(1, k), lab[2] * Math.min(1, k)]));
}

// One recipe applied to a base colour. Returns { rgb: [r, g, b], alpha }.
export function applyRecipe(baseRgb, recipe) {
  const lab = rgbToOklab(baseRgb);
  if (recipe[0] === "lch") {
    const [, L, factor, alpha = 1] = recipe;
    return { rgb: oklabToRgb([L, lab[1] * factor, lab[2] * factor]), alpha };
  }
  const [withName, pct, alpha = 1] = recipe;
  const other = rgbToOklab(withName === "white" ? [255, 255, 255] : [0, 0, 0]);
  const p = pct / 100;
  return { rgb: oklabToRgb(lab.map((v, i) => v * (1 - p) + other[i] * p)), alpha };
}

export const cssColor = ({ rgb, alpha }) => (alpha >= 1 ? rgbToHex(rgb) : `rgba(${rgb.join(", ")}, ${alpha})`);

// A whole group of the table ("css", "wall" or "chrome") resolved for one base hex.
export function derivePalette(baseHex, group) {
  const rgb = hexToRgb(baseHex) || hexToRgb(PALETTE["default-base"]);
  const out = {};
  for (const [k, r] of Object.entries(PALETTE[group] || {})) out[k] = cssColor(applyRecipe(rgb, r));
  return out;
}

// The same "css" recipes as CSS text, so a browser re-derives them live from var(--g-base).
// Only the mix recipes are allowed in that group (CSS cannot do the lch ones everywhere yet).
export function cssRecipe(recipe, baseVar = "var(--g-base)") {
  const [withName, pct, alpha = 1] = recipe;
  const mixed = pct === 0 ? baseVar : `color-mix(in oklab, ${baseVar} ${100 - pct}%, ${withName} ${pct}%)`;
  return alpha >= 1 ? mixed : `color-mix(in oklab, ${mixed} ${Math.round(alpha * 100)}%, transparent)`;
}

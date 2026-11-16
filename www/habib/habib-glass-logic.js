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
  const first = on[0].attributes || {};
  let rgb = WARM;
  if (first.color_mode === "color_temp" && first.color_temp_kelvin) rgb = kelvinToRgb(first.color_temp_kelvin);
  else if (Array.isArray(first.rgb_color)) rgb = first.rgb_color;
  const bri = on.map((s) => (s.attributes && typeof s.attributes.brightness === "number" ? s.attributes.brightness : 255));
  const avg = bri.reduce((a, b) => a + b, 0) / bri.length;
  const pct = Math.max(1, Math.round((avg / 255) * 100));
  return { on: on.length, total: live.length, rgb, level: 0.35 + 0.65 * (avg / 255), pct };
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

import test from "node:test";
import assert from "node:assert/strict";
import * as G from "../../www/habib/habib-glass-logic.js";

// Local-day comparison in UTC for deterministic tests.
const sameDay = (a, b) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
const d = (s) => new Date(s);

test("prayerPlan picks the earliest upcoming prayer and ignores sunrise", () => {
  const now = d("2026-11-16T06:30:00Z");
  const times = {
    fajr: d("2026-11-17T05:50:00Z"), sunrise: d("2026-11-16T07:00:00Z"),
    dhuhr: d("2026-11-16T12:15:00Z"), asr: d("2026-11-16T15:10:00Z"),
    maghrib: d("2026-11-16T17:30:00Z"), isha: d("2026-11-16T18:45:00Z"),
  };
  const p = G.prayerPlan(times, now, sameDay);
  assert.equal(p.next.key, "dhuhr");
  assert.equal(p.rows.find((r) => r.key === "fajr").passed, true);
  assert.equal(p.rows.find((r) => r.key === "asr").passed, false);
  assert.ok(p.progress > 0 && p.progress < 1);
  assert.equal(G.formatCountdown(p.msLeft), "5h 45m");
});

test("prayerPlan after Isha points at tomorrow's Fajr", () => {
  const now = d("2026-11-16T22:00:00Z");
  const t = (h) => d(`2026-11-17T${h}:00Z`);
  const p = G.prayerPlan({ fajr: t("05:50"), dhuhr: t("12:15"), asr: t("15:10"), maghrib: t("17:30"), isha: t("18:45") }, now, sameDay);
  assert.equal(p.next.key, "fajr");
  assert.ok(p.rows.every((r) => r.passed));
});

test("prayerPlan survives missing sensors", () => {
  const p = G.prayerPlan({ fajr: null, isha: null }, d("2026-11-16T00:00:00Z"), sameDay);
  assert.equal(p.next, null);
  assert.equal(G.formatCountdown(null), "");
});

test("formatCountdown", () => {
  assert.equal(G.formatCountdown(59 * 60000), "59m");
  assert.equal(G.formatCountdown(61 * 60000), "1h 01m");
});

test("kelvinToRgb is warm at 2700 K and white-blue at 6500 K", () => {
  const warm = G.kelvinToRgb(2700);
  const cool = G.kelvinToRgb(6500);
  assert.equal(warm[0], 255);
  assert.ok(warm[2] < 200);
  assert.ok(cool[2] > 240);
});

test("lightGlow counts on lights and averages brightness", () => {
  const states = {
    "light.a": { state: "on", attributes: { brightness: 255, color_mode: "rgb", rgb_color: [255, 0, 0] } },
    "light.b": { state: "on", attributes: { brightness: 0 } },
    "light.c": { state: "off", attributes: {} },
  };
  const g = G.lightGlow(states, ["light.a", "light.b", "light.c", "light.missing"]);
  assert.equal(g.on, 2);
  assert.equal(g.total, 3);
  assert.deepEqual(g.rgb, [255, 0, 0]);
  assert.equal(g.pct, 50);
  assert.equal(G.lightGlow(states, ["light.c"]).level, 0);
});

test("weatherLayers", () => {
  assert.equal(G.weatherLayers("sunny", true).orb, "moon");
  assert.equal(G.weatherLayers("cloudy", false).orb, null);
  assert.equal(G.weatherLayers("lightning-rainy", false).bolt, true);
  assert.equal(G.daypart(6), "dawn");
  assert.equal(G.daypart(23), "night");
});

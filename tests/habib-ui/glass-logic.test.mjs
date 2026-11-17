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

test("glowColor prefers white unless HA reports a colour mode", () => {
  const amber = G.kelvinToRgb(3000);
  assert.deepEqual(G.glowColor({ color_mode: "color_temp", color_temp_kelvin: 3000, rgb_color: [255, 0, 0] }), amber);
  assert.deepEqual(G.glowColor({ color_mode: null, color_temp_kelvin: 3000, rgb_color: [255, 0, 0] }), amber);
  assert.deepEqual(G.glowColor({ color_mode: "rgbw", color_temp_kelvin: 3000, rgb_color: [255, 0, 0], rgbw_color: [255, 0, 0, 255] }), amber);
  assert.deepEqual(G.glowColor({ color_mode: "rgbw", rgb_color: [255, 0, 0], rgbw_color: [255, 0, 0, 0] }), [255, 0, 0]);
  assert.equal(G.glowColor({}), null);
  assert.equal(G.colorLabel({ color_mode: "color_temp", color_temp_kelvin: 2700 }), "White 2700 K");
});

test("lightGlow: plugs count as on but not in brightness or colour", () => {
  const states = {
    "switch.plug": { state: "on", attributes: {} },
    "light.a": { state: "on", attributes: { brightness: 128, color_mode: "color_temp", color_temp_kelvin: 2700 } },
  };
  const g = G.lightGlow(states, ["switch.plug", "light.a"]);
  assert.equal(g.on, 2);
  assert.equal(g.pct, 50);
  assert.deepEqual(g.rgb, G.kelvinToRgb(2700));
  assert.deepEqual(G.byDomain(["light.a", "switch.b", "light.c"]), { light: ["light.a", "light.c"], switch: ["switch.b"] });
});

test("weatherLayers", () => {
  assert.equal(G.weatherLayers("sunny", true).orb, "moon");
  assert.equal(G.weatherLayers("cloudy", false).orb, null);
  assert.equal(G.weatherLayers("lightning-rainy", false).bolt, true);
  assert.equal(G.daypart(6), "dawn");
  assert.equal(G.daypart(23), "night");
});

// ---- Prayer bar wording (I57) ----
test("prayerStatus: all done today when every time is valid and none is left", () => {
  const now = d("2026-11-16T22:00:00Z");
  const t = (h) => d(`2026-11-16T${h}:00Z`);
  const p = G.prayerPlan({ fajr: t("05:50"), sunrise: t("07:00"), dhuhr: t("12:15"), asr: t("15:10"), maghrib: t("17:30"), isha: t("18:45") }, now, sameDay);
  assert.equal(p.next, null);
  assert.equal(G.prayerStatus(p), "done");
});

test("prayerStatus: unavailable only when a sensor is missing, unknown or unavailable", () => {
  const now = d("2026-11-16T22:00:00Z");
  const t = (h) => d(`2026-11-16T${h}:00Z`);
  const missing = G.prayerPlan({ fajr: t("05:50"), dhuhr: t("12:15"), asr: null, maghrib: t("17:30"), isha: t("18:45") }, now, sameDay);
  assert.equal(G.prayerStatus(missing), "unavailable");
  assert.equal(G.prayerStatus(G.prayerPlan({ fajr: null, isha: null }, now, sameDay)), "unavailable");
  const ahead = G.prayerPlan({ fajr: t("05:50"), asr: null, isha: d("2026-11-16T23:00:00Z") }, now, sameDay);
  assert.equal(G.prayerStatus(ahead), "next");
});

// ---- habib-layout packing (D79) ----
test("columnCount follows min(max, floor((width + gap) / (min + gap)))", () => {
  const o = { maxColumns: 4, minColumn: 320, gap: 32, compactBelow: 700 };
  assert.equal(G.columnCount(398, o), 1);     // phone
  assert.equal(G.columnCount(699.09, o), 1);  // the old blank band (I56) still renders one column
  assert.equal(G.columnCount(788, o), 2);     // 820 wide
  assert.equal(G.columnCount(1152, o), 3);    // 1440 minus sidebar
  assert.equal(G.columnCount(1440, o), 4);    // 1728 minus sidebar
  assert.equal(G.columnCount(2272, o), 4);    // capped
  assert.equal(G.columnCount(0, o), 1);
});

test("packGroups: wireframe heights at 3 columns, config order into the shortest column, ties left", () => {
  // hero, HOME, FLOORS, LIVING, BEDROOM, NURSERY, LISTEN, UPSTAIRS
  const p = G.packGroups([262, 476, 312, 568, 504, 504, 322, 760], 3, 0);
  assert.deepEqual(p.place.map((x) => x.col), [0, 1, 2, 0, 2, 1, 2, 0]);
  assert.deepEqual(p.place.map((x) => x.top), [0, 0, 0, 262, 312, 476, 816, 830]);
  assert.deepEqual(p.colHeights, [1590, 980, 1138]);
  assert.equal(p.height, 1590);
});

test("packGroups: 1, 2 and 4 columns, gaps, hidden groups and one very tall group", () => {
  assert.deepEqual(G.packGroups([100, 200, 50], 1, 10).place, [{ col: 0, top: 0 }, { col: 0, top: 110 }, { col: 0, top: 320 }]);
  assert.deepEqual(G.packGroups([100, 100, 100], 2, 0).place.map((x) => x.col), [0, 1, 0]); // tie goes left
  assert.deepEqual(G.packGroups([10, 20, 30, 40, 5], 4, 0).place.map((x) => x.col), [0, 1, 2, 3, 0]);
  const tall = G.packGroups([2000, 100, 100, 100, 100], 2, 0);
  assert.deepEqual(tall.place.map((x) => x.col), [0, 1, 1, 1, 1]); // everything else stacks beside it
  const hidden = G.packGroups([100, 0, null, 100], 2, 0);
  assert.equal(hidden.place[1], null);
  assert.equal(hidden.place[2], null);
  assert.deepEqual(hidden.place[3], { col: 1, top: 0 });
});

// ---- habib-button ----
test("buttonAction: allowed domains toggle or run, refused domains throw", () => {
  assert.deepEqual(G.buttonAction("light.a", "on"), { domain: "light", service: "turn_off", stateful: true });
  assert.deepEqual(G.buttonAction("switch.a", "off"), { domain: "switch", service: "turn_on", stateful: true });
  assert.deepEqual(G.buttonAction("input_boolean.a", "off"), { domain: "input_boolean", service: "turn_on", stateful: true });
  assert.deepEqual(G.buttonAction("scene.a", "x"), { domain: "scene", service: "turn_on", stateful: false });
  assert.deepEqual(G.buttonAction("script.a", "off"), { domain: "script", service: "turn_on", stateful: false });
  for (const id of ["lock.front", "cover.garage", "climate.up", "alarm_control_panel.home", "media_player.pod"]) assert.throws(() => G.buttonAction(id, "on"), /never controls/);
  assert.throws(() => G.buttonAction("sensor.x", "1"));
  assert.throws(() => G.buttonAction("", ""));
});

test("plainText strips summary markup for aria-label", () => {
  assert.equal(G.plainText('Down <b class="x">72°</b> · Up <b>72°</b>'), "Down 72° · Up 72°");
});

// ---- Single-hex colour ----
test("derived colours stay within 5/255 of the values they replaced (default base)", () => {
  const near = (hex, want) => { const a = G.hexToRgb(hex); want.forEach((v, i) => assert.ok(Math.abs(a[i] - v) <= 5, `${hex} vs ${want}`)); };
  const css = G.derivePalette("#1c3226", "css");
  near(css.page, [18, 34, 26]); near(css["page-deep"], [15, 28, 21]); near(css.dialog, [28, 49, 38]); near(css.ink, [22, 36, 27]);
  const chrome = G.derivePalette("#1c3226", "chrome");
  near(chrome["sidebar-background-color"], [15, 28, 21]); near(chrome["secondary-background-color"], [26, 45, 34]); near(chrome["state-icon-color"], [207, 224, 212]);
});

test("a different base changes every derived colour and keeps the hue", () => {
  const navy = G.derivePalette("#1b2a4a", "css");
  const page = G.hexToRgb(navy.page);
  assert.ok(page[2] > page[1] && page[2] > page[0]); // still blue
  assert.notEqual(navy.page, G.derivePalette("#1c3226", "css").page);
});

test("clampBase keeps the base in the dark range; contrast maths is WCAG", () => {
  assert.equal(G.clampBase("#1c3226"), "#1c3226");
  const L = (hex) => G.rgbToOklab(G.hexToRgb(hex))[0];
  assert.ok(L(G.clampBase("#ffffff")) <= 0.361);
  assert.ok(L(G.clampBase("#000000")) >= 0.159);
  assert.equal(G.clampBase("nope"), null);
  assert.equal(Math.round(G.contrast([255, 255, 255], [0, 0, 0])), 21);
});

test("css recipes are valid color-mix text built from the base variable", () => {
  assert.equal(G.cssRecipe(["black", 19]), "color-mix(in oklab, var(--g-base) 81%, black 19%)");
  assert.equal(G.cssRecipe(["black", 0]), "var(--g-base)");
  assert.match(G.cssRecipe(["white", 16.5, 0.88]), /^color-mix\(in oklab, color-mix\(in oklab, var\(--g-base\) 83.5%, white 16.5%\) 88%, transparent\)$/);
  for (const r of Object.values(G.PALETTE.css)) assert.notEqual(r[0], "lch"); // CSS group: mix recipes only
});

test("adhanStatus: on, off and error", () => {
  const all = ["on", "on", "on", "on", "on"];
  assert.equal(G.adhanStatus({ gate: "on", error: "", automations: all }), "on");
  assert.equal(G.adhanStatus({ gate: "on", error: "unknown", automations: all }), "on");
  assert.equal(G.adhanStatus({ gate: "off", error: "", automations: all }), "off");
  assert.equal(G.adhanStatus({ gate: "off", error: "2026-11-17 Fajr.mp3: volume unreadable", automations: all }), "off");
  assert.equal(G.adhanStatus({ gate: "on", error: "2026-11-17 Fajr.mp3: volume unreadable", automations: all }), "error");
  assert.equal(G.adhanStatus({ gate: "on", error: "", automations: ["on", "off", "on"] }), "error");
  assert.equal(G.adhanStatus({ gate: "on", error: "", automations: ["on", "unavailable"] }), "error");
  assert.equal(G.adhanStatus({ gate: "unavailable" }), "error");
  assert.equal(G.adhanStatus({ gate: null }), "error");
});

test("climate targets and steps keep the range gap and the limits", () => {
  const r = G.climateTargets("heat_cool", { target_temp_low: 69, target_temp_high: 78, temperature: null });
  assert.deepEqual(r, { kind: "range", low: 69, high: 78 });
  assert.deepEqual(G.climateTargets("heat", { temperature: 70 }), { kind: "single", value: 70 });
  assert.deepEqual(G.climateTargets("off", {}), { kind: "none" });
  assert.deepEqual(G.stepTarget(r, "low", 1), { kind: "range", low: 70, high: 78 });
  assert.deepEqual(G.stepTarget({ kind: "range", low: 74, high: 77 }, "low", 1), { kind: "range", low: 74, high: 77 });
  assert.deepEqual(G.stepTarget({ kind: "range", low: 74, high: 77 }, "high", -1), { kind: "range", low: 74, high: 77 });
  assert.deepEqual(G.stepTarget({ kind: "single", value: 90 }, null, 1), { kind: "single", value: 90 });
  assert.deepEqual(G.stepTarget({ kind: "single", value: 50 }, null, -1, { min: 50 }), { kind: "single", value: 50 });
  assert.deepEqual(G.targetData({ kind: "range", low: 68, high: 77 }), { target_temp_low: 68, target_temp_high: 77 });
  assert.deepEqual(G.targetData({ kind: "single", value: 71 }), { temperature: 71 });
});

test("fluidPack: pins, chains, tallest-first balance, config order inside a column", () => {
  // hero(pinned left) home floors(with home) lights(pinned right) media lists
  const h = [1040, 430, 300, 450, 80, 80];
  const meta = [{ column: 1 }, {}, { with: 1 }, { column: -1 }, {}, {}];
  const three = G.fluidPack(h, 3, meta);
  assert.deepEqual(three.assign, [0, 1, 1, 2, 2, 2]);
  assert.equal(three.place[2].top, 430); // floors directly under home
  assert.equal(three.place[4].top, 450); // media under lights
  const four = G.fluidPack(h, 4, meta);
  assert.deepEqual(four.assign, [0, 1, 1, 3, 2, 2]); // lights stays rightmost
  const one = G.fluidPack(h, 1, meta);
  assert.ok(one.assign.every((c) => c === 0));
  assert.deepEqual(one.place.map((p) => p.top), [0, 1040, 1470, 1770, 2220, 2300]);
});

test("fluidPack: a kept assignment only moves tops; hidden groups take no room", () => {
  const meta = [{ column: 1 }, {}, { with: 1 }, { column: -1 }, {}, {}];
  const first = G.fluidPack([1040, 430, 300, 450, 80, 80], 3, meta);
  const after = G.fluidPack([1040, 430, 300, 900, 80, 80], 3, meta, first.assign); // a room opened in Lights
  assert.deepEqual(after.assign, first.assign);
  assert.equal(after.place[4].top, 900);
  const hidden = G.fluidPack([1040, 0, 300, 450, 80, 80], 3, meta);
  assert.equal(hidden.place[1], null);
  assert.ok(hidden.place[2]); // the follower of a hidden anchor still shows
});

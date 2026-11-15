import test from "node:test";
import assert from "node:assert/strict";
import * as L from "../../www/habib/habib-logic.js";

const light = (state, extra = {}) => ({ state, attributes: { supported_color_modes: ["color_temp"], ...extra } });
const S = {
  "light.a": light("on", { brightness: 255 }),
  "light.b": light("off"),
  "light.c": light("unavailable"),
  "light.d": light("unknown"),
  "light.plain": { state: "on", attributes: { supported_color_modes: ["onoff"] } },
  "light.on2": light("on", { brightness: 128 }),
};

test("group tap rule: any on -> turn_off all usable", () => {
  const v = L.lightView(S, ["light.a", "light.b"]);
  assert.deepEqual(L.tapPlan(v), { service: "turn_off", ids: ["light.a", "light.b"] });
});

test("group tap rule: all off -> turn_on all usable", () => {
  const v = L.lightView(S, ["light.b", "light.b"]);
  assert.equal(L.tapPlan(v).service, "turn_on");
});

test("counts skip unavailable and unknown members", () => {
  const v = L.lightView(S, ["light.a", "light.b", "light.c", "light.d"]);
  assert.equal(v.label, "1 of 2 on");
  assert.deepEqual(L.tapPlan(v).ids, ["light.a", "light.b"]);
  assert.deepEqual(v.notes, ["No response: 2"]);
});

test("single light labels On / Off", () => {
  assert.equal(L.lightView(S, ["light.a"]).label, "On");
  assert.equal(L.lightView(S, ["light.b"]).label, "Off");
});

test("all members dead -> No response and no tap plan", () => {
  const v = L.lightView(S, ["light.c", "light.d"]);
  assert.equal(v.label, "No response");
  assert.equal(v.kind, "dead");
  assert.equal(L.tapPlan(v), null);
});

test("nonexistent entity -> Not found text", () => {
  const v = L.lightView(S, ["light.does_not_exist_test"]);
  assert.equal(v.label, "Not found: light.does_not_exist_test");
  assert.equal(v.kind, "missing");
  assert.equal(L.tapPlan(v), null);
});

test("group with one typo keeps working and notes the typo", () => {
  const v = L.lightView(S, ["light.a", "light.typo"]);
  assert.equal(v.label, "1 of 1 on");
  assert.deepEqual(v.notes, ["Not found: light.typo"]);
});

test("empty entity list", () => {
  assert.equal(L.lightView(S, []).label, "No entities set");
});

test("brightness support: any mode other than onoff", () => {
  assert.equal(L.supportsBrightness(S["light.a"]), true);
  assert.equal(L.supportsBrightness(S["light.plain"]), false);
  assert.equal(L.supportsBrightness({ state: "on", attributes: {} }), false);
  assert.equal(L.supportsBrightness(undefined), false);
});

test("brightness targets: usable and capable only", () => {
  const t = L.brightnessTargets(S, ["light.a", "light.plain", "light.c", "light.nope"]);
  assert.deepEqual(t, ["light.a"]);
});

test("brightness start value and clamp", () => {
  assert.equal(L.brightnessStart(S, ["light.a"]), 100);
  assert.equal(L.brightnessStart(S, ["light.on2"]), 50);
  assert.equal(L.brightnessStart(S, ["light.b"]), 100);
  assert.equal(L.clampPct(2), 10);
  assert.equal(L.clampPct(150), 100);
  assert.equal(L.clampPct("abc"), 100);
});

test("blocked-service guard: domains", () => {
  for (const d of ["lock", "cover", "climate", "alarm_control_panel", "media_player", "homeassistant"]) {
    assert.equal(L.checkAction({ service: `${d}.anything` }).blocked, true, d);
  }
  assert.equal(L.checkAction({ service: "scene.turn_on", data: { entity_id: "scene.x" } }).ok, true);
  assert.equal(L.checkAction({ service: "light.turn_on" }).ok, true);
});

test("blocked-service guard: entity in blocked domain, case, and bad format", () => {
  assert.equal(L.checkAction({ service: "light.turn_on", data: { entity_id: "lock.front" } }).blocked, true);
  assert.equal(L.checkAction({ service: "light.turn_on", data: { entity_id: ["light.a", "cover.g"] } }).blocked, true);
  assert.equal(L.checkAction({ service: "scene.turn_on", target: { entity_id: "climate.x" } }).blocked, true);
  assert.equal(L.checkAction({ service: "LOCK.unlock" }).blocked, true);
  assert.equal(L.checkAction({ service: "nodot" }).ok, false);
  assert.equal(L.checkAction({}).ok, false);
});

test("states map: text, tone, fallback", () => {
  const states = { "lock.x": { state: "locked", attributes: {} }, "cover.y": { state: "open", attributes: {} } };
  const item = { entity: "lock.x", states: { locked: { text: "Locked", tone: "ok" }, unlocked: { text: "Unlocked", tone: "warn" } } };
  assert.deepEqual(L.itemStatus(states, item), { kind: "ok", text: "Locked", tone: "ok" });
  const item2 = { entity: "cover.y", states: { closed: { text: "Closed", tone: "ok" } } };
  assert.deepEqual(L.itemStatus(states, item2), { kind: "ok", text: "Open", tone: "neutral" });
  const item3 = { entity: "lock.x", states: { locked: { text: "Locked", tone: "loud" } } };
  assert.equal(L.itemStatus(states, item3).tone, "neutral");
});

test("attribute chip: climate current_temperature with unit", () => {
  const states = { "climate.d": { state: "heat_cool", attributes: { current_temperature: 72 } }, "climate.n": { state: "heat_cool", attributes: {} } };
  assert.equal(L.itemStatus(states, { entity: "climate.d", attribute: "current_temperature", unit: "°" }).text, "72°");
  assert.equal(L.itemStatus(states, { entity: "climate.n", attribute: "current_temperature" }).text, "No response");
});

test("status strip: No response and Not found", () => {
  const states = { "lock.x": { state: "unavailable", attributes: {} }, "sensor.y": { state: "unknown", attributes: {} } };
  assert.equal(L.itemStatus(states, { entity: "lock.x" }).text, "No response");
  assert.equal(L.itemStatus(states, { entity: "sensor.y" }).text, "No response");
  assert.equal(L.itemStatus(states, { entity: "lock.typo" }).text, "Not found: lock.typo");
});

test("render gate: no re-render when nothing relevant changed", () => {
  let renders = 0;
  const ids = ["light.a", "light.b"];
  const gate = L.createRenderGate((h) => L.entitiesSignature(h, ids, ["supported_color_modes"]), () => { renders++; });
  let hass = { states: { ...S } };
  assert.equal(gate.update(hass), true);
  assert.equal(renders, 1);
  // Unrelated entity changes, brightness change, new object identity: no render.
  hass = { states: { ...S, "sensor.other": { state: "5", attributes: {} }, "light.a": light("on", { brightness: 10 }) } };
  assert.equal(gate.update(hass), false);
  assert.equal(gate.update({ states: { ...hass.states } }), false);
  assert.equal(renders, 1);
  // Relevant change: render once.
  hass = { states: { ...hass.states, "light.b": light("on") } };
  assert.equal(gate.update(hass), true);
  assert.equal(renders, 2);
  // force renders regardless.
  gate.force(hass);
  assert.equal(renders, 3);
});

test("strip signature ignores unrelated attributes", () => {
  const items = [{ entity: "climate.d", attribute: "current_temperature" }];
  const a = { states: { "climate.d": { state: "heat_cool", attributes: { current_temperature: 72, hvac_modes: [1] } } } };
  const b = { states: { "climate.d": { state: "heat_cool", attributes: { current_temperature: 72, hvac_modes: [2] } } } };
  const c = { states: { "climate.d": { state: "heat_cool", attributes: { current_temperature: 73 } } } };
  assert.equal(L.stripSignature(a, items), L.stripSignature(b, items));
  assert.notEqual(L.stripSignature(a, items), L.stripSignature(c, items));
});

test("clock timer aligns to the next minute", () => {
  assert.equal(L.msToNextMinute(0), 60050);
  assert.equal(L.msToNextMinute(59950), 100);
});

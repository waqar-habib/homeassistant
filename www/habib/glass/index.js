// glass/index.js: loads the glass card set. Every file is fetched in parallel, and the custom
// elements are defined together only when all of them have arrived, so a dashboard never shows
// a half-registered set (no flash of missing cards).
//   base.js   tokens, shared stylesheet, GlassCard, drawer     art.js   drawn lamps, weather, icons
//   one file per card: hero, prayer, light, climate, security, media, todo, label, room, dock,
//   button, layout, section, accordion
//
// Library names (library v1, 2026-11-17, Bootstrap 6 naming, no owner name): every component is
// registered as custom:ui-<name>. The old custom:habib-* names stay registered with their old
// defaults, so dashboards built before the library keep working unchanged.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const FILES = ["hero", "prayer", "light", "climate", "security", "media", "todo", "label", "room", "dock", "button", "layout", "section", "accordion"];
const mods = await Promise.all(FILES.map((f) => B.load(`./${f}.js`)));
const byTag = Object.fromEntries(mods.map((m) => [m.card.tag, m.card]));

// Library name -> [old tag, library defaults, picker name, description]. null = the file is library-native.
const LIBRARY = {
  "ui-page": ["habib-layout", {}, "Page", "Layout: packs sections into columns by its own width; one column on a phone. Paints the wallpaper."],
  "ui-heading": ["habib-label", {}, "Heading", "Content: small-caps heading for a group of cards."],
  "ui-card": ["habib-light", { defaultLayout: "row" }, "Card", "Light or switch card. Large card (art beside name and state, control pill below)."],
  "ui-hero": ["habib-hero", {}, "Hero", "Clock, date and weather."],
  "ui-prayer": ["habib-prayer", {}, "Prayer times", "Five prayers, countdown, Adhan badge (shown, never changed)."],
  "ui-climate": ["habib-climate", { defaultControls: true }, "Climate", "Thermostat dials; a tap opens the climate drawer."],
  "ui-security": ["habib-security", {}, "Security", "Door and garage status; a tap opens Home Assistant's own dialog."],
  "ui-media": ["habib-media", {}, "Media", "Speaker player."],
  "ui-list": ["habib-todo", {}, "List", "To-do list."],
  "ui-dock": ["habib-dock", {}, "Dock", "Status bars, two per row."],
  "ui-button": ["habib-button", {}, "Button", "Generic chip or tile for a switch, light, scene, script or helper."],
};

const define = (tag, cls) => { if (!customElements.get(tag)) customElements.define(tag, cls); };
for (const { card } of mods) define(card.tag, card.cls);
for (const [tag, [old, defaults]] of Object.entries(LIBRARY)) {
  const Base = byTag[old].cls;
  const Cls = class extends Base {};
  for (const [k, v] of Object.entries(defaults)) Cls[k] = v;
  define(tag, Cls);
}
for (const [tag, [, , name, desc]] of Object.entries(LIBRARY)) B.registerCard(tag, name, desc);
for (const { card } of mods) if (card.tag.startsWith("ui-")) B.registerCard(card.tag, card.name, card.description);
B.injectGlobals();
export const cards = [...mods.map((m) => m.card.tag), ...Object.keys(LIBRARY)];

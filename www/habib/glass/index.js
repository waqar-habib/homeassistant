// glass/index.js: loads the glass card set. Every file is fetched in parallel, and the custom
// elements are defined together only when all of them have arrived, so a dashboard never shows
// a half-registered set (no flash of missing cards).
//   base.js   tokens, shared stylesheet, GlassCard        art.js   drawn lamps, weather, icons
//   one file per card: hero, prayer, light, climate, security, media, todo, label, room, dock,
//   button, layout
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const FILES = ["hero", "prayer", "light", "climate", "security", "media", "todo", "label", "room", "dock", "button", "layout"];
const mods = await Promise.all(FILES.map((f) => B.load(`./${f}.js`)));
for (const { card } of mods) if (!customElements.get(card.tag)) customElements.define(card.tag, card.cls);
for (const { card } of mods) B.registerCard(card.tag, card.name, card.description);
B.injectGlobals();
export const cards = mods.map((m) => m.card.tag);

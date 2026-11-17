// Habib UI loader. Loaded as a Lovelace module resource: /local/habib/loader.js?v=11
// Dev loop: add ?dev to the dashboard URL (or set localStorage habib_dev to "1")
// to load the card files with a fresh timestamp on every page load (no cache).
// Production loads them pinned to VERSION. Bump VERSION on every JS change (CR6).
// v7: adds habib-glass.js (glass card set, D70). habib-ui.js stays for habib-lab and habib-kiosk.
// v8: opt-in fold for large glass cards (collapsible: true), used on habib-wh only.
// v9: habib-room, habib-dock, compact hero; habib-mkh fits one iPhone screen (D75).
// v10: plug lamps in groups, scroll-safe sliders, stricter lamp colour, 1/3 icon chips and dock bars, direct door and garage bars.
// v11: glass cards split into www/habib/glass/ (one token file, one shared stylesheet, one file per card), habib-layout,
//      habib-button, single-hex colour (habib-base), defect fixes I55 to I59.
// v12: component library v1 (generic ui-* names, Bootstrap 6 naming): ui-page, ui-section, ui-card (Large card),
//      ui-accordion, drawer (shade, climate controls), Adhan badge on/off/error, heading gap, 44 px list rows.
// v13: fluid rule (ui-page packing: fluid), always-open and nested sections, climate stepper fits its box.
const VERSION = 13;

const isDev = (() => {
  try {
    return new URLSearchParams(location.search).has("dev") ||
      localStorage.getItem("habib_dev") === "1";
  } catch (e) {
    return false;
  }
})();

const q = isDev ? `t=${Date.now()}` : `v=${VERSION}`;

for (const file of ["habib-ui.js", "habib-glass.js"]) {
  const url = `/local/habib/${file}?${q}`;
  import(url).catch((err) => {
    console.error("habib: failed to load", url, err);
  });
}

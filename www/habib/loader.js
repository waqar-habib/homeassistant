// Habib UI loader. Loaded as a Lovelace module resource: /local/habib/loader.js?v=7
// Dev loop: add ?dev to the dashboard URL (or set localStorage habib_dev to "1")
// to load the card files with a fresh timestamp on every page load (no cache).
// Production loads them pinned to VERSION. Bump VERSION on every JS change (CR6).
// v7: adds habib-glass.js (glass card set, D70). habib-ui.js stays for habib-lab and habib-kiosk.
const VERSION = 7;

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

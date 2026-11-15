// Habib UI loader. Loaded as a Lovelace module resource: /local/habib/loader.js?v=3
// Dev loop: add ?dev to the dashboard URL (or set localStorage habib_dev to "1")
// to load habib-ui.js with a fresh timestamp on every page load (no cache).
// Production loads habib-ui.js pinned to VERSION. Bump VERSION on every JS change (CR6).
const VERSION = 3;

const isDev = (() => {
  try {
    return new URLSearchParams(location.search).has("dev") ||
      localStorage.getItem("habib_dev") === "1";
  } catch (e) {
    return false;
  }
})();

const url = isDev
  ? `/local/habib/habib-ui.js?t=${Date.now()}`
  : `/local/habib/habib-ui.js?v=${VERSION}`;

import(url).catch((err) => {
  console.error("habib-ui: failed to load", url, err);
});

// habib-glass: entry point of the glass card set (D70). Since loader v11 the cards live in
// www/habib/glass/: base.js (tokens, shared stylesheet, GlassCard), art.js (drawings) and one
// file per card. This file only loads that folder, with the same cache key the loader gave it.
// Rules kept: no entity IDs in JavaScript, every card registers in window.customCards, sizes via
// getGridOptions, lock, garage and climate never get a service call from a card, Adhan is shown
// and never changed.
await import(new URL("./glass/index.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);

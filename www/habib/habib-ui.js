// habib-ui: design foundation and custom cards for the Habib dashboards.
// Loaded by /local/habib/loader.js. Rules: no entity IDs, labels or icons in JavaScript
// (CR1); every card registers in window.customCards (CR2); sizes via getGridOptions (CR3).
// Version constant lives in loader.js; bump it on every change here (CR6).

const TOKENS_ID = "habib-ui-tokens";

const TOKENS = `
:root {
  --habib-accent: #2EC4D6;
  --habib-on-accent: #00363D;

  --habib-surface: #1B1F23;
  --habib-surface-container: #22272C;
  --habib-surface-high: #2A3036;
  --habib-on-surface: #E2E6EA;
  --habib-on-surface-muted: #A4ADB6;
  --habib-outline: #3C444C;
  --habib-error: #FFB4AB;

  --habib-font: Roboto, "Helvetica Neue", Arial, sans-serif;
  --habib-type-title: 500 20px/28px var(--habib-font);
  --habib-type-body: 400 16px/24px var(--habib-font);
  --habib-type-label: 500 14px/20px var(--habib-font);

  --habib-space-1: 8px;
  --habib-space-2: 16px;
  --habib-space-3: 24px;

  --habib-radius-s: 8px;
  --habib-radius-m: 16px;
  --habib-radius-l: 28px;

  --habib-elevation-1: 0 1px 2px rgba(0,0,0,.3);
  --habib-elevation-2: 0 4px 12px rgba(0,0,0,.35);

  --habib-glass-blur: 16px;
  --habib-glass-fill: rgba(42, 48, 54, .72);
}
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --habib-accent: #00677A;
    --habib-on-accent: #FFFFFF;
    --habib-surface: #F5F7F9;
    --habib-surface-container: #FFFFFF;
    --habib-surface-high: #E6EBEF;
    --habib-on-surface: #1A1C1E;
    --habib-on-surface-muted: #4B545C;
    --habib-outline: #C3CBD2;
    --habib-error: #BA1A1A;
    --habib-glass-fill: rgba(255, 255, 255, .72);
  }
}
:root[data-theme="light"] {
  --habib-accent: #00677A;
  --habib-on-accent: #FFFFFF;
  --habib-surface: #F5F7F9;
  --habib-surface-container: #FFFFFF;
  --habib-surface-high: #E6EBEF;
  --habib-on-surface: #1A1C1E;
  --habib-on-surface-muted: #4B545C;
  --habib-outline: #C3CBD2;
  --habib-error: #BA1A1A;
  --habib-glass-fill: rgba(255, 255, 255, .72);
}
/* Tablet: a 12 px blur. The tablet dashboard sets data-device="tablet" on its root. */
:root[data-device="tablet"] { --habib-glass-blur: 12px; }
/* Global off switch: no blur anywhere. */
:root[data-glass="off"] { --habib-glass-blur: 0px; }

habib-surface, habib-diag {
  display: block;
  box-sizing: border-box;
  color: var(--habib-on-surface);
  background: var(--habib-surface-container);
  border-radius: var(--habib-radius-m);
  padding: var(--habib-space-2);
  font: var(--habib-type-body);
}
/* Glass is opt-in per surface (class habib-glass). Design limit: at most 4 per screen. */
habib-surface.habib-glass, habib-diag.habib-glass {
  background: var(--habib-glass-fill);
  -webkit-backdrop-filter: blur(var(--habib-glass-blur));
  backdrop-filter: blur(var(--habib-glass-blur));
}
habib-surface[data-glass="off"], habib-diag[data-glass="off"] {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
.habib-title { font: var(--habib-type-title); margin: 0 0 var(--habib-space-1); }
.habib-row { display: flex; justify-content: space-between; gap: var(--habib-space-1); padding: 2px 0; }
.habib-muted { color: var(--habib-on-surface-muted); font: var(--habib-type-label); }
`;

function injectTokens() {
  if (document.getElementById(TOKENS_ID)) return;
  const style = document.createElement("style");
  style.id = TOKENS_ID;
  style.textContent = TOKENS;
  document.head.appendChild(style);
}

function registerCard(tag, name, description) {
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === tag)) {
    window.customCards.push({ type: tag, name, description, preview: false });
  }
}

// Base surface: a styled container. Use inside cards; tag with class habib-glass for glass.
class HabibSurface extends HTMLElement {
  connectedCallback() {
    injectTokens();
  }
}

// Diagnostics card: shows viewport, device and user facts. Makes no service call.
class HabibDiag extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    injectTokens();
    this._render();
    this._onResize = () => this._render();
    window.addEventListener("resize", this._onResize);
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this._onResize);
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 12, rows: 3, min_columns: 6, min_rows: 2 };
  }

  static getStubConfig() {
    return { type: "custom:habib-diag", title: "Habib diagnostics" };
  }

  _render() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const cfg = this._config || {};
    const user = (this._hass && this._hass.user) || {};
    const glassOn = document.documentElement.getAttribute("data-glass") !== "off";
    const supportsBlur =
      typeof CSS !== "undefined" && CSS.supports &&
      (CSS.supports("backdrop-filter", "blur(1px)") ||
       CSS.supports("-webkit-backdrop-filter", "blur(1px)"));
    const rows = [
      ["Viewport", `${window.innerWidth} x ${window.innerHeight}`],
      ["Device pixel ratio", String(window.devicePixelRatio)],
      ["Glass blur supported", supportsBlur ? "yes" : "no"],
      ["Glass switched on", glassOn ? "yes" : "no"],
      ["User", user.name || "unknown"],
      ["Admin", user.is_admin === undefined ? "unknown" : (user.is_admin ? "yes" : "no")],
      ["Date", new Date().toString()],
      ["User agent", navigator.userAgent],
    ];
    const body = rows
      .map(([k, v]) => `<div class="habib-row"><span class="habib-muted">${k}</span><span>${escapeHtml(v)}</span></div>`)
      .join("");
    const surfaceClass = "habib-glass";
    this.shadowRoot.innerHTML = `
      <style>${TOKENS}
        :host { display: block; }
        .card { box-sizing: border-box; height: 100%; background: var(--habib-surface-container);
                color: var(--habib-on-surface); border-radius: var(--habib-radius-m); padding: var(--habib-space-2);
                font: var(--habib-type-body); }
        .card.habib-glass { background: var(--habib-glass-fill);
                -webkit-backdrop-filter: blur(var(--habib-glass-blur)); backdrop-filter: blur(var(--habib-glass-blur)); }
        .habib-title { font: var(--habib-type-title); margin: 0 0 var(--habib-space-1); }
        .habib-row { display: flex; justify-content: space-between; gap: var(--habib-space-1); padding: 2px 0; }
        .habib-muted { color: var(--habib-on-surface-muted); font: var(--habib-type-label); }
      </style>
      <div class="card ${surfaceClass}">
        <div class="habib-title">${escapeHtml(cfg.title || "Habib diagnostics")}</div>
        ${body}
      </div>`;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

if (!customElements.get("habib-surface")) customElements.define("habib-surface", HabibSurface);
if (!customElements.get("habib-diag")) customElements.define("habib-diag", HabibDiag);

registerCard("habib-diag", "Habib diagnostics", "Viewport, device and user facts for checking the Habib dashboards. No service calls.");
injectTokens();

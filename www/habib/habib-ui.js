// habib-ui: design foundation and custom cards for the Habib dashboards.
// Loaded by /local/habib/loader.js. Rules: no entity IDs, labels or icons in JavaScript
// (CR1); every card registers in window.customCards (CR2); sizes via getGridOptions (CR3).
// Render rule (I44): `set hass` computes a signature of only the states a card uses and
// renders only when it changes. Pure logic lives in habib-logic.js (same version query).
// Version constant lives in loader.js; bump it on every change here (CR6).

const logicUrl = new URL("./habib-logic.js", import.meta.url);
logicUrl.search = new URL(import.meta.url).search;
const L = await import(logicUrl.href);

const TOKENS_ID = "habib-ui-tokens";

const TOKENS = `
:root {
  /* Colour comes only from the Material You theme (--md-sys-color-*), with HA's own variables as fallback. */
  --habib-primary: var(--md-sys-color-primary, var(--primary-color));
  --habib-on-primary: var(--md-sys-color-on-primary, var(--text-primary-color, #fff));
  --habib-secondary-container: var(--md-sys-color-secondary-container, var(--secondary-background-color));
  --habib-on-secondary-container: var(--md-sys-color-on-secondary-container, var(--primary-text-color));
  --habib-surface: var(--md-sys-color-surface, var(--primary-background-color));
  --habib-surface-container: var(--md-sys-color-surface-container, var(--card-background-color));
  --habib-surface-container-low: var(--md-sys-color-surface-container-low, var(--card-background-color));
  --habib-surface-container-high: var(--md-sys-color-surface-container-high, var(--secondary-background-color));
  --habib-on-surface: var(--md-sys-color-on-surface, var(--primary-text-color));
  --habib-on-surface-variant: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
  --habib-outline-variant: var(--md-sys-color-outline-variant, var(--divider-color));
  --habib-error: var(--md-sys-color-error, var(--error-color));

  --habib-font: Roboto, "Helvetica Neue", Arial, sans-serif;
  --habib-type-heading: 500 16px/24px var(--habib-font);
  --habib-type-body: 400 14px/20px var(--habib-font);
  --habib-type-label: 500 14px/20px var(--habib-font);
  --habib-type-support: 400 12px/16px var(--habib-font);

  --habib-space-1: 8px;
  --habib-space-2: 16px;
  --habib-space-3: 24px;

  --habib-radius-chip: 8px;
  --habib-radius-card: 12px;
  --habib-radius-sheet: 28px;
}

habib-surface, habib-diag {
  display: block;
  box-sizing: border-box;
  color: var(--habib-on-surface);
  background: var(--habib-surface-container);
  border-radius: var(--habib-radius-card);
  padding: var(--habib-space-2);
  font: var(--habib-type-body);
}
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function iconHtml(icon) {
  return icon ? `<ha-icon class="icon" icon="${escapeHtml(icon)}"></ha-icon>` : "";
}

// Tile icon: icon and text only (D67), no round badge.
function badgeHtml(icon) {
  return iconHtml(icon);
}

// Styles shared by the interactive cards. Colours and radii come from the --habib-* tokens.
const CARD_CSS = `
  :host { display: block; }
  * { box-sizing: border-box; }
  .tile { all: unset; box-sizing: border-box; position: relative; overflow: hidden; display: flex; align-items: center;
          gap: 12px; width: 100%; min-width: 0; min-height: 64px; padding: 12px var(--habib-space-2);
          background: var(--habib-surface-container); color: var(--habib-on-surface-variant);
          border-radius: var(--habib-radius-card); font: var(--habib-type-label); cursor: pointer;
          transition: background-color .15s, color .15s, opacity .15s; -webkit-user-select: none; user-select: none;
          -webkit-touch-callout: none; touch-action: manipulation; }
  /* State layer on the content colour: hover .08, focus .10, pressed .10. */
  .tile::before { content: ""; position: absolute; inset: 0; background: currentColor; opacity: 0;
                  pointer-events: none; transition: opacity .15s; }
  @media (hover: hover) { .tile:hover::before { opacity: .08; } }
  .tile:focus-visible::before, .tile:active::before { opacity: .10; }
  .tile:focus-visible { outline: 2px solid var(--habib-primary); outline-offset: 2px; }
  .tile.on { background: var(--habib-secondary-container); color: var(--habib-on-secondary-container); }
  .tile.pending { opacity: .7; }
  .tile.dead { opacity: .38; cursor: default; }
  .tile.missing { color: var(--habib-error); border: 1px dashed var(--habib-error); cursor: default; }
  .tile.blocked { color: var(--habib-error); cursor: default; }
  .tile.done { background: var(--habib-secondary-container); color: var(--habib-on-secondary-container); }
  .icon { flex: none; --mdc-icon-size: 24px; width: 24px; height: 24px; }
  .text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
  .name { font: var(--habib-type-label); overflow-wrap: anywhere; }
  .label, .note { font: var(--habib-type-support); opacity: .85; overflow-wrap: anywhere; }
  .empty { padding: var(--habib-space-2); color: var(--habib-error); font: var(--habib-type-support);
           background: var(--habib-surface-container); border-radius: var(--habib-radius-card); }
`;

// ---- Shared bottom sheet (no blur; closes on scrim tap and Escape) ---------------------

let openSheetHandle = null;

function openSheet({ title, build }) {
  if (openSheetHandle) openSheetHandle.close();
  injectTokens();
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      .scrim { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,.32);
               display: flex; align-items: flex-end; justify-content: center; }
      .panel { width: 100%; max-width: 640px; background: var(--habib-surface-container-low); color: var(--habib-on-surface-variant);
               border-radius: var(--habib-radius-sheet) var(--habib-radius-sheet) 0 0;
               padding: 0 var(--habib-space-3) calc(var(--habib-space-3) + env(safe-area-inset-bottom, 0px));
               font: var(--habib-type-body); }
      .handle { width: 32px; height: 4px; margin: 22px auto; border-radius: 2px; background: currentColor; opacity: .4; }
      .head { display: flex; align-items: center; justify-content: space-between; gap: var(--habib-space-2);
              margin-bottom: var(--habib-space-2); }
      .title { font: var(--habib-type-heading); color: var(--habib-on-surface); overflow-wrap: anywhere; }
      .close { all: unset; box-sizing: border-box; min-width: 64px; min-height: 48px; padding: 0 var(--habib-space-2);
               display: flex; align-items: center; justify-content: center; border-radius: 20px;
               color: var(--habib-primary); font: var(--habib-type-label); cursor: pointer; }
      .close:hover { background: color-mix(in srgb, var(--habib-primary) 8%, transparent); }
      .close:focus-visible { outline: 2px solid var(--habib-primary); outline-offset: 2px; }
    </style>
    <div class="scrim">
      <div class="panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="handle"></div>
        <div class="head"><div class="title">${escapeHtml(title)}</div><button class="close" type="button">Done</button></div>
        <div class="content"></div>
      </div>
    </div>`;
  const scrim = root.querySelector(".scrim");
  const panel = root.querySelector(".panel");
  const openedAt = Date.now();
  const previousFocus = document.activeElement;
  const onKey = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      handle.close();
    }
  };
  const handle = {
    close() {
      document.removeEventListener("keydown", onKey, true);
      host.remove();
      if (openSheetHandle === handle) openSheetHandle = null;
      if (previousFocus && previousFocus.focus) previousFocus.focus();
    },
  };
  scrim.addEventListener("click", (e) => {
    // Ignore the click that follows the long press which opened the sheet.
    if (e.target === scrim && Date.now() - openedAt > 400) handle.close();
  });
  root.querySelector(".close").addEventListener("click", () => handle.close());
  document.addEventListener("keydown", onKey, true);
  build(root.querySelector(".content"), handle);
  document.body.appendChild(host);
  const focusTarget = panel.querySelector("input, button");
  if (focusTarget) focusTarget.focus();
  openSheetHandle = handle;
  return handle;
}

// ---- Base class for the interactive cards ----------------------------------------------

class HabibCard extends HTMLElement {
  constructor() {
    super();
    this._timers = new Set();
  }

  // Subclasses implement: _ids(), _signature(hass), _render(), _afterConnect().
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = config;
    this._validate(config);
    this._gate = L.createRenderGate(
      (h) => this._signature(h),
      () => this._render()
    );
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this._setup();
    }
    this._gate.force(this._hass);
  }

  set hass(hass) {
    this._hass = hass;
    if (this._gate) {
      if (this._gate.update(hass)) this._onSignatureChanged();
    }
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    injectTokens();
    this._afterConnect();
  }

  disconnectedCallback() {
    this._clearTimers();
    this._afterDisconnect();
  }

  _validate() {}
  _afterConnect() {}
  _afterDisconnect() {}
  _onSignatureChanged() {}

  _states() {
    return (this._hass && this._hass.states) || {};
  }

  _later(fn, ms) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      fn();
    }, ms);
    this._timers.add(id);
    return id;
  }

  _cancel(id) {
    clearTimeout(id);
    this._timers.delete(id);
  }

  _clearTimers() {
    for (const id of this._timers) clearTimeout(id);
    this._timers.clear();
  }
}

// ---- A. habib-light-button -------------------------------------------------------------

class HabibLightButton extends HabibCard {
  _validate(config) {
    this._ids = L.asList(config.entities);
  }

  _signature(hass) {
    return L.entitiesSignature(hass, this._ids, ["supported_color_modes"]) + `|p${this._pending ? 1 : 0}`;
  }

  _setup() {
    const root = this.shadowRoot;
    root.addEventListener("pointerdown", (e) => this._down(e));
    root.addEventListener("pointermove", (e) => this._move(e));
    root.addEventListener("pointerup", () => this._cancelLong());
    root.addEventListener("pointercancel", () => this._cancelLong());
    root.addEventListener("pointerleave", () => this._cancelLong());
    root.addEventListener("contextmenu", (e) => e.preventDefault());
    root.addEventListener("click", (e) => this._click(e));
  }

  _afterDisconnect() {
    this._pending = false;
    this._longTimer = null;
    this._longFired = false;
  }

  _onSignatureChanged() {
    // A state changed: the pending state (if any) ends with this render.
    if (this._pending) {
      this._pending = false;
      this._cancel(this._pendingTimer);
      this._gate.force(this._hass);
    }
  }

  _render() {
    const cfg = this._config;
    const v = L.lightView(this._states(), this._ids);
    const cls = v.kind !== "ok" ? v.kind : v.anyOn ? "on" : "off";
    const label = this._pending ? "Working…" : v.label;
    const notes = v.notes.length ? `<span class="note">${escapeHtml(v.notes.join(", "))}</span>` : "";
    this.shadowRoot.innerHTML = `
      <style>${CARD_CSS}</style>
      <button class="tile ${cls} ${this._pending ? "pending" : ""}" type="button"
        ${v.kind === "missing" ? "disabled" : ""} aria-label="${escapeHtml(cfg.name || "Light")}: ${escapeHtml(label)}">
        ${badgeHtml(cfg.icon)}
        <span class="text">
          <span class="name">${escapeHtml(cfg.name || "")}</span>
          <span class="label">${escapeHtml(label)}</span>
          ${notes}
        </span>
      </button>`;
  }

  _down(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this._cancelLong();
    this._longFired = false;
    this._downAt = { x: e.clientX, y: e.clientY };
    if (!L.brightnessTargets(this._states(), this._ids).length) return;
    this._longTimer = this._later(() => {
      this._longTimer = null;
      this._longFired = true;
      this._openBrightness();
    }, L.LONG_PRESS_MS);
  }

  _move(e) {
    if (this._longTimer && this._downAt) {
      if (Math.hypot(e.clientX - this._downAt.x, e.clientY - this._downAt.y) > 10) this._cancelLong();
    }
  }

  _cancelLong() {
    if (this._longTimer) {
      this._cancel(this._longTimer);
      this._longTimer = null;
    }
  }

  _click(e) {
    if (!e.target.closest || !e.target.closest(".tile")) return;
    if (this._longFired) {
      this._longFired = false;
      return;
    }
    const plan = L.tapPlan(L.lightView(this._states(), this._ids));
    if (!plan || !this._hass) return;
    this._pending = true;
    this._gate.force(this._hass);
    this._pendingTimer = this._later(() => {
      this._pending = false;
      this._gate.force(this._hass);
    }, L.PENDING_MS);
    this._hass.callService("light", plan.service, {}, { entity_id: plan.ids }).catch(() => {
      this._pending = false;
      this._cancel(this._pendingTimer);
      this._gate.force(this._hass);
    });
  }

  _openBrightness() {
    const hass = this._hass;
    if (!hass) return;
    const targets = L.brightnessTargets(hass.states, this._ids);
    if (!targets.length) return;
    const start = L.brightnessStart(hass.states, targets);
    openSheet({
      title: `${this._config.name || "Light"} brightness`,
      build: (content) => {
        content.innerHTML = `
          <style>
            .row { display: flex; align-items: center; gap: var(--habib-space-2); }
            input { flex: 1; min-height: 48px; accent-color: var(--habib-primary); }
            output { min-width: 56px; text-align: right; font: var(--habib-type-heading); color: var(--habib-on-surface); }
          </style>
          <div class="row">
            <input type="range" min="${L.BRIGHTNESS_MIN}" max="${L.BRIGHTNESS_MAX}" step="1" value="${start}" aria-label="Brightness percent">
            <output>${start}%</output>
          </div>`;
        const input = content.querySelector("input");
        const out = content.querySelector("output");
        input.addEventListener("input", () => {
          out.textContent = `${input.value}%`;
        });
        input.addEventListener("change", () => {
          const pct = L.clampPct(input.value);
          const live = L.brightnessTargets(this._hass.states, this._ids);
          if (live.length) {
            this._hass.callService("light", "turn_on", { brightness_pct: pct }, { entity_id: live });
          }
        });
      },
    });
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    const cols = Number(this._config && this._config.columns);
    return {
      columns: Number.isFinite(cols) && cols >= 1 && cols <= 12 ? cols : 6,
      rows: "auto",
      min_columns: 3,
    };
  }

  static getStubConfig(hass, entities) {
    const first = (entities || []).find((e) => L.domainOf(e) === "light");
    return { type: "custom:habib-light-button", name: "Light", entities: first ? [first] : [] };
  }
}

// ---- B. habib-action-button ------------------------------------------------------------

class HabibActionButton extends HabibCard {
  _validate(config) {
    this._check = L.checkAction(config.action);
    this._ids = this._check.entityIds || [];
    this._flash = "";
  }

  _signature(hass) {
    const states = (hass && hass.states) || {};
    return (hass ? "h" : "n") + this._ids.map((id) => `${id}:${states[id] ? 1 : 0}`).join(",") + `|f${this._flash}`;
  }

  _setup() {
    this.shadowRoot.addEventListener("click", (e) => this._click(e));
  }

  _afterDisconnect() {
    this._flash = "";
  }

  _problem() {
    const c = this._check;
    if (!c.ok && c.blocked) return { cls: "blocked", text: "Blocked in this card" };
    if (!c.ok) return { cls: "missing", text: "Invalid action" };
    const missing = this._ids.find((id) => L.entityStatus(this._states(), id) === "missing");
    if (missing && this._hass) return { cls: "missing", text: `Not found: ${missing}` };
    return null;
  }

  _render() {
    const cfg = this._config;
    const problem = this._problem();
    const flash = this._flash;
    const cls = problem ? problem.cls : flash ? "done" : "";
    const label = problem ? problem.text : flash === "error" ? "Failed" : flash ? "Done" : "";
    this.shadowRoot.innerHTML = `
      <style>${CARD_CSS}</style>
      <button class="tile ${cls}" type="button" ${problem ? "disabled" : ""}
        aria-label="${escapeHtml(cfg.name || "Action")}${label ? ": " + escapeHtml(label) : ""}">
        ${badgeHtml(cfg.icon)}
        <span class="text">
          <span class="name">${escapeHtml(cfg.name || "")}</span>
          ${label ? `<span class="label">${escapeHtml(label)}</span>` : ""}
        </span>
      </button>`;
  }

  _click(e) {
    if (!e.target.closest || !e.target.closest(".tile")) return;
    if (this._problem() || !this._hass) return;
    const { domain, service } = this._check;
    const action = this._config.action;
    const done = (kind) => {
      this._flash = kind;
      this._gate.force(this._hass);
      this._later(() => {
        this._flash = "";
        this._gate.force(this._hass);
      }, 1200);
    };
    const call = action.target
      ? this._hass.callService(domain, service, action.data || {}, action.target)
      : this._hass.callService(domain, service, action.data || {});
    Promise.resolve(call).then(() => done("ok"), () => done("error"));
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 3 };
  }

  static getStubConfig() {
    return { type: "custom:habib-action-button", name: "Action", action: { service: "", data: {} } };
  }
}

// ---- C. habib-status-strip -------------------------------------------------------------

const STRIP_CSS = `
  :host { display: block; }
  * { box-sizing: border-box; }
  .strip { display: flex; flex-wrap: wrap; align-items: center; gap: var(--habib-space-1); color: var(--habib-on-surface);
           font: var(--habib-type-body); }
  .chip { all: unset; box-sizing: border-box; position: relative; display: flex; align-items: center; gap: var(--habib-space-1);
          height: 32px; padding: 0 var(--habib-space-2); border-radius: var(--habib-radius-chip);
          border: 1px solid var(--habib-outline-variant); background: transparent; color: var(--habib-on-surface-variant);
          font: var(--habib-type-label); -webkit-user-select: none; user-select: none; }
  .chip.ico { padding-left: var(--habib-space-1); }
  /* 48px touch area around the 32px chip. */
  button.chip { cursor: pointer; touch-action: manipulation; transition: background-color .15s; }
  button.chip::after { content: ""; position: absolute; inset: -8px 0; }
  button.chip:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
  button.chip:active { background: color-mix(in srgb, currentColor 10%, transparent); }
  button.chip:focus-visible { outline: 2px solid var(--habib-primary); outline-offset: 2px; }
  .chip.ok { color: var(--habib-primary); border-color: var(--habib-primary); }
  .chip.warn { color: var(--habib-error); border-color: var(--habib-error); }
  .chip.missing { color: var(--habib-error); border-style: dashed; }
  .icon { flex: none; --mdc-icon-size: 18px; width: 18px; height: 18px; }
  .lab { color: var(--habib-on-surface-variant); overflow-wrap: anywhere; }
  .val { overflow-wrap: anywhere; }
  .clock { display: flex; flex-direction: column; justify-content: center; min-height: 40px; padding: 0 var(--habib-space-1); }
  .time { font: var(--habib-type-heading); color: var(--habib-on-surface); }
  .date { font: var(--habib-type-support); color: var(--habib-on-surface-variant); }
`;

class HabibStatusStrip extends HabibCard {
  _validate(config) {
    this._items = Array.isArray(config.items) ? config.items.filter(Boolean) : [];
    this._hasClock = this._items.some((i) => i.kind === "clock");
  }

  _signature(hass) {
    return L.stripSignature(hass, this._items);
  }

  _setup() {
    this.shadowRoot.addEventListener("click", (e) => {
      const chip = e.target.closest && e.target.closest("button.chip");
      if (!chip) return;
      const id = chip.getAttribute("data-entity");
      if (!id) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true }));
    });
  }

  setConfig(config) {
    super.setConfig(config);
    if (this.isConnected) this._armClock();
  }

  _afterConnect() {
    this._armClock();
  }

  _afterDisconnect() {
    this._clockTimer = null;
  }

  _armClock() {
    if (!this._hasClock || this._clockTimer) return;
    this._clockTimer = this._later(() => {
      this._clockTimer = null;
      this._tickClock();
      this._armClock();
    }, L.msToNextMinute(Date.now()));
  }

  _clockParts() {
    const now = new Date();
    return {
      time: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      date: now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
    };
  }

  _tickClock() {
    const root = this.shadowRoot;
    if (!root) return;
    const p = this._clockParts();
    root.querySelectorAll("[data-clock]").forEach((el) => {
      el.querySelector(".time").textContent = p.time;
      el.querySelector(".date").textContent = p.date;
    });
  }

  _render() {
    const states = this._states();
    const p = this._clockParts();
    const chips = this._items
      .map((item) => {
        if (item.kind === "clock") {
          return `<div class="clock" data-clock><span class="time">${escapeHtml(p.time)}</span><span class="date">${escapeHtml(p.date)}</span></div>`;
        }
        if (!item.entity) return `<div class="chip missing">Invalid item</div>`;
        const s = L.itemStatus(states, item);
        const label = item.label ? `<span class="lab">${escapeHtml(item.label)}</span>` : "";
        const body = `${iconHtml(item.icon)}${label}<span class="val">${escapeHtml(s.text)}</span>`;
        const cls = (s.kind === "missing" ? "missing" : s.tone) + (item.icon ? " ico" : "");
        const tappable = item.tap !== "none" && s.kind !== "missing";
        return tappable
          ? `<button class="chip ${cls}" type="button" data-entity="${escapeHtml(item.entity)}">${body}</button>`
          : `<div class="chip ${cls}">${body}</div>`;
      })
      .join("");
    this.shadowRoot.innerHTML = `<style>${STRIP_CSS}</style><div class="strip">${chips || '<span class="chip missing">No items set</span>'}</div>`;
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 4 };
  }

  static getStubConfig() {
    return { type: "custom:habib-status-strip", items: [{ kind: "clock" }] };
  }
}

// ---- Base surface and diagnostics ------------------------------------------------------

class HabibSurface extends HTMLElement {
  connectedCallback() {
    injectTokens();
  }
}

// Diagnostics card: viewport, device and user facts. Makes no service call.
// Re-renders only on setConfig, resize and a change of user (not on every hass update).
class HabibDiag extends HabibCard {
  _signature(hass) {
    const u = (hass && hass.user) || {};
    return `${u.id || ""}|${u.name || ""}|${u.is_admin}`;
  }

  _setup() {}

  _afterConnect() {
    this._onResize = () => this._gate && this._gate.force(this._hass);
    window.addEventListener("resize", this._onResize);
  }

  _afterDisconnect() {
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
    const cfg = this._config || {};
    const user = (this._hass && this._hass.user) || {};
    const glassOn = document.documentElement.getAttribute("data-glass") !== "off";
    const supportsBlur =
      typeof CSS !== "undefined" && CSS.supports &&
      (CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)"));
    const rows = [
      ["Viewport", `${window.innerWidth} x ${window.innerHeight}`],
      ["Device pixel ratio", String(window.devicePixelRatio)],
      ["Glass blur supported", supportsBlur ? "yes" : "no"],
      ["Glass switched on", glassOn ? "yes" : "no"],
      ["User", user.name || "unknown"],
      ["Admin", user.is_admin === undefined ? "unknown" : user.is_admin ? "yes" : "no"],
      ["Date", new Date().toString()],
      ["User agent", navigator.userAgent],
    ];
    const body = rows
      .map(([k, v]) => `<div class="row"><span class="muted">${k}</span><span>${escapeHtml(v)}</span></div>`)
      .join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card { box-sizing: border-box; height: 100%; background: var(--habib-surface-container); color: var(--habib-on-surface);
                border-radius: var(--habib-radius-card); padding: var(--habib-space-2); font: var(--habib-type-body); }
        .title { font: var(--habib-type-heading); margin: 0 0 var(--habib-space-1); }
        .row { display: flex; justify-content: space-between; gap: var(--habib-space-1); padding: 2px 0; }
        .muted { color: var(--habib-on-surface-variant); font: var(--habib-type-support); }
      </style>
      <div class="card">
        <div class="title">${escapeHtml(cfg.title || "Habib diagnostics")}</div>
        ${body}
      </div>`;
  }
}

function define(tag, cls) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}

define("habib-surface", HabibSurface);
define("habib-diag", HabibDiag);
define("habib-light-button", HabibLightButton);
define("habib-action-button", HabibActionButton);
define("habib-status-strip", HabibStatusStrip);

registerCard("habib-diag", "Habib diagnostics", "Viewport, device and user facts for checking the Habib dashboards. No service calls.");
registerCard("habib-light-button", "Habib light button", "One light or a group of lights. Tap toggles; press and hold sets brightness.");
registerCard("habib-action-button", "Habib action button", "Runs one scene or light service. Refuses lock, cover, climate, alarm and media player services.");
registerCard("habib-status-strip", "Habib status strip", "A row of status chips: clock, temperatures, lock and door states. Tap opens the entity's dialog. Never calls a service.");
injectTokens();

// glass/button.js: habib-button. A generic chip or tile for any switch, light, input_boolean,
// scene or script, built only from the shared primitives in base.js (no styling of its own).
// It refuses lock, cover, climate, alarm and media_player entities (design guide section 9).
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { G, GlassCard, esc, haptic, usableState, ICONS } = B;

const SIZES = ["auto", "chip", "tile"];
const DEFAULT_ICON = { light: "bulb", switch: "plug", input_boolean: "toggle", scene: "scene", script: "script" };

export class HabibButton extends GlassCard {
  static css = `
    :host { height: auto; }
    .fill { height: 100%; }
  `;
  _validate(c) {
    G.buttonAction(c.entity, "off"); // throws for a refused or unknown domain
    if (c.size && !SIZES.includes(c.size)) throw new Error(`size is one of ${SIZES.join(", ")}`);
    if (c.icon && !ICONS[c.icon]) throw new Error(`icon is one of ${Object.keys(ICONS).join(", ")}`);
    this._domain = String(c.entity).split(".")[0];
    this._size = c.size || "auto";
  }
  _signature() { return this._sigOf([this._config.entity]); }
  _snap() { const s = this._st(this._config.entity); return s ? `${s.state}|${s.last_changed || ""}` : "-"; }
  _setup() {
    this.shadowRoot.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("[data-act]")) this._press(); });
  }
  _press() {
    const s = this._st(this._config.entity);
    if (!usableState(s) || !this._hass) return;
    const act = G.buttonAction(this._config.entity, s.state);
    haptic(this);
    this._begin("b", () => this._snap());
    this._hass.callService(act.domain, act.service, {}, { entity_id: this._config.entity }).catch(() => {});
  }
  _render() {
    const cfg = this._config;
    const s = this._st(cfg.entity);
    const dead = !usableState(s);
    const stateful = G.buttonAction(cfg.entity, "off").stateful;
    const on = stateful && !dead && s.state === "on";
    const name = cfg.name || (s && s.attributes.friendly_name) || cfg.entity;
    const text = !s ? "Not found" : dead || this._noResponse("b") ? "No response" : this._pending("b") ? "…" : stateful ? (on ? "On" : "Off") : this._domain === "scene" ? "Scene" : "Run";
    const icon = ICONS[cfg.icon || DEFAULT_ICON[this._domain]];
    this._paint(`<div class="chipbox fill"><button class="chip press ${this._size} ${on ? "is-on" : ""} ${!s ? "is-missing" : dead ? "is-dead" : ""}" data-act
        ${stateful ? `aria-pressed="${on}"` : ""} aria-label="${esc(name)}: ${esc(text)}">
        <span class="ci">${icon}</span><span class="cn">${esc(name)}</span><span class="cs">${esc(text)}</span></button></div>`);
  }
  getCardSize() { return 1; }
  getGridOptions() {
    return this._size === "chip" ? { columns: 6, rows: 1, min_columns: 3 } : { columns: 6, rows: "auto", min_columns: 3 };
  }
  static getStubConfig(hass, entities) {
    const first = (entities || []).find((e) => G.BUTTON_DOMAINS.includes(e.split(".")[0]));
    return { type: "custom:habib-button", entity: first || "", size: "auto" };
  }
}
export const card = { tag: "habib-button", cls: HabibButton, name: "Habib button (glass)", description: "A chip or tile for a switch, light, scene, script or input_boolean. Never controls locks, covers, climate, alarms or media players." };

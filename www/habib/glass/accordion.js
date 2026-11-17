// glass/accordion.js: ui-accordion. Component with two modes for any glass card that has a
// one-line summary (prayer, climate, media, list, security):
//   collapsed = a 60 px bar: label, the card's summary, a chevron; open = the full card.
// Config: card (the card config), collapsed (true = starts collapsed, the default),
// remember (true = the viewer's last choice is kept per device), layout ("stack" = 52 px dock bar).
// The fold itself is the shared GlassCard fold, so every accordion behaves the same.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { adopt, paint } = B;

export class UiAccordion extends HTMLElement {
  setConfig(config) {
    const c = config && config.card;
    if (!c || !String(c.type || "").startsWith("custom:")) throw new Error("Set card: a glass card config (custom:ui-...)");
    this._config = config;
    if (!this.shadowRoot) { this.attachShadow({ mode: "open" }); adopt(this.shadowRoot, ":host { display: block; height: auto; }"); }
    paint(this.shadowRoot, "");
    const el = document.createElement(String(c.type).replace(/^custom:/, ""));
    el.setConfig({ ...c, collapsible: true, collapsed: config.collapsed !== false, remember: config.remember !== false,
      ...(config.layout === "stack" ? { fold_layout: "stack" } : {}) });
    this._el = el;
    this.shadowRoot.appendChild(el);
    if (this._hass) el.hass = this._hass;
  }
  set hass(h) { this._hass = h; if (this._el) this._el.hass = h; }
  get hass() { return this._hass; }
  _summary() { return this._el && this._el._summary ? this._el._summary() : { label: "", html: "" }; }
  getCardSize() { return this._el && this._el.getCardSize ? this._el.getCardSize() : 2; }
  getGridOptions() { return { columns: 12, rows: "auto" }; }
  static getStubConfig() { return { type: "custom:ui-accordion", card: { type: "custom:ui-climate", entities: [] } }; }
}
export const card = { tag: "ui-accordion", cls: UiAccordion, name: "Accordion", description: "Any glass card as a one-line summary bar that opens to the full card." };

// glass/dock.js: habib-dock. Folded glass cards two to a row; an opened card takes the full row.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { adopt, paint, injectGlobals } = B;

const DOCK_TAGS = ["habib-security", "habib-climate", "habib-media", "habib-todo", "habib-prayer"];
const CSS = `
  :host { height: auto; }
  .dock { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--z-gap-card); grid-auto-flow: row dense; }
  .cell { min-width: 0; height: var(--z-bar-stack); } .cell.open { grid-column: 1 / -1; height: auto; }
`;

export class HabibDock extends HTMLElement {
  setConfig(config) {
    const cards = config && Array.isArray(config.cards) ? config.cards : [];
    if (!cards.length) throw new Error("Set cards");
    const tags = cards.map((c) => String((c && c.type) || "").replace(/^custom:/, ""));
    const bad = tags.find((t) => !DOCK_TAGS.includes(t));
    if (bad !== undefined) throw new Error(`habib-dock takes ${DOCK_TAGS.join(", ")} (got ${bad || "no type"})`);
    this._config = config;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      adopt(this.shadowRoot, CSS);
      this.shadowRoot.addEventListener("habib-fold", (e) => {
        const cell = e.target && e.target.parentElement;
        if (cell && cell.classList.contains("cell")) cell.classList.toggle("open", !e.detail.collapsed);
      });
    }
    injectGlobals();
    paint(this.shadowRoot, `<div class="dock"></div>`);
    const dock = this.shadowRoot.querySelector(".dock");
    this._kids = cards.map((c, i) => {
      const el = document.createElement(tags[i]);
      el.setConfig({ ...c, collapsible: true, remember: false, fold_layout: "stack" });
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.appendChild(el);
      dock.appendChild(cell);
      if (this._hass) el.hass = this._hass;
      return el;
    });
  }
  set hass(h) {
    this._hass = h;
    for (const k of this._kids || []) k.hass = h;
  }
  get hass() { return this._hass; }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-dock", cards: [] }; }
}
export const card = { tag: "habib-dock", cls: HabibDock, name: "Habib dock (glass)", description: "Folded cards two to a row; tap one to open it across the row." };

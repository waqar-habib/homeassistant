// glass/label.js: habib-label. Small-caps section label that sits on the wallpaper.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { GlassCard, esc } = B;

export class HabibLabel extends GlassCard {
  static css = `
    .l { display: flex; align-items: baseline; justify-content: space-between; gap: var(--s-8); padding: var(--z-label-pad) var(--s-6) 0; color: var(--g-text); font-family: var(--g-font); }
    .h { font: var(--t-section); letter-spacing: var(--ls-section); text-transform: uppercase; text-shadow: var(--g-text-shadow); }
    .s { font: var(--t-sub); color: var(--g-dim); text-shadow: var(--g-text-shadow); }
  `;
  _signature() { return "static"; }
  _render() {
    this._paint(`<div class="l" role="heading" aria-level="2"><span class="h">${esc(this._config.label || "")}</span>${this._config.note ? `<span class="s">${esc(this._config.note)}</span>` : ""}</div>`);
  }
  getGridOptions() { return { columns: 12, rows: 1 }; }
  static getStubConfig() { return { type: "custom:habib-label", label: "Living Room" }; }
}
export const card = { tag: "habib-label", cls: HabibLabel, name: "Habib section label (glass)", description: "Small-caps label for a section." };

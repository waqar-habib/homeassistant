// glass/todo.js: habib-todo. A to-do list with colour bars, quick add and tap to complete.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { GlassCard, esc, haptic, moreInfo, ICONS } = B;

const BAR_COUNT = 5; // --g-list-0 .. --g-list-4

export class HabibTodo extends GlassCard {
  static css = `
    .glass { padding: var(--s-16); display: flex; flex-direction: column; gap: var(--s-10); }
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--s-8); }
    .right { display: flex; align-items: center; gap: var(--s-8); }
    .big { font: var(--t-headline); letter-spacing: var(--ls-headline); background: var(--g-list-title); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .open { position: relative; font: var(--t-state); color: var(--g-dim); padding: var(--s-6) var(--s-10); border-radius: var(--r-pill); background: var(--g-well-border); }
    .list { display: flex; flex-direction: column; gap: var(--s-6); }
    .it { display: flex; align-items: center; gap: var(--s-12); padding: var(--s-12); border-radius: var(--r-chip); position: relative; overflow: hidden;
      background: linear-gradient(90deg, rgba(var(--c), .20), var(--g-raised-lo) 60%); border: var(--g-hair) solid rgba(var(--c), .25); }
    .it::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: var(--z-stripe); background: rgb(var(--c)); }
    .ck { position: relative; width: var(--z-check); height: var(--z-check); border-radius: var(--r-round); border: var(--g-edge) solid rgba(var(--c), .9); flex: none; transition: background var(--m-fast); }
    .ck.ticking { background: rgb(var(--c)); }
    .tx { font: var(--t-body); overflow-wrap: anywhere; }
    .empty { font: var(--t-label); color: var(--g-dim); padding: var(--s-8) var(--s-2); }
    .add { display: flex; gap: var(--s-8); margin-top: auto; padding-top: var(--s-4); }
    input { all: unset; box-sizing: border-box; flex: 1; min-width: 0; min-height: var(--z-touch); padding: var(--s-12) var(--s-14); border-radius: var(--r-chip);
      background: var(--g-well-deep); border: var(--g-hair) solid var(--g-raised); font: var(--t-body-sm); color: var(--g-text); }
    input::placeholder { color: var(--g-faint); }
    .plus { width: var(--z-plus); border-radius: var(--r-chip); display: grid; place-items: center; color: var(--g-solid);
      background: var(--g-list-add); box-shadow: var(--g-list-add-glow); }
    .plus svg { width: var(--z-i-20); height: var(--z-i-20); }
  `;
  _validate(c) { if (!c.entity) throw new Error("Set entity"); this._items = this._items || []; }
  _signature() { return this._sigOf([this._config.entity]) + "#" + JSON.stringify(this._items.map((i) => [i.uid, i.status, i.summary])); }
  _onFirstHass() { this._subscribe(); }
  _connected() { this._subscribe(); }
  _disconnected() { if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; } }
  _subscribe() {
    if (this._unsub || !this._hass || !this.isConnected || !this._hass.connection) return;
    try {
      this._unsub = this._hass.connection.subscribeMessage(
        (msg) => { this._items = msg.items || []; this._maybeRender(false); },
        { type: "todo/item/subscribe", entity_id: this._config.entity }
      ).catch(() => null);
    } catch (e) { this._unsub = null; }
  }
  _setup() {
    const root = this.shadowRoot;
    root.addEventListener("click", (e) => {
      const done = e.target.closest && e.target.closest("[data-done]");
      if (done && this._hass) {
        haptic(this);
        done.classList.add("ticking");
        this._hass.callService("todo", "update_item", { item: done.dataset.done, status: "completed" }, { entity_id: this._config.entity }).catch(() => {});
        return;
      }
      if (e.target.closest && e.target.closest("[data-add]")) this._add();
      if (e.target.closest && e.target.closest("[data-open]")) moreInfo(this, this._config.entity);
    });
    root.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches("input")) this._add(); });
    // Hold renders only while the add field has focus (a focused fold bar must still re-render).
    root.addEventListener("focusin", (e) => { if (e.target.matches && e.target.matches("input")) this._hold = true; });
    root.addEventListener("focusout", (e) => {
      if (!(e.target.matches && e.target.matches("input"))) return;
      this._hold = false; this._later(() => this._maybeRender(false), 50);
    });
  }
  _add() {
    const input = this.shadowRoot.querySelector("input");
    const text = input && input.value.trim();
    if (!text || !this._hass) return;
    haptic(this);
    input.value = "";
    this._hass.callService("todo", "add_item", { item: text }, { entity_id: this._config.entity }).catch(() => { input.value = text; });
  }
  _render() {
    const open = this._items.filter((i) => i.status === "needs_action");
    const max = this._config.max_items || 6;
    const s = this._st(this._config.entity);
    const rows = open.slice(0, max).map((it, i) => `
      <div class="it" style="--c: var(--g-list-${i % BAR_COUNT})"><button class="ck tap" data-done="${esc(it.uid)}" aria-label="Done: ${esc(it.summary)}"></button>
        <span class="tx">${esc(it.summary)}</span></div>`).join("");
    this._paint(`<div class="glass">
      <div class="head"><div><div class="big">${esc(this._config.title || (s && s.attributes.friendly_name) || "List")}</div>
        <div class="sub">${!s ? "Not found" : open.length ? `${open.length} item${open.length === 1 ? "" : "s"}` : "All done"}</div></div>
        <span class="right" data-fold-slot><button class="open tap" data-open>Open</button></span></div>
      <div class="list">${rows || `<div class="empty">Nothing on the list. Add something below.</div>`}
        ${open.length > max ? `<div class="sub">+${open.length - max} more</div>` : ""}</div>
      <div class="add"><input type="text" placeholder="Add an item…" enterkeyhint="done" aria-label="New item">
        <button class="plus" data-add aria-label="Add">${ICONS.plus}</button></div>
    </div>`);
  }
  _summary() {
    const n = this._items.filter((i) => i.status === "needs_action").length;
    const s = this._st(this._config.entity);
    return { label: this._config.title || (s && s.attributes.friendly_name) || "List",
      html: n ? `<b>${n}</b> item${n === 1 ? "" : "s"}` : "All done", short: n ? `<b>${n}</b>` : "Done" };
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-todo", entity: "todo.shopping_list" }; }
}
export const card = { tag: "habib-todo", cls: HabibTodo, name: "Habib list (glass)", description: "A to-do list with quick add and tap to complete." };

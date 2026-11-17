// glass/media.js: habib-media. Speakers with album art or a spinning record, transport and volume.
const B = await import(new URL("./base.js", import.meta.url).href.split("?")[0] + new URL(import.meta.url).search);
const { GlassCard, esc, haptic, usableState, ICONS } = B;

export class HabibMedia extends GlassCard {
  static css = `
    .glass { padding: var(--s-16); display: flex; flex-direction: column; gap: var(--s-12); }
    .tabs { display: flex; gap: var(--s-6); flex-wrap: wrap; }
    .tab { position: relative; font: var(--t-state); padding: var(--s-6) var(--s-12); border-radius: var(--r-pill); color: var(--g-dim);
      background: var(--g-raised-lo); display: flex; align-items: center; gap: var(--s-6); }
    .tab.sel { background: var(--g-raised-hi); color: var(--g-text); }
    .main { display: grid; grid-template-columns: var(--z-media-art) minmax(0, 1fr); gap: var(--s-16); align-items: center; }
    .disc { position: relative; width: var(--z-media-art); height: var(--z-media-art); }
    .vinyl { width: 100%; height: 100%; border-radius: var(--r-round); background: var(--g-vinyl);
      box-shadow: var(--g-elev-float), inset 0 0 0 var(--g-hair) var(--g-well-border); }
    .vinyl::after { content: ""; position: absolute; inset: 0; border-radius: var(--r-round); background: var(--g-vinyl-shine); }
    .cover { width: 100%; height: 100%; border-radius: var(--r-panel); object-fit: cover; box-shadow: var(--g-elev-float); }
    .spin { animation: spin var(--m-record) linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .meta { min-width: 0; }
    .mt { font: var(--t-title-lg); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow-wrap: normal; hyphens: manual; }
    .ma { font: var(--t-label); color: var(--g-dim); margin-top: var(--s-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ctl { display: flex; align-items: center; gap: var(--s-10); margin-top: var(--s-12); }
    .b { width: var(--z-btn); height: var(--z-btn); color: var(--g-text); }
    .b svg { width: var(--z-i-18); height: var(--z-i-18); }
    .b.big { width: var(--z-btn-lg); height: var(--z-btn-lg); background: var(--g-solid); color: var(--g-ink); box-shadow: var(--g-elev-solid); }
    .b.big svg { width: var(--z-i-22); height: var(--z-i-22); }
    .b:active { transform: scale(var(--k-press-btn)); }
    .vol { display: flex; align-items: center; gap: var(--s-10); color: var(--g-dim); }
    .vol svg { width: var(--z-i-18); height: var(--z-i-18); flex: none; }
    /* Volume: the input is 44 px tall (the hit area); the visible track stays 6 px. */
    input[type=range] { -webkit-appearance: none; appearance: none; flex: 1; min-width: 0; height: var(--z-touch); margin: calc((var(--z-thumb) - var(--z-touch)) / 2) 0;
      background: transparent; outline: none; cursor: pointer; }
    input[type=range]::-webkit-slider-runnable-track { height: var(--z-track); border-radius: var(--r-bar);
      background: linear-gradient(90deg, var(--g-solid) var(--vol), var(--g-track) var(--vol)); }
    input[type=range]::-moz-range-track { height: var(--z-track); border-radius: var(--r-bar);
      background: linear-gradient(90deg, var(--g-solid) var(--vol), var(--g-track) var(--vol)); }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: var(--z-thumb); height: var(--z-thumb); border-radius: var(--r-round);
      margin-top: calc((var(--z-track) - var(--z-thumb)) / 2); background: var(--g-solid); box-shadow: var(--g-elev-thumb); }
    input[type=range]::-moz-range-thumb { width: var(--z-thumb); height: var(--z-thumb); border: 0; border-radius: var(--r-round); background: var(--g-solid); }
    input[type=range]:focus-visible { box-shadow: none; }
    input[type=range]:focus-visible::-webkit-slider-thumb { box-shadow: var(--g-ring); }
    .is-dead { pointer-events: none; }
  `;
  _validate(c) {
    this._players = (Array.isArray(c.players) ? c.players : []).map((p) => (typeof p === "string" ? { entity: p } : p));
    if (!this._players.length) throw new Error("Set players");
    this._sel = this._sel && this._players.some((p) => p.entity === this._sel) ? this._sel : null;
  }
  _active() {
    if (this._sel) return this._sel;
    const playing = this._players.find((p) => { const s = this._st(p.entity); return s && s.state === "playing"; });
    return (playing || this._players[0]).entity;
  }
  _signature() {
    return this._sigOf(this._players.map((p) => p.entity), ["media_title", "media_artist", "entity_picture", "volume_level", "is_volume_muted"]) + `|${this._sel}`;
  }
  _setup() {
    const root = this.shadowRoot;
    root.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("[data-act],[data-pick]");
      if (!b || !this._hass) return;
      if (b.dataset.pick) { this._sel = b.dataset.pick; this._maybeRender(true); return; }
      const id = this._active();
      haptic(this);
      const svc = { play: "media_play_pause", next: "media_next_track", prev: "media_previous_track" }[b.dataset.act];
      if (svc) this._hass.callService("media_player", svc, {}, { entity_id: id }).catch(() => {});
    });
    root.addEventListener("input", (e) => {
      if (e.target.matches && e.target.matches("input[type=range]")) e.target.style.setProperty("--vol", `${e.target.value}%`);
    });
    root.addEventListener("change", (e) => {
      if (e.target.matches && e.target.matches("input[type=range]") && this._hass) {
        this._hass.callService("media_player", "volume_set", { volume_level: Number(e.target.value) / 100 }, { entity_id: this._active() }).catch(() => {});
      }
    });
    root.addEventListener("pointerdown", (e) => { if (e.target.matches && e.target.matches("input[type=range]")) this._hold = true; });
    root.addEventListener("pointerup", () => { if (this._hold) { this._hold = false; this._later(() => this._maybeRender(true), 400); } });
  }
  _render() {
    const id = this._active();
    const s = this._st(id);
    const a = (s && s.attributes) || {};
    const playing = s && s.state === "playing";
    const dead = !usableState(s);
    const pic = a.entity_picture ? (this._hass.hassUrl ? this._hass.hassUrl(a.entity_picture) : a.entity_picture) : null;
    const title = !s ? "Not found" : dead ? "No response" : a.media_title || (s.state === "off" ? "Off" : "Nothing playing");
    const artist = !dead && a.media_title ? a.media_artist || a.app_name || "" : "";
    const vol = typeof a.volume_level === "number" ? Math.round(a.volume_level * 100) : 0;
    const tabs = this._players.length > 1 ? `<div class="tabs" role="tablist">${this._players.map((p) => {
      const ps = this._st(p.entity);
      const on = ps && ps.state === "playing";
      return `<button class="tab tap ${p.entity === id ? "sel" : ""}" role="tab" aria-selected="${p.entity === id}" data-pick="${esc(p.entity)}">${on ? `<i class="dot sm ok on"></i>` : ""}${esc(p.name || (ps && ps.attributes.friendly_name) || p.entity)}</button>`;
    }).join("")}</div>` : "";
    this._paint(`<div class="glass">
      <div class="hd"><div class="eyebrow">Now playing</div><span data-fold-slot></span></div>
      ${tabs}
      <div class="main ${dead ? "is-dead" : ""}">
        <div class="disc">${pic ? `<img class="cover" src="${esc(pic)}" alt="">` : `<div class="vinyl ${playing ? "spin" : ""}"></div>`}</div>
        <div class="meta"><div class="mt">${esc(title)}</div>${artist ? `<div class="ma">${esc(artist)}</div>` : ""}
          <div class="ctl"><button class="rbtn b" data-act="prev" aria-label="Previous">${ICONS.prev}</button>
            <button class="rbtn b big" data-act="play" aria-label="${playing ? "Pause" : "Play"}">${playing ? ICONS.pause : ICONS.play}</button>
            <button class="rbtn b" data-act="next" aria-label="Next">${ICONS.next}</button></div></div>
      </div>
      <div class="vol ${dead ? "is-dead" : ""}">${ICONS.speaker}<input type="range" min="0" max="100" step="1" value="${vol}" style="--vol: ${vol}%" aria-label="Volume"></div>
    </div>`);
  }
  // Long form: the title and speaker, or "Nothing playing". Short form: the title, or "Idle".
  _summary() {
    const playing = this._players.find((p) => { const s = this._st(p.entity); return s && s.state === "playing"; });
    const icon = ICONS.speaker;
    if (!playing) return { label: "Listen", html: "Nothing playing", short: "Idle", icon };
    const s = this._st(playing.entity);
    const t = `<i class="dot ok on"></i><b>${esc(s.attributes.media_title || "Playing")}</b>`;
    return { label: "Listen", html: `${t} ${esc(playing.name || s.attributes.friendly_name || "")}`, short: t, icon, tone: "ok" };
  }
  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }
  static getStubConfig() { return { type: "custom:habib-media", players: [] }; }
}
export const card = { tag: "habib-media", cls: HabibMedia, name: "Habib media (glass)", description: "Speakers with album art or a spinning record, transport and volume." };

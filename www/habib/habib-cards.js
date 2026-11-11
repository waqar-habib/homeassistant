/* habib-cards v1.1.0
   Two small custom elements for the Nuvio glass dashboard (Habib Home). No dependencies.
   Both use Nuvio's --hg-* glass tokens so they match the built-in cards.

   1. habib-prayer-card: five prayer times, next prayer highlighted with a countdown.
        type: custom:habib-prayer-card
        title: Prayer times            # optional
        sunrise: sensor.living_room_adhan_sunrise_time   # optional, `false` hides it
        prayers:                       # optional, defaults below
          - { name: Fajr, entity: sensor.living_room_adhan_fajr_prayer }
      Narrow: a list. Wide (card 460 px or more): one column per prayer.

   2. habib-lock-chip: slim bar with the lock state. Tapping it ONLY opens Home Assistant's own
      more-info dialog for the lock. This element never calls a service, so it cannot lock or unlock
      anything. Unlocking stays a deliberate second step in HA's dialog.
        type: custom:habib-lock-chip
        entity: lock.living_room_front_door
        name: Front Door               # optional
*/
(() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const GLASS = `
  box-sizing:border-box; border-radius:var(--hg-radius, 24px); color:var(--primary-text-color, inherit);
  font-family:'DM Sans', system-ui, sans-serif;
  background:var(--hg-glass-lite, var(--hg-glass-bg, rgba(255,255,255,.12)));
  -webkit-backdrop-filter:var(--hg-bfo, blur(calc(var(--hg-glass-blur, 14px) * var(--hg-bf, 1))) saturate(var(--hg-glass-sat, 180%)));
  backdrop-filter:var(--hg-bfo, blur(calc(var(--hg-glass-blur, 14px) * var(--hg-bf, 1))) saturate(var(--hg-glass-sat, 180%)));
  box-shadow:var(--hg-card-sh, 0 10px 30px rgba(0,0,0,.18));`;
  const ICBOX = `flex:none; display:grid; place-items:center; border-radius:10px;
  background:color-mix(in srgb, var(--hg-accent, #63D71E) 18%, transparent); color:var(--hg-accent-tx, var(--hg-accent, #63D71E));`;
  const reg = (tag, cls, name, description) => {
    if (customElements.get(tag)) return;
    customElements.define(tag, cls);
    window.customCards = window.customCards || [];
    window.customCards.push({ type: tag, name, description });
  };

  /* ---------------------------------------------------------------- prayer card */
  const DEFAULT_PRAYERS = [
    { name: 'Fajr', entity: 'sensor.living_room_adhan_fajr_prayer' },
    { name: 'Dhuhr', entity: 'sensor.living_room_adhan_dhuhr_prayer' },
    { name: 'Asr', entity: 'sensor.living_room_adhan_asr_prayer' },
    { name: 'Maghrib', entity: 'sensor.living_room_adhan_maghrib_prayer' },
    { name: 'Isha', entity: 'sensor.living_room_adhan_isha_prayer' },
  ];
  const DEFAULT_SUNRISE = 'sensor.living_room_adhan_sunrise_time';
  const PRAYER_CSS = `
:host{ display:block; container-type:inline-size; }
.c{ padding:16px; ${GLASS} }
.hd{ display:flex; align-items:center; gap:10px; margin-bottom:6px; }
.ic{ ${ICBOX} width:32px; height:32px; }
.ic ha-icon{ --mdc-icon-size:20px; width:20px; height:20px; }
.hd b{ font-size:15px; font-weight:600; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.nx{ font-size:12px; font-weight:700; padding:4px 10px; border-radius:999px; white-space:nowrap;
  background:var(--hg-accent, #63D71E); color:var(--hg-on-accent, #0B0F0A); }
ul{ list-style:none; margin:0; padding:0; }
li{ display:flex; justify-content:space-between; align-items:center; gap:12px; padding:9px 0; font-size:15px;
  border-top:1px solid color-mix(in srgb, currentColor 10%, transparent); font-variant-numeric:tabular-nums; }
li:first-child{ border-top:0; }
li .t{ font-weight:500; }
li.past{ opacity:.5; }
li.un .t{ opacity:.5; }
li.next{ font-weight:700; color:var(--hg-accent-tx, var(--hg-accent, #63D71E)); }
li.next .t{ font-weight:700; }
.sr{ display:flex; align-items:center; gap:6px; margin-top:6px; padding-top:8px; font-size:12px; opacity:.7;
  border-top:1px solid color-mix(in srgb, currentColor 10%, transparent); }
.sr ha-icon{ --mdc-icon-size:16px; width:16px; height:16px; }
@container (min-width: 460px){
  ul{ display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; margin-top:10px; }
  li{ flex-direction:column; justify-content:center; gap:4px; padding:12px 6px; border-top:0; border-radius:16px; text-align:center;
    background:color-mix(in srgb, currentColor 6%, transparent); }
  li.next{ background:color-mix(in srgb, var(--hg-accent, #63D71E) 16%, transparent); }
  li .t{ font-size:18px; }
  .sr{ border-top:0; margin-top:10px; padding-top:0; }
}
`;
  class HabibPrayerCard extends HTMLElement {
    static getStubConfig() { return {}; }
    setConfig(c) {
      const cfg = c || {};
      this._c = {
        title: cfg.title || 'Prayer times',
        prayers: Array.isArray(cfg.prayers) && cfg.prayers.length ? cfg.prayers : DEFAULT_PRAYERS,
        sunrise: cfg.sunrise === false ? null : (cfg.sunrise || DEFAULT_SUNRISE),
      };
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._sig = null;
      this._draw();
    }
    set hass(h) { this._h = h; this._draw(); }
    getCardSize() { return 4; }
    getGridOptions() { return { columns: 6, rows: 'auto' }; }
    connectedCallback() { if (!this._tick) this._tick = setInterval(() => this._draw(true), 30000); this._draw(true); }
    disconnectedCallback() { clearInterval(this._tick); this._tick = null; }
    _fmt(ms) {
      const h = this._h, tf = h && h.locale && h.locale.time_format;
      const o = { hour: 'numeric', minute: '2-digit' };
      if (tf === '24') o.hour12 = false; else if (tf === '12') o.hour12 = true;
      if (h && h.config && h.config.time_zone) o.timeZone = h.config.time_zone;
      try { return new Intl.DateTimeFormat((h && h.locale && h.locale.language) || undefined, o).format(ms); } catch (e) { return new Date(ms).toLocaleTimeString(); }
    }
    _in(ms) {
      const m = Math.max(0, Math.round(ms / 60000)), hh = Math.floor(m / 60), mm = m % 60;
      return m < 1 ? 'now' : hh ? `in ${hh}h ${mm}m` : `in ${mm}m`;
    }
    _draw(force) {
      const h = this._h, c = this._c; if (!h || !c || !this.shadowRoot) return;
      const now = Date.now();
      const rows = c.prayers.map((p) => { const s = h.states[p.entity], t = s ? Date.parse(s.state) : NaN; return { name: p.name || p.entity, t: isFinite(t) ? t : NaN }; });
      const sr = c.sunrise && h.states[c.sunrise] ? Date.parse(h.states[c.sunrise].state) : NaN;
      const sig = rows.map((r) => r.t).join(',') + '|' + sr + '|' + Math.floor(now / 60000) + '|' + (h.locale && h.locale.time_format);
      if (!force && sig === this._sig) return;
      this._sig = sig;
      const next = rows.find((r) => isFinite(r.t) && r.t > now);
      const allDone = !next && rows.some((r) => isFinite(r.t));
      const chip = next ? `${esc(next.name)} ${this._in(next.t - now)}` : allDone ? `${esc(rows[0].name)} tomorrow` : '';
      const li = rows.map((r) => {
        const cls = r === next ? 'next' : !isFinite(r.t) ? 'un' : r.t <= now ? 'past' : '';
        return `<li class="${cls}"${cls === 'next' ? ' aria-current="true"' : ''}><span class="n">${esc(r.name)}</span><span class="t">${isFinite(r.t) ? this._fmt(r.t) : '--'}</span></li>`;
      }).join('');
      this.shadowRoot.innerHTML = `<style>${PRAYER_CSS}</style><div class="c" role="group" aria-label="${esc(c.title)}">
        <div class="hd"><span class="ic"><ha-icon icon="mdi:mosque"></ha-icon></span><b>${esc(c.title)}</b>${chip ? `<span class="nx">${chip}</span>` : ''}</div>
        <ul role="list">${li}</ul>
        ${isFinite(sr) ? `<div class="sr"><ha-icon icon="mdi:weather-sunset-up"></ha-icon><span>Sunrise ${this._fmt(sr)}</span></div>` : ''}</div>`;
    }
  }
  reg('habib-prayer-card', HabibPrayerCard, 'Prayer times', 'Five daily prayers with the next one highlighted (Habib Home)');

  /* ------------------------------------------------------------------ lock chip */
  const LOCK_CSS = `
:host{ display:block; }
button{ all:unset; cursor:pointer; display:flex; align-items:center; gap:12px; width:100%; min-height:52px; padding:6px 14px 6px 8px; ${GLASS} }
button:focus-visible{ outline:2px solid var(--hg-accent, #63D71E); outline-offset:2px; }
button:active{ transform:scale(.99); }
.ic{ ${ICBOX} width:40px; height:40px; border-radius:50%; }
.ic ha-icon{ --mdc-icon-size:22px; width:22px; height:22px; }
.n{ font-size:15px; font-weight:600; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.s{ font-size:13px; font-weight:600; opacity:.85; }
.locked .ic{ background:var(--hg-accent, #63D71E); color:var(--hg-on-accent, #0B0F0A); }
.unlocked .ic{ background:var(--warning-color, #ff9f0a); color:#1b1200; }
.unlocked .s{ color:var(--warning-color, #ff9f0a); opacity:1; }
.jammed .ic{ background:var(--error-color, #ff5b4f); color:#fff; }
.jammed .s{ color:var(--error-color, #ff5b4f); opacity:1; }
.un{ opacity:.6; }
`;
  class HabibLockChip extends HTMLElement {
    static getStubConfig() { return { entity: 'lock.front_door' }; }
    setConfig(c) {
      if (!c || !c.entity) throw new Error('entity is required');
      this._c = { entity: c.entity, name: c.name || '' };
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this._sig = null;
      this._draw();
    }
    set hass(h) { this._h = h; this._draw(); }
    getCardSize() { return 1; }
    getGridOptions() { return { columns: 12, rows: 1 }; }
    _draw() {
      const h = this._h, c = this._c; if (!h || !c || !this.shadowRoot) return;
      const s = h.states[c.entity], st = s ? s.state : 'unavailable';
      const name = c.name || (s && s.attributes.friendly_name) || c.entity;
      const sig = st + '|' + name; if (sig === this._sig) return; this._sig = sig;
      const kind = st === 'locked' ? 'locked' : st === 'jammed' ? 'jammed' : (st === 'unavailable' || st === 'unknown') ? 'un' : 'unlocked';
      const icon = st === 'locked' ? 'mdi:lock' : st === 'jammed' ? 'mdi:lock-alert' : (st === 'unavailable' || st === 'unknown') ? 'mdi:lock-question' : 'mdi:lock-open-variant';
      const label = st === 'unavailable' || st === 'unknown' ? 'Unavailable' : st.charAt(0).toUpperCase() + st.slice(1);
      this.shadowRoot.innerHTML = `<style>${LOCK_CSS}</style><button class="${kind}" aria-label="${esc(name)}, ${esc(label)}. Opens the lock controls.">
        <span class="ic"><ha-icon icon="${icon}"></ha-icon></span><span class="n">${esc(name)}</span><span class="s">${esc(label)}</span></button>`;
      this.shadowRoot.querySelector('button').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: c.entity } }));
      });
    }
  }
  reg('habib-lock-chip', HabibLockChip, 'Lock bar', 'Slim lock status bar that opens the lock dialog; never changes the lock itself (Habib Home)');
})();

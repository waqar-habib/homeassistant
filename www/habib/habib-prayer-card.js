/* habib-prayer-card v1.0.0
   Prayer times card for the Nuvio glass dashboard (Habib Home).
   Reads the five prayer timestamp sensors, highlights the next prayer with a countdown.
   Uses Nuvio's --hg-* glass tokens, so it matches the weather card. No other dependencies.
   Usage (Nuvio: + Add > Card from HA (YAML)):
     type: custom:habib-prayer-card
     title: Prayer times            # optional
     sunrise: sensor.living_room_adhan_sunrise_time   # optional, `false` hides it
     prayers:                       # optional, defaults below
       - { name: Fajr, entity: sensor.living_room_adhan_fajr_prayer }
*/
(() => {
  const TAG = 'habib-prayer-card';
  if (customElements.get(TAG)) return;

  const DEFAULT_PRAYERS = [
    { name: 'Fajr', entity: 'sensor.living_room_adhan_fajr_prayer' },
    { name: 'Dhuhr', entity: 'sensor.living_room_adhan_dhuhr_prayer' },
    { name: 'Asr', entity: 'sensor.living_room_adhan_asr_prayer' },
    { name: 'Maghrib', entity: 'sensor.living_room_adhan_maghrib_prayer' },
    { name: 'Isha', entity: 'sensor.living_room_adhan_isha_prayer' },
  ];
  const DEFAULT_SUNRISE = 'sensor.living_room_adhan_sunrise_time';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const CSS = `
:host{ display:block; }
.c{ box-sizing:border-box; padding:16px; border-radius:var(--hg-radius, 24px); color:var(--primary-text-color, inherit);
  font-family:'DM Sans', system-ui, sans-serif;
  background:var(--hg-glass-lite, var(--hg-glass-bg, rgba(255,255,255,.12)));
  -webkit-backdrop-filter:var(--hg-bfo, blur(calc(var(--hg-glass-blur, 14px) * var(--hg-bf, 1))) saturate(var(--hg-glass-sat, 180%)));
  backdrop-filter:var(--hg-bfo, blur(calc(var(--hg-glass-blur, 14px) * var(--hg-bf, 1))) saturate(var(--hg-glass-sat, 180%)));
  box-shadow:var(--hg-card-sh, 0 10px 30px rgba(0,0,0,.18)); }
.hd{ display:flex; align-items:center; gap:10px; margin-bottom:6px; }
.ic{ flex:none; width:32px; height:32px; border-radius:10px; display:grid; place-items:center;
  background:color-mix(in srgb, var(--hg-accent, #63D71E) 18%, transparent); color:var(--hg-accent-tx, var(--hg-accent, #63D71E)); }
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
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="c" role="group" aria-label="${esc(c.title)}">
        <div class="hd"><span class="ic"><ha-icon icon="mdi:mosque"></ha-icon></span><b>${esc(c.title)}</b>${chip ? `<span class="nx">${chip}</span>` : ''}</div>
        <ul role="list">${li}</ul>
        ${isFinite(sr) ? `<div class="sr"><ha-icon icon="mdi:weather-sunset-up"></ha-icon><span>Sunrise ${this._fmt(sr)}</span></div>` : ''}</div>`;
    }
  }

  customElements.define(TAG, HabibPrayerCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Prayer times', description: 'Five daily prayers with the next one highlighted (Habib Home)' });
})();

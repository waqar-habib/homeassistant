// Renders dashboard configs in headless Chromium with mock states, saves screenshots and
// measures the acceptance criteria. Usage:
//   node tests/habib-ui/render/render.mjs --cfg <folder with dashboard JSON> --out <folder> --jobs <jobs.json>
// A job: { name, cfg, mode: "panel" | "sections", w, h, entry?, base?, scale?, scenario?, time?, measure?: true, contrast?: true }
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "./server.mjs";
import * as PNG from "./png.mjs";
import * as G from "../../../www/habib/habib-glass-logic.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const cfgDir = path.resolve(arg("cfg", "."));
const outDir = path.resolve(arg("out", "."));
const jobs = JSON.parse(fs.readFileSync(arg("jobs"), "utf8"));
const extra = arg("old") ? { "/old/": path.resolve(arg("old")) } : {};
fs.mkdirSync(outDir, { recursive: true });

const { server, port } = await serve({ cfgDir, extra });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "habib-render-"));
const chrome = spawn(process.env.CHROMIUM || "chromium", ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--force-device-scale-factor=1",
  "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((resolve, reject) => {
  let buf = "";
  chrome.stderr.on("data", (d) => { buf += d; const m = /DevTools listening on (ws:\/\/\S+)/.exec(buf); if (m) resolve(m[1]); });
  chrome.on("exit", () => reject(new Error("chromium exited: " + buf.slice(-400))));
});
const debugPort = new URL(wsUrl).port;
const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let seq = 0; const waiting = new Map(); let errors = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) { const { resolve, reject } = waiting.get(m.id); waiting.delete(m.id); m.error ? reject(new Error(m.error.message)) : resolve(m.result); return; }
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error") errors.push(`${m.params.entry.text} ${m.params.entry.url || ""}`);
});
const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; waiting.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => {
  const r = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await cdp("Page.enable"); await cdp("Runtime.enable"); await cdp("Log.enable");

const shot = async () => PNG.decode(Buffer.from((await cdp("Page.captureScreenshot", { format: "png" })).data, "base64"));
// The whole page as the user would scroll it: one viewport at a time, so the sticky wallpaper
// sits behind every part exactly as on a device.
async function fullPage(w, h) {
  const total = await evaluate("document.documentElement.scrollHeight");
  const img = { w, h: total, data: Buffer.alloc(w * total * 4) };
  for (let y = 0; y < total; y += h) {
    await evaluate(`scrollTo(0, ${y}); document.getElementById("header").style.visibility = ${y ? '"hidden"' : '""'}`);
    await sleep(120);
    const at = await evaluate("scrollY");
    const tile = await shot();
    for (let row = 0; row < tile.h && at + row < total; row++) tile.data.copy(img.data, (at + row) * w * 4, row * w * 4, (row + 1) * w * 4);
  }
  await evaluate(`scrollTo(0, 0); document.getElementById("header").style.visibility = ""`);
  return img;
}
const measureJs = fs.readFileSync(path.join(here, "measure.js"), "utf8");
const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

const results = [];
for (const job of jobs) {
  errors = [];
  const q = new URLSearchParams({ cfg: `/cfg/${job.cfg}`, mode: job.mode || "panel" });
  for (const k of ["entry", "base", "scale", "scenario", "time"]) if (job[k]) q.set(k, job[k]);
  await cdp("Emulation.setDeviceMetricsOverride", { width: job.w, height: job.h, deviceScaleFactor: 1, mobile: false });
  await cdp("Page.navigate", { url: `http://127.0.0.1:${port}/harness/page.html?${q}` });
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) { await sleep(100); ready = await evaluate("window.__ready === true").catch(() => false); }
  if (!ready) { results.push({ name: job.name, error: "page never became ready", errors }); continue; }
  if (job.before) { await evaluate(job.before); await sleep(job.wait || 300); }
  const res = { name: job.name, w: job.w, h: job.h };
  fs.writeFileSync(path.join(outDir, `${job.name}.png`), PNG.encode(await shot()));
  const full = await fullPage(job.w, job.h);
  fs.writeFileSync(path.join(outDir, `${job.name}-full.png`), PNG.encode(full));
  if (job.measure !== false) {
    const m = await evaluate(measureJs);
    Object.assign(res, { pageHeight: m.pageHeight, hScroll: m.hScroll, contentBottom: m.contentBottom, broken: m.broken, clipped: m.clipped, bars: m.bars, chips: m.chips, layout: m.layout,
      hitsUnder44: m.hits.filter((x) => x.w < 44 || x.h < 44), hitCount: m.hits.length });
    if (job.contrast) {
      // Same page with the text made transparent: the pixels behind each text run are what it sits on.
      await evaluate(`(async () => { const B = await import("/local/habib/glass/base.js" + new URL([...document.querySelectorAll("script")].length ? performance.getEntriesByType("resource").find((e) => e.name.includes("/glass/base.js")).name : location.href).search);
        B.SHEET.insertRule("* { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }", B.SHEET.cssRules.length); })()`);
      await sleep(250);
      const bare = await fullPage(job.w, job.h);
      const rows = [];
      for (const t of m.texts) {
        if (t.gradientText) continue;
        const ratios = [];
        for (const r of t.rects) for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(bare.h, Math.ceil(r.y + r.h)); y++) for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(bare.w, Math.ceil(r.x + r.w)); x++) {
          const i = (y * bare.w + x) * 4; const bg = [bare.data[i], bare.data[i + 1], bare.data[i + 2]];
          ratios.push(G.contrast(G.blend(t.color, bg, Math.min(1, t.alpha)), bg));
        }
        if (ratios.length) rows.push({ card: t.card, cls: t.cls, text: t.text, size: t.size, weight: t.weight, alpha: +t.alpha.toFixed(2), lit: t.lit, stack: t.stack, low: +pct(ratios, 0.05).toFixed(2), median: +pct(ratios, 0.5).toFixed(2) });
      }
      res.contrast = rows;
    }
  }
  if (job.after) res.after = await evaluate(job.after);
  res.errors = errors;
  results.push(res);
  console.log(`${job.name}: ${job.w}x${job.h} page ${res.pageHeight ?? "?"} errors ${errors.length}`);
}
fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 1));
ws.close(); chrome.kill(); server.close();
try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch (e) { /* Chromium may still be closing */ }

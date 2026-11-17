// Static server for the render harness: /local/ -> www/, /harness/ -> this folder, /cfg/ -> a config folder.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../..");
const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".css": "text/css" };

export function serve({ port = 0, cfgDir, extra = {} } = {}) {
  const roots = { "/local/": path.join(repo, "www"), "/harness/": here, "/cfg/": cfgDir || here, ...extra };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const hit = Object.entries(roots).find(([p]) => url.startsWith(p));
    const file = hit ? path.join(hit[1], path.normalize(url.slice(hit[0].length))) : null;
    if (!file || !file.startsWith(hit[1]) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}

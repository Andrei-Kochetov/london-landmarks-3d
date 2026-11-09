// Open a page in headless Chrome, wait, report which models loaded and any JS errors.
// Works for https://, http://localhost and file:// pages.
// Usage: node check_page.mjs <url> [waitMs=25000]
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [, , url, waitMs = "25000"] = process.argv;
const profile = mkdtempSync(join(tmpdir(), "ll3d-chrome-"));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", "--remote-debugging-port=9333", "--user-data-dir=" + profile, "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader", "--window-size=1300,900", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { target = (await (await fetch("http://127.0.0.1:9333/json")).json()).find((t) => t.type === "page"); } catch (e) { /* not up yet */ }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map(), errors = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); }
  if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") errors.push(d.params.args.map((a) => a.value || a.description).join(" ").slice(0, 200));
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url });
await sleep(+waitMs);
const res = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `JSON.stringify({ title: document.title, models: Array.from(document.querySelectorAll('.sight model-viewer')).map(m => m.closest('.sight').id + ':' + (m.loaded ? 'loaded' : 'not yet')), viewer: !!customElements.get('model-viewer') })`,
});
console.log(res.result.value);
console.log("errors:", JSON.stringify(errors.slice(0, 5)));
ws.close();
chrome.kill();

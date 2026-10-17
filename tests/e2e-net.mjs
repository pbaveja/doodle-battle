// Network resilience: dropped sockets, zombie sockets, offline devices and a server restart mid-game.
// Run against the dev server (FAST=1): node tests/e2e-net.mjs [baseUrl]
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-shots-net");
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const errors = [];
const results = [];
const check = (name, ok, extra = "") => { results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`); };

async function device(name, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/ERR_TUNNEL|fonts|WebSocket connection/.test(m.text())) errors.push(`${name}: ${m.text()}`); });
  return { name, ctx, page };
}
const A = await device("laptop", { viewport: { width: 1280, height: 800 } });
const B = await device("phone", { ...devices["Pixel 7"] });
const C = await device("ipad", { ...devices["iPad Mini"] });
const all = [A, B, C];

await A.page.goto(BASE);
await A.page.fill("#nameInput", "Host");
await A.page.click("#createBtn");
await A.page.waitForSelector("#lobby:not([hidden])");
const code = (await A.page.textContent("#lobbyCode")).trim();
for (const [d, n] of [[B, "Phone"], [C, "Tablet"]]) {
  await d.page.goto(`${BASE}/r/${code}`);
  await d.page.fill("#nameInput", n);
  await d.page.click("#joinGo");
  await d.page.waitForSelector("#lobby:not([hidden])");
}
const pid = (d) => d.page.evaluate(() => window.doodle.app.you);
await A.page.click('#settings .stepper[data-key="rounds"] [data-d="-1"]');
await A.page.click('#settings .stepper[data-key="rounds"] [data-d="-1"]');
await A.page.click("#startBtn");
let drawer = null;
for (let i = 0; i < 40 && !drawer; i++) { for (const d of all) if (await d.page.$(".choice")) drawer = d; if (!drawer) await wait(150); }
await drawer.page.click(".choice >> nth=0");
await drawer.page.waitForSelector("#tools:not([hidden])");
const word = (await drawer.page.textContent("#wordBox .theword")).trim();
const guessers = all.filter((d) => d !== drawer);
console.log("drawer", drawer.name, "word", word);

const box = await drawer.page.locator("#board").boundingBox();
const P = (x, y) => [box.x + box.width * x, box.y + box.height * y];
async function stroke(pts) {
  const m = drawer.page.mouse;
  await m.move(...P(...pts[0])); await m.down();
  for (const p of pts.slice(1)) await m.move(...P(...p), { steps: 8 });
  await m.up();
}
const ink = (d) => d.page.evaluate(() => {
  const c = document.getElementById("board"), x = c.getContext("2d");
  const data = x.getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 0; i < data.length; i += 4 * 31) if (data[i] < 200) n++;
  return n;
});
async function sameCanvas(label) {
  await wait(700);
  const v = await Promise.all(all.map(ink));
  const max = Math.max(...v), min = Math.min(...v);
  check(`canvas matches on every device: ${label}`, max > 0 && (max - min) / max < 0.03, v.join("/"));
}
const bannerShown = (d) => d.page.evaluate(() => !document.getElementById("netbar").hidden && !document.getElementById("netbar").classList.contains("ok"));
async function waitFor(fn, ms) { const end = Date.now() + ms; while (Date.now() < end) { if (await fn()) return true; await wait(100); } return false; }

await stroke([[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8], [0.2, 0.2]]);
await sameCanvas("first stroke");

// 1. A guesser's socket is dropped by the server
const g = guessers[0];
await fetch(`${BASE}/__dev/drop/${code}/${await pid(g)}`);
await stroke([[0.3, 0.3], [0.7, 0.7]]); // drawn while the guesser is reconnecting
const back1 = await waitFor(async () => (await g.page.evaluate(() => window.doodle.app.conn.live)), 6000);
check("dropped guesser reconnects on its own", back1);
await sameCanvas("after guesser reconnect");

// 2. The drawer's socket is dropped
await fetch(`${BASE}/__dev/drop/${code}/${await pid(drawer)}`);
const back2 = await waitFor(async () => !!(await drawer.page.$("#paperWrap.drawing")) && (await drawer.page.evaluate(() => window.doodle.app.conn.live)), 6000);
check("dropped drawer reconnects and keeps the turn", back2 && !!(await drawer.page.$("#tools:not([hidden])")));
await stroke([[0.7, 0.3], [0.3, 0.7]]);
await sameCanvas("drawer kept drawing after reconnect");

// 3. A zombie socket (connection looks open but nothing arrives)
const z = guessers[1];
const zpid = await pid(z);
await fetch(`${BASE}/__dev/freeze/${zpid}/on`);
const t0 = Date.now();
const detected = await waitFor(() => bannerShown(z), 20000);
check("silent dead connection is detected", detected, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
await z.page.screenshot({ path: `${OUT}/zombie-banner.png` });
await fetch(`${BASE}/__dev/freeze/${zpid}/off`);
const back3 = await waitFor(async () => (await z.page.evaluate(() => window.doodle.app.conn.live)), 12000);
check("zombie device recovers", back3);

// 4. Device goes offline, then online
await g.ctx.setOffline(true);
const offBanner = await waitFor(() => bannerShown(g), 3000);
const offText = await g.page.textContent("#netText");
check("offline banner appears", offBanner, offText);
await g.page.screenshot({ path: `${OUT}/offline-banner.png` });
const chatLocked = await g.page.$eval("#chatInput", (i) => i.disabled);
check("guess box locks while offline", chatLocked);
await wait(1500);
await g.ctx.setOffline(false);
const back4 = await waitFor(async () => (await g.page.evaluate(() => window.doodle.app.conn.live)), 10000);
check("device rejoins when back online", back4);
await sameCanvas("after offline");

// 5. Server restart mid-turn (like a deploy)
await wait(2500); // let the canvas save
const before = await A.page.evaluate(() => ({ phase: window.doodle.app.view.phase, turn: window.doodle.app.view.turn }));
await fetch(`${BASE}/__dev/restart/${code}`);
const back5 = await waitFor(async () => (await Promise.all(all.map((d) => d.page.evaluate(() => window.doodle.app.conn.live)))).every(Boolean), 10000);
const after = await A.page.evaluate(() => ({ phase: window.doodle.app.view.phase, turn: window.doodle.app.view.turn }));
check("everyone reconnects after a server restart", back5);
check("game continues from where it was", before.turn === after.turn && after.phase === "drawing", `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
await sameCanvas("after restart");

// 6. Guessing still works and scores
for (const d of guessers) { await d.page.fill("#chatInput", word); await d.page.press("#chatInput", "Enter"); }
const revealed = await waitFor(async () => (await A.page.evaluate(() => window.doodle.app.view.phase)) === "reveal", 5000);
check("turn ends when everyone guesses", revealed);

// 7. Refreshing mid-game keeps your score
await wait(400);
const scoreBefore = await g.page.evaluate(() => window.doodle.app.view.players.find((p) => p.id === window.doodle.app.you).score);
await g.page.reload();
await g.page.waitForSelector("#game:not([hidden]), #over:not([hidden])", { timeout: 10000 });
const scoreAfter = await g.page.evaluate(() => window.doodle.app.view.players.find((p) => p.id === window.doodle.app.you).score);
check("refresh keeps your seat and score", scoreBefore > 0 && scoreBefore === scoreAfter, `${scoreBefore} -> ${scoreAfter}`);

// 8. A second tab takes over the seat
const tab2 = await g.ctx.newPage();
await tab2.goto(`${BASE}/r/${code}`);
await tab2.waitForSelector("#game:not([hidden]), #over:not([hidden])", { timeout: 10000 });
const replaced = await waitFor(async () => (await g.page.textContent("#noticeTitle").catch(() => "")) === "Opened in another tab" && !(await g.page.$("#notice[hidden]")), 5000);
check("old tab says it was opened elsewhere", replaced);

console.log(results.join("\n"));
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
await browser.close();

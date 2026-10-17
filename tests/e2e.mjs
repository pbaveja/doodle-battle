// End-to-end: three devices play a short game against the dev server (FAST=1).
// Run: node tests/e2e.mjs [baseUrl]   (needs the global playwright install)
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");

const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-shots");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const errors = [];
async function device(name, opts) {
  const ctx = await browser.newContext({ ...opts, colorScheme: opts.colorScheme ?? "light" });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|ERR_TUNNEL/.test(m.text())) errors.push(`${name}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  return { name, ctx, page };
}
const shot = (d, label) => d.page.screenshot({ path: `${OUT}/${label}-${d.name}.png` });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const A = await device("laptop", { viewport: { width: 1440, height: 900 } });
const B = await device("ipad", { ...devices["iPad (gen 7)"], colorScheme: "dark" });
const C = await device("phone", { ...devices["iPhone 13"] });

// Laptop creates a room
await A.page.goto(BASE);
await A.page.fill("#nameInput", "Asha");
await shot(A, "01-home");
await A.page.click("#createBtn");
await A.page.waitForSelector("#lobby:not([hidden])");
const code = (await A.page.textContent("#lobbyCode")).trim();
console.log("room", code);

// iPad and phone join by link
for (const [d, name] of [[B, "Ben"], [C, "Chen"]]) {
  await d.page.goto(`${BASE}/r/${code}`);
  await d.page.waitForSelector("#join:not([hidden])");
  await d.page.fill("#nameInput", name);
  if (d === C) await shot(C, "02-join");
  await d.page.click("#joinGo");
  await d.page.waitForSelector("#lobby:not([hidden])");
}
await wait(300);
await A.page.click('#settings .stepper[data-key="rounds"] [data-d="-1"]');
await A.page.click('#settings .stepper[data-key="rounds"] [data-d="-1"]');
for (let i = 0; i < 3; i++) { await A.page.click('#settings .stepper[data-key="drawTime"] [data-d="-1"]'); await wait(120); }
await A.page.fill("#chatInput", "hi everyone");
await A.page.press("#chatInput", "Enter");
await wait(300);
for (const d of [A, B, C]) await shot(d, "03-lobby");

// Start
await A.page.click("#startBtn");
for (const d of [A, B, C]) await d.page.waitForSelector("#game:not([hidden])");
await wait(900); // round banner
for (const d of [A, B, C]) await shot(d, "04-choosing");

async function findDrawer() {
  for (const d of [A, B, C]) if (await d.page.$(".choice")) return d;
  return null;
}
let drawer = null;
for (let i = 0; i < 20 && !drawer; i++) { drawer = await findDrawer(); if (!drawer) await wait(200); }
if (!drawer) throw new Error("no drawer found");
console.log("drawer:", drawer.name);
await drawer.page.click(".choice >> nth=0");
await drawer.page.waitForSelector("#tools:not([hidden])");
const word = (await drawer.page.textContent("#wordBox .theword")).trim();
console.log("word:", word);

// Draw a house with the mouse
const box = await drawer.page.locator("#board").boundingBox();
const P = (x, y) => [box.x + box.width * x, box.y + box.height * y];
async function stroke(points) {
  const m = drawer.page.mouse;
  await m.move(...P(...points[0]));
  await m.down();
  for (const p of points.slice(1)) await m.move(...P(...p), { steps: 6 });
  await m.up();
}
await stroke([[0.3, 0.75], [0.3, 0.45], [0.5, 0.25], [0.7, 0.45], [0.7, 0.75], [0.3, 0.75]]);
await drawer.page.click('.pen[data-c="3"]');
await drawer.page.click('[data-size="3"]');
await stroke([[0.45, 0.75], [0.45, 0.6], [0.55, 0.6], [0.55, 0.75]]);
await drawer.page.click('[data-tool="fill"]');
await drawer.page.click('.pen[data-c="5"]');
await drawer.page.mouse.click(...P(0.4, 0.5));
await wait(500);
const guessers = [A, B, C].filter((d) => d !== drawer);
for (const d of [A, B, C]) await shot(d, "05-drawing");

// Network drop on one guesser during the turn
const flaky = guessers.find((d) => d === C) ?? guessers[1];
await flaky.ctx.setOffline(true);
await wait(2500);
await shot(flaky, "06-offline");
await stroke([[0.1, 0.1], [0.2, 0.2], [0.15, 0.3]]); // drawn while the flaky device is offline
await flaky.ctx.setOffline(false);
await flaky.page.waitForFunction(() => document.getElementById("netbar").hidden || document.getElementById("netbar").classList.contains("ok"), null, { timeout: 15000 });
await wait(800);

// Compare canvases: the flaky device should have caught up via snapshot
const pixels = async (d) => d.page.evaluate(() => {
  const c = document.getElementById("board");
  const x = c.getContext("2d");
  const data = x.getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 0; i < data.length; i += 4 * 97) if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) n++;
  return n;
});
const pd = await pixels(drawer), pf = await pixels(flaky), po = await pixels(guessers.find((d) => d !== flaky));
console.log("ink samples drawer/flaky/other:", pd, pf, po);

// Guesses: a wrong one, a close one, then correct ones
const g1 = guessers[0], g2 = guessers[1];
await g1.page.fill("#chatInput", "banana");
await g1.page.press("#chatInput", "Enter");
await g1.page.fill("#chatInput", word.length >= 4 ? word.slice(0, -1) + (word.endsWith("x") ? "y" : "x") : "zzz");
await g1.page.press("#chatInput", "Enter");
await wait(300);
await g1.page.fill("#chatInput", word.toUpperCase());
await g1.page.press("#chatInput", "Enter");
await wait(500);
for (const d of [A, B, C]) await shot(d, "07-guessed");
await g2.page.fill("#chatInput", word);
await g2.page.press("#chatInput", "Enter");
await wait(400);
for (const d of [A, B, C]) await shot(d, "08-reveal");

// Play the remaining turns: pick a word, then everyone guesses it.
let shotTaken = false;
for (let i = 0; i < 400; i++) {
  if (await A.page.$("#over:not([hidden])")) break;
  for (const d of [A, B, C]) {
    const choice = await d.page.$(".choice");
    if (choice) { await choice.click().catch(() => {}); await wait(300); }
    const w = await d.page.$("#tools:not([hidden])") ? await d.page.textContent("#wordBox .theword").catch(() => null) : null;
    if (w) {
      if (!shotTaken && d === C) { await shot(C, "08b-phone-drawer"); shotTaken = true; }
      for (const o of [A, B, C]) if (o !== d) {
        const input = await o.page.$("#chatInput:not([disabled])");
        if (input) { await o.page.fill("#chatInput", w.trim()); await o.page.press("#chatInput", "Enter"); }
      }
    }
  }
  await wait(250);
}
await A.page.waitForSelector("#over:not([hidden])", { timeout: 60000 });
await wait(3200);
for (const d of [A, B, C]) await shot(d, "09-over");

// Final checks
const titles = await Promise.all([A, B, C].map((d) => d.page.textContent("#overTitle")));
console.log("over titles:", titles);
const gal = await A.page.$$eval(".gcard", (n) => n.length);
console.log("sketchbook drawings:", gal);

// Play again goes back to the lobby for everyone
await A.page.click("#againBtn");
for (const d of [A, B, C]) await d.page.waitForSelector("#lobby:not([hidden])");
console.log("back to lobby: ok");

// Refresh keeps the seat
await C.page.reload();
await C.page.waitForSelector("#lobby:not([hidden])", { timeout: 10000 });
const count = await A.page.$$eval("#lobbyPlayers .prow", (n) => n.length);
console.log("players after phone refresh:", count);

console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no console errors");
await browser.close();

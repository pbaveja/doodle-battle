// Stepping away on a phone (page hidden, connection dropped) keeps the seat and host role.
// Also checks phone layouts: home screen width, connection banner, chat while typing.
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-shots3");
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const results = [], errors = [];
const check = (n, ok, x = "") => results.push(`${ok ? "PASS" : "FAIL"} ${n}${x ? ` (${x})` : ""}`);
async function dev(name, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  return { name, ctx, page };
}

// 1. Home screen fits on small phones
for (const [n, d] of [["SE", devices["iPhone SE"]], ["13", devices["iPhone 13"]], ["Pixel", devices["Pixel 5"]]]) {
  const x = await dev(n, d);
  await x.page.goto(BASE);
  await wait(600);
  const m = await x.page.evaluate(() => {
    const panel = document.querySelector(".start").getBoundingClientRect();
    const kids = [...document.querySelectorAll(".start input, .start .inks, .start button")].map((e) => e.getBoundingClientRect());
    return { vw: innerWidth, home: document.getElementById("home").scrollWidth, panelR: panel.right, maxR: Math.max(...kids.map((r) => r.right)) };
  });
  check(`home fits on ${n}`, m.home <= m.vw && m.maxR <= m.panelR + 0.5, JSON.stringify(m));
  if (n === "SE") await x.page.screenshot({ path: `${OUT}/home-SE.png`, fullPage: true });
  await x.ctx.close();
}

// 2. Away flow: host (phone) steps away and comes back
const H = await dev("host-phone", devices["iPhone 13"]);
const G = await dev("guest", { viewport: { width: 1280, height: 800 } });
const G2 = await dev("guest2", { viewport: { width: 1280, height: 800 } });
await H.page.goto(BASE);
await H.page.fill("#nameInput", "Prakhar");
await H.page.click("#createBtn");
await H.page.waitForSelector("#lobby:not([hidden])");
const code = (await H.page.textContent("#lobbyCode")).trim();
for (const [d, n] of [[G, "Riya"], [G2, "Sam"]]) {
  await d.page.goto(`${BASE}/r/${code}`);
  await d.page.fill("#nameInput", n);
  await d.page.click("#joinGo");
  await d.page.waitForSelector("#lobby:not([hidden])");
}
const hostName = () => G.page.evaluate(() => window.doodle.app.view.players.find((p) => p.id === window.doodle.app.view.host)?.name);
const hostPid = await H.page.evaluate(() => window.doodle.app.you);
const setHidden = (d, hidden) => d.page.evaluate((h) => {
  Object.defineProperty(document, "visibilityState", { value: h ? "hidden" : "visible", configurable: true });
  Object.defineProperty(document, "hidden", { value: h, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}, hidden);

await setHidden(H, true);
await wait(500);
const status = await G.page.$$eval("#lobbyPlayers .pmeta", (n) => n.map((x) => x.textContent));
check("guests see the host as Away", status.includes("Away"), status.join(", "));
await fetch(`${BASE}/__dev/drop/${code}/${hostPid}`); // the phone OS kills the connection
await wait(5000); // shorter than the host grace (8s in test mode)
check("host role stays during a short absence", (await hostName()) === "Prakhar", await hostName());
await setHidden(H, false);
await H.page.waitForFunction(() => window.doodle.app.conn?.live, null, { timeout: 10000 });
await wait(500);
check("host is still host after coming back", (await hostName()) === "Prakhar");
const chatText = await G.page.$$eval("#chatLog .cm", (n) => n.map((x) => x.textContent).join(" | "));
check("no 'left' or 'joined' noise in chat", !/Prakhar left|Prakhar joined.*Prakhar joined/.test(chatText));

// Long absence in the lobby: role moves, then returns to the creator
await setHidden(H, true);
await wait(9500);
const moved = await hostName();
check("host role moves after a long absence in the lobby", moved !== "Prakhar", moved);
await setHidden(H, false);
await wait(800);
check("creator gets the host role back on return", (await hostName()) === "Prakhar", await hostName());
await G.page.screenshot({ path: `${OUT}/lobby-after-return.png` });

// 3. Connection banner on the phone
await H.ctx.setOffline(true);
await wait(2500);
const bar = await H.page.evaluate(() => { const r = document.getElementById("netbar").getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), text: document.getElementById("netText").textContent }; });
check("banner is wide and on one line", bar.h <= 52 && bar.w > 220, JSON.stringify(bar));
await H.page.screenshot({ path: `${OUT}/banner.png` });
await H.ctx.setOffline(false);
await H.page.waitForFunction(() => window.doodle.app.conn?.live, null, { timeout: 15000 });

// 4. Chat visible while typing (phone guesser)
await H.page.waitForSelector("#startBtn:not([disabled])", { timeout: 10000 });
await H.page.click("#startBtn");
let drawer = null;
for (let i = 0; i < 60 && !drawer; i++) { for (const d of [H, G, G2]) if (await d.page.$(".choice")) drawer = d; if (!drawer) await wait(150); }
await drawer.page.click(".choice >> nth=0");
await wait(500);
if (drawer === H) {
  // Let someone else draw so the phone is a guesser.
  await H.page.click("#menuBtn");
  await H.page.click("#menuSkip");
  await H.page.click("#menuSkip");
  drawer = null;
  for (let i = 0; i < 80 && !drawer; i++) { for (const d of [G, G2]) if (await d.page.$(".choice")) drawer = d; if (!drawer) await wait(200); }
  await drawer.page.click(".choice >> nth=0");
  await wait(500);
}
for (const d of [G, G2].filter((x) => x !== drawer)) for (const t of ["is it a bird", "plane?", "kite"]) { await d.page.fill("#chatInput", t); await d.page.press("#chatInput", "Enter"); await wait(150); }
if (drawer !== H) {
  // A real keyboard shrinks the visible area but not the screen; keep the emulated screen portrait.
  await H.page.evaluate(() => Object.defineProperty(screen, "orientation", { value: { type: "portrait-primary", addEventListener() {} }, configurable: true }));
  for (const [label, h] of [["iPhone 13 keyboard", 400], ["small phone keyboard", 330]]) {
    await H.page.setViewportSize({ width: 390, height: h });
    await wait(400);
    const m = await H.page.evaluate(() => {
      const log = document.getElementById("chatLog").getBoundingClientRect();
      const board = document.getElementById("board").getBoundingClientRect();
      const input = document.getElementById("chatInput").getBoundingClientRect();
      return { kb: document.body.classList.contains("kb"), chatH: Math.round(log.height), board: Math.round(board.height), inputBottom: Math.round(input.bottom), vh: innerHeight };
    });
    check(`${label}: ~3 chat lines and a usable canvas`, m.kb && m.chatH >= 62 && m.board >= 110 && m.inputBottom <= m.vh, JSON.stringify(m));
    await H.page.screenshot({ path: `${OUT}/keyboard-${h}.png` });
  }
} else check("phone was drawer, skipped keyboard check", true);

console.log(results.join("\n"));
console.log(errors.length ? `ERRORS:\n${errors.join("\n")}` : "no page errors");
await browser.close();

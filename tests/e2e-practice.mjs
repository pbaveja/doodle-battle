// Solo practice on a laptop, an iPad and phones: settings, picking, drawing, Done/Skip, time up,
// the summary, pausing in the background, offline start, and the layout on each screen size.
// Run against the dev server: FAST=1 bun dev/server.ts & node tests/e2e-practice.mjs
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-shots-practice");
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const results = [], errors = [];
const check = (n, ok, x = "") => results.push(`${ok ? "PASS" : "FAIL"} ${n}${x ? ` (${x})` : ""}`);

async function dev(name, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !/favicon|ERR_FAILED|Failed to load resource/.test(m.text()) && errors.push(`${name} console: ${m.text()}`));
  return { name, ctx, page };
}

const visible = (page, sel) => page.locator(sel).isVisible();
const text = (page, sel) => page.locator(sel).innerText();
const norm = (t) => t.replace(/\s+/g, " ").trim().toLowerCase();

async function scribble(page) {
  const b = await page.locator("#board").boundingBox();
  await page.mouse.move(b.x + b.width * 0.25, b.y + b.height * 0.4);
  await page.mouse.down();
  for (let i = 1; i <= 24; i++) await page.mouse.move(b.x + b.width * (0.25 + 0.5 * i / 24), b.y + b.height * (0.4 + 0.25 * Math.sin(i / 3)), { steps: 2 });
  await page.mouse.up();
}

const ink = (page) => page.evaluate(() => {
  const c = document.getElementById("board");
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 0; i < d.length; i += 16) if (d[i] < 200 || d[i + 1] < 200 || d[i + 2] < 200) n++;
  return n;
});

/** Sizes of the main pieces, and whether anything sticks out of the screen. */
const layout = (page) => page.evaluate(() => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), b: Math.round(b.bottom), r: Math.round(b.right) }; };
  const scr = [...document.querySelectorAll(".screen")].find((s) => !s.hidden);
  return {
    vw: innerWidth, vh: innerHeight, screen: scr?.id,
    overflowX: scr ? scr.scrollWidth > scr.clientWidth + 1 : false,
    overflowY: scr ? scr.scrollHeight > scr.clientHeight + 1 : false,
    paper: r("#paperWrap"), tools: r("#tools"), palette: r("#palette"), bar: r(".gbar"), done: r("#pDone"), card: r(".pcard"), clock: r("#clock"),
    landscape: document.body.classList.contains("landscape"),
    chatShown: getComputedStyle(document.getElementById("gameChat")).display !== "none",
    playersShown: getComputedStyle(document.querySelector(".players-col")).display !== "none",
  };
});

/* ================= 1. Laptop: the full flow ================= */
{
  const L = await dev("laptop", { viewport: { width: 1280, height: 800 } });
  const p = L.page;
  await p.goto(BASE);
  await p.waitForSelector("#home:not([hidden])");
  check("home shows a Practice button", await visible(p, "#practiceBtn"));
  await p.screenshot({ path: `${OUT}/01-home-laptop.png` });
  await p.click("#practiceBtn");
  await p.waitForSelector("#practice:not([hidden])");
  check("Practice opens the setup at /practice", new URL(p.url()).pathname === "/practice");
  await p.selectOption("#pCategory", "animals");
  await p.click('#pDiff button[data-v="easy"]');
  for (let i = 0; i < 3; i++) await p.click('#pSettings [data-key="drawTime"] [data-d="-1"]'); // 80 → 30
  await p.click('#pSettings [data-key="words"] [data-d="-1"]'); // 5 → 3
  check("draw time shows 30s", (await text(p, '#pSettings [data-key="drawTime"] [data-val]')) === "30s");
  check("minus is disabled at the shortest time", await p.locator('#pSettings [data-key="drawTime"] [data-d="-1"]').isDisabled());
  check("words shows 3", (await text(p, '#pSettings [data-key="words"] [data-val]')) === "3");
  await p.screenshot({ path: `${OUT}/02-setup-laptop.png` });
  await p.reload();
  await p.waitForSelector("#practice:not([hidden])");
  check("settings are remembered after a reload",
    (await p.inputValue("#pCategory")) === "animals" && (await p.getAttribute('#pDiff [data-v="easy"]', "aria-checked")) === "true" && (await text(p, '#pSettings [data-key="words"] [data-val]')) === "3");

  await p.click("#pStart");
  await p.waitForSelector("#game:not([hidden]) .choice");
  let m = await layout(p);
  check("game screen in practice mode", await p.locator("#game.solo").count() === 1);
  check("no chat or player list in practice", !m.chatShown && !m.playersShown);
  const metas = await p.locator(".choice .cmeta").allInnerTexts();
  check("3 choices, all Animals · Easy", metas.length === 3 && metas.every((t) => norm(t) === "animals · easy"), metas.join(", "));
  check("label says Word 1 of 3", norm(await text(p, "#roundLabel")) === "word 1 of 3");
  const before = await p.locator(".choice .cw").allInnerTexts();
  await p.click("#pShuffle");
  const after = await p.locator(".choice .cw").allInnerTexts();
  check("New words deals different words", after.length === 3 && after.every((w) => !before.includes(w)), `${before} → ${after}`);
  await wait(450);
  await p.screenshot({ path: `${OUT}/03-choose-laptop.png` });
  await p.keyboard.press("1");
  await p.waitForSelector("#wordBox .theword");
  const word1 = await text(p, "#wordBox .theword");
  check("key 1 picks the first word", word1 === after[0], word1);
  check("tools show while drawing", await visible(p, "#tools"));
  const paperChoose = (await layout(p)).paper;
  check("button says Skip on an empty page", (await text(p, "#pDone")) === "Skip");
  check("clock runs", await p.locator("#clock").evaluate((e) => getComputedStyle(e).visibility === "visible"));
  await scribble(p);
  check("drawing puts ink on the page", (await ink(p)) > 50);
  check("button turns into Done", (await text(p, "#pDone")) === "Done");
  m = await layout(p);
  check("laptop: canvas is big", m.paper.w >= 760, `${m.paper.w}x${m.paper.h}`);
  check("laptop: tools on screen", m.tools.b <= m.vh, JSON.stringify(m.tools));
  await p.screenshot({ path: `${OUT}/04-drawing-laptop.png` });
  await p.click("#pDone");
  await p.waitForSelector(".pcard");
  const cardText = await text(p, ".pcard");
  check("Done shows the card with the time", /Done in \d+ s/i.test(cardText) && cardText.includes(word1), cardText.replace(/\n/g, " | "));
  check("card has a Save link with the image", ((await p.getAttribute(".pcard a[download]", "href")) ?? "").startsWith("data:image/jpeg"));
  check("drawing stays visible above the card", (await ink(p)) > 50);
  await wait(450);
  await p.screenshot({ path: `${OUT}/05-done-laptop.png` });
  await p.click("#pNext");
  await p.waitForSelector(".choice");
  check("next word: Word 2 of 3", norm(await text(p, "#roundLabel")) === "word 2 of 3");
  check("page is clean for the next word", (await ink(p)) === 0);
  const offered2 = await p.locator(".choice .cw").allInnerTexts();
  check("a drawn word isn't offered again", !offered2.includes(word1));
  await p.click(".choice >> nth=1");
  await p.waitForSelector("#wordBox .theword");
  await p.click("#pDone"); // Skip with nothing drawn
  await p.waitForSelector(".pcard");
  check("Skip shows Skipped without a Save link", /skipped/i.test(await text(p, ".pcard")) && (await p.locator(".pcard a[download]").count()) === 0);
  await p.click("#pNext");
  await p.waitForSelector(".choice");
  await p.click(".choice >> nth=2");
  await p.waitForSelector("#wordBox .theword");
  const word3 = await text(p, "#wordBox .theword");
  await scribble(p);
  // Pause: hide the page for 3 s and check the clock didn't move.
  const secA = Number(await text(p, "#clockText"));
  await p.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await wait(3200);
  await p.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await wait(300);
  const secB = Number(await text(p, "#clockText"));
  check("clock pauses while the page is in the background", secA - secB <= 1, `${secA} → ${secB}`);
  await p.waitForSelector(".stamp", { timeout: 40000 });
  check("time runs out: Time's up stamp", (await text(p, ".stamp")).includes("Time"));
  check("tools lock when time is up", !(await visible(p, "#tools")));
  await p.waitForSelector(".pcard", { timeout: 4000 });
  check("last word: See your drawings", (await text(p, "#pNext")) === "See your drawings");
  await wait(450);
  await p.screenshot({ path: `${OUT}/06-timeup-laptop.png` });
  await p.click("#pNext");
  await p.waitForSelector("#practiceDone:not([hidden])");
  const cards = await p.locator("#pdGallery .gcard .gw").allInnerTexts();
  check("summary shows the 2 drawings (not the skipped one)", cards.length === 2 && cards[0] === word1 && cards[1] === word3, cards.join(", "));
  check("summary stats", (await text(p, "#pdStats")).startsWith("You drew 2 words in"), await text(p, "#pdStats"));
  check("each drawing can be saved", (await p.locator("#pdGallery a.gsave[download]").count()) === 2);
  await wait(900);
  await p.screenshot({ path: `${OUT}/07-summary-laptop.png` });
  await p.click("#pdAgain");
  await p.waitForSelector("#game:not([hidden]) .choice");
  check("Practice again starts over at Word 1", norm(await text(p, "#roundLabel")) === "word 1 of 3");
  await p.click(".choice >> nth=0");
  await scribble(p);
  await p.click("#menuBtn");
  check("menu: End practice shown, room items hidden",
    (await visible(p, "#menuPEnd")) && !(await visible(p, "#menuInvite")) && !(await visible(p, "#menuLeave")));
  await wait(450);
  await p.screenshot({ path: `${OUT}/08-menu-laptop.png` });
  await p.click("#menuPEnd");
  await p.waitForSelector("#practiceDone:not([hidden])");
  check("End practice keeps the drawing in progress", (await p.locator("#pdGallery .gcard").count()) === 1);
  await p.click("#pdSettings");
  await p.waitForSelector("#practice:not([hidden])");
  check("Change settings goes back to setup", true);
  await p.click("#practice .pstart .textlink");
  await p.waitForSelector("#home:not([hidden])");
  check("Back to home", new URL(p.url()).pathname === "/");
  // Browser back from the middle of a drawing goes home cleanly, then a room still works.
  await p.goto(`${BASE}/practice`);
  await p.click("#pStart");
  await p.waitForSelector(".choice");
  await p.click(".choice >> nth=0");
  await p.goBack();
  await p.waitForSelector("#home:not([hidden])");
  check("leaving mid-drawing stops practice", (await p.locator("#game.solo").count()) === 0);
  await p.fill("#nameInput", "Prakhar");
  await p.click("#createBtn");
  await p.waitForSelector("#lobby:not([hidden])");
  check("multiplayer still works after practice", true);
  await L.ctx.close();
}

/* ================= 2. Offline start ================= */
{
  const O = await dev("offline", { viewport: { width: 1280, height: 800 } });
  await O.page.route("**/api/words", (r) => r.abort());
  await O.page.goto(`${BASE}/practice`);
  await O.page.click("#pStart");
  await O.page.waitForSelector("#pErr:not([hidden])", { timeout: 15000 });
  check("no word list and no connection: clear error", (await text(O.page, "#pErr")).length > 10, await text(O.page, "#pErr"));
  await O.page.unroute("**/api/words");
  await O.page.click("#pStart");
  await O.page.waitForSelector(".choice");
  check("retry works once the connection is back", true);
  // With the list saved, practice starts even if the server can't be reached.
  await O.page.goto(`${BASE}/practice`);
  await O.page.route("**/api/words", (r) => r.abort());
  await O.page.click("#pStart");
  await O.page.waitForSelector(".choice", { timeout: 4000 });
  check("saved word list: starts with no connection", true);
  await O.ctx.close();
}

/* ================= 3. iPad, phones, sideways ================= */
const sizes = [
  ["iPad", devices["iPad (gen 7)"]],
  ["iPad-landscape", devices["iPad (gen 7) landscape"]],
  ["iPhone13", devices["iPhone 13"]],
  ["iPhoneSE", devices["iPhone SE"]],
  ["Pixel5", devices["Pixel 5"]],
  ["iPhone13-landscape", devices["iPhone 13 landscape"]],
  ["Pixel5-landscape", devices["Pixel 5 landscape"]],
  ["iPhone13-dark", { ...devices["iPhone 13"], colorScheme: "dark" }],
];
for (const [n, d] of sizes) {
  const D = await dev(n, d);
  const p = D.page;
  // Playwright's iPhone landscape reports a portrait screen; real Safari reports landscape.
  if (n === "iPhone13-landscape") await p.addInitScript(() => Object.defineProperty(screen, "orientation", { value: { type: "landscape-primary", addEventListener() {} }, configurable: true }));
  await p.goto(BASE);
  await p.waitForSelector("#home:not([hidden])");
  const home = await layout(p);
  check(`${n}: home has no sideways scroll`, !home.overflowX);
  await p.click("#practiceBtn");
  await p.waitForSelector("#practice:not([hidden])");
  const setup = await layout(p);
  check(`${n}: setup fits the width`, !setup.overflowX);
  if (n.startsWith("iPhone13") || n === "iPad") await p.screenshot({ path: `${OUT}/${n}-setup.png` });
  await p.click("#pStart");
  await p.waitForSelector(".choice");
  await wait(400); // let the screen's entry animation finish
  const choose = await layout(p);
  check(`${n}: choosing fits`, !choose.overflowX && choose.paper.b <= choose.vh, JSON.stringify(choose.paper));
  const fit = await p.evaluate(() => {
    const pw = document.getElementById("paperWrap").getBoundingClientRect();
    return [...document.querySelectorAll(".choice")].every((c) => { const r = c.getBoundingClientRect(); return r.top >= pw.top - 1 && r.bottom + 6 <= pw.bottom + 1; });
  });
  check(`${n}: word choices fit inside the canvas`, fit);
  check(`${n}: New words button in the top bar`, await visible(p, "#pShuffle"));
  await wait(450);
  await p.screenshot({ path: `${OUT}/${n}-choose.png` });
  await p.click(".choice >> nth=0");
  await p.waitForSelector("#wordBox .theword");
  await scribble(p);
  const m = await layout(p);
  check(`${n}: canvas stays put when drawing starts`, JSON.stringify(m.paper) === JSON.stringify(choose.paper), `${JSON.stringify(choose.paper)} → ${JSON.stringify(m.paper)}`);
  const allIn = m.paper.b <= m.vh && m.tools.b <= m.vh + 1 && m.tools.r <= m.vw + 1 && m.done.r <= m.vw && m.clock.r <= m.vw;
  check(`${n}: canvas, tools, Done and clock all on screen`, allIn && !m.overflowX && !m.overflowY, JSON.stringify({ paper: m.paper, tools: m.tools, done: m.done, clock: m.clock, bar: m.bar, oy: m.overflowY, ox: m.overflowX, word: await p.textContent('#wordBox'), vh: m.vh, vw: m.vw }));
  const share = (m.paper.w * m.paper.h) / (m.vw * m.vh);
  check(`${n}: canvas uses the screen well`, share >= (n.includes("landscape") ? 0.25 : 0.3), `${Math.round(share * 100)}% of screen, ${m.paper.w}x${m.paper.h}`);
  if (n.endsWith("-landscape") && !n.startsWith("iPad")) check(`${n}: tools beside the canvas`, m.tools.x > m.paper.r - 2, JSON.stringify({ paper: m.paper, tools: m.tools }));
  check(`${n}: ink lands`, (await ink(p)) > 50);
  await wait(450);
  await p.screenshot({ path: `${OUT}/${n}-drawing.png` });
  await p.click("#pDone");
  await p.waitForSelector(".pcard");
  const c = await layout(p);
  check(`${n}: done card inside the canvas`, c.card.x >= c.paper.x && c.card.r <= c.paper.r && c.card.b <= c.paper.b, JSON.stringify({ card: c.card, paper: c.paper }));
  await wait(450);
  await p.screenshot({ path: `${OUT}/${n}-done.png` });
  await p.click("#menuBtn");
  await p.click("#menuPEnd");
  await p.waitForSelector("#practiceDone:not([hidden])");
  const s = await layout(p);
  check(`${n}: summary fits the width`, !s.overflowX);
  await wait(900);
  await p.screenshot({ path: `${OUT}/${n}-summary.png`, fullPage: true });
  await D.ctx.close();
}

await browser.close();
for (const r of results) console.log(r);
if (errors.length) console.log("ERRORS:\n" + errors.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length - failed}/${results.length} passed${errors.length ? `, ${errors.length} page errors` : ""}`);
process.exit(failed || errors.length ? 1 : 0);

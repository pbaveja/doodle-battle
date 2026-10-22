// Voice chat: players connect straight to each other, mute, follow the room's voice rules during a
// turn, recover after a dropped connection, and the room passes on exactly one offer and one answer
// per pair. Also checks the voice button and menu fit on small phones.
// Run against the dev server: FAST=1 bun dev/server.ts & node tests/e2e-voice.mjs
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-voice");
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream", // a beeping fake mic, so speaking shows
    "--autoplay-policy=no-user-gesture-required",
  ],
});
const results = [], errors = [];
const check = (n, ok, x = "") => results.push(`${ok ? "PASS" : "FAIL"} ${n}${x ? ` (${x})` : ""}`);

// Counts the messages each page sends to the room, by type.
const countSent = () => {
  window.__sent = {};
  const send = WebSocket.prototype.send;
  WebSocket.prototype.send = function (data) {
    try {
      const t = JSON.parse(data).t;
      window.__sent[t] = (window.__sent[t] ?? 0) + 1;
    } catch { /* not JSON */ }
    return send.call(this, data);
  };
};

async function dev(name, opts) {
  const ctx = await browser.newContext({ ...opts, permissions: ["microphone"] });
  await ctx.addInitScript(countSent);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  return { name, ctx, page };
}
const sent = (d, t) => d.page.evaluate((t) => window.__sent[t] ?? 0, t);
const pid = (d) => d.page.evaluate(() => window.doodle.app.you);
const peer = (d, id) => d.page.evaluate((id) => window.doodle.voice.peer(id), id);
const until = async (d, fn, arg, ms = 15000) => {
  try {
    await d.page.waitForFunction(fn, arg, { timeout: ms, polling: 200 });
    return true;
  } catch {
    return false;
  }
};
const connected = (d, id, ms) => until(d, (id) => window.doodle.voice.peer(id) === "connected", id, ms);
const audioMuted = (d, id) => d.page.evaluate((id) => document.querySelector(`audio[data-id="${id}"]`)?.muted ?? null, id);
const inVoice = (d) => d.page.evaluate(() => window.doodle.app.view.players.filter((p) => p.voice).map((p) => p.name).sort().join(","));
const noOverflow = (d) => d.page.evaluate(() => {
  const scr = [...document.querySelectorAll(".screen")].find((s) => !s.hidden);
  const out = [...scr.querySelectorAll(".topbar *, .gbar *")].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width && (r.right > innerWidth + 0.5 || r.left < -0.5);
  });
  return { ok: scr.scrollWidth <= innerWidth && out.length === 0, sw: scr.scrollWidth, vw: innerWidth, out: out.map((e) => e.className || e.tagName).slice(0, 4) };
});

const H = await dev("host", { viewport: { width: 1280, height: 800 } });
const G = await dev("guest-phone", devices["iPhone SE"]);
const C = await dev("guest2", { viewport: { width: 900, height: 1100 } });
await H.page.goto(BASE);
await H.page.fill("#nameInput", "Prakhar");
await H.page.click("#createBtn");
await H.page.waitForSelector("#lobby:not([hidden])");
const code = (await H.page.textContent("#lobbyCode")).trim();
for (const [d, n] of [[G, "Riya"], [C, "Sam"]]) {
  await d.page.goto(`${BASE}/r/${code}`);
  await d.page.fill("#nameInput", n);
  await d.page.click("#joinGo");
  await d.page.waitForSelector("#lobby:not([hidden])");
}
const [hId, gId, cId] = [await pid(H), await pid(G), await pid(C)];

// 1. The lobby: the voice button, the host setting and its info
check("voice is off by default", (await H.page.getAttribute('#voiceSeg [data-v="off"]', "aria-checked")) === "true");
await H.page.click('#voiceSeg [data-v="on"]');
await G.page.waitForSelector("#lobbyVoice #voiceBtn", { state: "visible" });
check("voice button shows in the lobby", await G.page.isVisible("#lobbyVoice #voiceBtn"));
check("info is hidden until asked", !(await G.page.isVisible("#voiceInfo")));
await G.page.click("#voiceInfoBtn");
check("guests can read the voice info", await G.page.isVisible("#voiceInfo") && /Between turns/.test(await G.page.textContent("#voiceInfo")));
check("info button says it's open", (await G.page.getAttribute("#voiceInfoBtn", "aria-expanded")) === "true");
await G.page.screenshot({ path: `${OUT}/lobby-info-SE.png`, fullPage: true });
await G.page.click("#voiceInfoBtn");
check("lobby top bar fits on iPhone SE", (await noOverflow(G)).ok, JSON.stringify(await noOverflow(G)));
check("nobody sent anything voice-related yet", (await sent(H, "voice")) + (await sent(G, "voice")) + (await sent(H, "rtc")) === 0);

// 2. Joining: one offer and one answer per pair
await H.page.click("#voiceBtn");
await G.page.click("#voiceBtn");
check("host and phone connect", await connected(H, gId) && await connected(G, hId));
check("the button shows a live mic", (await H.page.getAttribute("#voiceBtn", "class")).includes("on"));
check("lobby lists show who's in voice", (await C.page.$$("#lobbyPlayers .vmark")).length === 2, await inVoice(C));
await C.page.click("#voiceBtn");
check("third player connects to both", await connected(C, hId) && await connected(C, gId) && await connected(H, cId) && await connected(G, cId));
await wait(500);
const rtcTotal = (await sent(H, "rtc")) + (await sent(G, "rtc")) + (await sent(C, "rtc"));
check("three players: exactly 6 handshake messages (3 pairs x offer + answer)", rtcTotal === 6, String(rtcTotal));
check("one voice message each", (await sent(H, "voice")) === 1 && (await sent(G, "voice")) === 1 && (await sent(C, "voice")) === 1);
check("speaking shows on the lists", await until(H, (id) => document.getElementById("voiceCss").textContent.includes(id), gId, 8000));
check("no audio element is muted in the lobby", (await audioMuted(H, gId)) === false && (await audioMuted(G, cId)) === false);
await G.page.click("#voiceMore");
await wait(300);
await G.page.screenshot({ path: `${OUT}/lobby-menu-SE.png` });
const menuBox = await G.page.evaluate(() => { const r = document.getElementById("voiceMenu").getBoundingClientRect(); return { l: r.left, r: r.right, vw: innerWidth }; });
check("voice menu fits on iPhone SE", menuBox.l >= 0 && menuBox.r <= menuBox.vw, JSON.stringify(menuBox));
check("voice menu lists both others", (await G.page.$$("#voiceMenu .vrow")).length === 2);
await G.page.click("body", { position: { x: 5, y: 300 } });
check("menu closes on an outside tap", !(await G.page.isVisible("#voiceMenu")));

// 3. Muting goes over the data channel, not the room
const voiceBefore = await sent(G, "voice");
await G.page.click("#voiceBtn");
check("phone's button shows muted", (await G.page.getAttribute("#voiceBtn", "class")).includes("muted"));
check("others see the phone's mic off", await until(H, (id) => window.doodle.voice.peerMuted(id), gId, 5000));
check("muting sent nothing to the room", (await sent(G, "voice")) === voiceBefore && (await sent(G, "rtc")) <= 2);
await G.page.click("#voiceBtn");
check("unmuting shows on the other side", await until(H, (id) => !window.doodle.voice.peerMuted(id), gId, 5000));

// 4. A turn: the drawer can't be heard by guessers
await H.page.click("#startBtn");
const devs = [H, G, C], ids = new Map([[H, hId], [G, gId], [C, cId]]);
let drawer = null;
for (let i = 0; i < 40 && !drawer; i++) {
  for (const d of devs) if (await d.page.$(".choice")) drawer = d;
  if (!drawer) await wait(200);
}
check("someone is choosing a word", !!drawer);
const guessers = devs.filter((d) => d !== drawer);
const dId = ids.get(drawer);
check("guessers can't hear the drawer while a word is picked", (await audioMuted(guessers[0], dId)) === true && (await audioMuted(guessers[1], dId)) === true);
check("the drawer sees why", !!(await drawer.page.$("#voiceBtn .vhush")));
check("guessers still hear each other", (await audioMuted(guessers[0], ids.get(guessers[1]))) === false);
await drawer.page.click(".choice >> nth=0");
await drawer.page.waitForFunction(() => window.doodle.app.view.phase === "drawing");
const word = await drawer.page.evaluate(() => window.doodle.app.view.word);
await guessers[0].page.waitForFunction(() => window.doodle.app.view.phase === "drawing");
await guessers[0].page.fill("#chatInput", word);
await guessers[0].page.press("#chatInput", "Enter");
await guessers[0].page.waitForFunction(() => window.doodle.app.view.guessed.includes(window.doodle.app.you));
await wait(400);
check("a player who guessed hears the drawer", (await audioMuted(guessers[0], dId)) === false);
check("a player still guessing can't hear the one who guessed", (await audioMuted(guessers[1], ids.get(guessers[0]))) === true);
check("the drawer hears the one who guessed", (await audioMuted(drawer, ids.get(guessers[0]))) === false);
const phoneInGame = G === drawer ? null : G;
await G.page.screenshot({ path: `${OUT}/game-SE.png` });
check("game bar fits on iPhone SE", (await noOverflow(G)).ok, JSON.stringify(await noOverflow(G)));
if (phoneInGame) {
  await G.page.click("#voiceMore");
  await wait(250);
  await G.page.screenshot({ path: `${OUT}/game-menu-SE.png` });
  await G.page.click("body", { position: { x: 5, y: 300 } });
}
await H.page.screenshot({ path: `${OUT}/game-desktop.png` });

// 5. A dropped connection: the call comes back by itself, with one new handshake per pair
const rtcBefore = (await sent(G, "rtc")) + (await sent(H, "rtc")) + (await sent(C, "rtc"));
await fetch(`${BASE}/__dev/drop/${code}/${gId}`);
await G.page.waitForFunction(() => window.doodle.app.conn?.live, null, { timeout: 15000 });
check("after a reconnect the phone is back in voice", await connected(G, hId, 20000) && await connected(G, cId, 20000) && await connected(H, gId, 20000));
await wait(500);
const rtcAfter = (await sent(G, "rtc")) + (await sent(H, "rtc")) + (await sent(C, "rtc"));
check("the reconnect cost 4 handshake messages (2 pairs)", rtcAfter - rtcBefore === 4, String(rtcAfter - rtcBefore));

// 6. End the game, try "Between turns", then leave voice
await H.page.click("#menuBtn");
await H.page.click("#menuEnd");
await H.page.click("#menuEnd");
await H.page.waitForSelector("#over:not([hidden])");
check("voice button on the results screen", await H.page.isVisible("#overVoice #voiceBtn"));
await G.page.waitForSelector("#over:not([hidden])");
check("results top bar fits on iPhone SE", (await noOverflow(G)).ok, JSON.stringify(await noOverflow(G)));
await G.page.screenshot({ path: `${OUT}/over-SE.png` });
await H.page.click("#againBtn");
await H.page.waitForSelector("#lobby:not([hidden])");
await H.page.click('#voiceSeg [data-v="breaks"]');
await G.page.waitForFunction(() => window.doodle.app.view.settings.voice === "breaks");
check("still connected after the mode changed", (await peer(G, hId)) === "connected");
await H.page.click("#startBtn");
await H.page.waitForFunction(() => window.doodle.app.view.phase === "choosing");
await G.page.waitForFunction(() => window.doodle.app.view.phase === "choosing");
await wait(300);
check("between turns: everyone is muted during a turn", (await audioMuted(G, hId)) === true && (await audioMuted(G, cId)) === true && (await audioMuted(H, gId)) === true);
await H.page.click("#menuBtn");
await H.page.click("#menuEnd");
await H.page.click("#menuEnd");
await H.page.waitForSelector("#over:not([hidden])");
await wait(300);
check("between turns: everyone hears again on the results", (await audioMuted(G, hId)) === false);

await C.page.waitForSelector("#over:not([hidden])");
await C.page.click("#voiceMore");
await C.page.click("[data-leave-voice]");
check("leaving voice drops the calls", await until(H, (id) => !window.doodle.app.view.players.find((p) => p.id === id).voice, cId, 5000) && !(await C.page.$("audio")));
check("a player who left voice can't be heard", !(await H.page.$(`audio[data-id="${cId}"]`)));

// 7. The host turns voice off
await H.page.click("#againBtn");
await H.page.waitForSelector("#lobby:not([hidden])");
await H.page.click('#voiceSeg [data-v="off"]');
check("voice off hides the button for everyone", await until(G, () => document.getElementById("voice").hidden, null, 5000));
check("voice off ends every call", !(await G.page.$("audio")) && (await inVoice(H)) === "");

console.log(results.join("\n"));
if (errors.length) console.log("PAGE ERRORS:\n" + errors.join("\n"));
console.log(`screenshots: ${OUT}`);
await browser.close();
process.exit(results.some((r) => r.startsWith("FAIL")) || errors.length ? 1 : 0);

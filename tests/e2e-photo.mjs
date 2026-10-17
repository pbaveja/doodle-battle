// Characters and photos: the look picker, the camera (Chromium's fake camera), the three looks,
// photos shown to other players, the host's Player photos switch, refresh, and a blocked camera.
// Run against the dev server: FAST=1 bun dev/server.ts & node tests/e2e-photo.mjs
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PW_PATH || "playwright");
const BASE = process.argv[2] || "http://localhost:8787";
const OUT = process.env.SHOTS || join(tmpdir(), "doodle-battle-shots-photo");
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const results = [], errors = [];
const check = (n, ok, x = "") => results.push(`${ok ? "PASS" : "FAIL"} ${n}${x ? ` (${x})` : ""}`);
async function dev(name, opts) {
  const ctx = await browser.newContext({ ...opts, permissions: ["camera"] });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`));
  return { name, ctx, page };
}

const H = await dev("host-phone", devices["iPhone 13"]);
const p = H.page;
await p.goto(BASE);
await p.waitForSelector("#home:not([hidden])");
check("avatar is a character with a thick ring", (await p.locator("#faceShuffle svg circle[stroke-width='6']").count()) === 1);
await p.click("#faceShuffle");
await p.waitForSelector("#lookSheet:not([hidden])");
check("picker shows all 48 characters", (await p.locator("#lookBody [data-face]").count()) === 48);
check("picker offers Take a photo", (await p.locator("#lookBody [data-camera]").count()) === 1);
await wait(300);
await p.screenshot({ path: `${OUT}/01-picker-phone.png` });
await p.click('#lookBody [data-face="12"]');
check("picking Panda closes the picker and names it", (await p.locator("#lookSheet").isHidden()) && (await p.textContent("#lookName")) === "Panda");
await p.click("#faceN");
check("arrows move to the next character", (await p.textContent("#lookName")) === "Koala");

await p.click("#photoBtn");
await p.waitForSelector("#camSheet:not([hidden])");
await p.waitForFunction(() => !document.querySelector("#camShoot").disabled, null, { timeout: 8000 });
check("camera starts", true);
await wait(300);
await p.screenshot({ path: `${OUT}/02-camera-live.png` });
await p.click("#camShoot");
await p.waitForSelector("#camReview:not([hidden])", { timeout: 6000 });
check("3-2-1 then three looks", (await p.locator(".cam-look").count()) === 3);
check("camera turns off after the shot", await p.evaluate(() => !document.querySelector("#camVideo").srcObject));
await p.click('.cam-look[data-look="ink"]');
await wait(200);
await p.screenshot({ path: `${OUT}/03-camera-review.png` });
await p.click("#camUse");
await p.waitForSelector("#camSheet", { state: "hidden" });
check("your photo becomes your avatar", (await p.locator("#faceShuffle .pic img").count()) === 1 && (await p.textContent("#lookName")) === "Your photo");
await p.fill("#nameInput", "Prakhar");
await p.click("#createBtn");
await p.waitForSelector("#lobby:not([hidden])");
const code = (await p.textContent("#lobbyCode")).trim();

const G = await dev("guest-laptop", { viewport: { width: 1280, height: 800 } });
await G.page.goto(`${BASE}/r/${code}`);
await G.page.fill("#nameInput", "Riya");
await G.page.click("#joinGo");
await G.page.waitForSelector("#lobby:not([hidden])");
await G.page.waitForSelector("#lobbyPlayers .pic img", { timeout: 5000 }).catch(() => {});
check("the guest sees the host's photo", (await G.page.locator("#lobbyPlayers .pic img").count()) === 1);
const kept = await p.evaluate(() => ({ s: (sessionStorage.getItem("db.photo") || "").length, l: Object.keys(localStorage).some((k) => (localStorage.getItem(k) || "").includes("data:image")) }));
check("photo kept for this visit only (tab storage, not saved on the device)", kept.s > 1000 && !kept.l, JSON.stringify(kept));
await G.page.screenshot({ path: `${OUT}/04-lobby-guest.png` });

// Host turns photos off, then on again
await p.click("#photosOn");
await G.page.waitForFunction(() => !document.querySelector("#lobbyPlayers .pic"), null, { timeout: 5000 }).catch(() => {});
check("photos off: everyone sees characters", (await G.page.locator("#lobbyPlayers .pic").count()) === 0 && (await p.locator("#lobbyPlayers .pic").count()) === 0);
await p.click("#photosOn");
await G.page.waitForSelector("#lobbyPlayers .pic img", { timeout: 5000 }).catch(() => {});
check("photos back on: the host's photo returns", (await G.page.locator("#lobbyPlayers .pic img").count()) === 1);

// Refresh keeps the photo for this visit
await p.reload();
await p.waitForSelector("#lobby:not([hidden])");
await wait(1200);
check("after a refresh the photo is still there", (await p.locator("#lobbyPlayers .pic img").count()) === 1 && (await G.page.locator("#lobbyPlayers .pic img").count()) === 1);

// Start a game: photos in the game's player list
await p.click("#startBtn");
await p.waitForSelector("#game:not([hidden])");
await wait(1500);
check("photos show in the game's player list", (await G.page.locator("#gamePlayers .pic img").count()) === 1);
await p.screenshot({ path: `${OUT}/05-game-phone.png` });

// Blocked camera
const D = await dev("denied", { viewport: { width: 1280, height: 800 } });
await D.page.addInitScript(() => {
  navigator.mediaDevices.getUserMedia = () => Promise.reject(Object.assign(new Error("denied"), { name: "NotAllowedError" }));
});
await D.page.goto(BASE);
await D.page.waitForSelector("#home:not([hidden])");
await D.page.click("#photoBtn");
await D.page.waitForSelector("#camFail:not([hidden])");
check("blocked camera explains how to allow it", /Allow the camera/.test(await D.page.textContent("#camMsg")));
await D.page.click("#camChar2");
check("and falls back to a character", (await D.page.locator("#faceShuffle svg").count()) === 1);

await browser.close();
for (const r of results) console.log(r);
if (errors.length) console.log("ERRORS:\n" + errors.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed || errors.length ? 1 : 0);

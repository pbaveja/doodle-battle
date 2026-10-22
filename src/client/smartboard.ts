// Smartboard view: for a classroom's big touch screen (a 65" interactive panel), read from the back
// of the room. It's a per-device switch. The text gets bigger; the drawer draws on a small pad in a
// corner the students can reach while the whole class watches the big canvas; and guessers type on
// big on-screen keys, so the panel's own keyboard never pops up over the drawing.

import { CANVAS_H, CANVAS_W, LIMITS, type View } from "../shared/protocol";
import { send, toast } from "./app";
import type { Board } from "./board";
import { sfx } from "./sound";
import { $, esc, store } from "./util";

const KEY = "db.smartboard";
const PAD_KEY = "db.pad";
/** Keep the pad clear of the screen edges, where panels put their own swipe-in toolbars. */
const EDGE = 48;
/** Pad widths, as a share of the screen width. */
const PAD_SIZES = [0.32, 0.4, 0.48];
const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const LETTER = /[\p{L}\p{N}]/u;

function detect(): boolean {
  const flag = new URLSearchParams(location.search).get("board");
  if (flag === "1") store.set(KEY, true);
  else if (flag === "0") store.del(KEY);
  return store.get<boolean>(KEY, false) === true;
}

let on = detect();
let board: Board;

export const isSmartboard = () => on;

export function setSmartboard(next: boolean) {
  on = next;
  if (on) store.set(KEY, true);
  else store.del(KEY);
  document.documentElement.classList.toggle("smartboard", on);
  if (on) enterFullscreen();
  if (!on) hidePad();
  hideKeys();
  onToggle();
}

let onToggle = () => {};

/* ---------------- full screen ---------------- */

export const canFullscreen = () => !!document.documentElement.requestFullscreen;
export const isFullscreen = () => !!document.fullscreenElement;

export function enterFullscreen() {
  if (!canFullscreen() || isFullscreen()) return;
  document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
}

export function toggleFullscreen() {
  if (isFullscreen()) void document.exitFullscreen().catch(() => {});
  else enterFullscreen();
}

/* ---------------- drawing pad ---------------- */

interface PadPos {
  /** Left and top edges as a share of the free space, so the pad keeps its place when the screen size changes. */
  x: number;
  y: number;
  size: number;
}

let pad: PadPos = loadPad();
let padShown = false;
let mirrorRaf = 0;
let mirrored = -1;

function loadPad(): PadPos {
  const p = store.get<Partial<PadPos>>(PAD_KEY, {});
  const frac = (n: unknown, d: number) => (typeof n === "number" && n >= 0 && n <= 1 ? n : d);
  const size = typeof p.size === "number" && p.size >= 0 && p.size < PAD_SIZES.length ? p.size : 1;
  return { x: frac(p.x, 0), y: frac(p.y, 1), size };
}

function placePad() {
  const el = $("#pad");
  const vw = window.innerWidth, vh = window.innerHeight;
  let w = Math.round(Math.min(vw - EDGE * 2, Math.max(320, vw * PAD_SIZES[pad.size])));
  el.style.width = `${w}px`;
  // On a short screen, narrow it until it fits the height (the drawing area is 4:3, so it shrinks by 3/4 of the width).
  const over = el.getBoundingClientRect().height - (vh - EDGE * 2);
  if (over > 0) {
    w = Math.max(280, Math.round(w - over / 0.75));
    el.style.width = `${w}px`;
  }
  const r = el.getBoundingClientRect();
  const freeX = Math.max(0, vw - EDGE * 2 - r.width), freeY = Math.max(0, vh - EDGE * 2 - r.height);
  el.style.left = `${Math.round(EDGE + freeX * pad.x)}px`;
  el.style.top = `${Math.round(EDGE + freeY * pad.y)}px`;
  for (const b of document.querySelectorAll<HTMLButtonElement>("#pad [data-pad-size]")) {
    const d = Number(b.dataset.padSize);
    b.disabled = pad.size + d < 0 || pad.size + d >= PAD_SIZES.length;
  }
}

function mirror() {
  mirrorRaf = requestAnimationFrame(mirror);
  const c = $<HTMLCanvasElement>("#padCanvas");
  const w = Math.round(c.clientWidth * devicePixelRatio), h = Math.round(c.clientHeight * devicePixelRatio);
  if (!w || !h) return;
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
    mirrored = -1;
  }
  if (mirrored === board.paints) return;
  mirrored = board.paints;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(board.canvas, 0, 0, CANVAS_W, CANVAS_H, 0, 0, w, h);
}

function showPad(v: View) {
  const word = $("#padWord");
  const text = v.word ?? "";
  if (word.textContent !== text) word.textContent = text;
  if (padShown) return;
  padShown = true;
  const el = $("#pad");
  el.hidden = false;
  // The tools move into the pad, within reach of the student drawing.
  $("#padTools").appendChild($("#tools"));
  placePad();
  board.setSurface($("#padCanvas"));
  mirrored = -1;
  if (!mirrorRaf) mirror();
}

function hidePad() {
  if (!padShown) return;
  padShown = false;
  $("#pad").hidden = true;
  $("#stage").appendChild($("#tools"));
  board.setSurface(null);
  cancelAnimationFrame(mirrorRaf);
  mirrorRaf = 0;
}

function savePad() {
  store.set(PAD_KEY, pad);
}

function bindPad() {
  const el = $("#pad");
  const grip = $("#padGrip");
  let start: { id: number; x: number; y: number; left: number; top: number } | null = null;
  grip.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const r = el.getBoundingClientRect();
    start = { id: e.pointerId, x: e.clientX, y: e.clientY, left: r.left, top: r.top };
    grip.setPointerCapture(e.pointerId);
    el.classList.add("moving");
  });
  grip.addEventListener("pointermove", (e) => {
    if (!start || e.pointerId !== start.id) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const left = Math.min(vw - EDGE - r.width, Math.max(EDGE, start.left + e.clientX - start.x));
    const top = Math.min(vh - EDGE - r.height, Math.max(EDGE, start.top + e.clientY - start.y));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  });
  const drop = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    start = null;
    el.classList.remove("moving");
    const vw = window.innerWidth, vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const freeX = Math.max(1, vw - EDGE * 2 - r.width), freeY = Math.max(1, vh - EDGE * 2 - r.height);
    let x = (r.left - EDGE) / freeX, y = (r.top - EDGE) / freeY;
    // Near a side or the bottom, it snaps there: the lower corners are where students can reach.
    if (x < 0.15) x = 0;
    if (x > 0.85) x = 1;
    if (y > 0.8) y = 1;
    pad = { ...pad, x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
    savePad();
    placePad();
  };
  grip.addEventListener("pointerup", drop);
  grip.addEventListener("pointercancel", drop);
  for (const b of document.querySelectorAll<HTMLButtonElement>("#pad [data-pad-corner]")) {
    b.addEventListener("click", () => {
      pad = { ...pad, x: b.dataset.padCorner === "left" ? 0 : 1, y: 1 };
      savePad();
      placePad();
    });
  }
  for (const b of document.querySelectorAll<HTMLButtonElement>("#pad [data-pad-size]")) {
    b.addEventListener("click", () => {
      pad = { ...pad, size: Math.min(PAD_SIZES.length - 1, Math.max(0, pad.size + Number(b.dataset.padSize))) };
      savePad();
      placePad();
    });
  }
  window.addEventListener("resize", () => padShown && placePad());
}

/* ---------------- on-screen keys ---------------- */

let typed: string[] = [];
let keysShown = false;
let mask: (string | null)[] = [];

/** How many letters the hidden word has: typing stops there. */
const letterCount = () => mask.filter((c) => c === null || LETTER.test(c)).length;

/** The guess as text: the typed letters laid into the word's shape, with its spaces and hyphens. */
export function guessText(m: (string | null)[], letters: string[]): string {
  let out = "";
  let i = 0;
  for (const ch of m) {
    if (i >= letters.length) break;
    if (ch === null || LETTER.test(ch)) out += letters[i++];
    else out += ch;
  }
  return out.trim();
}

function renderAnswer() {
  const words: string[][] = [[]];
  let i = 0;
  for (const ch of mask) {
    if (ch === " ") {
      words.push([]);
      continue;
    }
    if (ch !== null && !LETTER.test(ch)) {
      words[words.length - 1].push(`<span class="kslot sym">${esc(ch)}</span>`);
      continue;
    }
    const t = typed[i];
    const cls = t ? "kslot filled" : i === typed.length ? "kslot next" : "kslot";
    // A hint letter shows faintly in its slot until the class types over it.
    const hint = !t && ch !== null ? `<span class="khint">${esc(ch)}</span>` : "";
    words[words.length - 1].push(`<span class="${cls}">${t ? esc(t) : hint}</span>`);
    i++;
  }
  $("#kbdAnswer").innerHTML = words.filter((w) => w.length).map((w) => `<span class="kword">${w.join("")}</span>`).join("");
  $<HTMLButtonElement>("#kbdGuess").disabled = !typed.length;
  $<HTMLButtonElement>("#kbdBack").disabled = !typed.length;
  $<HTMLButtonElement>("#kbdClear").disabled = !typed.length;
}

function press(k: string) {
  if (!keysShown) return;
  if (k === "back") typed.pop();
  else if (k === "clear") typed = [];
  else if (k === "guess") {
    const text = guessText(mask, typed).slice(0, LIMITS.chatMax);
    if (!text) return;
    if (!send({ t: "chat", text })) {
      toast("You're offline, so that guess wasn't sent. Try again in a moment.", true);
      return;
    }
    sfx.pick();
    typed = [];
  } else if (typed.length < letterCount()) typed.push(k.toLowerCase());
  renderAnswer();
}

function showKeys(m: (string | null)[]) {
  const shape = m.map((c) => (c === null ? "_" : c)).join("");
  const oldShape = mask.map((c) => (c === null ? "_" : c)).join("");
  mask = m;
  if (!keysShown) {
    keysShown = true;
    typed = [];
    $("#kbd").hidden = false;
    $("#game").classList.add("keys-on");
  } else if (shape.length !== oldShape.length) typed = [];
  renderAnswer();
}

function hideKeys() {
  if (!keysShown) return;
  keysShown = false;
  typed = [];
  $("#kbd").hidden = true;
  $("#game").classList.remove("keys-on");
}

function bindKeys() {
  $("#kbdKeys").innerHTML =
    ROWS.map((row, r) => {
      const keys = Array.from(row).map((k) => `<button type="button" class="key" data-k="${k}">${k}</button>`).join("");
      const end =
        r === 0
          ? `<button type="button" class="key act" id="kbdBack" data-k="back" aria-label="Delete a letter"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12Z"/><path d="m17 9-6 6M11 9l6 6"/></svg></button>`
          : r === 1
            ? `<button type="button" class="key act" id="kbdClear" data-k="clear">Clear</button>`
            : `<button type="button" class="key act go" id="kbdGuess" data-k="guess">Guess</button>`;
      return `<div class="krow">${keys}${end}</div>`;
    }).join("");
  $("#kbdKeys").addEventListener("pointerdown", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".key");
    if (!b || b.disabled) return;
    // Act on touch-down: on a big infrared panel a tap that drifts can miss "click".
    e.preventDefault();
    press(b.dataset.k!);
  });
  // A keyboard plugged into the panel types here too.
  window.addEventListener("keydown", (e) => {
    if (!keysShown || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
    if (e.key === "Backspace") press("back");
    else if (e.key === "Enter") press("guess");
    else if (e.key === "Escape") press("clear");
    else if (e.key.length === 1 && LETTER.test(e.key)) press(e.key);
    else return;
    e.preventDefault();
  });
}

/* ---------------- wiring ---------------- */

export function initSmartboard(b: Board, toggled: () => void) {
  board = b;
  onToggle = toggled;
  document.documentElement.classList.toggle("smartboard", on);
  bindPad();
  bindKeys();
}

/** Called on every game update: the pad for the drawer, the keys for guessers who haven't got it yet. */
export function renderSmartboard(v: View | null) {
  const drawing = !!v && v.phase === "drawing";
  const isDrawer = !!v && v.drawer === v.you;
  const guessed = !!v && v.guessed.includes(v.you);
  if (on && drawing && isDrawer) showPad(v!);
  else hidePad();
  if (on && drawing && !isDrawer && !guessed && v!.mask) showKeys(v!.mask);
  else hideKeys();
}

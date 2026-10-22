// Solo practice: pick a word, draw it against the clock, keep the sketches. It runs entirely in the
// browser on the game screen's canvas, tools and clock. Only the word list comes from the server,
// and a saved copy lets practice start even when the connection is poor.

import { categoryLabel, CATEGORIES } from "../../shared/categories";
import {
  forGrade, freshCount, fromStudentWire, fromWire, pickChoices, PRACTICE_COUNTS, PRACTICE_TIMES, sanitizePractice,
  type PracticeSettings, type PracticeWord, type StudentWord,
} from "../../shared/practice";
import { INKS } from "../../shared/protocol";
import { GRADES, subjectLabel, subjectOptions } from "../../shared/students";
import { app } from "../app";
import { thumbnail } from "../board";
import { confetti } from "../confetti";
import { APP_NAME, EDITION, EDITION_QS, STUDENTS } from "../edition";
import { buzz, sfx } from "../sound";
import { $, $$, esc, plural, store } from "../util";
import { board, paintClock, requestWake } from "./game";

type Phase = "idle" | "choosing" | "drawing" | "done";

interface Sketch {
  word: string;
  category: string | null;
  url: string;
  secs: number;
  timeUp: boolean;
}

export interface PracticeHooks {
  show(id: "practice" | "practiceDone" | "game"): void;
  navigate(path: string): void;
}

const LEVEL = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;
const STAMP_MS = 1100;
// The student edition keeps its own copies, in case both editions share an origin (?students=1).
const WORDS_KEY = STUDENTS ? "db.words.students" : "db.words";
const SETTINGS_KEY = STUDENTS ? "db.practice.students" : "db.practice";

/** The main list, or the student list with each word's class. */
type WordList = PracticeWord[] | StudentWord[];

let hooks: PracticeHooks;
let settings: PracticeSettings = sanitizePractice(store.get(SETTINGS_KEY, null), EDITION);
let words: WordList | null = null;
let loading: Promise<WordList> | null = null;
let startToken = 0;
let clockTimer = 0;
let stampTimer = 0;

const S = {
  phase: "idle" as Phase,
  /** Words drawn (or skipped) this session; they don't come up again. */
  used: new Set<string>(),
  /** Words already offered, so "New words" shows new ones until the pool runs out. */
  shown: new Set<string>(),
  choices: [] as PracticeWord[],
  current: null as PracticeWord | null,
  sketches: [] as Sketch[],
  turns: 0,
  endsAt: 0,
  left: 0,
  activeSince: 0,
  drawnMs: 0,
  paused: false,
  lastSec: -1,
  warned: false,
};

/* ---------------- word list ---------------- */

const parse = (list: unknown): WordList => (STUDENTS ? fromStudentWire(list) : fromWire(list));

/** The words to pick from: in the student edition, those up to the chosen class. */
function pool(): PracticeWord[] {
  return STUDENTS ? forGrade(words as StudentWord[], settings.grade) : (words as PracticeWord[]);
}

function label(category: string): string | null {
  return STUDENTS ? subjectLabel(category, settings.grade) : categoryLabel(category);
}

function saved(): WordList {
  return parse(store.get<{ words?: unknown } | null>(WORDS_KEY, null)?.words);
}

async function fetchWords(): Promise<WordList> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 7000);
    try {
      const res = await fetch(`/api/words${EDITION_QS}`, { signal: ctl.signal });
      if (res.ok) {
        const body = (await res.json()) as { words?: unknown };
        const list = parse(body.words);
        if (list.length >= 30) {
          store.set(WORDS_KEY, { at: Date.now(), words: body.words });
          return list;
        }
      }
      lastErr = new Error(`status ${res.status}`);
    } catch (e) {
      lastErr = e;
      if (!navigator.onLine) break;
    } finally {
      clearTimeout(t);
    }
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }
  throw lastErr ?? new Error("words");
}

/** The word list: the saved copy straight away (refreshed in the background), else the network. */
export function loadWords(): Promise<WordList> {
  if (words) return Promise.resolve(words);
  if (loading) return loading;
  const copy = saved();
  if (copy.length >= 30) {
    words = copy;
    void fetchWords().then((fresh) => (words = fresh)).catch(() => {});
    return Promise.resolve(copy);
  }
  loading = fetchWords()
    .then((list) => (words = list))
    .finally(() => (loading = null));
  return loading;
}

/* ---------------- setup screen ---------------- */

function saveSettings() {
  store.set(SETTINGS_KEY, settings);
}

function renderSettings() {
  const cat = $<HTMLSelectElement>("#pCategory");
  if (STUDENTS) {
    $<HTMLSelectElement>("#pGrade").value = String(settings.grade);
    cat.innerHTML = `<option value="all">All subjects</option>${subjectOptions(settings.grade).map((c) => `<option value="${c.id}">${c.label}</option>`).join("")}`;
  }
  cat.value = settings.category;
  for (const b of $$<HTMLButtonElement>("#pDiff button")) b.setAttribute("aria-checked", String(b.dataset.v === settings.difficulty));
  const steppers: [string, readonly number[], number, (n: number) => string][] = [
    ["drawTime", PRACTICE_TIMES, settings.drawTime, (n) => (n ? `${n}s` : "No timer")],
    ["words", PRACTICE_COUNTS, settings.words, (n) => (n ? String(n) : "Nonstop")],
  ];
  for (const [key, list, value, fmt] of steppers) {
    const st = $(`#pSettings [data-key="${key}"]`);
    const i = list.indexOf(value);
    st.querySelector("[data-val]")!.textContent = fmt(value);
    st.querySelector<HTMLButtonElement>('[data-d="-1"]')!.disabled = i <= 0;
    st.querySelector<HTMLButtonElement>('[data-d="1"]')!.disabled = i >= list.length - 1;
  }
}

export function showPracticeSetup() {
  leavePractice();
  document.title = `Practice · ${APP_NAME}`;
  settings = sanitizePractice(store.get(SETTINGS_KEY, null), EDITION);
  renderSettings();
  $("#pErr").hidden = true;
  const btn = $<HTMLButtonElement>("#pStart");
  btn.disabled = false;
  btn.textContent = "Start drawing";
  hooks.show("practice");
  void loadWords().catch(() => {});
}

async function startFromSetup() {
  const btn = $<HTMLButtonElement>("#pStart");
  const err = $("#pErr");
  err.hidden = true;
  const token = ++startToken;
  if (!words) {
    btn.disabled = true;
    btn.textContent = "Loading words…";
  }
  try {
    await loadWords();
  } catch {
    if (token !== startToken) return;
    err.textContent = navigator.onLine
      ? "Couldn't load the words. Check your connection and try again."
      : "You're offline. Connect once to load the words, then practice works anywhere.";
    err.hidden = false;
    return;
  } finally {
    btn.disabled = false;
    btn.textContent = "Start drawing";
  }
  if (token !== startToken) return; // left the screen while loading
  startSession();
}

/* ---------------- session ---------------- */

function startSession() {
  if (!words) return;
  clearTimers();
  S.used.clear();
  S.shown.clear();
  S.sketches = [];
  S.turns = 0;
  S.current = null;
  const g = $("#game");
  g.classList.add("solo");
  g.classList.remove("is-drawer");
  $("#awayChip").hidden = true;
  $("#menu").hidden = true;
  const tools = $("#tools");
  tools.hidden = false;
  tools.classList.add("off");
  for (const c of document.querySelectorAll(".confetti")) c.remove();
  document.title = `Practice · ${APP_NAME}`;
  hooks.show("game");
  void requestWake();
  nextWord();
}

function setLabel() {
  const n = S.turns + 1;
  $("#roundLabel").innerHTML = settings.words ? `Word ${n}<span class="of"> of ${settings.words}</span>` : `Word ${n}`;
}

function setWord(html: string) {
  const box = $("#wordBox");
  box.classList.remove("got");
  box.innerHTML = html;
  box.dataset.html = html;
}

function overlay(html: string, mode: "" | "clear" | "peek" = ""): HTMLElement {
  const ov = $("#overlay");
  ov.className = `overlay${mode ? ` ${mode}` : ""}`;
  ov.innerHTML = html;
  ov.hidden = !html;
  return ov;
}

function lockBoard() {
  board.cancelInput();
  board.enabled = false;
  $("#tools").classList.add("off");
  $("#paperWrap").classList.remove("drawing");
  $("#pDone").hidden = true;
  $("#pShuffle").hidden = true;
}

function nextWord() {
  if (settings.words && S.turns >= settings.words) {
    showSummary();
    return;
  }
  clearTimers();
  S.phase = "choosing";
  S.current = null;
  lockBoard();
  board.load(-1 - S.turns, 0, []);
  const clock = $("#clock");
  clock.hidden = true; // out of the layout while choosing, so "New words" sits by the menu
  clock.classList.remove("low", "urgent");
  setLabel();
  setWord(`<span class="say">Pick a word to draw</span>`);
  $("#pShuffle").hidden = false;
  dealChoices();
}

function dealChoices() {
  const all = pool();
  if (freshCount(all, settings, new Set([...S.used, ...S.shown])) < 3) S.shown.clear();
  S.choices = pickChoices(all, settings, new Set([...S.used, ...S.shown]), 3, Math.random);
  for (const c of S.choices) S.shown.add(c.word);
  const ov = overlay(`<div class="ocard">
    <h2 class="h2">Pick a word to draw</h2>
    <div class="choices">${S.choices
      .map((c, i) => `<button type="button" class="choice" data-i="${i}"><span class="cw">${esc(c.word)}</span><span class="cmeta">${esc(label(c.category) ?? "")} · ${LEVEL[c.level]}</span></button>`)
      .join("")}</div>
  </div>`);
  ov.querySelectorAll<HTMLButtonElement>(".choice").forEach((b) => b.addEventListener("click", () => choose(Number(b.dataset.i))));
}

function choose(i: number) {
  const w = S.choices[i];
  if (!w || S.phase !== "choosing") return;
  sfx.pick();
  buzz(20);
  S.current = w;
  S.used.add(w.word);
  S.phase = "drawing";
  $("#pShuffle").hidden = true;
  overlay("");
  const cat = label(w.category);
  setWord(`<span class="say">Draw</span><span class="theword">${esc(w.word)}</span>${cat ? `<span class="catchip">${esc(cat)}</span>` : ""}`);
  $("#tools").classList.remove("off");
  board.enabled = true;
  $("#paperWrap").classList.add("drawing");
  $("#pDone").hidden = false;
  syncDone();
  const now = performance.now();
  S.endsAt = settings.drawTime ? now + settings.drawTime * 1000 : Infinity;
  S.activeSince = now;
  S.drawnMs = 0;
  S.paused = false;
  S.lastSec = -1;
  S.warned = false;
  clearInterval(clockTimer);
  clockTimer = window.setInterval(tick, 200);
  tick();
}

/** "Done" once there's something on the page, "Skip" before that. */
function syncDone() {
  const b = $<HTMLButtonElement>("#pDone");
  const empty = board.isEmpty;
  b.textContent = empty ? "Skip" : "Done";
  b.classList.toggle("primary", !empty);
  b.classList.toggle("secondary", empty);
  b.setAttribute("aria-label", empty ? "Skip this word" : "Finish this drawing");
}

function elapsed(now = performance.now()) {
  return S.drawnMs + (S.paused ? 0 : now - S.activeSince);
}

function tick() {
  if (S.phase !== "drawing" || S.paused) return;
  const clock = $("#clock");
  if (!settings.drawTime) {
    clock.hidden = true;
    return;
  }
  clock.hidden = false;
  clock.style.visibility = "visible";
  const total = settings.drawTime * 1000;
  const rem = Math.max(0, S.endsAt - performance.now());
  const sec = paintClock(rem, total, true);
  if (sec !== S.lastSec) {
    const fresh = S.lastSec !== -1;
    S.lastSec = sec;
    if (fresh && sec > 0 && sec <= 10) sfx.tick(sec <= 3);
    if (sec === 30 && total >= 59_000 && !S.warned) {
      S.warned = true;
      sfx.warn();
    }
  }
  if (rem <= 0) finish(true);
}

/** Ends the current drawing. Quiet mode records it without the card (used by "End practice"). */
function finish(timeUp: boolean, quiet = false) {
  if (S.phase !== "drawing" || !S.current) return;
  const secs = Math.max(1, Math.round(elapsed() / 1000));
  clearInterval(clockTimer);
  clockTimer = 0;
  lockBoard();
  board.drain();
  S.phase = "done";
  S.turns++;
  const w = S.current;
  const empty = board.isEmpty;
  let sketch: Sketch | null = null;
  if (!empty) {
    sketch = { word: w.word, category: label(w.category), url: thumbnail(null, board.canvas, 900), secs, timeUp };
    S.sketches.push(sketch);
  }
  const clock = $("#clock");
  clock.classList.remove("low", "urgent");
  if (!timeUp) clock.hidden = true;
  if (quiet) return;
  setWord(`<span class="say">${empty ? (timeUp ? "Time's up for" : "Skipped") : "You drew"}</span><span class="theword">${esc(w.word)}</span>`);
  const last = settings.words > 0 && S.turns >= settings.words;
  const card = () => doneCard(w, sketch, timeUp, last);
  if (timeUp) {
    sfx.timeUp();
    buzz([40, 60, 40]);
    overlay(`<div class="stamp">Time's up</div>`, "clear");
    stampTimer = window.setTimeout(card, STAMP_MS);
  } else {
    if (sketch) sfx.allGuessed();
    card();
  }
}

const fileName = (word: string) => `doodle-battle-${word.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.jpg`;

export function duration(secs: number): string {
  if (secs < 60) return `${secs} s`;
  const m = Math.floor(secs / 60), s = secs % 60;
  return s ? `${m} min ${s} s` : `${m} min`;
}

function doneCard(w: PracticeWord, sketch: Sketch | null, timeUp: boolean, last: boolean) {
  if (S.phase !== "done") return;
  const head = sketch ? (timeUp ? "Time's up" : `Done in ${duration(sketch.secs)}`) : timeUp ? "Time's up" : "Skipped";
  const ov = overlay(`<div class="pcard" role="group" aria-label="${esc(head)}">
    <div class="pcard-text"><p class="eyebrow">${esc(head)}</p><p class="pcard-word">${esc(w.word)}</p></div>
    <div class="pcard-actions">
      ${sketch ? `<a class="btn small paperbtn" href="${sketch.url}" download="${esc(fileName(w.word))}">Save</a>` : ""}
      <button type="button" class="btn primary small" id="pNext">${last ? "See your drawings" : "Next word"}</button>
    </div>
  </div>`, "peek");
  const next = ov.querySelector<HTMLButtonElement>("#pNext")!;
  next.addEventListener("click", () => {
    sfx.pick();
    nextWord();
  });
  if (!matchMedia("(pointer: coarse)").matches) next.focus({ preventScroll: true });
}

function endSession() {
  if (S.phase === "drawing") finish(false, true);
  showSummary();
}

/* ---------------- summary ---------------- */

function showSummary() {
  clearTimers();
  S.phase = "idle";
  lockBoard();
  overlay("");
  $("#game").classList.remove("solo");
  $("#tools").classList.remove("off");
  $("#tools").hidden = true;
  $("#clock").hidden = false;
  $("#clock").style.visibility = "";
  const list = S.sketches;
  const total = list.reduce((n, s) => n + s.secs, 0);
  $("#pdTitle").textContent = list.length ? (list.length >= 5 ? "Great session!" : "Nice work!") : "No drawings this time";
  const fastest = list.filter((s) => !s.timeUp).sort((a, b) => a.secs - b.secs)[0];
  $("#pdStats").textContent = list.length
    ? `You drew ${plural(list.length, "word")} in ${duration(total)}.${fastest && list.length > 1 ? ` Quickest: ${fastest.word} in ${duration(fastest.secs)}.` : ""}`
    : "Draw something next time and it'll show up here, ready to save.";
  const g = $("#pdGallery");
  g.innerHTML = list
    .map(
      (s) => `<figure class="gcard"><div class="gframe"><img src="${s.url}" alt="Your drawing of ${esc(s.word)}" loading="lazy"></div>
        <figcaption><div class="gw">${esc(s.word)}</div><div class="gm"><span>${s.timeUp ? "Time's up" : esc(duration(s.secs))}${s.category ? ` · ${esc(s.category)}` : ""}</span><a class="gsave" href="${s.url}" download="${esc(fileName(s.word))}">Save</a></div></figcaption></figure>`,
    )
    .join("");
  g.hidden = !list.length;
  hooks.show("practiceDone");
  if (list.length) {
    setTimeout(() => {
      sfx.fanfare();
      confetti([INKS[app.profile.color] ?? INKS[0], "#e0a100", "#ffffff", "#2463e6", "#e0322b"]);
    }, 250);
  }
}

/* ---------------- lifecycle ---------------- */

function clearTimers() {
  clearInterval(clockTimer);
  clockTimer = 0;
  clearTimeout(stampTimer);
  stampTimer = 0;
}

/** Stops any practice in progress (navigating away, joining a room). */
export function leavePractice() {
  startToken++;
  if (S.phase === "idle" && !$("#game").classList.contains("solo")) return;
  clearTimers();
  S.phase = "idle";
  lockBoard();
  overlay("");
  $("#game").classList.remove("solo");
  $("#clock").style.visibility = "";
  $("#clock").hidden = false;
  const tools = $("#tools");
  tools.classList.remove("off");
  tools.hidden = true;
}

export function practiceActive() {
  return S.phase !== "idle";
}

function onVisibility() {
  if (S.phase !== "drawing" && S.phase !== "choosing") return;
  const now = performance.now();
  if (document.visibilityState === "hidden") {
    // Switching apps pauses the clock, so a phone call doesn't cost you the drawing.
    if (S.phase === "drawing" && !S.paused) {
      S.left = S.endsAt - now;
      S.drawnMs += now - S.activeSince;
      S.paused = true;
      board.cancelInput();
    }
  } else {
    if (S.phase === "drawing" && S.paused) {
      S.endsAt = settings.drawTime ? now + S.left : Infinity;
      S.activeSince = now;
      S.paused = false;
      tick();
    }
    void requestWake();
  }
}

export function initPractice(h: PracticeHooks) {
  hooks = h;
  const cat = $<HTMLSelectElement>("#pCategory");
  cat.innerHTML = `<option value="all">All categories</option>${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join("")}`;
  if (STUDENTS) {
    // Class and subject replace difficulty and category.
    $("#pGradeSetting").hidden = false;
    $("#pDiffSetting").hidden = true;
    $("#pCategoryLabel").textContent = "Subject";
    const grade = $<HTMLSelectElement>("#pGrade");
    grade.innerHTML = GRADES.map((g) => `<option value="${g}">Class ${g}</option>`).join("");
    grade.addEventListener("change", () => {
      settings = sanitizePractice({ ...settings, grade: Number(grade.value) }, EDITION);
      saveSettings();
      renderSettings();
    });
  }
  cat.addEventListener("change", () => {
    settings = sanitizePractice({ ...settings, category: cat.value }, EDITION);
    saveSettings();
    renderSettings();
  });
  $("#pDiff").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!b) return;
    settings = sanitizePractice({ ...settings, difficulty: b.dataset.v }, EDITION);
    saveSettings();
    renderSettings();
  });
  for (const st of $$(".stepper", $("#pSettings"))) {
    st.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".stepbtn");
      if (!b || b.disabled) return;
      const key = st.dataset.key as "drawTime" | "words";
      const list: readonly number[] = key === "drawTime" ? PRACTICE_TIMES : PRACTICE_COUNTS;
      const i = Math.min(list.length - 1, Math.max(0, list.indexOf(settings[key]) + Number(b.dataset.d)));
      settings = sanitizePractice({ ...settings, [key]: list[i] }, EDITION);
      saveSettings();
      renderSettings();
    });
  }
  $("#pStart").addEventListener("click", () => void startFromSetup());
  $("#pdAgain").addEventListener("click", () => {
    sfx.pick();
    if (words) startSession();
    else hooks.navigate("/practice");
  });
  $("#pdSettings").addEventListener("click", () => hooks.navigate("/practice"));
  $("#pDone").addEventListener("click", () => finish(false));
  $("#pShuffle").addEventListener("click", () => {
    if (S.phase !== "choosing") return;
    sfx.shuffle();
    dealChoices();
  });
  $("#menuPEnd").addEventListener("click", (e) => {
    e.stopPropagation();
    $("#menu").hidden = true;
    $("#menuBtn").setAttribute("aria-expanded", "false");
    endSession();
  });
  // Load the words as soon as someone shows interest, so Start is instant.
  const warm = () => void loadWords().catch(() => {});
  $("#practiceBtn").addEventListener("pointerenter", warm, { once: true });
  $("#practiceBtn").addEventListener("touchstart", warm, { once: true, passive: true });
  $("#practiceBtn").addEventListener("focus", warm, { once: true });

  const prevChange = board.onChange;
  board.onChange = () => {
    prevChange();
    if (S.phase === "drawing") syncDone();
  };
  window.addEventListener("keydown", (e) => {
    if (S.phase !== "choosing" || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
    if (["1", "2", "3"].includes(e.key)) choose(Number(e.key) - 1);
  });
  document.addEventListener("visibilitychange", onVisibility);
}

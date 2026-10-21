import {
  BRUSH_SIZES, CANVAS_H, CANVAS_W, CODE_ALPHABET, DEFAULT_SETTINGS, DIFFICULTIES, DRAW_TIMES,
  FACE_COUNT, INKS, LIMITS, PALETTE, type Item, type Op, type Result, type Settings,
} from "./protocol";
import { CATEGORY_IDS } from "./categories";

/* ---------- text ---------- */

const CONTROL = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g;

export function cleanText(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  const t = s.replace(CONTROL, "").replace(/\s+/g, " ").trim();
  return Array.from(t).slice(0, max).join("").trim();
}

export function sanitizeName(s: unknown): string {
  return cleanText(s, LIMITS.nameMax);
}

export function sameName(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
}

const ARTICLE = /^(?:the|a|an)\s+/;

/** Lowercase, drop Latin accents and a leading "the/a/an", then keep only letters, marks and digits. */
export function normalizeGuess(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim()
    .replace(ARTICLE, "")
    .replace(/[^\p{L}\p{M}\p{N}]/gu, "");
}

/** Optimal string alignment distance (Levenshtein plus adjacent swaps), stopping early past `cap`. */
export function editDistance(a: string, b: string, cap = 3): number {
  const A = Array.from(a), B = Array.from(b);
  if (Math.abs(A.length - B.length) > cap) return cap + 1;
  const rows: number[][] = [Array.from({ length: B.length + 1 }, (_, j) => j)];
  for (let i = 1; i <= A.length; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= B.length; j++) {
      const cost = A[i - 1] === B[j - 1] ? 0 : 1;
      let v = Math.min(rows[i - 1][j] + 1, row[j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && A[i - 1] === B[j - 2] && A[i - 2] === B[j - 1]) v = Math.min(v, rows[i - 2][j - 2] + 1);
      row.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > cap) return cap + 1;
    rows.push(row);
  }
  return rows[A.length][B.length];
}
export const levenshtein = editDistance;

const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
function keysNear(a: string, b: string): boolean {
  const pos = (c: string) => {
    for (let r = 0; r < 3; r++) {
      const i = KEY_ROWS[r].indexOf(c);
      if (i >= 0) return [r, i] as const;
    }
    return null;
  };
  const p = pos(a), q = pos(b);
  if (!p || !q) return false;
  const [r1, i1] = p, [r2, i2] = q;
  if (r1 === r2) return Math.abs(i1 - i2) === 1;
  if (Math.abs(r1 - r2) !== 1) return false;
  // Rows are staggered: the key below index i sits at i-1 and i of the next row.
  const [upper, ui, li] = r1 < r2 ? [r1, i1, i2] : [r2, i2, i1];
  void upper;
  return li === ui || li === ui - 1;
}

/** Plural or singular of the same word: cat/cats, box/boxes, berry/berries. */
function samePlural(a: string, b: string): boolean {
  if (a === b) return true;
  const [s, l] = a.length < b.length ? [a, b] : [b, a];
  if (s.length < 3) return false;
  return l === `${s}s` || l === `${s}es` || (s.endsWith("y") && l === `${s.slice(0, -1)}ies`);
}

/** A forgivable spelling mistake. Short words need to be exact; longer words allow one or two slips. */
export function isTypoOf(g: string, w: string): boolean {
  const G = Array.from(g), W = Array.from(w);
  const n = W.length;
  if (G.length < 3) return false;
  if (n <= 3) {
    // Only swapped letters: dgo for dog.
    return G.length === 3 && n === 3 && editDistance(g, w, 1) === 1 && G[0] !== W[0] && G[0] === W[1] && G[1] === W[0] && G[2] === W[2]
      || (G.length === 3 && n === 3 && G[0] === W[0] && G[1] === W[2] && G[2] === W[1]);
  }
  if (n <= 5) {
    if (editDistance(g, w, 1) !== 1) return false;
    if (G.length > W.length) return true; // an extra letter
    if (G.length < W.length) return G.length >= 4; // a missing letter
    const diff: number[] = [];
    for (let i = 0; i < n; i++) if (G[i] !== W[i]) diff.push(i);
    if (diff.length === 2 && diff[1] === diff[0] + 1) return true; // swapped letters
    return diff.length === 1 && keysNear(G[diff[0]], W[diff[0]]); // fat-fingered a neighbouring key
  }
  const allowed = n <= 7 ? 1 : 2;
  return editDistance(g, w, allowed) <= allowed;
}

/** The answer's words, normalized: "The Hat-Stand" gives ["hat", "stand"]. */
function answerWords(word: string): string[] {
  return word.toLocaleLowerCase().trim().replace(ARTICLE, "").split(/[\s-]+/).map(normalizeGuess).filter(Boolean);
}

/** One answer word: short words allow only swapped letters, longer ones a slip or two. */
function wordSlip(g: string, w: string): boolean {
  if (g === w) return true;
  const n = Array.from(w).length;
  if (n <= 3) return isTypoOf(g, w);
  const allowed = n <= 7 ? 1 : 2;
  return editDistance(g, w, allowed) <= allowed;
}

/**
 * A multi-word answer's typo allowance must not be spent on one short word: "man stand" is not
 * "hat stand". The guess (spaces ignored) has to split into pieces that each slip on one word.
 */
function slipsPerWord(g: string, words: string[]): boolean {
  if (words.length === 1) return wordSlip(g, words[0]);
  const G = Array.from(g);
  for (let i = 1; i < G.length; i++) {
    if (wordSlip(G.slice(0, i).join(""), words[0]) && slipsPerWord(G.slice(i).join(""), words.slice(1))) return true;
  }
  return false;
}

export interface GuessTarget {
  word: string;
  very?: string[];
  close?: string[];
}

export interface Verdict {
  kind: "correct" | "very" | "close" | null;
  typo?: boolean;
}

/**
 * Judge a guess. Spelling slips count as correct. Synonyms, part of a multi-word answer and
 * near-misses are "very close"; related ideas are "close". `otherWords` holds every other word
 * in the game so that a different real word (goat for boat) is never mistaken for a typo.
 */
export function judgeGuess(guess: string, t: GuessTarget, otherWords?: { has(key: string): boolean }): Verdict {
  const g = normalizeGuess(guess), w = normalizeGuess(t.word);
  if (!g || !w) return { kind: null };
  if (g === w || samePlural(g, w)) return { kind: "correct" };
  const known = !!otherWords?.has(g);
  const wl = Array.from(w).length, gl = Array.from(g).length;
  if (!known && isTypoOf(g, w)) {
    const words = answerWords(t.word);
    if (words.length < 2 || words.join("") !== w || slipsPerWord(g, words)) return { kind: "correct", typo: true };
  }

  const matches = (term: string) => {
    const n = normalizeGuess(term);
    if (!n || n === w) return false;
    return n === g || samePlural(g, n) || (Array.from(n).length >= 6 && editDistance(g, n, 1) <= 1);
  };
  if (t.very?.some(matches)) return { kind: "very" };
  if (wl >= 4 && gl > wl && g.includes(w)) return { kind: "very" };
  const parts = t.word.split(/[\s-]+/).map(normalizeGuess).filter((p) => Array.from(p).length >= 3 && p !== w);
  if (parts.length && parts.some((p) => p === g || samePlural(g, p))) return { kind: "very" };
  if (!known && wl >= 3) {
    const allowed = wl <= 5 ? 1 : wl <= 7 ? 2 : 3;
    if (editDistance(g, w, allowed) <= allowed) return { kind: "very" };
  }
  if (t.close?.some(matches)) return { kind: "close" };
  return { kind: null };
}

export function isCorrect(guess: string, word: string): boolean {
  return judgeGuess(guess, { word }).kind === "correct";
}

/* ---------- scoring ---------- */

export const ORDER_POINTS = [200, 160, 130, 110];
export const LATER_POINTS = 100;
export const SPEED_BONUS = 100;
export const DRAWER_MAX = 300;

/** The drawer's points grow with the word's difficulty, so a player who is behind can gamble on a hard word. */
export const DRAWER_LEVEL_BONUS: Record<string, number> = { easy: 1, medium: 1.25, hard: 1.5 };

/**
 * Order points plus a speed bonus for how quickly the word was guessed, so an earlier correct
 * guess always scores more. `elapsedMs` counts from the start of drawing, so the bonus is not
 * cut short when the race shrinks the clock.
 */
export function guessPoints(order: number, elapsedMs: number, drawMs: number): number {
  const base = order < ORDER_POINTS.length ? ORDER_POINTS[order] : LATER_POINTS;
  const frac = drawMs > 0 ? Math.min(1, Math.max(0, 1 - elapsedMs / drawMs)) : 0;
  return base + Math.round(SPEED_BONUS * frac);
}

/** A share of 300 for the guessers who got it, raised for medium and hard words. */
export function drawerPoints(guessed: number, eligible: number, level?: string): number {
  if (eligible <= 0 || guessed <= 0) return 0;
  const bonus = (level && DRAWER_LEVEL_BONUS[level]) || 1;
  return Math.round((DRAWER_MAX * bonus * Math.min(guessed, eligible)) / eligible);
}

/** Standard competition ranking: 1, 1, 3, 4. */
export function rankPlayers<T extends { score: number }>(list: T[]): (T & { rank: number })[] {
  const sorted = [...list].sort((a, b) => b.score - a.score);
  let lastScore = Number.NaN, lastRank = 0;
  return sorted.map((p, i) => {
    const rank = p.score === lastScore ? lastRank : i + 1;
    lastScore = p.score;
    lastRank = rank;
    return { ...p, rank };
  });
}

export type RankedResult = Result;

/* ---------- words and hints ---------- */

const LETTER = /[\p{L}\p{N}]/u;

export function maskWord(word: string, revealed: Iterable<number>): (string | null)[] {
  const show = new Set(revealed);
  return Array.from(word).map((ch, i) => (LETTER.test(ch) ? (show.has(i) ? ch : null) : ch));
}

export function letterIndexes(word: string): number[] {
  const out: number[] = [];
  Array.from(word).forEach((ch, i) => { if (LETTER.test(ch)) out.push(i); });
  return out;
}

const HINT_FRACTIONS: Record<number, number[]> = { 1: [0.5], 2: [0.45, 0.7], 3: [0.35, 0.55, 0.75] };

/** Plan when hint letters appear. Never reveals more than (letters - 2). */
export function planHints(word: string, hints: number, startMs: number, drawMs: number, random: () => number) {
  const idx = letterIndexes(word);
  const count = Math.max(0, Math.min(hints, idx.length - 2, 3));
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const fr = HINT_FRACTIONS[count] ?? [];
  return fr.map((f, i) => ({ at: startMs + Math.round(f * drawMs), idx: idx[i] }));
}

export function parseCustomWords(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of text.slice(0, LIMITS.customMaxChars).split(/[,\n]/)) {
    const w = cleanText(raw, LIMITS.customWordMax);
    if (!w || !LETTER.test(w)) continue;
    const key = normalizeGuess(w);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(w);
    if (out.length >= LIMITS.customMaxWords) break;
  }
  return out;
}

/* ---------- settings ---------- */

const int = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;

export function sanitizeSettings(input: unknown, current: Settings, playerCount: number): Settings {
  const s: Settings = { ...current };
  if (!input || typeof input !== "object") return s;
  const i = input as Record<string, unknown>;
  const rounds = int(i.rounds);
  if (rounds !== null) s.rounds = Math.min(LIMITS.maxRounds, Math.max(LIMITS.minRounds, rounds));
  const dt = int(i.drawTime);
  if (dt !== null && (DRAW_TIMES as readonly number[]).includes(dt)) s.drawTime = dt;
  const mp = int(i.maxPlayers);
  if (mp !== null) s.maxPlayers = Math.min(LIMITS.maxPlayers, Math.max(LIMITS.minPlayers, playerCount, mp));
  const h = int(i.hints);
  if (h !== null) s.hints = Math.min(LIMITS.maxHints, Math.max(0, h));
  if (typeof i.difficulty === "string" && (DIFFICULTIES as readonly string[]).includes(i.difficulty)) {
    s.difficulty = i.difficulty as Settings["difficulty"];
  }
  if (typeof i.customWords === "string") s.customWords = i.customWords.replace(CONTROL, (c) => (c === "\n" ? c : "")).slice(0, LIMITS.customMaxChars);
  if (typeof i.customOnly === "boolean") s.customOnly = i.customOnly;
  if (typeof i.category === "string" && (i.category === "all" || CATEGORY_IDS.includes(i.category))) s.category = i.category;
  if (typeof i.showCategory === "boolean") s.showCategory = i.showCategory;
  if (typeof i.photos === "boolean") s.photos = i.photos;
  return s;
}

export function defaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}

/* ---------- profile ---------- */

export function validColor(v: unknown): number | null {
  const n = int(v);
  return n !== null && n >= 0 && n < INKS.length ? n : null;
}

export function validFace(v: unknown): number {
  const n = int(v);
  return n !== null && n >= 0 && n < FACE_COUNT ? n : 0;
}

const PHOTO_RE = /^data:image\/(?:jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

/** A player photo: a small JPEG or WebP data URL. Anything else is refused. */
export function validPhoto(v: unknown): string | null {
  return typeof v === "string" && v.length <= LIMITS.photoMaxChars && PHOTO_RE.test(v) ? v : null;
}

/* ---------- room codes ---------- */

export function randomCode(random: () => number): string {
  let s = "";
  for (let i = 0; i < 5; i++) s += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return s;
}

/* ---------- canvas ops ---------- */

const MARGIN = 120;
const isInt = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n);
const inX = (n: unknown) => isInt(n) && n >= -MARGIN && n <= CANVAS_W + MARGIN;
const inY = (n: unknown) => isInt(n) && n >= -MARGIN && n <= CANVAS_H + MARGIN;

export function validOp(op: unknown): op is Op {
  if (!op || typeof op !== "object") return false;
  const o = op as Record<string, unknown>;
  switch (o.k) {
    case "b":
      return isInt(o.c) && o.c >= -1 && o.c < PALETTE.length && isInt(o.w) && o.w >= 2 && o.w <= 120 && inX(o.x) && inY(o.y);
    case "m": {
      const p = o.p;
      if (!Array.isArray(p) || p.length === 0 || p.length % 2 !== 0 || p.length > LIMITS.maxPointsPerOp * 2) return false;
      for (let i = 0; i < p.length; i += 2) if (!inX(p[i]) || !inY(p[i + 1])) return false;
      return true;
    }
    case "f":
      return isInt(o.c) && o.c >= 0 && o.c < PALETTE.length && isInt(o.x) && isInt(o.y) && o.x >= 0 && o.x < CANVAS_W && o.y >= 0 && o.y < CANVAS_H;
    case "e":
    case "u":
    case "x":
      return true;
    default:
      return false;
  }
}

function closeOpen(items: Item[]) {
  const last = items[items.length - 1];
  if (last && last.k === "s" && last.o) delete last.o;
}

/** Applies one op to a list of items. Returns the number of points added, or -1 if the op does not fit. */
export function applyOp(items: Item[], op: Op): number {
  switch (op.k) {
    case "b":
      closeOpen(items);
      items.push({ k: "s", c: op.c, w: op.w, p: [op.x, op.y], o: 1 });
      return 1;
    case "m": {
      const last = items[items.length - 1];
      if (!last || last.k !== "s" || !last.o) return -1;
      for (const n of op.p) last.p.push(n);
      return op.p.length / 2;
    }
    case "e":
      closeOpen(items);
      return 0;
    case "f":
      closeOpen(items);
      items.push({ k: "f", c: op.c, x: op.x, y: op.y });
      return 0;
    case "u":
      closeOpen(items);
      items.pop();
      return 0;
    case "x": {
      closeOpen(items);
      const last = items[items.length - 1];
      if (last && last.k !== "x") items.push({ k: "x" });
      return 0;
    }
  }
}

export function countPoints(items: Item[]): number {
  let n = 0;
  for (const it of items) if (it.k === "s") n += it.p.length / 2;
  return n;
}

export const BRUSHES = BRUSH_SIZES;

// Solo practice: settings and word picking. Runs in the browser; the server only hands out the
// word list (words, levels and categories, without the guess hints).

import { CATEGORY_IDS } from "./categories";
import { DIFFICULTIES, type Difficulty } from "./protocol";

export type Level = "easy" | "medium" | "hard";

export interface PracticeWord {
  word: string;
  level: Level;
  category: string;
}

/** Compact form sent to the browser: [word, level letter, category id]. */
export type WireWord = [string, "e" | "m" | "h", string];

/** Draw times in seconds. 0 means no timer. */
export const PRACTICE_TIMES = [30, 45, 60, 80, 100, 120, 150, 180, 0] as const;
/** Words per session. 0 means keep going until you stop. */
export const PRACTICE_COUNTS = [3, 5, 10, 15, 20, 0] as const;

export interface PracticeSettings {
  category: string;
  difficulty: Difficulty;
  drawTime: number;
  words: number;
}

export const DEFAULT_PRACTICE: PracticeSettings = { category: "all", difficulty: "mixed", drawTime: 80, words: 5 };

export function sanitizePractice(input: unknown): PracticeSettings {
  const s = { ...DEFAULT_PRACTICE };
  if (!input || typeof input !== "object") return s;
  const i = input as Record<string, unknown>;
  if (typeof i.category === "string" && (i.category === "all" || CATEGORY_IDS.includes(i.category))) s.category = i.category;
  if (typeof i.difficulty === "string" && (DIFFICULTIES as readonly string[]).includes(i.difficulty)) s.difficulty = i.difficulty as Difficulty;
  if (typeof i.drawTime === "number" && (PRACTICE_TIMES as readonly number[]).includes(i.drawTime)) s.drawTime = i.drawTime;
  if (typeof i.words === "number" && (PRACTICE_COUNTS as readonly number[]).includes(i.words)) s.words = i.words;
  return s;
}

const LEVEL_CODE = { easy: "e", medium: "m", hard: "h" } as const;
const CODE_LEVEL = { e: "easy", m: "medium", h: "hard" } as const;

export function toWire(entries: readonly PracticeWord[]): WireWord[] {
  return entries.map((e) => [e.word, LEVEL_CODE[e.level], e.category]);
}

/** Reads the word list from the server (or a saved copy), dropping anything malformed. */
export function fromWire(list: unknown): PracticeWord[] {
  if (!Array.isArray(list)) return [];
  const out: PracticeWord[] = [];
  const seen = new Set<string>();
  for (const row of list) {
    if (!Array.isArray(row) || row.length < 3) continue;
    const [word, lv, cat] = row as unknown[];
    if (typeof word !== "string" || !word.trim() || word.length > 40) continue;
    if (lv !== "e" && lv !== "m" && lv !== "h") continue;
    if (typeof cat !== "string" || !CATEGORY_IDS.includes(cat)) continue;
    if (seen.has(word)) continue;
    seen.add(word);
    out.push({ word, level: CODE_LEVEL[lv], category: cat });
  }
  return out;
}

/** The words that match the settings, then wider pools to fall back on when those run out. */
export function practicePools(all: readonly PracticeWord[], s: Pick<PracticeSettings, "category" | "difficulty">): PracticeWord[][] {
  const inCat = s.category === "all" ? all.slice() : all.filter((w) => w.category === s.category);
  const leveled = s.difficulty === "mixed" ? inCat : inCat.filter((w) => w.level === s.difficulty);
  return [leveled, inCat, all.slice()];
}

/**
 * Picks `n` different words, skipping any in `avoid`. With all categories, each choice comes from
 * a different category where possible. Widens to the bigger pools only when the first runs dry.
 */
export function pickChoices(
  all: readonly PracticeWord[],
  s: Pick<PracticeSettings, "category" | "difficulty">,
  avoid: ReadonlySet<string>,
  n: number,
  random: () => number,
): PracticeWord[] {
  const pools = practicePools(all, s);
  const out: PracticeWord[] = [];
  const take = (list: PracticeWord[]) => {
    let options = list.filter((w) => !out.some((o) => o.word === w.word));
    const varied = options.filter((w) => !out.some((o) => o.category === w.category));
    if (s.category === "all" && varied.length) options = varied;
    if (!options.length) return false;
    out.push(options[Math.floor(random() * options.length)]);
    return true;
  };
  for (let i = 0; i < n; i++) {
    if (pools.some((p) => take(p.filter((w) => !avoid.has(w.word))))) continue;
    // Everything has been seen: allow repeats from the chosen category.
    if (!take(pools[1]) && !take(pools[2])) break;
  }
  return out;
}

/** How many words in the main pool are still unseen. */
export function freshCount(all: readonly PracticeWord[], s: Pick<PracticeSettings, "category" | "difficulty">, avoid: ReadonlySet<string>): number {
  return practicePools(all, s)[0].filter((w) => !avoid.has(w.word)).length;
}

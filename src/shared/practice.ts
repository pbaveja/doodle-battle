// Solo practice: settings and word picking. Runs in the browser; the server only hands out the
// word list (words, levels and categories, without the guess hints).

import { CATEGORY_IDS } from "./categories";
import { DIFFICULTIES, type Difficulty } from "./protocol";
import {
  categoryMatches, DEFAULT_GRADE, fitSubject, gradeLevel, MIN_WORD_GRADE, SUBJECT_IDS, validGrade,
  type Edition,
} from "./students";

export type Level = "easy" | "medium" | "hard";

export interface PracticeWord {
  word: string;
  level: Level;
  category: string;
}

/** Compact form sent to the browser: [word, level letter, category id]. */
export type WireWord = [string, "e" | "m" | "h", string];
/** Student edition: [word, class, subject id]. Levels depend on the class picked, so they're worked out in the browser. */
export type StudentWireWord = [string, number, string];

export interface StudentWord {
  word: string;
  grade: number;
  category: string;
}

/** Draw times in seconds. 0 means no timer. */
export const PRACTICE_TIMES = [30, 45, 60, 80, 100, 120, 150, 180, 0] as const;
/** Words per session. 0 means keep going until you stop. */
export const PRACTICE_COUNTS = [3, 5, 10, 15, 20, 0] as const;

export interface PracticeSettings {
  category: string;
  difficulty: Difficulty;
  /** Student edition: the class that sets the words, in place of the difficulty. */
  grade: number;
  drawTime: number;
  words: number;
}

export const DEFAULT_PRACTICE: PracticeSettings = { category: "all", difficulty: "mixed", grade: DEFAULT_GRADE, drawTime: 80, words: 5 };

export function sanitizePractice(input: unknown, edition: Edition = "main"): PracticeSettings {
  const s = { ...DEFAULT_PRACTICE };
  if (!input || typeof input !== "object") return s;
  const i = input as Record<string, unknown>;
  if (edition === "students") {
    s.grade = validGrade(i.grade) ?? s.grade;
    if (typeof i.category === "string") s.category = fitSubject(i.category, s.grade);
  } else {
    if (typeof i.category === "string" && (i.category === "all" || CATEGORY_IDS.includes(i.category))) s.category = i.category;
    if (typeof i.difficulty === "string" && (DIFFICULTIES as readonly string[]).includes(i.difficulty)) s.difficulty = i.difficulty as Difficulty;
  }
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

export function toStudentWire(entries: readonly { word: string; grade: number; subject: string }[]): StudentWireWord[] {
  return entries.map((e) => [e.word, e.grade, e.subject]);
}

/** Reads the student word list from the server (or a saved copy), dropping anything malformed. */
export function fromStudentWire(list: unknown): StudentWord[] {
  if (!Array.isArray(list)) return [];
  const out: StudentWord[] = [];
  const seen = new Set<string>();
  for (const row of list) {
    if (!Array.isArray(row) || row.length < 3) continue;
    const [word, grade, cat] = row as unknown[];
    if (typeof word !== "string" || !word.trim() || word.length > 40) continue;
    if (typeof grade !== "number" || !Number.isInteger(grade) || grade < MIN_WORD_GRADE || grade > 12) continue;
    if (typeof cat !== "string" || !(SUBJECT_IDS as readonly string[]).includes(cat)) continue;
    if (seen.has(word)) continue;
    seen.add(word);
    out.push({ word, grade, category: cat });
  }
  return out;
}

/** Student words up to the picked class, each with a level relative to it. */
export function forGrade(list: readonly StudentWord[], grade: number): PracticeWord[] {
  const out: PracticeWord[] = [];
  for (const w of list) {
    const level = gradeLevel(w.grade, grade);
    if (level) out.push({ word: w.word, level, category: w.category });
  }
  return out;
}

/** The words that match the settings, then wider pools to fall back on when those run out. */
export function practicePools(all: readonly PracticeWord[], s: Pick<PracticeSettings, "category" | "difficulty">): PracticeWord[][] {
  const inCat = all.filter((w) => categoryMatches(s.category, w.category));
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

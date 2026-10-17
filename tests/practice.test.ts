// Solo practice: settings, the word list format and word picking.
import { describe, expect, test } from "bun:test";
import {
  DEFAULT_PRACTICE, freshCount, fromWire, pickChoices, sanitizePractice, toWire, type PracticeWord,
} from "../src/shared/practice";
import { WORD_ENTRIES } from "../src/shared/words";

const ALL: PracticeWord[] = WORD_ENTRIES.map((e) => ({ word: e.word, level: e.level, category: e.category }));

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe("practice settings", () => {
  test("defaults and validation", () => {
    expect(sanitizePractice(null)).toEqual(DEFAULT_PRACTICE);
    expect(sanitizePractice({ category: "movies", difficulty: "hard", drawTime: 0, words: 0 })).toEqual({ category: "movies", difficulty: "hard", drawTime: 0, words: 0 });
    expect(sanitizePractice({ category: "nope", difficulty: "insane", drawTime: 7, words: 99 })).toEqual(DEFAULT_PRACTICE);
  });
});

describe("word list format", () => {
  test("round trips and drops junk", () => {
    const wire = toWire(ALL);
    expect(fromWire(wire)).toEqual(ALL);
    expect(fromWire("nope")).toEqual([]);
    expect(fromWire([["cat", "x", "animals"], ["", "e", "animals"], ["dog", "e", "space"], [1, 2, 3], ["fish", "e", "animals"], ["fish", "e", "animals"]])).toEqual([
      { word: "fish", level: "easy", category: "animals" },
    ]);
  });
});

describe("picking words", () => {
  test("three different words matching the category and difficulty", () => {
    const r = seeded(1);
    for (let i = 0; i < 50; i++) {
      const c = pickChoices(ALL, { category: "food", difficulty: "easy" }, new Set(), 3, r);
      expect(c).toHaveLength(3);
      expect(new Set(c.map((w) => w.word)).size).toBe(3);
      for (const w of c) {
        expect(w.category).toBe("food");
        expect(w.level).toBe("easy");
      }
    }
  });

  test("all categories: each choice from a different category", () => {
    const r = seeded(2);
    for (let i = 0; i < 50; i++) {
      const c = pickChoices(ALL, { category: "all", difficulty: "mixed" }, new Set(), 3, r);
      expect(new Set(c.map((w) => w.category)).size).toBe(3);
    }
  });

  test("never repeats a word in the session until the pool runs out", () => {
    const r = seeded(3);
    const s = { category: "movies", difficulty: "hard" } as const;
    const pool = ALL.filter((w) => w.category === s.category && w.level === s.difficulty);
    const used = new Set<string>();
    for (let i = 0; i < pool.length; i++) {
      const c = pickChoices(ALL, s, used, 3, r);
      expect(used.has(c[0].word)).toBe(false);
      used.add(c[0].word);
    }
    expect(freshCount(ALL, s, used)).toBe(0);
    // Pool exhausted: falls back to other levels in the same category, still no repeats.
    const more = pickChoices(ALL, s, used, 3, r);
    expect(more).toHaveLength(3);
    for (const w of more) {
      expect(w.category).toBe("movies");
      expect(used.has(w.word)).toBe(false);
    }
    // Everything used: allows repeats rather than coming back empty.
    const everything = new Set(ALL.map((w) => w.word));
    expect(pickChoices(ALL, s, everything, 3, r)).toHaveLength(3);
  });

  test("every category has enough words for every difficulty", () => {
    const cats = new Set(ALL.map((w) => w.category));
    for (const category of cats) {
      for (const difficulty of ["easy", "medium", "hard"] as const) {
        expect(freshCount(ALL, { category, difficulty }, new Set())).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

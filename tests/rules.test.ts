import { describe, expect, test } from "bun:test";
import {
  applyOp, drawerPoints, guessPoints, isCorrect, judgeGuess, levenshtein, maskWord, normalizeGuess,
  parseCustomWords, planHints, rankPlayers, sanitizeName, sanitizeSettings, validOp,
} from "../src/shared/rules";
import { DEFAULT_SETTINGS, type Item } from "../src/shared/protocol";

describe("guess matching", () => {
  test("ignores case, spaces, accents and punctuation", () => {
    expect(isCorrect("Ice Cream", "ice cream")).toBe(true);
    expect(isCorrect("icecream", "ice cream")).toBe(true);
    expect(isCorrect("  ICE-CREAM!! ", "ice cream")).toBe(true);
    expect(isCorrect("café", "cafe")).toBe(true);
    expect(isCorrect("writers block", "writer's block")).toBe(true);
    expect(isCorrect("ice", "ice cream")).toBe(false);
    expect(isCorrect("!!!", "cat")).toBe(false);
  });
  test("keeps non-Latin scripts", () => {
    expect(normalizeGuess("नमस्ते")).toBe("नमस्ते".normalize("NFKD"));
    expect(isCorrect("नमस्ते", "नमस्ते")).toBe(true);
  });
  test("spelling slips count as correct", () => {
    const j = (g: string, w: string) => judgeGuess(g, { word: w }).kind;
    expect(j("girafe", "giraffe")).toBe("correct");
    expect(j("elefant", "elephant")).toBe("correct");
    expect(j("baot", "boat")).toBe("correct");
    expect(j("dgo", "dog")).toBe("correct");
    expect(j("ice creem", "ice cream")).toBe("correct");
    expect(j("lion king", "The Lion King")).toBe("correct");
    expect(j("spiderman", "Spider-Man")).toBe("correct");
    expect(j("cats", "cat")).toBe("correct");
    expect(j("cat", "car")).not.toBe("correct");
    expect(judgeGuess("goat", { word: "boat" }, { has: (k) => k === "goat" }).kind).toBeNull();
  });
  test("meaning-based nudges", () => {
    const dog = { word: "dog", very: ["puppy", "hound"], close: ["bone", "leash"] };
    expect(judgeGuess("puppy", dog).kind).toBe("very");
    expect(judgeGuess("puppies", dog).kind).toBe("very");
    expect(judgeGuess("bone", dog).kind).toBe("close");
    expect(judgeGuess("banana", dog).kind).toBeNull();
    expect(judgeGuess("ice", { word: "ice cream" }).kind).toBe("very");
    expect(judgeGuess("vanilla ice cream", { word: "ice cream" }).kind).toBe("very");
    expect(judgeGuess("grafe", { word: "giraffe" }).kind).toBe("very");
  });
  test("levenshtein caps early", () => {
    expect(levenshtein("kitten", "sitting", 5)).toBe(3);
    expect(levenshtein("abcd", "abdc", 3)).toBe(1); // a swap is one edit
    expect(levenshtein("a", "abcdefgh", 2)).toBe(3);
  });
});

describe("scoring", () => {
  test("first guesser always scores the most", () => {
    const draw = 80000;
    let last = Infinity;
    for (let order = 0; order < 11; order++) {
      const elapsed = order * 5000;
      const pts = guessPoints(order, elapsed, draw);
      expect(pts).toBeLessThan(last);
      last = pts;
    }
    expect(guessPoints(0, 0, 80000)).toBe(300);
    expect(guessPoints(0, 80000, 80000)).toBe(200);
    expect(guessPoints(5, 40000, 80000)).toBe(150);
    // A quick second guess keeps its speed bonus even though the race cut the clock to 30 s.
    expect(guessPoints(1, 22000, 80000)).toBe(160 + 73);
  });
  test("drawer gets a share of 300", () => {
    expect(drawerPoints(3, 6)).toBe(150);
    expect(drawerPoints(6, 6)).toBe(300);
    expect(drawerPoints(0, 6)).toBe(0);
    expect(drawerPoints(1, 0)).toBe(0);
  });
  test("harder words pay the drawer more", () => {
    expect(drawerPoints(6, 6, "easy")).toBe(300);
    expect(drawerPoints(6, 6, "medium")).toBe(375);
    expect(drawerPoints(3, 6, "hard")).toBe(225);
    expect(drawerPoints(6, 6, "custom")).toBe(300);
  });
  test("ranking shares places on ties", () => {
    const r = rankPlayers([{ score: 10 }, { score: 30 }, { score: 30 }, { score: 5 }]);
    expect(r.map((x) => [x.score, x.rank])).toEqual([[30, 1], [30, 1], [10, 3], [5, 4]]);
  });
});

describe("hints and masks", () => {
  test("mask keeps spaces and hyphens", () => {
    expect(maskWord("ice cream", [])).toEqual([null, null, null, " ", null, null, null, null, null]);
    expect(maskWord("yo-yo", [0])).toEqual(["y", null, "-", null, null]);
  });
  test("never reveals too much of short words", () => {
    let seed = 1;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    expect(planHints("cat", 3, 0, 1000, rnd).length).toBe(1);
    expect(planHints("ox", 3, 0, 1000, rnd).length).toBe(0);
    const h = planHints("elephant", 2, 1000, 80000, rnd);
    expect(h.length).toBe(2);
    expect(h[0].at).toBe(1000 + 36000);
    expect(new Set(h.map((x) => x.idx)).size).toBe(2);
  });
});

describe("input cleaning", () => {
  test("names", () => {
    expect(sanitizeName("  Riya \u0000  K ")).toBe("Riya K");
    expect(sanitizeName("a".repeat(40)).length).toBe(16);
    expect(sanitizeName("   ")).toBe("");
    expect(sanitizeName(42)).toBe("");
  });
  test("custom words", () => {
    expect(parseCustomWords("Cat, dog\nCAT,  big   tree ,, 123, !!")).toEqual(["Cat", "dog", "big tree", "123"]);
  });
  test("settings are clamped", () => {
    const s = sanitizeSettings({ rounds: 99, drawTime: 77, maxPlayers: 1, hints: -2, difficulty: "nope" }, DEFAULT_SETTINGS, 5);
    expect(s.rounds).toBe(10);
    expect(s.drawTime).toBe(DEFAULT_SETTINGS.drawTime);
    expect(s.maxPlayers).toBe(5);
    expect(s.hints).toBe(0);
    expect(s.difficulty).toBe("mixed");
  });
});

describe("canvas ops", () => {
  test("strokes, undo and clear", () => {
    const items: Item[] = [];
    applyOp(items, { k: "b", c: 0, w: 12, x: 10, y: 10 });
    applyOp(items, { k: "m", p: [20, 20, 30, 30] });
    applyOp(items, { k: "e" });
    expect(items).toEqual([{ k: "s", c: 0, w: 12, p: [10, 10, 20, 20, 30, 30] }]);
    expect(applyOp(items, { k: "m", p: [1, 1] })).toBe(-1); // no open stroke
    applyOp(items, { k: "x" });
    applyOp(items, { k: "x" }); // double clear is one item
    expect(items.length).toBe(2);
    applyOp(items, { k: "u" }); // undo the clear
    expect(items.length).toBe(1);
  });
  test("validation", () => {
    expect(validOp({ k: "b", c: -1, w: 24, x: 0, y: 0 })).toBe(true);
    expect(validOp({ k: "b", c: 99, w: 24, x: 0, y: 0 })).toBe(false);
    expect(validOp({ k: "m", p: [1, 2, 3] })).toBe(false);
    expect(validOp({ k: "m", p: [1.5, 2] })).toBe(false);
    expect(validOp({ k: "f", c: 1, x: 1200, y: 0 })).toBe(false);
    expect(validOp({ k: "zzz" })).toBe(false);
  });
});

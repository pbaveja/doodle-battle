// Student edition: classes, subjects, the student word list, and rooms and practice that use it.
import { describe, expect, test } from "bun:test";
import { RoomCore, type RoomIO } from "../src/server/room";
import { forGrade, fromStudentWire, pickChoices, sanitizePractice, toStudentWire } from "../src/shared/practice";
import { defaultSettings, normalizeGuess, sanitizeSettings } from "../src/shared/rules";
import { STUDENT_WORDS } from "../src/shared/student-words";
import { categoryMatches, fitSubject, GRADES, gradeLevel, subjectLabel, subjectOptions } from "../src/shared/students";
import { WORD_ENTRIES } from "../src/shared/words";

const students = () => ({ ...defaultSettings(), edition: "students" as const });

describe("classes and subjects", () => {
  test("Science splits into Physics, Chemistry and Biology from Class 11", () => {
    expect(subjectOptions(9).map((o) => o.id)).toEqual(["science", "maths", "history", "geography", "civics", "economics", "computers"]);
    expect(subjectOptions(11).map((o) => o.id)).toContain("physics");
    expect(subjectOptions(11).map((o) => o.id)).not.toContain("science");
    expect(subjectLabel("physics", 9)).toBe("Science");
    expect(subjectLabel("physics", 12)).toBe("Physics");
    expect(subjectLabel("civics", 12)).toBe("Political Science");
  });

  test("a subject choice survives a change of class", () => {
    expect(fitSubject("physics", 9)).toBe("science");
    expect(fitSubject("science", 11)).toBe("all");
    expect(fitSubject("commerce", 10)).toBe("all");
    expect(fitSubject("history", 7)).toBe("history");
    expect(categoryMatches("science", "chemistry")).toBe(true);
    expect(categoryMatches("science", "maths")).toBe(false);
  });

  test("this year's topics are hard, last year's medium, older ones easy, later ones left out", () => {
    expect(gradeLevel(10, 10)).toBe("hard");
    expect(gradeLevel(9, 10)).toBe("medium");
    expect(gradeLevel(6, 10)).toBe("easy");
    expect(gradeLevel(11, 10)).toBeNull();
  });
});

describe("student word list", () => {
  test("every subject has words for every class it's offered in", () => {
    for (const g of GRADES) {
      for (const o of subjectOptions(g)) {
        const n = STUDENT_WORDS.filter((w) => w.grade <= g && categoryMatches(o.id, w.subject)).length;
        expect(n).toBeGreaterThanOrEqual(5);
      }
      // Enough of each level for a mixed game of three choices.
      expect(STUDENT_WORDS.filter((w) => w.grade === g).length).toBeGreaterThanOrEqual(15);
    }
  });

  test("words are unique and hints never repeat the word", () => {
    const seen = new Set<string>();
    for (const w of STUDENT_WORDS) {
      const k = normalizeGuess(w.word);
      expect(seen.has(k)).toBe(false);
      seen.add(k);
      for (const v of [...w.very, ...w.close]) expect(normalizeGuess(v)).not.toBe(k);
    }
  });

  test("a very close guess is never another word in the list", () => {
    const keys = new Set(STUDENT_WORDS.map((w) => normalizeGuess(w.word)));
    for (const w of STUDENT_WORDS) for (const v of w.very) expect(keys.has(normalizeGuess(v))).toBe(false);
  });
});

describe("student settings", () => {
  test("class replaces difficulty and subjects follow the class", () => {
    let s = sanitizeSettings({ grade: 11, category: "physics", difficulty: "hard" }, students(), 2);
    expect(s).toMatchObject({ grade: 11, category: "physics", difficulty: "mixed" });
    s = sanitizeSettings({ grade: 9 }, s, 2);
    expect(s.category).toBe("science");
    expect(sanitizeSettings({ category: "animals" }, s, 2).category).toBe("science");
    expect(sanitizeSettings({ grade: 13 }, s, 2).grade).toBe(9);
    expect(sanitizeSettings({ edition: "main" }, s, 2).edition).toBe("students");
  });

  test("the main edition ignores classes and subjects", () => {
    const s = sanitizeSettings({ grade: 11, category: "physics" }, defaultSettings(), 2);
    expect(s.grade).toBe(8);
    expect(s.category).toBe("all");
  });
});

function room(edition?: "main" | "students") {
  let seed = 11;
  const io: RoomIO = {
    send: () => {}, close: () => {}, bind: () => {}, schedule: () => {}, save: () => {}, remove: () => {},
    lastHeartbeat: () => null, log: () => {}, sendGallery: () => {}, destroy: () => {},
    now: () => 1_000_000,
    random: () => ((seed = (seed * 16807) % 2147483647) / 2147483647),
  };
  const core = new RoomCore(io);
  core.claim("ABCDE", edition);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return core as any;
}

describe("student rooms", () => {
  test("a student room starts with photos off; a main room is unchanged", () => {
    expect(room("students").settings).toMatchObject({ edition: "students", photos: false });
    expect(room().settings).toMatchObject({ edition: "main", photos: true });
  });

  test("choices come from the class and subject: one from this year, one from last year, one older", () => {
    const byWord = new Map(STUDENT_WORDS.map((w) => [w.word, w]));
    for (const grade of [8, 10, 12]) {
      const core = room("students");
      core.settings.grade = grade;
      for (let turn = 0; turn < 10; turn++) {
        const choices = core.pickWords(3) as { word: string; level: string; category: string }[];
        expect(choices.map((c) => c.level)).toEqual(["easy", "medium", "hard"]);
        const grades = choices.map((c) => byWord.get(c.word)!.grade);
        expect(grades[0]).toBeLessThan(grade - 1);
        expect(grades[1]).toBe(grade - 1);
        expect(grades[2]).toBe(grade);
        core.used.add(normalizeGuess(choices[0].word));
      }
    }
    const core = room("students");
    core.settings.grade = 9;
    core.settings.category = "science";
    for (let turn = 0; turn < 10; turn++) {
      for (const c of core.pickWords(3)) expect(["physics", "chemistry", "biology"]).toContain(c.category);
    }
  });

  test("subject labels use the class's names", () => {
    const core = room("students");
    core.settings.grade = 12;
    expect(core.label("civics")).toBe("Political Science");
    core.settings.grade = 7;
    expect(core.label("chemistry")).toBe("Science");
  });

  test("a main room never offers student words", () => {
    const core = room();
    const main = new Set(WORD_ENTRIES.map((e) => e.word));
    for (let i = 0; i < 20; i++) for (const c of core.pickWords(3)) expect(main.has(c.word)).toBe(true);
  });
});

describe("student practice", () => {
  test("the word list round trips and drops junk", () => {
    const wire = toStudentWire(STUDENT_WORDS);
    expect(fromStudentWire(wire).length).toBe(STUDENT_WORDS.length);
    expect(fromStudentWire([["atom", 13, "chemistry"], ["atom", 9, "space"], ["", 9, "chemistry"], ["atom", 9, "chemistry"]])).toEqual([
      { word: "atom", grade: 9, category: "chemistry" },
    ]);
  });

  test("settings keep the class and fit the subject to it", () => {
    expect(sanitizePractice({ grade: 10, category: "physics" }, "students")).toMatchObject({ grade: 10, category: "science", difficulty: "mixed" });
    expect(sanitizePractice({ grade: 12, category: "physics", difficulty: "hard" }, "students")).toMatchObject({ grade: 12, category: "physics", difficulty: "mixed" });
  });

  test("choices stay within the class and subject", () => {
    const list = fromStudentWire(toStudentWire(STUDENT_WORDS));
    const pool = forGrade(list, 8);
    const grades = new Map(list.map((w) => [w.word, w.grade]));
    let r = 3;
    const random = () => ((r = (r * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 20; i++) {
      for (const c of pickChoices(pool, { category: "science", difficulty: "mixed" }, new Set(), 3, random)) {
        expect(grades.get(c.word)!).toBeLessThanOrEqual(8);
        expect(["physics", "chemistry", "biology"]).toContain(c.category);
      }
    }
  });
});

// Student edition (students.doodlebattle.in): words from school subjects, graded by the CBSE / NCERT
// class where each topic is first taught. Shared by the lobby and practice pickers (client) and the
// word picking (server).

export type Edition = "main" | "students";

export function parseEdition(v: unknown): Edition {
  return v === "students" ? "students" : "main";
}

/** The classes a room can pick. Words can also be tagged 6: basics taught by Class 6. */
export const GRADES = [7, 8, 9, 10, 11, 12] as const;
export const DEFAULT_GRADE = 8;
export const MIN_WORD_GRADE = 6;

/** Subjects each word is tagged with. Classes 7–10 see physics, chemistry and biology as one "Science". */
export const SUBJECT_IDS = [
  "physics", "chemistry", "biology", "maths", "history", "geography", "civics", "economics", "computers", "commerce",
] as const;
export type SubjectId = (typeof SUBJECT_IDS)[number];

const SCIENCE: readonly string[] = ["physics", "chemistry", "biology"];
/** From Class 11, Science splits into Physics, Chemistry and Biology, as the CBSE streams do. */
const SPLIT_FROM = 11;

export function validGrade(v: unknown): number | null {
  return typeof v === "number" && (GRADES as readonly number[]).includes(v) ? v : null;
}

/** The subject picker for a class, in CBSE's names for that stage. */
export function subjectOptions(grade: number): { id: string; label: string }[] {
  const ids =
    grade >= SPLIT_FROM
      ? ["physics", "chemistry", "biology", "maths", "computers", "commerce", "economics", "history", "geography", "civics"]
      : ["science", "maths", "history", "geography", "civics", "economics", "computers"];
  return ids.map((id) => ({ id, label: subjectLabel(id, grade)! }));
}

export function subjectLabel(id: string | null | undefined, grade: number): string | null {
  const senior = grade >= SPLIT_FROM;
  switch (id) {
    case "science": return "Science";
    case "physics": return senior ? "Physics" : "Science";
    case "chemistry": return senior ? "Chemistry" : "Science";
    case "biology": return senior ? "Biology" : "Science";
    case "maths": return "Maths";
    case "history": return "History";
    case "geography": return "Geography";
    case "civics": return senior ? "Political Science" : "Civics";
    case "economics": return "Economics";
    case "computers": return senior ? "Computer Science" : "Computers";
    case "commerce": return "Accountancy & Business";
    default: return null;
  }
}

/**
 * Keeps a subject choice valid when the class changes: Physics in Class 11 becomes Science in
 * Class 9 and the other way round, and a subject the class doesn't have falls back to all subjects.
 */
export function fitSubject(category: string, grade: number): string {
  if (category === "all") return category;
  if (grade < SPLIT_FROM && SCIENCE.includes(category)) return "science";
  return subjectOptions(grade).some((o) => o.id === category) ? category : "all";
}

/** Whether a word tagged `wordCategory` belongs to the picked category. "science" covers its three parts. */
export function categoryMatches(category: string, wordCategory: string | null | undefined): boolean {
  if (category === "all") return true;
  if (category === "science") return !!wordCategory && SCIENCE.includes(wordCategory);
  return wordCategory === category;
}

/**
 * How hard a word is for the picked class: this year's topics are hard, the last year's are medium,
 * and older ones easy. Words from later classes are left out (null).
 */
export function gradeLevel(wordGrade: number, grade: number): "easy" | "medium" | "hard" | null {
  if (wordGrade > grade) return null;
  if (wordGrade === grade) return "hard";
  if (wordGrade === grade - 1) return "medium";
  return "easy";
}

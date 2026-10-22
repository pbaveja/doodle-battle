// GET /api/words: the built-in word list for solo practice. Only words, levels (or classes) and
// categories go out; the "very close" and "close" guess lists stay on the server.

import { toStudentWire, toWire } from "../shared/practice";
import { STUDENT_WORDS } from "../shared/student-words";
import type { Edition } from "../shared/students";
import { WORD_ENTRIES } from "../shared/words";

const BODY: Record<Edition, string> = {
  main: JSON.stringify({
    v: 1,
    words: toWire(WORD_ENTRIES.map((e) => ({ word: e.word, level: e.level, category: e.category }))),
  }),
  students: JSON.stringify({ v: 1, words: toStudentWire(STUDENT_WORDS) }),
};

export function wordsResponse(edition: Edition = "main"): Response {
  return new Response(BODY[edition], {
    headers: {
      "content-type": "application/json; charset=utf-8",
      // The list only changes with a deploy, so browsers can keep it for an hour.
      "cache-control": "public, max-age=3600",
    },
  });
}

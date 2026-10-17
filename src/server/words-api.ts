// GET /api/words: the built-in word list for solo practice. Only words, levels and categories go
// out; the "very close" and "close" guess lists stay on the server.

import { toWire } from "../shared/practice";
import { WORD_ENTRIES } from "../shared/words";

const BODY = JSON.stringify({
  v: 1,
  words: toWire(WORD_ENTRIES.map((e) => ({ word: e.word, level: e.level, category: e.category }))),
});

export function wordsResponse(): Response {
  return new Response(BODY, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      // The list only changes with a deploy, so browsers can keep it for an hour.
      "cache-control": "public, max-age=3600",
    },
  });
}

// Which edition this page is. students.doodlebattle.in is the student edition; ?students=1 switches it
// on anywhere else (a preview or localhost) and ?students=0 switches it back off.

import { type Edition } from "../shared/students";
import { $, store } from "./util";

const KEY = "db.edition";

function detect(): Edition {
  if (location.hostname.startsWith("students.")) return "students";
  const flag = new URLSearchParams(location.search).get("students");
  if (flag === "1") store.set(KEY, "students");
  else if (flag === "0") store.del(KEY);
  return store.get(KEY, null) === "students" ? "students" : "main";
}

export const EDITION: Edition = detect();
export const STUDENTS = EDITION === "students";
export const APP_NAME = STUDENTS ? "Doodle Battle Students" : "Doodle Battle";

/** Query string for the API calls that depend on the edition. */
export const EDITION_QS = STUDENTS ? "?edition=students" : "";

/** Home page copy for the student edition. */
export function applyEdition() {
  if (!STUDENTS) return;
  document.documentElement.classList.add("students");
  document.title = APP_NAME;
  $(".home .title").innerHTML = `Doodle Battle <span class="edition-badge">Students</span>`;
  $(".home .tag").textContent = "Draw and guess words from your school subjects, Class 7 to 12. Science, Maths, History, Geography and more.";
}

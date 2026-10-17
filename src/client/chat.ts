// Chat and guessing. One instance is moved between the lobby and the game.

import { INKS, LIMITS, type ChatMsg } from "../shared/protocol";
import { app, send, toast } from "./app";
import { $, esc } from "./util";

const log = () => $("#chatLog");
let stuck = true;
let unread = 0;

export function initChat() {
  const form = $<HTMLFormElement>("#chatForm");
  const input = $<HTMLInputElement>("#chatInput");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.replace(/\s+/g, " ").trim().slice(0, LIMITS.chatMax);
    if (!text || input.disabled) return;
    if (!send({ t: "chat", text })) {
      toast("You're offline, so that wasn't sent. Try again in a moment.", true);
      return;
    }
    input.value = "";
  });
  input.addEventListener("focus", () => document.body.classList.add("typing"));
  input.addEventListener("blur", () => document.body.classList.remove("typing"));
  const l = log();
  l.addEventListener("scroll", () => {
    stuck = l.scrollHeight - l.scrollTop - l.clientHeight < 48;
    if (stuck) {
      unread = 0;
      $("#newMsgs").hidden = true;
    }
  });
  $("#newMsgs").addEventListener("click", () => scrollDown(true));
  // Stay pinned to the newest message when the chat box changes size (keyboard, layout).
  if ("ResizeObserver" in window) new ResizeObserver(() => { if (stuck) l.scrollTop = l.scrollHeight; }).observe(l);
}

export function mountChat(slot: string) {
  const el = $("#chat");
  const target = $(slot);
  if (el.parentElement !== target) target.appendChild(el);
  el.hidden = false;
  requestAnimationFrame(() => scrollDown(true));
}

function line(m: ChatMsg): string {
  const ink = m.color !== undefined ? INKS[m.color] : undefined;
  const who = m.name ? `<b style="--pc:${ink}">${esc(m.name)}</b>` : "";
  switch (m.k) {
    case "msg":
      return `<div class="cm">${who} ${esc(m.text)}</div>`;
    case "secret":
      return `<div class="cm secret">${who} ${esc(m.text)}</div>`;
    case "correct":
      return `<div class="cm correct">${m.name ? `${who} guessed the word!` : esc(m.text)}</div>`;
    case "close":
      return `<div class="cm close">${esc(m.text)}</div>`;
    case "warm":
      return `<div class="cm warm">${esc(m.text)}</div>`;
    case "you":
      return `<div class="cm you">${esc(m.text)}</div>`;
    default:
      return `<div class="cm sys">${esc(m.text)}</div>`;
  }
}

function scrollDown(force = false) {
  const l = log();
  if (force || stuck) {
    l.scrollTop = l.scrollHeight;
    stuck = true;
    unread = 0;
    $("#newMsgs").hidden = true;
  }
}

export function resetChat(list: ChatMsg[]) {
  app.chat = list.slice(-120);
  log().innerHTML = app.chat.map(line).join("");
  scrollDown(true);
}

export function addChat(m: ChatMsg) {
  if (app.chat.some((c) => c.id === m.id)) return;
  app.chat.push(m);
  const l = log();
  l.insertAdjacentHTML("beforeend", line(m));
  while (l.children.length > 150) l.firstElementChild?.remove();
  if (app.chat.length > 150) app.chat.splice(0, app.chat.length - 150);
  if (stuck) scrollDown();
  else {
    unread++;
    const b = $("#newMsgs");
    b.hidden = false;
    b.textContent = unread === 1 ? "1 new message" : `${unread} new messages`;
  }
}

export interface ChatMode {
  placeholder: string;
  disabled: boolean;
  cls: "" | "guess" | "guessed";
}

export function setChatMode(mode: ChatMode) {
  const input = $<HTMLInputElement>("#chatInput");
  const form = $("#chatForm");
  input.placeholder = mode.placeholder;
  if (input.disabled !== mode.disabled) {
    input.disabled = mode.disabled;
    if (mode.disabled) input.blur();
  }
  $<HTMLButtonElement>(".sendbtn", form).disabled = mode.disabled;
  form.classList.toggle("guess", mode.cls === "guess");
  form.classList.toggle("guessed", mode.cls === "guessed");
}

export function focusChat() {
  const input = $<HTMLInputElement>("#chatInput");
  if (!input.disabled && window.matchMedia("(hover: hover) and (pointer: fine)").matches) input.focus({ preventScroll: true });
}

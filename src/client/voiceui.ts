// The voice chat button and its menu (one copy, moved between the lobby, the game and the results),
// and the mic marks and speaking rings on player lists. Rings and mute marks come from one small
// generated stylesheet, so they survive the lists being redrawn.

import { INKS, type PlayerView, type View } from "../shared/protocol";
import { app, toast } from "./app";
import { avatarHtml } from "./avatar";
import { canHear, initVoice, joinVoice, leaveVoice, toggleMic, toggleSilence, voice, voiceSupported } from "./voice";
import { $, esc } from "./util";

const svg = (paths: string, size = 20) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const MIC_PATHS = `<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>`;
const SLASH = `<path d="m4 4 16 16"/>`;
const ICONS = {
  off: svg(MIC_PATHS),
  on: svg(MIC_PATHS),
  asking: svg(MIC_PATHS),
  muted: svg(MIC_PATHS + SLASH),
  none: svg(`<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>`),
};
const LABELS = {
  off: "Join voice chat",
  on: "Mute your mic",
  muted: "Unmute your mic",
  asking: "Waiting for your mic",
  none: "Listening only. Turn on your mic",
};
const BLOCKED = "Your mic is blocked, so you can listen but not talk. Allow the mic for this site to talk.";

let speakingCss = "";
let talking = false;

export function initVoiceUi() {
  initVoice({ change: renderVoice, speaking: paintSpeaking });
  const menu = $("#voiceMenu");
  const more = $("#voiceMore");
  $("#voiceBtn").addEventListener("click", async () => {
    if (!voice.joined) {
      await joinVoice();
      if (voice.joined && voice.mic === "none") toast(BLOCKED, true, 5000);
    } else if (!(await toggleMic())) toast(BLOCKED, true, 5000);
  });
  more.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu.hidden) openMenu();
    else closeMenu();
  });
  menu.addEventListener("click", (e) => {
    e.stopPropagation();
    const t = e.target as HTMLElement;
    const b = t.closest<HTMLButtonElement>("[data-silence]");
    if (b) toggleSilence(b.dataset.silence!);
    if (t.closest("[data-leave-voice]")) {
      closeMenu();
      leaveVoice();
    }
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !$("#voice").contains(e.target as Node)) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) closeMenu();
  });
}

export function mountVoice(slot: string) {
  const el = $("#voice");
  const target = $(slot);
  if (el.parentElement !== target) {
    closeMenu();
    target.appendChild(el);
  }
  renderVoice();
}

function openMenu() {
  const v = app.view;
  if (!v) return;
  $("#voiceMenu").hidden = false;
  $("#voiceMore").setAttribute("aria-expanded", "true");
  renderMenu(v);
}

function closeMenu() {
  $("#voiceMenu").hidden = true;
  $("#voiceMore").setAttribute("aria-expanded", "false");
}

/** Why some players can't hear you right now, if that's the case. */
function hushNote(v: View): string {
  if (!voice.joined || (v.phase !== "choosing" && v.phase !== "drawing")) return "";
  if (v.settings.voice === "breaks") return "Everyone's muted until this turn ends.";
  if (v.drawer === v.you) return "Guessers can't hear you during your turn.";
  if (v.phase === "drawing" && v.guessed.includes(v.you)) return "Only the drawer and players who've guessed can hear you.";
  return "";
}

export function renderVoice() {
  const v = app.view;
  const show = !!v && app.joined && voiceSupported() && (v.settings.voice ?? "off") !== "off";
  $("#voice").hidden = !show;
  if (!show || !v) {
    closeMenu();
    paintCss();
    return;
  }
  const state = voice.joined ? voice.mic : "off";
  const hush = hushNote(v);
  const btn = $("#voiceBtn");
  const html = `${ICONS[state]}${state === "off" ? `<span class="vlabel">Voice</span>` : ""}${hush ? `<span class="vhush" aria-hidden="true"></span>` : ""}`;
  if (btn.dataset.html !== html) {
    btn.innerHTML = html;
    btn.dataset.html = html;
  }
  btn.className = `vbtn ${state}${talking ? " talking" : ""}`;
  btn.setAttribute("aria-label", hush ? `${LABELS[state]}. ${hush}` : LABELS[state]);
  btn.title = hush || LABELS[state];
  $("#voiceMore").hidden = !voice.joined;
  if (!voice.joined) closeMenu();
  else if (!$("#voiceMenu").hidden) renderMenu(v);
  paintCss();
}

function personStatus(v: View, p: PlayerView): string {
  if (voice.silenced(p.id)) return "Muted by you";
  const st = voice.peer(p.id);
  if (st === "failed") return "Couldn't connect";
  if (st === "connecting") return "Connecting…";
  if (voice.peerMuted(p.id)) return "Mic off";
  if (!canHear(v, p.id, v.you)) return "Can't be heard right now";
  return "";
}

function renderMenu(v: View) {
  const inVoice = v.players.filter((p) => p.id !== v.you && p.voice);
  const out = v.players.filter((p) => p.id !== v.you && !p.voice);
  const hush = hushNote(v);
  const rows = inVoice
    .map((p) => {
      const st = personStatus(v, p);
      const off = voice.silenced(p.id);
      return `<li class="vrow" data-id="${esc(p.id)}" style="--pc:${INKS[p.color]}">
        ${avatarHtml(p, 30)}
        <span class="vname"><b>${esc(p.name)}</b>${st ? `<small>${esc(st)}</small>` : ""}</span>
        <button type="button" class="kick" data-silence="${esc(p.id)}" aria-label="${off ? "Unmute" : "Mute"} ${esc(p.name)} for you">${off ? "Unmute" : "Mute"}</button>
      </li>`;
    })
    .join("");
  $("#voiceMenu").innerHTML = `<p class="menu-code">Voice chat</p>
    ${hush ? `<p class="vnote">${esc(hush)}</p>` : ""}
    ${rows ? `<ul class="vpeople">${rows}</ul>` : `<p class="vnote">Nobody else is in voice yet.</p>`}
    ${out.length ? `<p class="vnote">Not in voice: ${out.map((p) => esc(p.name)).join(", ")}</p>` : ""}
    <button type="button" class="menuitem danger" data-leave-voice>Leave voice chat</button>`;
}

/** A small mic after the name of each player in voice. It's crossed out while their mic is off. */
export function voiceMark(p: PlayerView): string {
  return p.voice ? `<span class="vmark" title="In voice chat">${svg(MIC_PATHS + `<path class="slash" d="m4 4 16 16"/>`, 13)}</span>` : "";
}

function paintSpeaking(ids: Set<string>) {
  speakingCss = ids.size ? `${[...ids].map((id) => `[data-id="${id}"] .face`).join(",")}{border-radius:50%;box-shadow:0 0 0 2px var(--raise),0 0 0 5px var(--pc,var(--good));animation:vpulse .8s ease-in-out infinite alternate}` : "";
  talking = !!app.view && ids.has(app.view.you);
  $("#voiceBtn").classList.toggle("talking", talking);
  paintCss();
}

function paintCss() {
  const v = app.view;
  const off = v && voice.joined
    ? v.players.filter((p) => p.voice && (p.id === v.you ? voice.mic !== "on" : voice.peerMuted(p.id) || voice.silenced(p.id))).map((p) => p.id)
    : [];
  const css = (off.length ? `${off.map((id) => `[data-id="${id}"] .vmark`).join(",")}{opacity:.55}${off.map((id) => `[data-id="${id}"] .vmark .slash`).join(",")}{display:inline}` : "") + speakingCss;
  const el = $("#voiceCss");
  if (el.textContent !== css) el.textContent = css;
}

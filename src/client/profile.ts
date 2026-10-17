// The name, look and colour picker. One instance is moved between the home, join and lobby screens.
// Your look is a character, or a photo taken this visit.

import { FACE_COUNT, INKS, INK_NAMES } from "../shared/protocol";
import { app, saveProfile, setYouColor } from "./app";
import { photoBadge } from "./avatar";
import { cameraOpen, openCamera } from "./camera";
import { CHARACTERS, GROUPS, characterSvg } from "./characters";
import { hasMyPhoto, myPhoto, setMyPhoto, useMyPhoto, usingMyPhoto } from "./photos";
import { $, esc } from "./util";

const root = () => $("#profile");
let onChange: () => void = () => {};

const CAM = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';

/** Photos are allowed unless you're in a room whose host turned them off. */
export function roomAllowsPhotos() {
  return !app.joined || !app.view || app.view.settings.photos !== false;
}

/** Your own look, as the picker shows it. */
export function myLookHtml(size: number, color = app.profile.color) {
  const ph = usingMyPhoto() && roomAllowsPhotos() ? myPhoto(color) : null;
  return ph ? photoBadge(ph.url, color, size) : characterSvg(app.profile.face, color, size);
}

export function initProfile() {
  const inks = $("#inks");
  inks.innerHTML = INKS.map(
    (c, i) => `<button type="button" class="ink-sw" role="radio" style="--c:${c}" data-i="${i}" aria-label="${INK_NAMES[i]}"></button>`,
  ).join("");
  inks.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".ink-sw");
    if (!b) return;
    app.profile.color = Number(b.dataset.i);
    changed();
  });
  const name = $<HTMLInputElement>("#nameInput");
  name.value = app.profile.name;
  name.addEventListener("input", () => {
    app.profile.name = name.value;
    saveProfile();
    onChange();
  });
  const pick = (face: number) => {
    app.profile.face = ((face % FACE_COUNT) + FACE_COUNT) % FACE_COUNT;
    useMyPhoto(false);
    changed();
  };
  $("#faceP").addEventListener("click", () => pick(app.profile.face - 1));
  $("#faceN").addEventListener("click", () => pick(app.profile.face + 1));
  $("#faceShuffle").addEventListener("click", openPicker);
  $("#photoBtn").addEventListener("click", takePhoto);

  // Picker sheet
  $("#lookClose").addEventListener("click", closePicker);
  $("#lookSheet").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closePicker();
  });
  $("#lookShuffle").addEventListener("click", () => {
    let f = app.profile.face;
    while (f === app.profile.face) f = Math.floor(Math.random() * FACE_COUNT);
    pick(f);
    renderPicker();
  });
  $("#lookBody").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!b) return;
    if (b.dataset.face !== undefined) {
      pick(Number(b.dataset.face));
      closePicker();
    } else if (b.dataset.photo !== undefined) {
      useMyPhoto(true);
      changed();
      closePicker();
    } else if (b.dataset.camera !== undefined) {
      closePicker();
      takePhoto();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#lookSheet").hidden && !cameraOpen()) closePicker();
  });
  renderProfile();
}

function takePhoto() {
  if (!roomAllowsPhotos()) return;
  openCamera(app.profile.color, (r) => {
    if (r === "character") useMyPhoto(false);
    else if (r) setMyPhoto(r.base, r.look);
    else return;
    changed();
  });
}

function openPicker() {
  renderPicker();
  $("#lookSheet").hidden = false;
  const on = $("#lookBody").querySelector<HTMLElement>(".look-tile.on");
  on?.scrollIntoView({ block: "center" });
  if (!matchMedia("(pointer: coarse)").matches) (on ?? $("#lookClose")).focus({ preventScroll: true });
}

function closePicker() {
  $("#lookSheet").hidden = true;
}

function renderPicker() {
  const color = app.profile.color;
  const photoOn = usingMyPhoto() && roomAllowsPhotos();
  let html = `<div class="look-grid look-photos">`;
  if (!roomAllowsPhotos()) {
    html += `<p class="hint look-off">Photos are off in this room.</p>`;
  } else if (hasMyPhoto()) {
    html += `<button type="button" class="look-tile${photoOn ? " on" : ""}" data-photo aria-pressed="${photoOn}">${photoBadge(myPhoto(color)!.url, color, 56)}<span>Your photo</span></button>`;
    html += `<button type="button" class="look-tile" data-camera><span class="look-cam">${CAM}</span><span>Retake</span></button>`;
  } else {
    html += `<button type="button" class="look-tile" data-camera><span class="look-cam">${CAM}</span><span>Take a photo</span></button>`;
  }
  html += `</div>`;
  for (const g of GROUPS) {
    html += `<h3 class="label look-group">${esc(g)}</h3><div class="look-grid">`;
    CHARACTERS.forEach((c, i) => {
      if (c.group !== g) return;
      const on = !photoOn && i === app.profile.face;
      html += `<button type="button" class="look-tile${on ? " on" : ""}" data-face="${i}" aria-pressed="${on}">${characterSvg(i, color, 56)}<span>${esc(c.name)}</span></button>`;
    });
    html += `</div>`;
  }
  $("#lookBody").innerHTML = html;
}

function changed() {
  saveProfile();
  renderProfile();
  onChange();
}

export function renderProfile() {
  $("#faceShuffle").innerHTML = myLookHtml(92);
  const photoOn = usingMyPhoto() && roomAllowsPhotos();
  $("#lookName").textContent = photoOn ? "Your photo" : CHARACTERS[app.profile.face % FACE_COUNT]?.name ?? "";
  $("#photoBtn").hidden = !roomAllowsPhotos();
  for (const b of $("#inks").querySelectorAll<HTMLButtonElement>(".ink-sw")) {
    b.setAttribute("aria-checked", String(Number(b.dataset.i) === app.profile.color));
  }
  const name = $<HTMLInputElement>("#nameInput");
  if (document.activeElement !== name) name.value = app.profile.name;
  if (!app.joined) setYouColor(app.profile.color);
}

export function mountProfile(slot: string, changeHandler: () => void = () => {}) {
  const el = root();
  $(slot).appendChild(el);
  el.hidden = false;
  onChange = changeHandler;
  renderProfile();
}

export function profileName() {
  return app.profile.name.replace(/\s+/g, " ").trim();
}

export function focusName() {
  $<HTMLInputElement>("#nameInput").focus();
}

// Keeps the room's copy of your photo in step with your choice. Your photo goes to the room when
// you join and when you save changes in the lobby, only while the host allows photos, and again
// (re-tinted) if the room gives you a different colour and you use the Ink look.

import { app, send } from "./app";
import { myPhoto, usingMyPhoto } from "./photos";

/** The look you've confirmed for this room (joining counts; lobby edits count once saved). */
let committed = false;
/** What the room has from you: undefined = unknown (just joined), null = no photo. */
let lastSent: string | null | undefined;

export function resetPhotoSync() {
  committed = usingMyPhoto();
  lastSent = undefined;
}

export function commitPhoto() {
  committed = usingMyPhoto();
  syncPhoto();
}

export function syncPhoto() {
  const v = app.view;
  if (!app.joined || !v) return;
  if (!v.settings.photos) {
    lastSent = null; // the room dropped every photo
    return;
  }
  const me = v.players.find((p) => p.id === v.you);
  if (!me) return;
  const want = committed ? myPhoto(me.color)?.data ?? null : null;
  if (want === lastSent) return;
  if (send({ t: "photo", data: want })) lastSent = want;
}

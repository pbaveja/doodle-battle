// Keeps the room's copy of your photo in step with your choice. Your photo goes to the room when
// you join and when you save changes in the lobby, only while the host allows photos, and again
// (re-tinted) if the room gives you a different colour and you use the Ink look. A reconnect
// doesn't send it again if the room still has it.

import { app, send } from "./app";
import { myPhoto, usingMyPhoto } from "./photos";

/** The look you've confirmed for this room (joining counts; lobby edits count once saved). */
let committed = false;
/** What you last sent this connection: undefined = nothing yet, null = no photo. */
let lastSent: string | null | undefined;
/** The room's copy of your photo, as it last sent it to you. */
let held: { v: number; data: string } | null = null;

export function resetPhotoSync() {
  committed = usingMyPhoto();
  lastSent = undefined;
  held = null; // the room sends every photo it has right after the welcome
}

/** The room sent a player's photo: remember it if it's yours. */
export function notePhoto(id: string, v: number, data: string) {
  if (id === app.you) held = { v, data };
}

export function commitPhoto() {
  committed = usingMyPhoto();
  syncPhoto();
}

export function syncPhoto() {
  const v = app.view;
  // A paired phone plays for a class: it never sends its own photo.
  if (!app.joined || !v || app.phone) return;
  if (!v.settings.photos) {
    lastSent = null; // the room dropped every photo
    return;
  }
  const me = v.players.find((p) => p.id === v.you);
  if (!me) return;
  const want = committed ? myPhoto(me.color)?.data ?? null : null;
  // What the room has: no photo, the copy it sent you, or not known yet. After a reconnect it
  // usually still has the right one, so nothing needs sending.
  const has = !me.photo ? null : held?.v === me.photo ? held.data : undefined;
  if (want === has || want === lastSent) return;
  if (send({ t: "photo", data: want })) lastSent = want;
}

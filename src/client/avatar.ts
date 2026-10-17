// Player avatars: their photo when they use one (and the room allows photos), otherwise their
// character. Both sit in the same thick ring of the player's colour.

import { FACE_COUNT, INKS } from "../shared/protocol";
import { characterSvg } from "./characters";
import { photoUrl } from "./photos";
import { esc } from "./util";

export interface AvatarOwner {
  id?: string;
  face: number;
  color: number;
  /** Photo version from the room (0 for none). */
  photo?: number;
}

/** A photo in the player's ring. The ring matches the characters' (6/64 of the size). */
export function photoBadge(url: string, color: number, size = 40, extra = ""): string {
  const ink = INKS[color] ?? INKS[0];
  const ring = Math.max(2, Math.round((size * 6) / 64));
  return `<span class="face pic${extra ? ` ${extra}` : ""}" style="--c:${ink};width:${size}px;height:${size}px;border-width:${ring}px;--s:${size}px" aria-hidden="true"><img src="${esc(url)}" alt="" draggable="false"></span>`;
}

export function avatarHtml(p: AvatarOwner, size = 40, extra = ""): string {
  const url = p.id && p.photo ? photoUrl(p.id, p.photo) : null;
  return url ? photoBadge(url, p.color, size, extra) : characterSvg(p.face, p.color, size, extra);
}

export const randomFace = () => Math.floor(Math.random() * FACE_COUNT);

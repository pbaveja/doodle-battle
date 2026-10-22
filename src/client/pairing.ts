// Classroom battle: pair a phone with this class's seat. The board shows a QR code; the phone that
// scans it joins the room as this class (not as a new player), to type guesses or draw.

import qrcode from "qrcode-generator";
import type { View } from "../shared/protocol";
import { app, me, send, toast } from "./app";
import { $, copyText, twoTap } from "./util";

let open = false;
let shownLink = "";

/** The address a phone opens to pair: the room's link plus the seat's pairing code. */
export function pairLink(code: string, pair: string) {
  return `${location.origin}/r/${code}?pair=${encodeURIComponent(pair)}`;
}

/** This page is a phone paired with a class's seat (it opened a pairing link). */
export function pairCodeFromUrl(): string | null {
  const v = new URLSearchParams(location.search).get("pair");
  return v && /^[A-Za-z0-9_-]{8,64}$/.test(v) ? v : null;
}

export function openPairing() {
  const v = app.view;
  if (!v || app.phone) return;
  open = true;
  $("#pairSheet").hidden = false;
  if (!v.pair) send({ t: "pair" });
  renderPairing(v);
}

function closePairing() {
  open = false;
  $("#pairSheet").hidden = true;
}

export function renderPairing(v: View) {
  if (!open) return;
  const mine = me();
  $("#pairName").textContent = mine?.name ?? "this class";
  const phones = mine?.phones ?? 0;
  $("#pairStatus").textContent = phones ? `${phones} ${phones === 1 ? "phone" : "phones"} paired` : "No phones paired yet";
  $("#pairStatus").classList.toggle("on", phones > 0);
  if (!v.pair) {
    $("#pairQr").innerHTML = `<p class="hint">Making a code…</p>`;
    return;
  }
  const link = pairLink(v.code, v.pair);
  if (link === shownLink) return;
  shownLink = link;
  $<HTMLInputElement>("#pairLink").value = link;
  const qr = qrcode(0, "M");
  qr.addData(link);
  qr.make();
  // Dark modules on white, whatever the theme, so every camera reads it.
  $("#pairQr").innerHTML = qr.createSvgTag({ cellSize: 8, margin: 3, scalable: true });
}

export function initPairing() {
  $("#pairClose").addEventListener("click", closePairing);
  $("#pairSheet").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closePairing();
  });
  document.addEventListener("keydown", (e) => {
    if (open && e.key === "Escape") closePairing();
  });
  $("#pairCopy").addEventListener("click", async () => {
    const ok = await copyText($<HTMLInputElement>("#pairLink").value, $<HTMLInputElement>("#pairLink"));
    toast(ok ? "Pairing link copied" : "Copy the link from the box", !ok);
  });
  twoTap($<HTMLButtonElement>("#pairReset"), "Tap again: unpairs phones", () => {
    shownLink = "";
    send({ t: "pair", reset: true });
  });
  $("#pairBtn").addEventListener("click", openPairing);
}

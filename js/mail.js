// js/mail.js - swipe-style decision mail. Skippable, auto-resolves, never blocks.
// One card, two choices, each previewing effects in 3 tiny icons (cash/time/rep).
// Imports the quest starter (data-only module) plus the clock tick.
import { store } from "./store.js";
import { sfx } from "./sound.js";
import { ksh } from "./i18n.js";
import { activeCareer } from "./store.js";
import { tickClock } from "./engine.js";
import { startFirstWin } from "./firstwin.js";
import { MAILS } from "../data/mail.js";

export function mailById(id) { return MAILS.find((m) => m.id === id); }
// The one active letter: first unanswered mail in the queue.
export function activeMail() {
  const c = activeCareer(); if (!c) return null;
  const id = (c.mail || []).find((m) => !(c.mailDone || {})[m]);
  return id ? mailById(id) : null;
}
// Answer a letter. Returns the one-line result string shown under the card.
export function resolveMail(side) {
  const c = activeCareer();
  const m = activeMail();
  if (!c || !m) return "No mail right now.";
  const opt = side === "left" ? m.left : m.right;
  // Apply effects.
  c.cash += opt.cash || 0;
  c.monthProfit = (c.monthProfit || 0) + (opt.cash || 0);
  c.reputation = Math.max(1, Math.min(5, Math.round(((c.reputation || 3) + (opt.rep || 0)) * 100) / 100));
  c.morale = Math.max(0, Math.min(100, (c.morale ?? 70) + (opt.morale || 0)));
  if (opt.stock) c.stock = (c.stock || 0) + opt.stock;
  if (opt.rooms) { c.rooms = (c.rooms || 0) + opt.rooms; }
  if (side === "left" && m.useEnergy !== false) {
    if ((c.actionsLeft || 0) < 1) return "No energy left today — rest or end the month, then answer. ⚡";
    tickClock(c); c.actionsLeft -= 1;
  }
  c.mailResult = opt.result;
  // Accepting the church tea starts the guided first job.
  if (m.id === "church-tea" && side === "left") { try { startFirstWin(c); } catch (e) {} }
  // Done with this mail forever.
  c.mailDone = c.mailDone || {}; c.mailDone[m.id] = true;
  c.mail = (c.mail || []).filter((id) => id !== m.id);
  store.update(() => {}); sfx.good();
  return opt.result;
}
// Month-end: unread mail drifts by kindly; a new letter may arrive (max 1 waiting).
export function monthlyMail(c) {
  const notes = [];
  if ((c.mail || []).length) {
    const m = mailById(c.mail[0]);
    c.mailDone = c.mailDone || {}; c.mailDone[c.mail[0]] = true;
    c.mail = [];
    c.mailSnoozed = false;
    notes.push(`💌 You missed "${m ? m.title : "a letter"}" — no harm done, life is busy.`);
  }
  // Queue the next unseen mail, if any remain and inbox is empty.
  const next = MAILS.map((m) => m.id).find((id) => !(c.mailDone || {})[id]);
  if (next) { c.mail = [next]; c.mailResult = null; }
  return notes;
}

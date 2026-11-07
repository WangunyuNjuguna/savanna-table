// js/mail.js - swipe-style decision mail. Skippable, auto-resolves, never blocks.
// One mail at a time, answered in Kitchen. Ignored mail is noted at month-end.
import { store } from "./store.js";
import { MAILS } from "../data/mail.js";
import { sfx } from "./sound.js";
import { tickClock } from "./engine.js";

export function mailById(id) { return MAILS.find((m) => m.id === id); }

// The mail waiting for a decision (null when snoozed or none).
export function activeMail(c) {
  if (!c || !c.mail || !c.mail.length || c.mailSnoozed) return null;
  return mailById(c.mail[0]);
}

// Answer the waiting mail: "left", "right" or "later".
export function resolveMail(side) {
  const c = store.career; if (!c) return "Start a career first 🌱";
  const m = activeMail(c); if (!m) return "No mail waiting. 📭";
  if (side === "later") {
    c.mailSnoozed = true; store.update(() => {});
    return "Sawa — the mail waits till month-end. 💌";
  }
  const opt = side === "left" ? m.left : m.right;
  if (!opt) return "Hmm?";
  if ((opt.energy || 0) > 0 && (c.actionsLeft || 0) < opt.energy) {
    return "No energy left — answer after End Month. 😴";
  }
  c.cash += opt.cash || 0;
  c.monthProfit = (c.monthProfit || 0) + (opt.cash || 0);
  if (opt.rep) c.reputation = Math.max(0, Math.min(5, c.reputation + opt.rep));
  if (opt.morale) c.morale = Math.max(0, Math.min(100, c.morale + opt.morale));
  if (opt.enquiries) c.enquiries = (c.enquiries || 0) + opt.enquiries;
  if (opt.pantry) {
    try {
      c.pantry = c.pantry || {};
      for (const k of Object.keys(opt.pantry)) {
        c.pantry[k] = Math.round(((c.pantry[k] || 0) + opt.pantry[k]) * 100) / 100;
      }
    } catch (e) {}
  }
  if (opt.energy) { tickClock(c); c.actionsLeft -= opt.energy; }
  // Done with this mail forever.
  c.mailDone = c.mailDone || {}; c.mailDone[m.id] = true;
  c.mail = (c.mail || []).filter((id) => id !== m.id);
  c.mailResult = opt.result;
  store.update(() => {});
  (opt.cash || 0) >= 0 ? sfx.cash() : sfx.click();
  return opt.result;
}

// Month-end: unread mail auto-resolves (a kind "missed it" note), next mail arrives.
export function monthlyMail(c) {
  const notes = [];
  const pending = (c.mail || []).map(mailById).find(Boolean);
  if (pending) {
    notes.push(`💌 Missed mail (“${pending.subject}”): ${pending.skip}`);
    if (pending.skipRep) c.reputation = Math.max(0, c.reputation + pending.skipRep);
    c.mail = [];
  }
  c.mailSnoozed = false; c.mailResult = null;
  // Next undone mail (church-tea only arrives with a new career).
  const done = c.mailDone || {};
  if (!(c.mail || []).length && Math.random() < 0.8) {
    const next = MAILS.find((m) => !done[m.id] && m.id !== "church-tea");
    if (next) c.mail.push(next.id);
  }
  return notes;
}

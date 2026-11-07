// js/chains.js - choices echo into next month. Skippable, auto-resolving, never blocks.
// One follow-up card at a time; if ignored, it rests kindly at month-end.
import { store } from "./store.js";
import { sfx } from "./sound.js";
import { CHAINS } from "../data/chains.js";

// Which chain hangs off this dilemma + side (null = this choice echoes nothing).
export function chainFor(dilemmaId, side) {
  return CHAINS.find((x) => x.from === dilemmaId && x.side === side) || null;
}

// Remember the choice. The echo lands at the NEXT month-end (not this one).
export function startChain(dilemmaId, side) {
  const c = store.career; if (!c) return;
  const ch = chainFor(dilemmaId, side); if (!ch) return;
  c.chains = c.chains || [];
  if (c.chains.some((x) => x.id === ch.id && !x.fired)) return; // no double-arming
  c.chains.push({ id: ch.id, from: dilemmaId, side, armedMonth: (c.year - 1) * 12 + (c.month || 1), fired: false });
}

// The follow-up waiting for a decision (null when nothing is waiting).
export function pendingChain(c) {
  const p = c && c.chainPending; if (!p) return null;
  const ch = CHAINS.find((x) => x.id === p.id); if (!ch || !ch.follow) return null;
  return { chain: ch, follow: ch.follow };
}

// Answer (or skip) the follow-up. Returns a one-line result for the card.
export function resolveChain(optionId) {
  const c = store.career; if (!c) return "Start a career first 🌱";
  const p = c.chainPending; if (!p) return "Nothing waiting — enjoy the quiet. 💛";
  const ch = CHAINS.find((x) => x.id === p.id);
  c.chainPending = null;
  if (optionId === "skip" || !ch || !ch.follow) {
    store.update(() => {});
    return "You let it rest — no harm done. 💛";
  }
  const opt = ch.follow.options.find((o) => o.id === optionId);
  if (!opt) return "Hmm?";
  const cost = Math.abs(Math.min(0, opt.cash || 0));
  if (cost > c.cash) { c.chainPending = p; return `Need KSh ${cost.toLocaleString()} for that — try the other road. 💛`; }
  c.cash += opt.cash || 0;
  c.monthProfit = (c.monthProfit || 0) + (opt.cash || 0);
  if (opt.rep) c.reputation = Math.max(0, Math.min(5, (c.reputation || 3) + opt.rep));
  if (opt.morale) c.morale = Math.min(100, Math.max(0, (c.morale ?? 70) + opt.morale));
  if (opt.enquiries) c.enquiries = (c.enquiries || 0) + opt.enquiries;
  store.update(() => {});
  (opt.cash || 0) >= 0 ? sfx.cash() : sfx.click();
  return opt.result;
}

// Month-end: an ignored follow-up rests kindly, then this month's echoes land.
export function monthlyChains(c) {
  const notes = [];
  const now = (c.year - 1) * 12 + (c.month || 1);
  if (c.chainPending) {
    const old = CHAINS.find((x) => x.id === c.chainPending.id);
    c.chainPending = null;
    notes.push(`💛 “${(old && old.follow && old.follow.title) || "That decision"}” rested unanswered — no harm done, life is busy.`);
  }
  c.chains = c.chains || [];
  let nextCard = null;
  for (const e of c.chains) {
    if (e.fired || now <= e.armedMonth) continue;
    const ch = CHAINS.find((x) => x.id === e.id);
    e.fired = true;
    if (!ch) continue;
    const fx = ch.effects || {};
    if (fx.cash) { c.cash += fx.cash; c.monthProfit = (c.monthProfit || 0) + fx.cash; }
    if (fx.rep) c.reputation = Math.max(0, Math.min(5, (c.reputation || 3) + fx.rep));
    if (fx.morale) c.morale = Math.min(100, Math.max(0, (c.morale ?? 70) + fx.morale));
    if (fx.enquiries) c.enquiries = (c.enquiries || 0) + fx.enquiries;
    const money = fx.cash ? ` (${fx.cash > 0 ? "+" : ""}KSh ${Math.abs(Math.round(fx.cash)).toLocaleString()})` : "";
    notes.push(`🔗 ${ch.title} — ${ch.text}${money}`);
    if (ch.follow && !nextCard) nextCard = ch;
  }
  if (nextCard) c.chainPending = { id: nextCard.id };
  return notes;
}

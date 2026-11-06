// js/pantry.js - metric pantry (kg/L/m/pcs) + hotel rooms + credit card autopay.
// Manual buying first, supplier contracts automate later (debited to credit card).
import { store } from "./store.js";
import { SUPPLIES, PER_GUEST, PER_ROOM_MONTH, ROOMS_BY_UPGRADE, ROOM_RATE, CONTRACTS } from "../data/pantry.js";
import { sfx } from "./sound.js";
import { tickClock } from "./engine.js";
const ksh = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");

export const sup = (id) => SUPPLIES.find((s) => s.id === id);
export function ensurePantry(c) {
  c.pantry = c.pantry || {};           // {rice: kg, milk: L, ...}
  c.pantryAge = c.pantryAge || {};    // months each stock has sat (spoilage)
  c.rooms = c.rooms ?? 0; c.occupancy = c.occupancy ?? 0;
  c.staffBy = c.staffBy || { cooks: 0, waiters: 0, cleaners: 0, reception: 0, manager: 0 };
  c.contracts = c.contracts || [];     // e.g. ["staples"]
  c.card = c.card || { limit: 100000, used: 0 }; // credit card in KSh
  c.cookStyle = c.cookStyle || "exact";
  if (typeof c.staff === "number" && c.staff > 0 && !c.staffBy.cooks) { c.staffBy.cooks = c.staff; }
  return c;
}
// Rooms from owned upgrades.
export function syncRooms(c) {
  let r = 0;
  for (const u of (c.upgradesOwned || [])) r = Math.max(r, ROOMS_BY_UPGRADE[u] || 0);
  c.rooms = r; return r;
}
// Buy supplies in metric units (manual, 1 action for a basket).
export function buySupply(id, qty) {
  const c = ensurePantry(store.career); if (!c) return "Start a career first 🌱";
  const s = sup(id); if (!s) return "Unknown item.";
  if (c.actionsLeft <= 0) return "No energy left — End Month. 😴";
  const cost = Math.round(s.price * qty);
  if (c.cash < cost) return `Need ${ksh(cost)} for ${qty} ${s.unit} ${s.name}. Cook a gig first! 💪`;
  c.cash -= cost; c.pantry[id] = Math.round(((c.pantry[id] || 0) + qty) * 100) / 100;
  c.pantryAge[id] = 0; tickClock(c); c.actionsLeft -= 1;
  c.monthProfit = (c.monthProfit || 0) - cost;
  store.update(() => {}); sfx.cash();
  return `Bought ${qty} ${s.unit} ${s.name} for ${ksh(cost)}. 🧺`;
}
// How much a gig for G guests needs (scaled by cook style).
export function gigNeeds(guests, style = "exact") {
  const mult = style === "generous" ? 1.25 : style === "scant" ? 0.8 : 1;
  const out = {};
  for (const k of Object.keys(PER_GUEST)) out[k] = Math.round(PER_GUEST[k] * guests * mult * 100) / 100;
  return out;
}
// What is missing for these needs? Auto-contracts fill gaps via credit card (+10%).
export function missingFor(needs) {
  const c = ensurePantry(store.career);
  const missing = {};
  for (const k of Object.keys(needs)) {
    const have = c.pantry[k] || 0, want = needs[k];
    if (have < want) {
      const gap = Math.round((want - have) * 100) / 100;
      const covered = c.contracts.some((ct) => CONTRACTS.find((x) => x.id === ct)?.covers.includes(k));
      missing[k] = { gap, auto: covered };
    }
  }
  return missing;
}
// Cook a catering gig: exact / generous (+taste, waste) / scant (saves, risks review).
export function cookGig(guests, style) {
  const c = ensurePantry(store.career);
  if (c.actionsLeft <= 0) return "No energy left — End Month. 😴";
  const needs = gigNeeds(guests, style);
  const missing = missingFor(needs);
  // Auto-fill contract gaps on the credit card.
  let cardTop = 0;
  for (const k of Object.keys(missing)) {
    if (missing[k].auto) {
      const s = sup(k), cost = Math.round(s.price * missing[k].gap * 1.1);
      if (c.card.used + cost <= c.card.limit) {
        c.card.used += cost; cardTop += cost;
        c.pantry[k] = (c.pantry[k] || 0) + missing[k].gap;
        delete missing[k];
      }
    }
  }
  const stillMissing = Object.keys(missing);
  tickClock(c); c.actionsLeft -= 1;
  // Not enough food -> shortfall: sad guests, rep hit (too LITTLE food lesson).
  if (stillMissing.length) {
    const s = sup(stillMissing[0]);
    c.reputation = Math.max(0, c.reputation - 0.15);
    store.update(() => {}); sfx.bad();
    return `Too LITTLE food! 😟 Ran out of ${s.name} for ${guests} guests. Rep -0.15. Buy ${s.unit} in Market (${stillMissing.map((k) => `${missing[k].gap} ${sup(k).unit} ${k}`).join(", ")}) or sign a supplier contract.`;
  }
  // Consume.
  for (const k of Object.keys(needs)) c.pantry[k] = Math.round(((c.pantry[k] || 0) - needs[k]) * 100) / 100;
  const revenue = guests * 1200, foodCost = guests * (style === "scant" ? 560 : style === "generous" ? 880 : 700);
  let profit = Math.round((revenue - foodCost) * (0.9 + c.skill / 80) * (0.85 + c.reputation / 10));
  let note = "";
  if (style === "generous") { profit = Math.round(profit * 0.9); c.reputation = Math.min(5, c.reputation + 0.06); note = " Guests raved — but 25% extra went to waste. 🗑️"; }
  if (style === "scant") { profit = Math.round(profit * 1.1); c.reputation = Math.max(0, c.reputation - 0.03); note = " Portions looked thin — one review said so. ⚖️"; }
  c.cash += Math.round(profit * 0.5); c.balanceDue = (c.balanceDue || 0) + Math.round(profit * 0.5);
  c.monthProfit = (c.monthProfit || 0) + profit; c.skill += 1;
  c.cookStyle = style;
  store.update(() => {}); sfx.cash();
  return `Fed ${guests} guests (${style})! +${ksh(profit)} value, deposit banked.${cardTop ? ` Card auto-bought shortfall ${ksh(cardTop)}. 💳` : ""}${note}`;
}
// Meet a supplier (1 action): unlocks auto-delivery on credit card.
export function meetSupplier(id) {
  const c = ensurePantry(store.career);
  const ct = CONTRACTS.find((x) => x.id === id);
  if (!ct) return "Unknown supplier.";
  if (c.contracts.includes(id)) return "Already delivering. ✅";
  if (c.actionsLeft <= 0) return "No energy left. 😴";
  if (c.cash < ct.fee) return `Need ${ksh(ct.fee)} introduction fee.`;
  c.cash -= ct.fee; c.contracts.push(id); tickClock(c); c.actionsLeft -= 1;
  c.monthProfit = (c.monthProfit || 0) - ct.fee;
  store.update(() => {}); sfx.good();
  return `${ct.name} shakes your hand! 🤝 ${ct.desc}. Shortfalls now auto-debit to your card (+10%).`;
}
// Run one hotel month: occupancy, income, consumption, staff effects.
export function hotelMonth(seasonMult = 1) {
  const c = ensurePantry(store.career);
  syncRooms(c);
  if (!c.rooms) return { income: 0, text: "" };
  const level = (c.upgradesOwned || []).includes("hotel") ? "hotel" : "guesthouse";
  const [lo, hi] = ROOM_RATE[level];
  const baseOcc = 0.35 + c.reputation * 0.08 + (c.staffBy.reception || 0) * 0.15 + (c.staffBy.cleaners || 0) * 0.05;
  const occ = Math.min(0.95, baseOcc * seasonMult);
  const nights = Math.round(c.rooms * 30 * occ);
  const rate = Math.round((lo + hi) / 2 * seasonMult);
  const income = nights * rate;
  // Consume monthly supplies per occupied room.
  const roomsOcc = nights / 30;
  const need = {};
  for (const k of Object.keys(PER_ROOM_MONTH)) need[k] = Math.round(PER_ROOM_MONTH[k] * roomsOcc * 100) / 100;
  let short = [];
  for (const k of Object.keys(need)) {
    const have = c.pantry[k] || 0;
    if (have < need[k]) {
      const covered = c.contracts.some((ct) => CONTRACTS.find((x) => x.id === ct)?.covers.includes(k));
      if (covered && c.card.used + 50000 < c.card.limit) {
        const cost = Math.round(sup(k).price * (need[k] - have) * 1.1);
        c.card.used += cost; c.pantry[k] = need[k];
      } else short.push(`${need[k] - have} ${sup(k).unit} ${k}`);
    }
    c.pantry[k] = Math.round(((c.pantry[k] || 0) - Math.min(c.pantry[k] || 0, need[k])) * 100) / 100;
  }
  c.cash += income; c.occupancy = Math.round(occ * 100);
  c.monthProfit = (c.monthProfit || 0) + income;
  if (short.length && !(c.staffBy.cleaners > 0)) c.reputation = Math.max(0, c.reputation - 0.05);
  return { income, text: `🏨 ${nights} room-nights @ ~${ksh(rate)} = +${ksh(income)} (${c.occupancy}% full). Used ${Object.entries(need).map(([k, v]) => `${v}${sup(k).unit} ${k}`).join(", ")}.${short.length ? ` Short: ${short.join("; ")} — guests noticed. Sign contracts!` : ""}` };
}
// Spoilage: fresh food (1-month perish) wastes if overbought (too MUCH food lesson).
export function spoilCheck() {
  const c = ensurePantry(store.career);
  let wasted = 0;
  for (const s of SUPPLIES) {
    if (s.perish <= 1 && (c.pantry[s.id] || 0) > 3) {
      const waste = Math.round(((c.pantry[s.id] || 0) - 3) * 100) / 100;
      wasted += waste * s.price; c.pantry[s.id] = 3;
    }
    c.pantryAge[s.id] = 0;
  }
  if (wasted > 0) {
    c.cash -= Math.round(wasted);
    c.monthProfit = (c.monthProfit || 0) - Math.round(wasted);
    return `🗑️ Spoilage: overbought fresh food wasted ${ksh(wasted)}. Buy beef/veg/milk in small kg/L amounts!`;
  }
  return "";
}
// Pay credit card from cash.
export function payCard(amount) {
  const c = ensurePantry(store.career);
  const pay = Math.min(amount, c.card.used, c.cash);
  if (pay <= 0) return "Nothing to pay. 💳";
  c.cash -= pay; c.card.used -= pay; store.update(() => {}); sfx.cash();
  return `Paid ${ksh(pay)} off the card. Balance ${ksh(c.card.used)} / limit ${ksh(c.card.limit)}. 💳`;
}

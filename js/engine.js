// js/engine.js - the playable heart: actions + end month + report.
// Keeps pacing: normal gains capped at 15% net worth per turn (PACING).
import { store } from "./store.js";
import { POSITIONS } from "../data/pantry.js";
import { ensurePantry, syncRooms, hotelMonth, spoilCheck } from "./pantry.js";
import { ensureStaff, wageBill, refreshApplicants, maybeStaffEvent, judgeDishes, branchMonth, lifeHappens } from "./staff.js";
import { ECONOMY, PACING } from "../data/economy.js";
import { EVENTS, SEASONS } from "../data/events.js";
import { sfx } from "./sound.js";
import { checkBadges } from "./achievements.js";

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const ksh = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");

// Net worth = cash + equipment + stock value + property - debt.
export function netWorth(c) {
  return Math.round((c.cash || 0) + (c.equipValue || 0) + (c.stock || 0) * 1500 + (c.property || 0) - (c.debt || 0));
}
// Cap any single gain to 15% of net worth (pacing rule).
function capGain(c, amount) {
  if (amount <= 0) return amount;
  const max = netWorth(c) * PACING.maxGainPerTurnPct;
  return Math.min(amount, max);
}
// Ensure a career has all fields (migration-safe).
export function ensure(c) {
  try { ensurePantry(c); } catch (e) { /* first load */ }
  try { ensureStaff(c); } catch (e) {}
  c.pantry = c.pantry || {}; c.card = c.card || { limit: 100000, used: 0 };
  c.staffBy = c.staffBy || { cooks: 0, waiters: 0, cleaners: 0, reception: 0, manager: 0 };
  // Migrate old single staff number into cooks.
  if (typeof c.staff === "number" && c.staff > 0 && !c.staffBy.cooks) c.staffBy.cooks = c.staff;
  c.actionsLeft = c.actionsLeft ?? 3;
  c.stock = c.stock ?? 2; c.equipValue = c.equipValue ?? 5000;
  c.property = c.property ?? 0; c.debt = c.debt ?? 0;
  c.rep = c.reputation; // alias guard
  c.enquiries = c.enquiries ?? 2; c.staff = c.staff ?? 0;
  c.recipes = c.recipes ?? ["Pilau", "Chapati"];
  c.regulars = c.regulars ?? {}; c.badges = c.badges ?? [];
  c.goal = c.goal ?? "Earn your first KSh 10,000 profit";
  c.report = c.report ?? null; c.sufuriaTaps = c.sufuriaTaps ?? 0;
  c.perk = c.perk ?? pick(["known for pilau 🍚", "warm smile 😊", "fast chopper 🔪", "owns 2 sufurias 🍲"]);
  return c;
}

// --- PLAYER ACTIONS (each costs 1 action point) ---
export function doAction(kind) {
  const c = store.career; if (!c || c.actionsLeft <= 0) return { ok: false, msg: "No energy left — End Month. 😴" };
  ensure(c);
  let msg = "";
  if (kind === "gig") { // weekend catering gig: needs stock
    if (c.stock < 1) return { ok: false, msg: "No stock! Buy at Market first. 🧺" };
    c.stock -= 1;
    const base = rnd(9000, 22000) * (1 + c.skill / 60) * (0.8 + c.reputation / 10);
    const profit = Math.round(capGain(c, base));
    c.cash += profit; c.skill += 1; c.reputation = Math.min(5, c.reputation + 0.03);
    c.monthProfit = (c.monthProfit || 0) + profit;
    msg = `Gig done! +${ksh(profit)}. Skill +1. 🍲`;
    sfx.cash();
  } else if (kind === "quote") {
    c.enquiries = Math.max(0, c.enquiries - 1);
    const price = Math.round(rnd(800, 1800));
    c.pendingQuote = { guests: Math.round(rnd(20, 80)), price };
    msg = `New enquiry: ${c.pendingQuote.guests} guests. Quote ${ksh(price)}/head in Catering! 📋`;
    sfx.pop();
  } else if (kind === "train") {
    c.cash -= 1500; c.skill += 3; c.morale = Math.min(100, c.morale + 5);
    c.monthProfit = (c.monthProfit || 0) - 1500;
    msg = "Training done! Skill +3, morale up. Mama Chef is proud. 💛";
    sfx.good();
  } else if (kind === "advertise") {
    const cost = 4000;
    if (c.cash < cost) return { ok: false, msg: "Not enough cash for ads. 😟" };
    c.cash -= cost; c.enquiries += 2; c.reputation = Math.min(5, c.reputation + 0.05);
    c.monthProfit = (c.monthProfit || 0) - cost;
    msg = "Radio + posters out! +2 enquiries. 📻";
    sfx.click();
  } else if (kind === "rest") {
    c.morale = Math.min(100, c.morale + 12);
    msg = "Chai break with Mama Chef. Morale +12. ☕";
    sfx.steam();
  }
  c.actionsLeft -= 1;
  store.update(() => {});
  checkBadges();
  return { ok: true, msg };
}

// Market buys (also 1 action each via doMarket).
export function buyStock(n = 1) {
  const c = store.career; if (!c || c.actionsLeft <= 0) return { ok: false, msg: "No energy left. 😴" };
  ensure(c);
  const cost = 4500 * n;
  if (c.cash < cost) return { ok: false, msg: "Pole — not enough cash. Try a gig first." };
  c.cash -= cost; c.stock += n; c.actionsLeft -= 1;
  c.monthProfit = (c.monthProfit || 0) - cost;
  store.update(() => {}); sfx.cash();
  return { ok: true, msg: `Bought ${n} stock for ${ksh(cost)}. Wise planning! 🧺` };
}

// Pitch mini-game: quote too high loses, too low loses profit.
export function answerQuote(accepted) {
  const c = store.career; ensure(c);
  const q = c.pendingQuote; if (!q) return "No active quote.";
  const fair = 1200, revenue = q.guests * (accepted ? q.price : 0);
  if (!accepted) { c.pendingQuote = null; store.update(() => {}); return "Declined kindly. Another will come. 💛"; }
  const diff = Math.abs(q.price - fair) / fair;
  if (q.price > fair * 1.5) { c.pendingQuote = null; c.reputation = Math.max(0, c.reputation - 0.05); store.update(() => {}); sfx.bad(); return "Too high — client walked away. Pole! Try near KSh 1,200/head."; }
  const cost = q.guests * 700;
  if (c.stock < 1) { return "No stock! Buy ingredients first. 🧺"; }
  c.stock -= 1;
  const profit = Math.round(capGain(c, revenue - cost));
  c.cash += Math.round(revenue * 0.5); // deposit now
  c.balanceDue = (c.balanceDue || 0) + Math.round(revenue * 0.5);
  c.monthProfit = (c.monthProfit || 0) + profit;
  c.reputation = Math.min(5, c.reputation + (diff < 0.2 ? 0.1 : 0.03));
  c.pendingQuote = null; c.enquiries += 1;
  store.update(() => {}); checkBadges(); sfx.cash();
  return `Hongera! Job booked 🎉 Deposit banked, balance ${ksh(c.balanceDue)} comes month-end.`;
}

// --- END MONTH: wages, bills, events, report ---
export function endMonth() {
  const c = store.career; if (!c) return null;
  ensure(c);
  const diff = store.settings.difficulty;
  const mult = diff === "easy" ? 0.8 : diff === "hard" ? 1.25 : 1;
  // Wages from your named crew + base bills. A manager frees your time (+1 action).
  let wages = 0;
  try { wages = wageBill(c); } catch (e) { wages = 0; }
  if (!wages && c.staffBy) { try { for (const p of POSITIONS) wages += (c.staffBy[p.id] || 0) * p.wage; } catch (e) {} }
  const bills = Math.round((ECONOMY.costs.gas + ECONOMY.costs.electricity + ECONOMY.costs.water + wages + 6000) * mult);
  c.cash -= bills;
  const hasMgr = (c.crew || []).some((m) => m.role === "manager") || (c.staffBy.manager || 0) > 0;
  c.actionsLeft = 3 + (hasMgr ? 1 : 0); // manager frees your time
  // Balances arrive (some pay late!).
  let got = c.balanceDue || 0;
  if (got > 0 && Math.random() < 0.25) { got = Math.round(got * 0.5); c.balanceDue = (c.balanceDue || 0) - got; c.lateNote = "One client paid late — balance next month. Cash flow! 💧"; }
  else { c.balanceDue = 0; c.lateNote = ""; }
  c.cash += got;
  // 1-3 events, kinder on easy / struggling streaks.
  const struggling = (c.hardMonths || 0) >= 3;
  const nEvents = 1 + Math.floor(Math.random() * (struggling ? 1 : 3));
  const log = [];
  for (let i = 0; i < nEvents; i++) {
    let e = pick(EVENTS);
    if ((diff === "easy" || struggling) && e.kind === "bad" && Math.random() < 0.5) e = pick(EVENTS.filter((x) => x.kind === "good"));
    if (e.gamble) { // auto-resolve gambles fairly with odds
      const win = Math.random() < e.gamble.odds && (c.skill >= (e.gamble.skill || 0));
      const amt = win ? e.gamble.win : -e.gamble.cost;
      c.cash += amt; log.push(`${e.title}: ${win ? `won ${ksh(amt)}! 🎉` : `lost ${ksh(-amt)}. Lesson learned. 💛`}`);
    } else {
      c.cash += e.cash || 0; c.reputation = Math.min(5, Math.max(0, c.reputation + (e.rep || 0)));
      if (e.morale) c.morale = Math.min(100, Math.max(0, c.morale + e.morale));
      if (e.stock) c.stock += e.stock;
      if (e.recipe && !c.recipes.includes(e.recipe)) c.recipes.push(e.recipe);
      log.push(`${e.title} — ${e.text}`);
    }
  }
  // Hotel rooms: occupancy income + metric supply use (milk L, linen m, soap pcs...).
  let hotelNote = "";
  try {
    const seasonMult = /Tourist|Christmas|Wedding/.test(pick(SEASONS)) ? 1.3 : 1;
    const h = hotelMonth(seasonMult);
    if (h.income) { hotelNote = h.text; log.push(h.text); }
  } catch (e) { /* hotel not ready */ }
  // Spoilage: overbought fresh food wastes (too MUCH food lesson).
  try { const s = spoilCheck(); if (s) log.push(s); } catch (e) {}
  // Credit card interest 3%/mo on unpaid auto-supply balance.
  if (c.card.used > 0) {
    const interest = Math.round(c.card.used * 0.03);
    c.card.used += interest;
    log.push(`💳 Card interest +${ksh(interest)} (balance ${ksh(c.card.used)}). Pay it in Money!`);
  }
  // People drama: a staffer may force a hard HR call (answered in Kitchen).
  try { const d = maybeStaffEvent(c); if (d) log.push(`👥 STAFF ISSUE: ${d.title} — see Kitchen to decide!`); } catch (e) {}
  // Signature dishes: tastings judged, royalties banked.
  try { for (const n of judgeDishes()) log.push(n); } catch (e) {}
  // Branches: income swings, upkeep always due.
  try { for (const n of branchMonth()) log.push(n); } catch (e) {}
  // Life happens (10%): good plans, bad luck.
  try { const m = lifeHappens(c); if (m) log.push(m); } catch (e) {}
  // Fresh applicants knock each month.
  try { refreshApplicants(c); } catch (e) {}
  // Month rollover.
  const profit = (c.monthProfit || 0) + got - bills;
  c.history.push(Math.round(c.cash));
  c.report = { month: c.month, year: c.year, profit: Math.round(profit), bills, got, events: log, season: pick(SEASONS), netWorth: netWorth(c) };
  c.monthProfit = 0; c.enquiries += 1;
  c.month++;
  if (c.month > 12) { c.month = 1; c.year++; c.yearReview = true; }
  // Adaptive: track hard months.
  c.hardMonths = profit < 0 ? (c.hardMonths || 0) + 1 : 0;
  // Next goal (always 1-3 turns away).
  c.goal = nextGoal(c);
  // Fresh start if broke (never game over).
  if (c.cash < 0) {
    c.lessons = (c.lessons || 0) + 1;
    c.report.broke = true;
    c.cash = 80000 + c.lessons * 5000; c.debt = 0; c.morale = 70;
    c.report.lesson = "One bad month can't stop you. Smaller gigs, buy less stock, ask deposits first. — Mama Chef 💛";
  }
  if (netWorth(c) >= PACING.millionNetWorth && !c.badges.includes("million")) { c.badges.push("million"); c.report.million = true; }
  store.update(() => {}); checkBadges(); sfx.win();
  return c.report;
}

function nextGoal(c) {
  const w = netWorth(c);
  if (!c.badges.includes("profit10k")) return "Earn your first KSh 10,000 profit";
  if (c.reputation < 4) return "Reach 4.0 ⭐ reputation for better clients";
  if (w < 300000) return "Grow net worth to KSh 300,000 (buy equipment)";
  if (w < 1000000) return "Chase the KSh 1M milestone — hotel arc next! 🏨";
  if (!c.property) return "Save for a van or restaurant space 🚐";
  return "Win Best Small Hotel award 🏆";
}

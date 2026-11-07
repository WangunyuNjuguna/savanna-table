// js/choices.js - resolves hard choices. Bold can exceed the 15% cap (rare + risky).
// Safe almost never fails. Both paths teach: easy money now vs strong later.
import { store } from "./store.js";
import { DILEMMAS } from "../data/choices.js";
import { sfx } from "./sound.js";
import { tickClock } from "./engine.js";
import { startChain } from "./chains.js";

export function currentDilemma() {
  const c = store.career; if (!c) return null;
  // One dilemma per month, cycling by month+year so it feels fresh.
  const idx = ((c.year - 1) * 12 + (c.month - 1)) % DILEMMAS.length;
  const d = DILEMMAS[idx];
  if (c["done_" + d.id + "_" + c.year + "_" + c.month]) return null;
  return d;
}

export function resolveChoice(dilemmaId, side) {
  const c = store.career; if (!c) return "Start a career first 🌱";
  const d = DILEMMAS.find((x) => x.id === dilemmaId); if (!d) return "Hmm?";
  const opt = side === "bold" ? d.bold : d.safe;
  c["done_" + d.id + "_" + c.year + "_" + c.month] = true;
  tickClock(c); // deciding takes time: the clock moves

  // Track style: safe streak vs bold streak (used for lessons + loans).
  c.safeStreak = side === "safe" ? (c.safeStreak || 0) + 1 : 0;
  c.boldStreak = side === "bold" ? (c.boldStreak || 0) + 1 : 0;

  let out = "";
  if (opt.gamble) {
    const skilledEnough = c.skill >= (opt.gamble.skill || 0);
    const win = skilledEnough && Math.random() < opt.gamble.odds;
    const amt = win ? opt.gamble.win : opt.gamble.lose; // bold CAN exceed cap
    c.cash += amt;
    c.monthProfit = (c.monthProfit || 0) + amt;
    c.reputation = Math.max(0, Math.min(5, c.reputation + (win ? 0.15 : -0.1)));
    out = win
      ? `BOLD paid off! +KSh ${amt.toLocaleString()} 🎉 Mama Chef dances!`
      : `Bold move stumbled: ${amt.toLocaleString()}. Lesson: ${(opt.gamble.skill ? `train skill to ${opt.gamble.skill}+ first` : "keep a cash cushion")}. Pole — you survive this. 💛`;
    win ? sfx.win() : sfx.bad();
    if (!win) c.hardMonths = (c.hardMonths || 0) + 0.5;
  } else {
    c.cash += opt.cash || 0;
    c.monthProfit = (c.monthProfit || 0) + (opt.cash || 0);
    if (opt.rep) c.reputation = Math.max(0, Math.min(5, c.reputation + opt.rep));
    if (opt.morale) c.morale = Math.min(100, c.morale + opt.morale);
    if (opt.skill) c.skill += opt.skill;
    if (opt.equip) c.equipValue = (c.equipValue || 0) + opt.equip;
    if (opt.debt) c.debt = (c.debt || 0) + opt.debt;
    if (opt.staff) { c.staffBy = c.staffBy || {}; c.staffBy.cooks = (c.staffBy.cooks || 0) + opt.staff; if (!c.badges.includes("firstHire")) c.badges.push("firstHire"); }
    out = side === "safe"
      ? `Safe road: steady. ${opt.desc}. 💧 (Safe streak: ${c.safeStreak} — lenders trust you.)`
      : `Bold road: spicy! ${opt.desc}. 🔥 (Bold streak: ${c.boldStreak} — big wins, big lessons.)`;
    side === "safe" ? sfx.click() : sfx.cash();
  }
  // Quiet teaching line after 3 same-style picks.
  if (c.safeStreak === 3) out += " Mama Chef whispers: “Steady is strong — but one bold step a year grows you faster.”";
  if (c.boldStreak === 3) out += " Mama Chef whispers: “Brave heart! Bank one safe month to catch your breath.”";
  startChain(d.id, side); // this choice echoes next month
  store.update(() => {});
  return out;
}

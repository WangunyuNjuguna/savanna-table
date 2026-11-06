// js/minigames.js - 3 tiny brain-teasers. Instant feedback, real lessons.
import { store } from "./store.js";
import { sfx } from "./sound.js";

// 1. Costing puzzle: pick a price for target margin.
export function costingQuiz(cost, targetPct = 40) {
  // Fair price = cost / (1 - margin). Round to nice 50s.
  const fair = Math.round(cost / (1 - targetPct / 100) / 50) * 50;
  return { cost, targetPct, fair, hint: `Cost ${cost}. For ${targetPct}% margin: price = cost ÷ ${(1 - targetPct / 100).toFixed(2)} ≈ ${fair}.` };
}
export function answerCosting(guess, fair) {
  const c = store.career;
  const close = Math.abs(guess - fair) / fair < 0.1;
  if (close && c) { c.skill += 2; c.cash += 1000; store.update(() => {}); sfx.good(); return "Hongera! Perfect costing — profit protected. +skill, +KSh 1,000 🎉"; }
  sfx.bad(); return `Close! Fair was ~${fair}. Rule: price = cost ÷ (1 − margin). Try again 💛`;
}
// 2. Capacity puzzle: cooks + sufurias for N guests on time?
export function capacityQuiz(guests = 120) {
  const cooks = Math.ceil(guests / 40), pots = Math.ceil(guests / 30);
  return { guests, cooks, pots, hint: "Rule of thumb: 1 cook per 40 guests, 1 big sufuria per 30." };
}
// 3. Menu planner combos (hidden discovery boosts satisfaction).
export const SECRET_COMBOS = {
  "Pilau+Kachumbari": "Classic coast pairing! Satisfaction +20%. 🥗",
  "Chapati+Madondo": "Student favourite — cheap, filling, loved. 🫘",
  "Biriyani+Passion juice": "Wedding magic. Clients pay 10% more. 💒",
  "Ugali+Fish+Greens": "Luo lakeside plate. Regulars adore it. 🐟"
};
export function tryCombo(a, b) {
  const key1 = `${a}+${b}`, key2 = `${b}+${a}`;
  const found = SECRET_COMBOS[key1] || SECRET_COMBOS[key2];
  const c = store.career;
  if (found && c && !c.recipes.includes(key1)) {
    c.recipes.push(key1); c.reputation = Math.min(5, c.reputation + 0.05);
    store.update(() => {}); sfx.win(); return "✨ NEW COMBO! " + found + " Saved in Chef's Notebook.";
  }
  return found || "Tasty, but not a secret combo. Try pilau + kachumbari… 👀";
}

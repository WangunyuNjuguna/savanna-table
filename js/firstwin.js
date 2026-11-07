// js/firstwin.js - the guided first job (church tea). Skippable, never blocks.
// Stage buy -> cook -> done. Ignored for 2 month-ends, Mama Chef closes it kindly.
// Imports data only, so any module can use it without import cycles.
import { PER_GUEST } from "../data/pantry.js";
import { FIRST_WIN } from "../data/firstwin.js";

// What a 30-guest exact job needs, in metric units.
export function needsForFirstWin() {
  const out = {};
  for (const k of Object.keys(PER_GUEST)) out[k] = Math.round(PER_GUEST[k] * FIRST_WIN.guests * 100) / 100;
  return out;
}
// Gaps in the pantry for that job: { rice: { gap, unit }, ... }.
export function missingForFirstWin(c) {
  const need = needsForFirstWin(), p = (c && c.pantry) || {}, miss = {};
  for (const k of Object.keys(need)) {
    if ((p[k] || 0) < need[k]) miss[k] = { gap: Math.round((need[k] - (p[k] || 0)) * 100) / 100, unit: FIRST_WIN.units[k] || "kg" };
  }
  return miss;
}
// Active quest or null (done / closed / never started).
export function questStage(c) {
  if (!c || !c.firstWin) return null;
  if (c.firstWin.stage === "done" || c.firstWin.stage === "closed") return null;
  return c.firstWin;
}
// The single next step for the guide bar, or null.
export function questStep(c) {
  const q = questStage(c); if (!q) return null;
  if (q.stage === "buy") return { text: FIRST_WIN.buyStep, tab: "market" };
  return { text: FIRST_WIN.cookStep, tab: "kitchen" };
}
// Accepting the church-tea mail starts the story.
export function startFirstWin(c) {
  if (!c || c.firstWin) return;
  c.firstWin = { stage: "buy", months: 0 };
}
// After buying: pantry ready? Advance to the cook step. True when it advances.
export function checkFirstWinPantry(c) {
  const q = questStage(c); if (!q || q.stage !== "buy") return false;
  if (Object.keys(missingForFirstWin(c)).length === 0) { q.stage = "cook"; return true; }
  return false;
}
// After a successful 30+-guest cook: badge, gift, graduation, celebration.
export function completeFirstWinCook(c, guests) {
  const q = questStage(c); if (!q) return "";
  if (q.stage === "buy") {
    if (Object.keys(missingForFirstWin(c)).length > 0) return "";
    q.stage = "cook";
  }
  if (q.stage !== "cook" || guests < FIRST_WIN.guests) return "";
  q.stage = "done";
  c.graduated = true;
  c.badges = c.badges || [];
  if (!c.badges.includes("firstWin")) c.badges.push("firstWin");
  c.cash += FIRST_WIN.rewardCash;
  c.monthProfit = (c.monthProfit || 0) + FIRST_WIN.rewardCash;
  c.celebrateFirstWin = true;
  return ` ${FIRST_WIN.completeText}`;
}
// Month-end: count quiet months; close kindly if ignored (no penalty, no ramp).
export function monthlyFirstWin(c) {
  const q = questStage(c); if (!q) return [];
  q.months = (q.months || 0) + 1;
  if (q.months >= FIRST_WIN.skipAfterMonths) {
    q.stage = "closed";
    return [FIRST_WIN.skipText];
  }
  return [];
}

// js/debug-simulate.js - DEBUG ONLY, not loaded by the game.
// Phase 3 + 5 will fill this in. Run with: node js/debug-simulate.js
// It must report average years to 1M NET WORTH for 3 play styles.
//
// Wanted output example:
//   cautious: 6.2y | balanced: 4.8y | aggressive: 4.1y (with X busts)
// Tune data/economy.js PACING until skilled ~= year 4, cautious ~= year 6+.
import { ECONOMY, PACING } from "../data/economy.js";

// TODO (Phase 3): replace random walk with the real monthly engine.
function oneCareer(style) {
  let worth = 200000, months = 0;
  const push = { cautious: 0.025, balanced: 0.035, aggressive: 0.043 }[style] || 0.035;
  while (worth < PACING.millionNetWorth && months < 12 * 15) {
    months++;
    // Friction demo: gains shrink as worth grows (diminishing returns).
    const gain = Math.min(PACING.maxGainPerTurnPct, push * (1 - worth / 12000000));
    worth *= 1 + gain * (0.7 + Math.random() * 0.6);
    if (Math.random() < 0.05) worth *= 0.95; // odd bad month
  }
  return months / 12;
}

const styles = ["cautious", "balanced", "aggressive"];
for (const s of styles) {
  let total = 0, n = 50;
  for (let i = 0; i < n; i++) total += oneCareer(s);
  console.log(`${s}: avg ${(total / n).toFixed(1)} years to 1M (PACING target: skilled ~${PACING.skilledYearsTo1M}y, cautious ~${PACING.cautiousYearsTo1M}y)`);
}
console.log("Note: stub numbers only. Real engine lands in Phase 3. Tune in data/economy.js.");

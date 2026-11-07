// js/achievements.js - badge cabinet. Tiny checks, big smiles.
import { store } from "./store.js";
export const BADGES = {
  firstCash: ["First Cash 💵", "Earned your first shilling"],
  teamFed: ["Team Fed 🍲", "Cooked your first 50-guest job"],
  networker: ["Networker 🤝", "Signed your first supplier contract"],
  boss: ["Boss 👔", "Hired your first employee"],
  profit10k: ["Profit Maker 📈", "Made KSh 10,000 profit in a month"],
  hotelier: ["Hotelier 🏨", "Opened your first rooms"],
  branches: ["Growing 🌱", "Opened a second branch"],
  nightOwl: ["Night Owl 🌙", "Found the secret night market"],
  firstWin: ["First Win 🥇", "Served the guided church-tea job"],
  survivor: ["Survivor 💪", "Survived a hard month"],
};
export function checkBadges() {
  const c = store.career; if (!c || c.badges?.includes("boss") && c.badges?.length >= 10) return [];
  const give = (id) => { if (!c.badges.includes(id)) { c.badges.push(id); return id; } return null; };
  const out = [];
  const push = (id) => { const g = give(id); if (g) out.push(g); };
  if (c.cash >= 5000) push("firstCash");
  if (c.contracts.length > 0) push("networker");
  if ((c.staff || 0) > 0 || (c.crew || []).length > 0) push("boss");
  if (c.rooms > 0) push("hotelier");
  if ((c.branches || []).length > 0) push("branches");
  if (c.hardMonths > 0) push("survivor");
  if (c.monthProfit >= 10000) push("profit10k");
  if (c.sufuriaTaps >= 5) push("goldenPot");
  if (c.firstWin?.stage === "done") push("firstWin");
  return out;
}

// js/achievements.js - badges, including secret ones. Generous + visible.
import { store } from "./store.js";

export const BADGES = {
  profit10k: ["First Profit 🎉", "Made KSh 10,000 profit in a month"],
  fiveStar: ["Five-Star Review ⭐", "Hit 4.5 reputation"],
  firstHire: ["First Hire 🤝", "Hired your first staff"],
  fullyBooked: ["Fully Booked 📅", "Had 4+ enquiries at once"],
  million: ["Million Milestone 💎", "Reached KSh 1M net worth!"],
  recipeHunter: ["Recipe Hunter 📜", "Found 5 recipes"],
  nightOwl: ["Night Owl 🌙", "Found the secret night market"],
  firstWin: ["First Win 🥇", "Served the guided church-tea job"],
  goldenPot: ["Golden Sufuria ✨", "Tapped the pot 5 times"],
  rivalFriend: ["Rival Friend 🤝", "Shook hands with Mama Njeri"],
  survivor: ["Fresh Start 🌱", "Bounced back from a hard month"]
};

export function checkBadges() {
  const c = store.career; if (!c) return [];
  c.badges = c.badges || [];
  const newly = [];
  const give = (id) => { if (!c.badges.includes(id)) { c.badges.push(id); newly.push(id); } };
  if ((c.monthProfit || 0) >= 10000 || (c.report?.profit || 0) >= 10000) give("profit10k");
  if (c.reputation >= 4.5) give("fiveStar");
  if (c.staff >= 1) give("firstHire");
  if (c.enquiries >= 4) give("fullyBooked");
  if ((c.recipes || []).length >= 5) give("recipeHunter");
  if (c.sufuriaTaps >= 5) give("goldenPot");
  if (c.firstWin?.stage === "done") give("firstWin");
  if (newly.length) store.update(() => {});
  return newly;
}

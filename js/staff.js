// js/staff.js - hiring AND firing, flawed humans, signature dishes, branches.
// Nobody is perfect. Even safe choices can end in tears — and lessons.
import { store } from "./store.js";
import { FIRST_NAMES, FLAWS, STAFF_DILEMMAS, DISH_BASES, DISH_TWISTS, BRANCHES, MISHAPS } from "../data/staff.js";
import { sfx } from "./sound.js";
import { tickClock } from "./engine.js";
const ksh = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");
const rnd = (a, b) => a + Math.random() * (b - a);
const pickW = (arr) => { // weighted pick by .w
  const t = arr.reduce((s, x) => s + (x.w || 1), 0);
  let r = Math.random() * t;
  for (const x of arr) { r -= (x.w || 1); if (r <= 0) return x; }
  return arr[0];
};
export function ensureStaff(c) {
  c.crew = c.crew || [];
  // One-time migration: old headcounts become named (mostly steady) crew.
  if (!c.crewMigrated) {
    c.crewMigrated = true;
    const roles = [];
    const sb = c.staffBy || {};
    for (const role of Object.keys(sb)) for (let i = 0; i < (sb[role] || 0); i++) roles.push(role);
    roles.forEach((role, i) => c.crew.push(makeMember(role, i < 2 ? 3 : 2, "none")));
  }
  c.applicants = c.applicants || [];
  c.dishes = c.dishes || [];
  c.branches = c.branches || [];
  c.pendingStaff = c.pendingStaff || null;
  return c;
}
export function roleWage(role) {
  return { cooks: 18000, waiters: 12000, cleaners: 10000, reception: 15000, manager: 35000 }[role] || 12000;
}
export function makeMember(role, skill, flawId) {
  const flaw = FLAWS.find((f) => f.id === flawId) || pickW(FLAWS);
  return {
    id: "m" + Date.now() + Math.floor(Math.random() * 9999),
    name: pickW(FIRST_NAMES.map((n) => ({ n, w: 1 }))).n || FIRST_NAMES[0],
    role, skill: Math.max(1, Math.min(5, skill)),
    flaw: flaw.id, wage: Math.round(roleWage(role) * rnd(0.85, 1.3)), mood: 70
  };
}
// 3 fresh applicants each month. Sometimes the pool is just... lousy. Sorry. 💛
export function refreshApplicants(c) {
  const used = new Set([...(c.crew || []).map((m) => m.name)]);
  c.applicants = [0, 1, 2].map(() => {
    const lousy = Math.random() < 0.35; // 1 in 3 months: thin pool
    const role = ["cooks", "waiters", "cleaners", "reception", "manager"][Math.floor(Math.random() * 5)];
    let m = makeMember(role, lousy ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 4), "none");
    let guard = 0; // unique names on the door
    while (used.has(m.name) && guard++ < 12) m.name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    used.add(m.name);
    return m;
  });
}
// Hire: 1 action + KSh 3,000 signing. True flaw revealed after the trial month!
export function hireApplicant(id) {
  const c = ensureStaff(store.career); if (!c) return "Start a career first 🌱";
  const i = c.applicants.findIndex((a) => a.id === id);
  if (i < 0) return "Already hired or gone.";
  if (c.actionsLeft <= 0) return "No energy left — End Month. 😴";
  if (c.cash < 3000) return "Need KSh 3,000 signing bonus.";
  const a = c.applicants.splice(i, 1)[0];
  a.flaw = pickW(FLAWS).id; // trial month reveals the truth...
  a.mood = 80; c.cash -= 3000; tickClock(c); c.actionsLeft -= 1;
  c.monthProfit = (c.monthProfit || 0) - 3000;
  c.crew.push(a);
  if (!c.badges.includes("firstHire")) c.badges.push("firstHire");
  store.update(() => {}); sfx.good();
  const fl = FLAWS.find((f) => f.id === a.flaw);
  return `Karibu, ${a.name}! ${roleName(a.role)}, skill ${a.skill}/5, ${ksh(a.wage)}/mo. Trial reveals: ${fl.label} — ${fl.desc}`;
}
// Fire: severance half a month wage, morale -8 (team feels it). Firing a drunk star earns respect.
export function fireMember(id) {
  const c = ensureStaff(store.career);
  const i = c.crew.findIndex((m) => m.id === id);
  if (i < 0) return "Not found.";
  const m = c.crew.splice(i, 1)[0];
  const sev = Math.round(m.wage / 2);
  c.cash -= sev; c.morale = Math.max(0, (c.morale || 70) - 8);
  if (m.flaw === "drinks" && m.skill >= 4) { c.reputation = Math.min(5, c.reputation + 0.05); }
  c.monthProfit = (c.monthProfit || 0) - sev;
  store.update(() => {}); sfx.bad();
  return `${m.name} is gone. Severance ${ksh(sev)}, morale -8. ${m.skill >= 4 ? "The team respects the standard you set. 💛" : "Pole — hiring never gets easy."}`;
}
export function roleName(r) { return { cooks: "Cook 👩🏾‍🍳", waiters: "Waiter 🧑🏾‍💼", cleaners: "Cleaner 🧹", reception: "Reception 🛎️", manager: "Manager 📋" }[r] || r; }
export function flawLabel(id) { const f = FLAWS.find((x) => x.id === id); return f ? f.label : id; }
export function wageBill(c) { return (c.crew || []).reduce((s, m) => s + m.wage, 0); }
// Monthly: maybe a staffer forces a hard HR call (35%, more crew = more drama).
export function maybeStaffEvent(c) {
  if ((c.crew || []).length === 0 || c.pendingStaff) return null;
  if (Math.random() > 0.25 + (c.crew || []).length * 0.03) return null;
  const star = [...c.crew].sort((a, b) => b.skill - a.skill)[0];
  let d;
  if (star && star.skill >= 4 && Math.random() < 0.45) {
    d = JSON.parse(JSON.stringify(STAFF_DILEMMAS[0])); // the drunk-star script
    d.starId = star.id; d.starName = star.name; d.starRole = roleName(star.role);
    d.title = `🍺 ${star.name} (your BEST ${star.role}, skill ${star.skill}) came in drunk`;
  } else d = JSON.parse(JSON.stringify(STAFF_DILEMMAS[1 + Math.floor(Math.random() * (STAFF_DILEMMAS.length - 1))]));
  // bind a random staffer as the subject
  const subj = star || c.crew[Math.floor(Math.random() * c.crew.length)];
  d.subjId = subj?.id; d.subjName = subj?.name;
  c.pendingStaff = d;
  return d;
}
// Resolve an HR option. Returns the story of what happened.
export function resolveStaff(optIdx) {
  const c = ensureStaff(store.career);
  const d = c.pendingStaff; if (!d) return "No pending issue.";
  const opt = d.options[optIdx]; if (!opt) return "Hmm?";
  const subj = c.crew.find((m) => m.id === (d.starId || d.subjId));
  let out = "";
  if (opt.fire && subj) { // fired on the spot
    c.crew = c.crew.filter((m) => m.id !== subj.id);
    c.cash -= Math.round(subj.wage / 2);
    c.morale = Math.max(0, c.morale - 10); c.reputation = Math.min(5, c.reputation + 0.08);
    out = `You fired ${subj.name}. The room went quiet — then the team stood taller. Morale -10 now, discipline +rep. Hiring pool is lousy, but standards are standards. 💛`;
    sfx.bad();
  } else if (opt.leave && subj) {
    c.crew = c.crew.filter((m) => m.id !== subj.id);
    c.reputation = Math.min(5, c.reputation + 0.05); c.morale = Math.max(0, c.morale - 5);
    out = `${subj.name} left with a hug and a reference. Short-staffed, proud. Rep +0.05. 🤝`;
  } else if (opt.raise && subj) {
    subj.wage = Math.round(subj.wage * 1.3); subj.mood = 90;
    c.morale = Math.min(100, c.morale + 8);
    out = `You paid ${subj.name} +30% (${ksh(subj.wage)}/mo). She stays — and tells the team you look after stars. Others will ask soon. 💛`;
    sfx.cash();
  } else if (opt.gamble) {
    const win = Math.random() < opt.gamble.odds;
    c.cash += opt.cash || 0;
    if (win) {
      if (opt.gamble.skill && subj) { subj.skill = Math.min(5, subj.skill + opt.gamble.skill); subj.mood = 90; }
      c.reputation = Math.min(5, c.reputation + (opt.gamble.winRep || 0));
      out = `It WORKED. 🎉 ${d.id === "drunk-star" ? subj?.name + " is sober 3 months and cooking the best pilau of his life." : "The gamble paid off — this time."}`;
      sfx.good();
    } else {
      c.reputation = Math.max(0, c.reputation + (opt.gamble.loseRep || -0.1));
      if (opt.gamble.loseStaff && subj) { c.crew = c.crew.filter((m) => m.id !== subj.id); out = `It backfired. 😞 ${subj.name} is gone — ${d.id === "raise-threat" ? "now plating for Mama Njeri." : "the course certificate hangs in a rival kitchen."} Rep ${opt.gamble.loseRep}. Pole — you decided well, luck didn't.`; }
      else if (opt.gamble.moraleRisk) { c.morale = Math.max(0, c.morale - 15); out = `Wrong call. An innocent ${subj?.role} quit in tears. Morale -15. You apologised properly — that matters. 💛`; }
      else out = `It backfired. 😞 Rep ${opt.gamble.loseRep}. You made a reasonable call and the dice disagreed — that's management. Pole. 💛`;
      sfx.bad();
    }
    if (opt.skill && subj && win) subj.skill = Math.min(5, subj.skill + opt.skill);
  } else {
    c.cash += opt.cash || 0; c.morale = Math.min(100, Math.max(0, c.morale + (opt.morale || 0)));
    c.reputation = Math.min(5, Math.max(0, c.reputation + (opt.rep || 0)));
    if (opt.skill && subj) subj.skill = Math.min(5, subj.skill + opt.skill);
    out = `Handled. ${opt.label}: steady hands. ${opt.risk ? `But the risk clock ticks (${Math.round(opt.risk * 100)}% scandal later)…` : "The team noticed your calm. 💛"}`;
    sfx.click();
  }
  if (opt.risk && Math.random() < opt.risk) { // covered-up scandal erupts later
    c.reputation = Math.max(0, c.reputation - 0.2);
    out += ` And then… the cover-up leaked. A client posted about it. Rep -0.2. Honesty is cheaper, Mama Chef sighs. 😞`;
  }
  c.pendingStaff = null;
  store.update(() => {});
  return out;
}
// ---- Signature dishes: invent, taste (KSh 8,000), find out if the world loves it.
export function createDish(name, base, twist) {
  const c = ensureStaff(store.career);
  if (!name || name.length < 2) return "Give your dish a name first! 📝";
  if (c.cash < 8000) return "Tastings cost KSh 8,000. Cook a gig first! 💪";
  if (c.actionsLeft <= 0) return "No energy left. 😴";
  c.cash -= 8000; tickClock(c); c.actionsLeft -= 1;
  c.monthProfit = (c.monthProfit || 0) - 8000;
  const dish = { id: "d" + Date.now(), name: name.slice(0, 24), base, twist, status: "tasting", royalty: 0, monthsLeft: 0 };
  c.dishes.push(dish);
  store.update(() => {}); sfx.pop();
  return `"${dish.name}" (${base} + ${twist}) goes to tasting! Results after End Month… 🤞`;
}
// Resolved at month-end: skill + rep help, but luck rules. Even great dishes flop ~25%.
export function judgeDishes() {
  const c = ensureStaff(store.career);
  const notes = [];
  for (const d of c.dishes.filter((x) => x.status === "tasting")) {
    const score = (c.skill || 10) * 0.045 + (c.reputation || 3) * 0.09 + Math.random() * 0.45;
    if (score > 0.78) {
      d.status = "hit"; d.royalty = Math.round(rnd(3000, 8000)); d.monthsLeft = 12;
      c.reputation = Math.min(5, c.reputation + 0.2);
      notes.push(`🌍 GLOBAL HIT! "${d.name}" is the talk of Nairobi! +${ksh(d.royalty)}/mo for a year, rep +0.2!`);
    } else if (score > 0.55) {
      d.status = "local"; d.royalty = Math.round(rnd(800, 2500)); d.monthsLeft = 6;
      notes.push(`💛 "${d.name}" is a quiet local favourite. +${ksh(d.royalty)}/mo for 6 months. Regulars adore it.`);
    } else {
      d.status = "flop"; c.reputation = Math.max(0, c.reputation - 0.08);
      notes.push(`😞 "${d.name}" flopped. Tasters were polite; nobody reordered. -rep 0.08, -KSh 8,000. Even Mama Chef has a flop story — the lesson is free. 💛`);
    }
  }
  // collect royalties
  let roy = 0;
  for (const d of c.dishes.filter((x) => (x.monthsLeft || 0) > 0 && x.status !== "flop")) {
    roy += d.royalty; d.monthsLeft -= 1;
  }
  if (roy > 0) { c.cash += roy; c.monthProfit = (c.monthProfit || 0) + roy; notes.push(`🎵 Dish royalties banked: +${ksh(roy)}. (Your hits keep paying!)`); }
  return notes;
}
// ---- Branches: costly, hungry, glorious. Need a manager on site or they bleed.
export function buyBranch(id) {
  const c = ensureStaff(store.career);
  const b = BRANCHES.find((x) => x.id === id); if (!b) return "Unknown branch.";
  if (c.branches.find((x) => x.id === id)) return "Already yours! ✅";
  if (!(c.upgradesOwned || []).includes(b.need)) return `Needs your ${b.need} first. Grow step by step. 🌱`;
  if (c.cash < b.cost) return `Need ${ksh(b.cost)}. This is the hard part — save, borrow, partner. 💪`;
  if (c.actionsLeft <= 0) return "No energy left. 😴";
  c.cash -= b.cost; c.actionsLeft -= 1;
  c.property += Math.round(b.cost * 0.6);
  c.branches.push({ id: b.id, months: 0 });
  store.update(() => {}); sfx.win();
  return `🎊 ${b.name} is YOURS! Upkeep ${ksh(b.upkeep)}/mo. Post a manager or it will bleed — no joke.`;
}
// Monthly branch ledger: income swings, upkeep always due. No manager = 50% bad month.
export function branchMonth() {
  const c = ensureStaff(store.career);
  const notes = [];
  const hasMgr = (c.crew || []).some((m) => m.role === "manager");
  for (const br of c.branches) {
    const b = BRANCHES.find((x) => x.id === br.id);
    br.months += 1;
    c.cash -= b.upkeep;
    let income = Math.round(rnd(b.income[0], b.income[1]) * (0.8 + c.reputation / 10));
    if (!hasMgr && Math.random() < 0.5) { income = Math.round(income * 0.3); notes.push(`😖 ${b.name}: no manager on site — staff argued, customers left. Upkeep ${ksh(b.upkeep)} due, only ${ksh(income)} in. POST A MANAGER.`); }
    else notes.push(`🏪 ${b.name}: +${ksh(income)} in, -${ksh(b.upkeep)} upkeep = ${income - b.upkeep >= 0 ? "+" : ""}${ksh(income - b.upkeep)}.`);
    c.cash += income;
    c.monthProfit = (c.monthProfit || 0) + income - b.upkeep;
  }
  return notes;
}
// Life happens roll (10%): good plans, bad luck.
export function lifeHappens(c) {
  if (Math.random() > 0.10) return "";
  const m = MISHAPS[Math.floor(Math.random() * MISHAPS.length)];
  c.cash += m.cash || 0;
  if (m.morale) c.morale = Math.max(0, c.morale + m.morale);
  if (m.rep) c.reputation = Math.max(0, Math.min(5, c.reputation + m.rep));
  c.monthProfit = (c.monthProfit || 0) + (m.cash || 0);
  return `${m.text} You did everything right — and life still happened. Pole. 💛`;
}

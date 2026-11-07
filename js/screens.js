// js/screens.js - all 5 tabs, fully playable. One screen at a time (small DOM).
import { store } from "./store.js";
import { ksh, netWorth, doAction, buyStock, answerQuote, endMonth, clockText, nextStep } from "./engine.js";
import { LADDER } from "../data/upgrades.js";
import { costingQuiz, answerCosting, capacityQuiz, tryCombo } from "./minigames.js";
import { BADGES } from "./achievements.js";
import { sfx } from "./sound.js";
import { currentDilemma, resolveChoice } from "./choices.js";
import { activeMail, resolveMail } from "./mail.js";
import { questStage, missingForFirstWin } from "./firstwin.js";
import { FIRST_WIN } from "../data/firstwin.js";
import { pendingChain, resolveChain } from "./chains.js";
import { potScene, hotelScene, marketScene, cateringScene, worthBar } from "./art.js";
import { ensurePantry, gigNeeds, cookGig, buySupply, meetSupplier, payCard, syncRooms } from "./pantry.js";
import { ensureStaff, hireApplicant, fireMember, resolveStaff, createDish, buyBranch, roleName, flawLabel } from "./staff.js";
import { DISH_BASES, DISH_TWISTS, BRANCHES } from "../data/staff.js";
import { SUPPLIES, CONTRACTS, POSITIONS } from "../data/pantry.js";

const el = (html) => { const t = document.createElement("div"); t.innerHTML = html.trim(); return t.firstElementChild; };
const goEnd = () => import("./router.js").then((m) => m.go(m.currentScreen()));

export function renderScreen(name) {
  if (name === "kitchen") return kitchen();
  if (name === "hotel") return hotel();
  if (name === "catering") return catering();
  if (name === "money") return money();
  return market();
}
function msgBar(c) {
  const s = nextStep(c);
  return `<div class="guidebar"><span>${clockText(c)} · ⚡${c.actionsLeft}</span><span>👉 Now: <b>${s.text}</b></span><button class="btn primary" data-goto="${s.tab}" style="min-height:44px">Go ➡️</button></div>
  <p class="hint">🎯 Goal: <b>${c.goal}</b> · ✨ ${c.perk}</p>`;
}

// KITCHEN: dashboard + actions + month report + hidden pot game.
function kitchen() {
  const c = store.career;
  if (!c) return el(`<section class="card"><h2>Start a career 🌱</h2><p>Pick a slot below, then come back. Mama Chef is waiting!</p></section>`);
  const bars = c.history.slice(-12).map((v) => `<i style="height:${10 + Math.min(80, v / 9000)}px"></i>`).join("");
  const card = el(`<section class="card">
    <h2>🍲 Kitchen — Month ${c.month}, Year ${c.year}</h2>
    ${potScene(c.skill)}${worthBar(netWorth(c))}
    ${msgBar(c)}
    <div id="mailbox">${mailCardHtml(c)}</div>
    <div id="quest">${questCardHtml(c)}</div>
    <div id="chain">${chainCardHtml(c)}</div>
    <div class="grid2">
      <div class="kpi"><small>Cash</small><b>${ksh(c.cash)}</b></div>
      <div class="kpi"><small>Net worth</small><b>${ksh(netWorth(c))}</b></div>
      <div class="kpi"><small>Reputation ⭐</small><b>${c.reputation.toFixed(1)} / 5</b></div>
      <div class="kpi"><small>Skill · Morale · Stock</small><b>${c.skill} · ${c.morale} · 🧺${c.stock}</b></div>
    </div>
    <div id="dilemma">${dilemmaHtml(c)}</div>
    <div id="staffdilemma">${staffCardHtml(c)}</div>
    <h3>🔥 Cook a catering job (metric recipe!)</h3>
    <p class="hint">Needs per guest: 150 g rice · 120 g flour · 30 ml oil · 120 g beef · 100 g veg. Too LITTLE = sad guests. Too MUCH (generous) = waste.</p>
    <div class="row"><label>Guests <select id="guests">${[20, 50, 120, 200].map((g) => `<option>${g}</option>`).join("")}</select></label></div>
    <div class="row">
      <button class="btn primary" data-cook="exact">Cook exact ⚖️</button>
      <button class="btn secondary" data-cook="generous">Generous +25% 😋</button>
      <button class="btn secondary" data-cook="scant">Scant −20% ⚠️</button>
    </div>
    <p class="hint">Pantry: ${pantryLine(c)}</p>
    <h3>🧑🏾‍🍳 Today's work (each costs 1 ⚡)</h3>
    <div class="row">
      <button class="btn secondary" data-a="quote">📋 Find client</button>
      <button class="btn secondary" data-a="train">📚 Train</button>
      <button class="btn secondary" data-a="advertise">📻 Advertise</button>
      <button class="btn secondary" data-a="rest">☕ Rest</button>
    </div>
    <div class="row"><button class="btn primary" data-a="endmonth" style="flex:1">➡️ End Month (report!)</button></div>
    <p id="kmsg" class="hint"></p>
    <details class="fold"><summary>📊 Cash journey (last 12 months)</summary><div class="bars">${bars}</div></details>
    <h3>Month-end report</h3><div id="report">${reportHtml(c)}</div>
    <div class="steam" id="pot" role="button" tabindex="0" aria-label="Tap the sufuria (secret?)">🍲 <i>♨</i><i>♨</i><i>♨</i> <small>(psst… tap the pot 👀)</small></div>
  </section>`);
  card.querySelectorAll("[data-a]").forEach((b) => (b.onclick = () => {
    sfx.click();
    const kind = b.dataset.a;
    if (kind === "endmonth") {
      const r = endMonth();
      window.dispatchEvent(new CustomEvent("toast", { detail: r.broke ? "Fresh Start 🌱 — small boost, big lesson." : `Month ${r.month} done: ${r.profit >= 0 ? "+" : ""}${ksh(r.profit)}` }));
      goEnd(); return;
    }
    const res = doAction(kind);
    card.querySelector("#kmsg").textContent = res.msg;
    setTimeout(goEnd, 600);
  }));
  // Hidden: tap pot 5x = Golden Sufuria badge + gift.
  const pot = card.querySelector("#pot");
  const tap = () => {
    c.sufuriaTaps = (c.sufuriaTaps || 0) + 1; sfx.pop();
    if (c.sufuriaTaps === 5) {
      c.cash += 5000; if (!c.badges.includes("goldenPot")) c.badges.push("goldenPot");
      store.update(() => {});
      window.dispatchEvent(new CustomEvent("toast", { detail: "✨ Golden Sufuria! +KSh 5,000 from Mama Chef!" }));
      goEnd();
    } else card.querySelector("#kmsg").textContent = `The pot wobbles… (${c.sufuriaTaps}/5) 🍲`;
  };
  pot.onclick = tap; pot.onkeydown = (e) => { if (e.key === "Enter") tap(); };
  // HR decisions: no perfect answer. Both roads cost something.
  card.querySelectorAll("[data-staff-opt]").forEach((b) => (b.onclick = () => {
    card.querySelector("#kmsg").textContent = resolveStaff(+b.dataset.staffOpt);
    setTimeout(goEnd, 1600);
  }));
  // Mail decisions: tap a side, or swipe the card. "Later" snoozes till month-end.
  card.querySelectorAll("[data-mail-pick]").forEach((b) => (b.onclick = () => {
    card.querySelector("#kmsg").textContent = resolveMail(b.dataset.mailPick);
    setTimeout(goEnd, 1400);
  }));
  const mailOk = card.querySelector("[data-mail-ok]");
  if (mailOk) mailOk.onclick = () => { c.mailResult = null; store.update(() => {}); goEnd(); };
  const mc = card.querySelector("#mailcard");
  if (mc) {
    let sx = 0;
    mc.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    mc.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 60) {
        card.querySelector("#kmsg").textContent = resolveMail(dx < 0 ? "left" : "right");
        setTimeout(goEnd, 1400);
      }
    }, { passive: true });
  }
  // Choice echoes: last month's decision returns as a small follow-up. Skippable.
  card.querySelectorAll("[data-chain-pick]").forEach((b) => (b.onclick = () => {
    card.querySelector("#kmsg").textContent = resolveChain(b.dataset.chainPick);
    setTimeout(goEnd, 1400);
  }));
  // Cook buttons: metric catering jobs (exact / generous / scant).
  card.querySelectorAll("[data-cook]").forEach((b) => (b.onclick = () => {
    const g = +(card.querySelector("#guests")?.value || 50);
    card.querySelector("#kmsg").textContent = cookGig(g, b.dataset.cook);
    setTimeout(goEnd, 1400);
  }));
  // Hard choice buttons (safe vs bold).
  card.querySelectorAll("[data-choice]").forEach((b) => (b.onclick = () => {
    const out = resolveChoice(b.dataset.d, b.dataset.choice);
    card.querySelector("#kmsg").textContent = out;
    setTimeout(goEnd, 1200);
  }));
  return card;
}
  // Hard-choice card: safe road (slow, never fails) vs bold road (fast, risky). Honest odds.
function dilemmaHtml(c) {
  const d = currentDilemma();
  if (!d) return "";
  return `<div class="slot active" style="border-color:var(--amber)"><span>⚖️</span><div style="flex:1">
    <strong>Hard choice: ${d.title}</strong><br><small>${d.text}</small>
    <div class="row">
      <button class="btn secondary" data-d="${d.id}" data-choice="safe" style="flex:1">💧 ${d.safe.label}<br><small>${d.safe.desc}</small></button>
      <button class="btn primary" data-d="${d.id}" data-choice="bold" style="flex:1">🔥 ${d.bold.label}<br><small>${d.bold.desc}</small></button>
    </div></div></div>`;
}
// Decision mail card: 2 choices with visible effects, a helper hint, swipe or tap.
function mailCardHtml(c) {
  try {
    const m = activeMail(c);
    const done = !m && c.mailResult
      ? `<div class="slot active"><span>💌</span><div style="flex:1"><strong>${c.mailResult}</strong></div><button class="btn secondary" data-mail-ok style="min-height:44px">Sawa</button></div>`
      : "";
    if (!m) return done;
    const prev = (o) => o.preview.map((p) => `<small>${p}</small>`).join("<br>");
    return `${done}<div class="mailcard" id="mailcard" role="dialog" aria-label="Mail needing a decision">
      <div class="mailhead"><span>💌</span><div><strong>${m.subject}</strong><br><small>from ${m.from}</small></div></div>
      <p>${m.body}</p>
      <p class="hint">🤝 ${m.note}</p>
      <div class="mailchoices">
        <button class="btn secondary" data-mail-pick="left">👈 ${m.left.label}<br>${prev(m.left)}</button>
        <button class="btn primary" data-mail-pick="right">${m.right.label} 👉<br>${prev(m.right)}</button>
      </div>
      <div class="row"><button class="linklike" data-mail-pick="later" style="flex:1">Decide later</button></div>
      <p class="hint">Tip: you can also swipe this card left or right 👆</p>
    </div>`;
  } catch (e) { return ""; }
}
// First-win quest card: the guided church-tea job, step by step.
function questCardHtml(c) {
  try {
    const q = questStage(c);
    if (!q) return "";
    if (q.stage === "buy") {
      const miss = missingForFirstWin(c);
      const list = Object.keys(miss).map((k) => `${miss[k].gap}${miss[k].unit} ${k}`).join(" · ");
      return `<div class="slot active"><span>🌟</span><div style="flex:1"><strong>First job: church tea for ${FIRST_WIN.guests}</strong><br><small>Step 1/2 — buy: ${list} (Market 🧺)</small></div></div>`;
    }
    return `<div class="slot active"><span>🌟</span><div style="flex:1"><strong>First job: church tea for ${FIRST_WIN.guests}</strong><br><small>Step 2/2 — cook ${FIRST_WIN.guests}+ guests here in Kitchen. Mama Chef believes! 🍲</small></div></div>`;
  } catch (e) { return ""; }
}
// Choice echo: last month's decision comes back. Two roads, one primary, skippable.
function chainCardHtml(c) {
  try {
    const p = pendingChain(c);
    if (!p) return "";
    const opts = p.follow.options.map((o) =>
      `<button class="btn ${o.primary ? "primary" : "secondary"}" data-chain-pick="${o.id}" style="flex:1">${o.label}<br><small>${o.desc}</small></button>`).join("");
    return `<div class="slot active"><span>🔗</span><div style="flex:1">
      <strong>${p.follow.title}</strong><br><small>${p.follow.text}</small>
      <div class="row">${opts}</div>
      <button class="linklike" data-chain-pick="skip">Not now — let it rest</button>
    </div></div>`;
  } catch (e) { return ""; }
}
function reportHtml(c) {
  const r = c.report; if (!r) return `<p class="hint">No report yet — press End Month. Your animated P&L appears here. 🧾</p>`;
  return `<div class="slot pop"><span>${r.profit >= 0 ? "📈" : "📉"}</span><div>
    <strong>M${r.month} Y${r.year}: ${r.profit >= 0 ? "+" : ""}${ksh(r.profit)}</strong><br>
    <small>Bills ${ksh(r.bills)} · Collected ${ksh(r.got)} · Worth ${ksh(r.netWorth)} · ${r.season}</small><br>
    <small>${r.events.slice(0, 2).join("<br>")}</small>
    ${r.million ? "<br><b>💎 1M MILESTONE! Hotel arc unlocked in Hotel tab!</b>" : ""}
    ${r.broke ? `<br><b>🌱 Fresh Start:</b> ${r.lesson}` : ""}${c.lateNote ? `<br><small>💧 ${c.lateNote}</small>` : ""}</div></div>`;
}

// CATERING: quotes + pitch mini-game + staff + costing quiz.
function catering() {
  const c = store.career;
  if (!c) return el(`<section class="card"><h2>Catering</h2><p>Start a career first 🌱</p></section>`);
  const q = c.pendingQuote;
  const card = el(`<section class="card"><h2>🎪 Catering</h2>${cateringScene(c.enquiries)}${msgBar(c)}
    <div class="slot"><span>📋</span><div><strong>${c.enquiries} enquiries waiting</strong><br><small>Deposits first, balances month-end. Some pay late — that's cash flow!</small></div></div>
    ${q ? `<div class="slot active"><span>💬</span><div><strong>${q.guests} guests @ ${ksh(q.price)}/head = ${ksh(q.guests * q.price)}</strong><br><small>Too high loses the job, too low loses profit. Fair ≈ KSh 1,200/head.</small></div></div>
    <div class="row"><button class="btn primary" id="q-yes">Accept ✅</button><button class="btn secondary" id="q-no">Decline kindly</button></div>` : `<div class="row"><button class="btn primary" id="q-new">Find a client (1⚡)</button></div>`}
    <p id="cmsg" class="hint"></p>
    <details class="fold"><summary>🧮 Costing puzzle (win skill + cash)</summary>
    <p class="hint">Cost KSh 700/head. What price gives 40% margin?</p>
    <div class="row"><button class="btn secondary" data-p="900">900</button><button class="btn secondary" data-p="1170">1,170</button><button class="btn secondary" data-p="1500">1,500</button></div></details>
    <h3>👨🏾‍🍳 Cooks (${(c.staffBy?.cooks || 0)}) — hire in Hotel tab 👥</h3>
    <p class="hint">Big events need cooks (40 guests each) + waiters. Hire by position in Hotel — wages due monthly!</p>
    <details class="fold"><summary>🧪 Secret combos (Chef's Notebook: ${c.recipes.length} found)</summary>
    <h3 style="display:none">combos</h3>
    <div class="row"><select id="combo-a" aria-label="Dish A">${["Pilau", "Chapati", "Biriyani", "Ugali", "Fish", "Beans"].map((d) => `<option>${d}</option>`).join("")}</select>
    <select id="combo-b" aria-label="Dish B">${["Kachumbari", "Madondo", "Passion juice", "Greens", "Fish", "Ugali"].map((d) => `<option>${d}</option>`).join("")}</select>
    <button class="btn secondary" id="combo-go">Taste test 👀</button></div></details>
    <h3>🌍 Signature dish lab (global hit or flop?)</h3>
    <p class="hint">Invent it, pay KSh 8,000 tasting, find out after End Month. Skill + rep help — but even great dishes flop ~25%. Hits pay royalties for a year!</p>
    <div class="row"><input id="dish-name" placeholder="Dish name…" maxlength="24" style="flex:1;min-height:44px;border-radius:10px;border:1px solid var(--line);padding:8px" />
    <select id="dish-base">${DISH_BASES.map((d) => `<option>${d}</option>`).join("")}</select>
    <select id="dish-twist">${DISH_TWISTS.map((d) => `<option>${d}</option>`).join("")}</select>
    <button class="btn primary" id="dish-go">Launch 🤞</button></div>
    ${(c.dishes || []).map((d) => `<div class="slot${d.status === "hit" ? " active" : ""}"><span>${d.status === "hit" ? "🌍" : d.status === "flop" ? "😞" : d.status === "local" ? "💛" : "🤞"}</span><div><strong>"${d.name}"</strong> (${d.base} + ${d.twist})<br><small>${d.status === "tasting" ? "tasting… results after End Month" : d.status + (d.monthsLeft > 0 ? ` · +${ksh(d.royalty)}/mo × ${d.monthsLeft} mo left` : "")}</small></div></div>`).join("")}
  </section>`);
  const say = (t) => (card.querySelector("#cmsg").textContent = t);
  card.querySelector("#q-new") && (card.querySelector("#q-new").onclick = () => { say(doAction("quote").msg); setTimeout(goEnd, 700); });
  card.querySelector("#q-yes") && (card.querySelector("#q-yes").onclick = () => { say(answerQuote(true)); setTimeout(goEnd, 900); });
  card.querySelector("#q-no") && (card.querySelector("#q-no").onclick = () => { say(answerQuote(false)); setTimeout(goEnd, 700); });
  card.querySelectorAll("[data-p]").forEach((b) => (b.onclick = () => { say(answerCosting(+b.dataset.p, costingQuiz(700).fair)); }));
  card.querySelector("#combo-go").onclick = () => {
    say(tryCombo(card.querySelector("#combo-a").value, card.querySelector("#combo-b").value));
  };
  card.querySelector("#dish-go").onclick = () => {
    say(createDish(card.querySelector("#dish-name").value.trim(), card.querySelector("#dish-base").value, card.querySelector("#dish-twist").value));
    setTimeout(goEnd, 1200);
  };
  return card;
}

// HOTEL: ladder + buy upgrades + hotel arc after 1M.
function hotel() {
  const c = store.career;
  const worth = c ? netWorth(c) : 0;
  const unlocked1M = worth >= 1000000 || (c?.badges || []).includes("million");
  const steps = LADDER.map((s) => {
    const owned = c?.upgradesOwned?.includes(s.id);
    return `<div class="slot${owned ? " active" : ""}"><span>${owned ? "✅" : "🔒"}</span>
      <div style="flex:1"><strong>${s.name}</strong><br><small>${s.blurb} — ${s.cost ? ksh(s.cost) : "start here"}</small></div>
      ${!owned && c ? `<button class="btn secondary" data-buy="${s.id}" style="min-height:44px">Buy</button>` : ""}</div>`;
  }).join("");
  if (c) { try { ensurePantry(c); syncRooms(c); } catch (e) {} }
  const team = c ? ((c.crew || []).map((m) =>
    `<div class="slot${m.skill >= 4 ? " active" : ""}"><span>${m.role === "cooks" ? "👩🏾‍🍳" : m.role === "manager" ? "📋" : "👤"}</span>
    <div style="flex:1"><strong>${m.name} — ${roleName(m.role)} · skill ${m.skill}/5</strong><br><small>${flawLabel(m.flaw)} · ${ksh(m.wage)}/mo · mood ${m.mood}</small></div>
    <button class="btn danger" data-fire="${m.id}" style="min-height:44px">Fire</button></div>`).join("") || "<p class='hint'>No team yet — just you and Mama Chef. Applicants knock each month. 💛</p>") : "";
  const apps = c ? ((c.applicants || []).map((a) =>
    `<div class="slot"><span>🚪</span><div style="flex:1"><strong>${a.name} — ${roleName(a.role)} · skill ${a.skill}/5</strong><br><small>Wants ${ksh(a.wage)}/mo + KSh 3,000 signing. Flaw revealed after trial… 👀</small></div>
    <button class="btn secondary" data-app-hire="${a.id}" style="min-height:44px">Hire</button></div>`).join("") || "<p class='hint'>No knocks this month.</p>") : "";
  const card = el(`<section class="card"><h2>🏨 Hotel + staff</h2>
    <p class="hint">Rooms: <b>${c?.rooms || 0}</b> · last occupancy <b>${(c && c.occupancy) || 0}%</b> · worth ${ksh(worth)} ${unlocked1M ? "· 💎 arc OPEN!" : "· arc at KSh 1M."}</p>
    <p class="hint">Each occupied room eats monthly: 20 L milk · 8 kg flour · 0.5 m linen · 40 pcs soap. Cleaners + reception lift occupancy. Card auto-buys shortfalls if contracted. 💳</p>
    ${hotelScene(c?.upgradesOwned || ["home"])}    ${c ? steps : "<p>Start a career first 🌱</p>"}
    <h3>👥 Your team (wages due monthly, on time!)</h3>${team}
    <h3>🚪 Applicants (pool is sometimes lousy — sorry! 💛)</h3>${apps}
    <p class="hint">Contracts: ${(c?.contracts || []).length ? c.contracts.join(", ") + " ✅ auto-delivering" : "none yet — meet suppliers in Market 🤝"} · Card: ${ksh(c?.card.used || 0)} / ${ksh(c?.card.limit || 100000)}</p>
    <p id="hmsg" class="hint"></p>
    ${unlocked1M ? `<div class="slot pop"><span>🏨</span><div><strong>Boutique hotel arc</strong><br><small>Rooms KSh 2,500–8,000/night. Save KSh 3–8M in phases: restaurant → guesthouse → hotel + garden. Loans + partners help.</small></div></div>` : ""}
    <details class="fold"><summary><b>🏪 Branches</b> (glorious… and hungry — tap to open)</summary>
    <p class="hint">Upkeep is due EVERY month, good or bad. No manager on site = half the income. Expand only when the core prints cash.</p>
    ${c ? BRANCHES.map((b) => {
      const owned = (c.branches || []).find((x) => x.id === b.id);
      return `<div class="slot${owned ? " active" : ""}"><span>${owned ? "✅" : "🏪"}</span>
      <div style="flex:1"><strong>${b.name}${owned ? ` · ${owned.months} mo old` : ""}</strong><br><small>${b.desc} Cost ${ksh(b.cost)} · upkeep ${ksh(b.upkeep)}/mo · takes ~${ksh(b.income[0])}–${ksh(b.income[1])}</small></div>
      ${!owned ? `<button class="btn secondary" data-branch="${b.id}" style="min-height:44px">Open</button>` : ""}</div>`;
    }).join("") : ""}</details>
  </section>`);
  card.querySelectorAll("[data-buy]").forEach((b) => (b.onclick = () => {
    const s = LADDER.find((x) => x.id === b.dataset.buy);
    if (c.cash < s.cost) { card.querySelector("#hmsg").textContent = `Need ${ksh(s.cost)}. Pole — save a bit more! 💪`; sfx.bad(); return; }
    c.cash -= s.cost; c.equipValue += Math.round(s.cost * 0.7); c.upgradesOwned.push(s.id);
    if (s.id === "team") { c.staffBy = c.staffBy || {}; c.staffBy.cooks = (c.staffBy.cooks || 0) + 1; c.staffBy.waiters = (c.staffBy.waiters || 0) + 1; }
    if (s.id === "restaurant") c.property += 800000;
    if (s.id === "guesthouse") c.property += 1500000;
    if (s.id === "hotel") c.property += 4000000;
    store.update(() => {}); sfx.win();
    card.querySelector("#hmsg").textContent = `Hongera! ${s.name} is yours! 🎉`;
    setTimeout(goEnd, 800);
  }));
  card.querySelectorAll("[data-app-hire]").forEach((b) => (b.onclick = () => {
    card.querySelector("#hmsg").textContent = hireApplicant(b.dataset.appHire);
    setTimeout(goEnd, 1200);
  }));
  card.querySelectorAll("[data-fire]").forEach((b) => (b.onclick = () => {
    if (!confirm("Fire this person? Severance + morale hit. No take-backs!")) return;
    card.querySelector("#hmsg").textContent = fireMember(b.dataset.fire);
    setTimeout(goEnd, 1200);
  }));
  card.querySelectorAll("[data-branch]").forEach((b) => (b.onclick = () => {
    if (!confirm("Open this branch? Huge cost + monthly upkeep, even in bad months. Sure?")) return;
    card.querySelector("#hmsg").textContent = buyBranch(b.dataset.branch);
    setTimeout(goEnd, 1200);
  }));
  return card;
}

// MONEY: cash flow, runway, loans, badges, notebook.
function money() {
  const c = store.career;
  if (!c) return el(`<section class="card"><h2>Money</h2><p>Start a career first 🌱</p></section>`);
  let wageBill = 0;
  try { for (const p of POSITIONS) wageBill += ((c.staffBy && c.staffBy[p.id]) || 0) * p.wage; } catch (e) {}
  const monthlyBurn = 25000 + wageBill;
  const runway = Math.max(0, Math.round(c.cash / Math.max(1, monthlyBurn)));
  const worth = netWorth(c);
  const badges = (c.badges || []).map((id) => `<div class="slot"><span>🏅</span><div><strong>${BADGES[id]?.[0] || id}</strong><br><small>${BADGES[id]?.[1] || ""}</small></div></div>`).join("") || "<p class='hint'>No badges yet — your first profit earns one! 🎉</p>";
  const card = el(`<section class="card"><h2>💰 Money</h2>
    <p class="hint">Game estimates, not tax or legal advice.</p>
    <div class="grid2">
      <div class="kpi"><small>Cash</small><b>${ksh(c.cash)}</b></div>
      <div class="kpi"><small>Net worth</small><b>${ksh(worth)}</b></div>
      <div class="kpi"><small>Debt</small><b>${ksh(c.debt)}</b></div>
      <div class="kpi"><small>Runway</small><b>~${runway} months</b></div>
    </div>
    <p class="hint">Break-even ≈ ${ksh(monthlyBurn)}/mo · Margin this month: ${c.report ? Math.round((c.report.profit / Math.max(1, c.report.got + 20000)) * 100) : 0}% · Balances due: ${ksh(c.balanceDue)}</p>
    <div class="row"><button class="btn secondary" id="loan">🤝 Chama loan KSh 50k (8%)</button></div>
    <h3>💳 Credit card (auto-supply debits)</h3>
    <p class="hint">Balance ${ksh(c.card.used)} / limit ${ksh(c.card.limit)} · 3%/mo interest. Auto-top-ups appear here.</p>
    <div class="row"><button class="btn secondary" id="paycard">Pay KSh 10,000</button></div>
    <p id="mmsg" class="hint"></p><details class="fold"><summary>🏅 Badges (${(c.badges || []).length}) — tap to view</summary>${badges}</details>
    <details class="fold"><summary>📓 Chef's Notebook (${c.recipes.length}) — tap to view</summary><p class="hint">${c.recipes.join(" · ")}</p></details></section>`);
  card.querySelector("#loan").onclick = () => {
    c.cash += 50000; c.debt += 54000; store.update(() => {}); sfx.cash();
    card.querySelector("#mmsg").textContent = "Chama loan in! True cost: pay KSh 54,000. Debts must be repaid — wages on time! 🤝";
  };
  card.querySelector("#paycard").onclick = () => {
    card.querySelector("#mmsg").textContent = payCard(10000); setTimeout(goEnd, 800);
  };
  return card;
}

// HR crisis card: your people need a decision. Suggestions included, consequences real.
function staffCardHtml(c) {
  const d = c.pendingStaff;
  if (!d) return "";
  const who = d.starName || d.subjName;
  const sug = d.id === "drunk-star"
    ? `Mama Chef whispers: “${who} is your best by numbers — but the team copies what you tolerate. A warning is kind; a second chance needs a WITNESS and a +1 skill promise.”`
    : d.id === "raise-threat"
    ? `Mama Chef whispers: “Counter with a title + half the raise + a bonus tied to reviews. Stars stay for growth, not just cash.”`
    : `Mama Chef whispers: “Slow down. Write the facts, talk privately, decide once. Reversals kill trust faster than mistakes.”`;
  return `<div class="slot active" style="border-color:#a33"><span>👥</span><div style="flex:1">
    <strong>HR crisis: ${d.title}</strong><br><small>${d.text}</small><br>
    <small><i>${sug}</i></small>
    <div class="row">${d.options.map((o, i) => `<button class="btn ${i === 0 ? "primary" : "secondary"}" data-staff-opt="${i}" style="flex:1">${o.label}<br><small>${o.desc}</small></button>`).join("")}</div></div></div>`;
}
// One-line pantry readout in kg / L / m / pcs.
function pantryLine(c) {
  try { ensurePantry(c); } catch (e) {}
  const p = c.pantry || {};
  return SUPPLIES.map((s) => `${(p[s.id] || 0)}${s.unit} ${s.id}`).join(" · ");
}
// MARKET: buy stock, capacity quiz, regulars, night-market secret.
function market() {
  const c = store.career;
  if (!c) return el(`<section class="card"><h2>Market</h2><p>Start a career first 🌱</p></section>`);
  const cap = capacityQuiz(120);
  ensurePantry(c);
  const shop = SUPPLIES.map((s) =>
    `<div class="slot"><span>${s.id === "linen" ? "🛏️" : s.id === "soap" ? "🧼" : s.id === "milk" ? "🥛" : s.id === "beef" ? "🥩" : s.id === "gas" ? "🧯" : "🧺"}</span>
    <div style="flex:1"><strong>${s.name} — ${ksh(s.price)}/${s.unit}</strong><br><small>Have ${(c.pantry[s.id] || 0)} ${s.unit} · ${s.note}</small></div>
    <button class="btn secondary" data-buy="${s.id}" style="min-height:44px">+1 ${s.unit}</button></div>`).join("");
  const deals = CONTRACTS.map((t) =>
    `<div class="slot${c.contracts.includes(t.id) ? " active" : ""}"><span>🤝</span>
    <div style="flex:1"><strong>${t.name}${c.contracts.includes(t.id) ? " ✅ auto" : ""}</strong><br><small>${t.desc} · fee ${ksh(t.fee)} · shortfalls debit card +10%</small></div>
    ${c.contracts.includes(t.id) ? "" : `<button class="btn secondary" data-deal="${t.id}" style="min-height:44px">Meet</button>`}</div>`).join("");
  const card = el(`<section class="card"><h2>🛍️ Soko Market</h2>${marketScene(2)}${msgBar(c)}
    <p class="hint">Buy daily in small kg / L amounts at first — beef, veg & milk spoil! Meet suppliers to automate (card auto-debit 💳).</p>
    ${shop}
    <h3>🤝 Supplier contracts (automation)</h3>${deals}
    <p id="smsg" class="hint"></p>
    <details class="fold"><summary>🧮 Capacity quiz: 120 guests, how many cooks?</summary>
    <div class="row"><button class="btn secondary" data-cc="2">2 cooks</button><button class="btn secondary" data-cc="3">3 cooks</button><button class="btn secondary" data-cc="5">5 cooks</button></div></details>
    <h3>💛 Regulars (remember their dish!)</h3>
    <div class="slot"><span>👵</span><div><strong>Auntie Wanjiku — loves Pilau</strong><br><small>Tap to serve her favourite (+loyalty, +tip)</small></div><button class="btn secondary" id="reg" style="min-height:44px">Serve 🍚</button></div>
    <p class="hint">🌙 Rumour: something happens at the market after midnight… (tap Soko prices 3 times?)</p>
    <div class="slot" id="soko" role="button" tabindex="0"><span>🧺</span><div><strong>Soko prices</strong><br><small>Tap 3× to sneak to the night market…</small></div></div>
  </section>`);
  const say = (t) => (card.querySelector("#smsg").textContent = t);
  card.querySelectorAll("[data-buy]").forEach((b) => (b.onclick = () => { say(buySupply(b.dataset.buy, 1)); setTimeout(goEnd, 800); }));
  card.querySelectorAll("[data-deal]").forEach((b) => (b.onclick = () => { say(meetSupplier(b.dataset.deal)); setTimeout(goEnd, 1000); }));
  card.querySelectorAll("[data-cc]").forEach((b) => (b.onclick = () => {
    const ok = +b.dataset.cc === cap.cooks;
    if (ok) { c.skill += 1; store.update(() => {}); sfx.good(); say(`Correct! ${cap.cooks} cooks + ${cap.pots} sufurias for 120. +1 skill 🎉`); }
    else { sfx.bad(); say(`Not quite — answer: ${cap.cooks} cooks, ${cap.pots} sufurias. Rule: 1 cook/40 guests. 💛`); }
  }));
  card.querySelector("#reg").onclick = () => {
    c.loyalty = Math.min(100, c.loyalty + 5); c.cash += 1500; c.reputation = Math.min(5, c.reputation + 0.02);
    store.update(() => {}); sfx.good(); say("Auntie beams: \"You remembered my pilau!\" +KSh 1,500 tip 💛"); setTimeout(goEnd, 800);
  };
  let taps = 0; // hidden night market
  const soko = card.querySelector("#soko");
  const sneak = () => {
    taps++; sfx.pop();
    if (taps >= 3) {
      c.stock += 3; if (!c.badges.includes("nightOwl")) c.badges.push("nightOwl");
      store.update(() => {}); say("🌙 Night market! Cheap mangoes: +3 stock. Badge earned!"); setTimeout(goEnd, 900);
    } else say(`Someone winks… (${taps}/3) 🌙`);
  };
  soko.onclick = sneak; soko.onkeydown = (e) => { if (e.key === "Enter") sneak(); };
  return card;
}

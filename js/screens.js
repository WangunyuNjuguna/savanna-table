// js/screens.js - all 5 tabs, fully playable. One screen at a time (small DOM).
import { store } from "./store.js";
import { ksh, netWorth, doAction, buyStock, answerQuote, endMonth, clockText, nextStep } from "./engine.js";
import { LADDER } from "../data/upgrades.js";
import { costingQuiz, answerCosting, capacityQuiz, tryCombo } from "./minigames.js";
import { BADGES } from "./achievements.js";
import { sfx } from "./sound.js";
import { currentDilemma, resolveChoice } from "./choices.js";
import { activeMail, resolveMail } from "./mail.js";
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
    <strong>Hard choice: ${d.title}</strong><br><small>${d.text}</small></div></div>`;
}
function reportHtml(c) {
  const r = c.report; if (!r) return `<p class="hint">No report yet — press End Month. Your animated P&L appears here. 🧾</p>`;
  return `<div class="slot pop"><span>${r.profit >= 0 ? "📈" : "📉"}</span><div>
    <strong>M${r.month} Y${r.year}: ${r.profit >= 0 ? "+" : ""}${ksh(r.profit)}</strong><br>
    <small>Bills ${ksh(r.bills)} · Collected ${ksh(r.got)} · Worth ${ksh(r.netWorth)} · ${r.season}</small><br>
    <small>${r.events.slice(0, 2).join("<br>")}</small>
    ${r.million ? "<br><b>💎 1M MILESTONE! Hotel arc unlocked in Hotel tab!</b>" : ""}
    ${r.broke ? `<br><b>🌱 Fresh Start:</b> ${r.lesson}</b>` : ""}${c.lateNote ? `<br><small>💧 ${c.lateNote}</small>` : ""}</div></div>`;
}

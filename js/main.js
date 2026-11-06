// js/main.js - boots the game: nav, career reveal, saves, sound, modal.
// Small file, phone-friendly edits.
import { store } from "./store.js";
import { blankCareer, exportSave, importSaveFile } from "./save.js";
import { go } from "./router.js";
import { applyLang } from "./i18n.js";
import { MENTOR_TIPS } from "../data/text.js";
import { ensure, netWorth } from "./engine.js";
import { sfx } from "./sound.js";

const $ = (id) => document.getElementById(id);
const ksh = (n) => "KSh " + Math.round(n).toLocaleString("en-KE");
export function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(t._h); t._h = setTimeout(() => (t.hidden = true), 2800);
}
window.addEventListener("toast", (e) => toast(e.detail));

function paint() {
  const c = store.career, s = store.settings;
  if (c) ensure(c);
  $("stat-cash").textContent = c ? ksh(c.cash) : "—";
  $("stat-month").textContent = c ? `M${c.month} Y${c.year}` : "—";
  $("stat-rep").textContent = c ? c.reputation.toFixed(1) : "—";
  $("mentor-text").textContent = c?.report?.lesson || MENTOR_TIPS[(c?.month ?? 1) % MENTOR_TIPS.length];
  applyLang(s.lang);
  $("top-sub").textContent = s.lang === "sw" ? "Karibu sana! 🌿" : "Karibu! 🌿";
  $("btn-sound").textContent = s.sound ? "🔊" : "🔇";
  paintSlots();
  // Confetti burst on million milestone.
  if (c?.report?.million) confetti();
}

function paintSlots() {
  const box = $("slots"); box.innerHTML = "";
  store.all.slots.forEach((c, i) => {
    const d = document.createElement("div");
    d.className = "slot" + (i === store.all.activeSlot ? " active" : "");
    const label = c ? `${c.name} — ${ksh(c.cash)} · M${c.month}Y${c.year} · worth ${ksh(netWorth(c))}` : `Empty slot ${i + 1} — start fresh 🌱`;
    d.innerHTML = `<strong>Slot ${i + 1}</strong><span style="flex:1">${label}</span>`;
    const b = document.createElement("button");
    b.className = "btn secondary"; b.style.minHeight = "44px";
    b.textContent = i === store.all.activeSlot ? "✓" : (c ? "Play" : "New ✨");
    b.setAttribute("aria-label", `Play slot ${i + 1}`);
    b.onclick = () => {
      sfx.click();
      if (!store.all.slots[i]) { newCareerSheet(i); return; }
      store.setSlot(i); paint(); go("kitchen"); toast(`Slot ${i + 1} loaded. Karibu! 💛`);
    };
    d.appendChild(b);
    box.appendChild(d);
  });
}

// New Career: dramatic but friendly capital reveal + path choice.
function newCareerSheet(i) {
  const c = blankCareer(`Career ${i + 1}`);
  const m = $("modal"), card = $("modal-card");
  m.hidden = false;
  card.innerHTML = `<h2>✨ Your starting capital…</h2>
    <div class="reveal pop"><b>${ksh(c.cash)}</b><br><small>${c.cash < 400000 ? "A humble start — Mama Chef started with less! 💛" : "Lucky! A kind uncle blessed you. Use it wisely. 🙏"}</small></div>
    <h3>Choose your path</h3>
    <div class="paths">
      <button class="btn secondary" data-p="home">🏠 Home catering<small>cheap start, 20-60 guests</small></button>
      <button class="btn secondary" data-p="learn">👩🏾‍🍳 Join & learn<small>wages + skill, slow + safe</small></button>
      <button class="btn secondary" data-p="kibanda">🍛 Kibanda stall<small>daily sales, licence cost</small></button>
      <button class="btn secondary" data-p="chama">🤝 Chama partner<small>group loan, share profit</small></button>
    </div>`;
  card.querySelectorAll("[data-p]").forEach((b) => (b.onclick = () => {
    c.path = b.dataset.p;
    if (c.path === "learn") { c.skill += 8; c.cash += 20000; }
    if (c.path === "kibanda") { c.cash -= 15000; c.enquiries += 2; }
    if (c.path === "chama") { c.cash += 100000; c.debt += 110000; }
    sfx.win(); confetti();
    store.setCareer(i, c); store.setSlot(i);
    m.hidden = true; paint(); go("kitchen");
    toast(`Karibu! Path: ${b.textContent.trim().slice(0, 20)}. Perk: ${c.perk} 💛`);
  }));
}

function confetti() {
  const box = $("confetti"); box.innerHTML = "";
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("i");
    s.textContent = ["🎉", "✨", "💛", "🌿"][i % 4];
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    box.appendChild(s);
  }
  setTimeout(() => (box.innerHTML = ""), 2200);
  sfx.win();
}

function boot() {
  document.querySelectorAll(".tab").forEach((b) => (b.onclick = () => { sfx.click(); go(b.dataset.screen); }));
  $("btn-sound").onclick = () => {
    store.updateSettings({ sound: !store.settings.sound });
    paint(); toast(store.settings.sound ? "Sounds on! 🎶" : "Sounds off. 🤫");
    if (store.settings.sound) sfx.good();
  };
  $("btn-settings").onclick = () => {
    $("sheet").hidden = false;
    $("set-lang").value = store.settings.lang;
    $("set-diff").value = store.settings.difficulty;
    $("set-sound").checked = store.settings.sound;
  };
  $("btn-close-settings").onclick = () => {
    store.updateSettings({ lang: $("set-lang").value, difficulty: $("set-diff").value, sound: $("set-sound").checked });
    $("sheet").hidden = true; paint(); toast("Saved. Sawa! ✅");
  };
  $("btn-wipe").onclick = () => {
    if (confirm("Fresh Start this slot? You keep a small legacy bonus (skill + cash). 🌱")) {
      const old = store.career;
      const c = blankCareer(`Career ${store.all.activeSlot + 1}`);
      c.skill += Math.min(10, (old?.skill || 0) >> 2); c.cash += 10000; c.lessons = (old?.lessons || 0) + 1;
      store.setCareer(store.all.activeSlot, c); paint(); go("kitchen"); toast("Fresh Start! Pole, lesson learned. 🌱");
    }
  };
  $("btn-export").onclick = () => { if (store.career) { exportSave(store.career); toast("Save downloaded 📥"); } };
  $("btn-import").onclick = () => $("file-import").click();
  $("file-import").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const c = await importSaveFile(f);
      store.setCareer(store.all.activeSlot, c); paint(); go("kitchen"); toast("Save imported. Hongera! 🎉");
    } catch { toast("Pole — that file didn't look like a save."); }
    e.target.value = "";
  };
  // Year in Review pop-up.
  store.onChange(() => {
    const c = store.career;
    if (c?.yearReview) {
      c.yearReview = false;
      const m = $("modal"), card = $("modal-card");
      m.hidden = false;
      card.innerHTML = `<h2>🎊 Year ${c.year - 1} in Review!</h2>
        <div class="slot pop"><span>📊</span><div><strong>Cash ${ksh(c.cash)} · Worth ${ksh(netWorth(c))}</strong><br>
        <small>Best: ${(c.report?.events || [])[0] || "first steps"}<br>“${(c.badges || []).length} badges. ${(c.lessons || 0) ? "You survived hard months — strong! 🌱" : "Steady hands, warm heart. — Mama Chef 💛"}”</small></div></div>
        <div class="row"><button class="btn primary" id="yr-ok" style="flex:1">Sawa! Screenshot 📸</button></div>`;
      card.querySelector("#yr-ok").onclick = () => { m.hidden = true; sfx.good(); };
    }
  });
  store.onChange(paint);
  paint();
  go("kitchen");
  // Welcome back for returners.
  if (store.career?.updatedAt && Date.now() - store.career.updatedAt > 1000 * 60 * 60 * 20) {
    setTimeout(() => toast(`Welcome back! ${store.career.goal} 💛`), 800);
  }
}
boot();

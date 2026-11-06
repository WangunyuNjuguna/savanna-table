// js/art.js - hand-drawn inline SVG scenes. No images, no CDN, tiny + fast.
// Each scene grows with progress. All animation is CSS transform/opacity.
import { netWorth } from "./engine.js";

// Steaming sufuria pot. Bubbles get happier as skill rises.
export function potScene(skill = 10) {
  const happy = skill >= 25 ? "😄" : skill >= 15 ? "🙂" : "🍲";
  const flames = skill >= 20
    ? `<ellipse cx="70" cy="96" rx="26" ry="6" fill="#E0A24E" class="flick"/>`
    : `<ellipse cx="70" cy="96" rx="20" ry="5" fill="#9A5B14" opacity=".6" class="flick"/>`;
  return `<svg viewBox="0 0 140 110" class="scene" role="img" aria-label="Sufuria pot steaming">
    <ellipse cx="70" cy="102" rx="44" ry="6" fill="#1F3D2B" opacity=".12"/>
    ${flames}
    <ellipse cx="70" cy="72" rx="42" ry="26" fill="#1F3D2B"/>
    <ellipse cx="70" cy="64" rx="42" ry="12" fill="#2e5442"/>
    <ellipse cx="70" cy="64" rx="32" ry="8" fill="#E0A24E" opacity=".85"/>
    <text x="70" y="76" text-anchor="middle" font-size="22">${happy}</text>
    <g class="steam" font-size="14" fill="#9A5B14">
      <text x="52" y="40" class="s1">♨</text><text x="68" y="34" class="s2">♨</text><text x="84" y="40" class="s3">♨</text>
    </g></svg>`;
}

// Hotel that visibly upgrades: hut -> tent -> van -> restaurant -> guesthouse -> hotel.
export function hotelScene(owned = ["home"]) {
  const n = owned.length; // 1..7
  const glow = n >= 5 ? `class="glow"` : ``;
  const tent = n >= 2 ? `<polygon points="10,78 30,52 50,78" fill="#F6F0E4" stroke="#E0A24E" stroke-width="2"/><line x1="30" y1="52" x2="30" y2="78" stroke="#9A5B14"/>` : ``;
  const van = n >= 3 ? `<g><rect x="118" y="66" width="52" height="20" rx="5" fill="#E0A24E"/><circle cx="130" cy="88" r="6" fill="#1B1B18"/><circle cx="158" cy="88" r="6" fill="#1B1B18"/><text x="144" y="80" text-anchor="middle" font-size="12">🚐</text></g>` : ``;
  const top = n >= 6
    ? `<rect x="60" y="22" width="80" height="46" rx="5" fill="#1F3D2B" ${glow}/><polygon points="50,24 100,2 150,24" fill="#E0A24E"/><text x="100" y="52" text-anchor="middle" font-size="13" fill="#F6F0E4">🏨 SAVANNA</text><text x="100" y="98" text-anchor="middle" font-size="11">🌴 🌴 🌴 garden party 🌴 🌴 🌴</text>`
    : n >= 5
    ? `<rect x="62" y="34" width="76" height="40" rx="5" fill="#2e5442" ${glow}/><polygon points="54,36 100,12 146,36" fill="#E0A24E"/><text x="100" y="58" text-anchor="middle" font-size="12" fill="#fff">🛏️ Guesthouse</text>`
    : n >= 4
    ? `<rect x="62" y="40" width="76" height="34" rx="5" fill="#9A5B14"/><polygon points="54,42 100,20 146,42" fill="#E0A24E"/><text x="100" y="62" text-anchor="middle" font-size="12" fill="#fff">🍽️ Restaurant</text>`
    : `<rect x="66" y="48" width="68" height="28" rx="5" fill="#1F3D2B"/><polygon points="58,50 100,28 142,50" fill="#E0A24E"/><text x="100" y="66" text-anchor="middle" font-size="12" fill="#fff">🏠 Home</text>`;
  const stars = n >= 6 ? `<text x="100" y="14" text-anchor="middle" font-size="10">⭐ ⭐ ⭐ ⭐ ⭐</text>` : ``;
  return `<svg viewBox="0 0 180 105" class="scene wide" role="img" aria-label="Your place, growing step by step">${stars}${top}${tent}${van}
    <ellipse cx="100" cy="100" rx="80" ry="4" fill="#1F3D2B" opacity=".12"/></svg>`;
}

// Market stall with awning + baskets. Baskets fill with stock.
export function marketScene(stock = 2) {
  const baskets = [0, 1, 2].map((i) =>
    `<g><ellipse cx="${40 + i * 35}" cy="80" rx="15" ry="8" fill="#9A5B14"/><text x="${40 + i * 35}" y="78" text-anchor="middle" font-size="13">${i < stock ? "🍅" : "🧺"}</text></g>`).join("");
  return `<svg viewBox="0 0 150 95" class="scene" role="img" aria-label="Market stall">
    <rect x="15" y="8" width="120" height="12" rx="6" fill="#E0A24E"/>
    <rect x="20" y="20" width="6" height="60" fill="#9A5B14"/><rect x="124" y="20" width="6" height="60" fill="#9A5B14"/>
    ${baskets}<text x="75" y="45" text-anchor="middle" font-size="12">🧺 Soko · fresh!</text></svg>`;
}

// Catering tent with guests. Crowd grows with enquiries.
export function cateringScene(enquiries = 2) {
  const crowd = "🎉".repeat(Math.min(5, Math.max(1, enquiries))).split("").map((e, i) =>
    `<text x="${40 + i * 18}" y="86" font-size="14" class="bob" style="animation-delay:${i * 0.15}s">${e}</text>`).join("");
  return `<svg viewBox="0 0 170 95" class="scene wide" role="img" aria-label="Event tent with guests">
    <polygon points="20,70 85,20 150,70" fill="#F6F0E4" stroke="#E0A24E" stroke-width="3"/>
    <polygon points="20,70 85,20 85,70" fill="#E0A24E" opacity=".35"/>
    <line x1="85" y1="20" x2="85" y2="70" stroke="#9A5B14" stroke-width="3"/>${crowd}</svg>`;
}

// Net-worth journey bar to 1M (and beyond to 8M hotel).
export function worthBar(worth) {
  const pct1M = Math.min(100, Math.round((worth / 1000000) * 100));
  return `<div class="journey" role="img" aria-label="Net worth ${pct1M} percent to 1 million">
    <div class="journey-track"><div class="journey-fill" style="width:${pct1M}%"></div>
    <span class="journey-pin" style="left:${pct1M}%">📍</span></div>
    <div class="journey-labels"><span>🏠 start</span><b>${pct1M}% → KSh 1M 💎</b><span>🏨 hotel</span></div></div>`;
}

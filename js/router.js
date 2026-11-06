// js/router.js - bottom-nav routing. Lazy-renders one screen at a time (small DOM).
import { renderScreen } from "./screens.js";

let current = "kitchen";
const host = () => document.getElementById("screen");

export function go(name) {
  current = name;
  // Render at once (no waiting): reliable even when the tab is hidden
  // and kinder to low-end phones. CSS still animates the entrance.
  const h = host();
  if (!h) return;
  h.innerHTML = "";
  try {
    h.appendChild(renderScreen(name));
  } catch (e) {
    console.error("render failed:", name, e);
    h.innerHTML = "<section class='card'><h2>Pole! 😟</h2><p>That screen stumbled. Tap another tab — your save is safe.</p></section>";
  }
  document.querySelectorAll(".tab").forEach((b) =>
    b.classList.toggle("active", b.dataset.screen === name));
}
export function currentScreen() { return current; }

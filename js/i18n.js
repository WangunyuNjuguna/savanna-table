// js/i18n.js - simple English/Swahili toggle for key labels.
import { STRINGS } from "../data/text.js";

export function applyLang(lang) {
  const dict = STRINGS[lang] || STRINGS.en;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (dict[k]) el.textContent = dict[k];
  });
  document.documentElement.lang = lang === "sw" ? "sw" : "en";
}

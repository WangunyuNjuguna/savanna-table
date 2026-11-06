// js/store.js - tiny shared state. No framework, just get/set + autosave.
import { loadAll, persist } from "./save.js";

let all = loadAll(); // { slots, activeSlot, settings }
const listeners = new Set();

export const store = {
  get all() { return all; },
  get career() { return all.slots[all.activeSlot]; },
  get settings() { return all.settings; },
  // Update career + autosave after every turn.
  update(fn) {
    const c = this.career;
    if (c) { fn(c); c.updatedAt = Date.now(); }
    persist(all);
    listeners.forEach((f) => f());
  },
  setSlot(i) { all.activeSlot = i; persist(all); listeners.forEach((f) => f()); },
  setCareer(i, career) { all.slots[i] = career; persist(all); listeners.forEach((f) => f()); },
  updateSettings(patch) { Object.assign(all.settings, patch); persist(all); listeners.forEach((f) => f()); },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
};

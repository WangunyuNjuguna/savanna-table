// js/save.js - 3 career slots + versioned schema + export/import.
// Small file, big job. All saves live in localStorage; cloud is optional later.
export const SAVE_KEY = "savanna-table-slots-v1";
export const SAVE_VERSION = 1;

// Blank career: random capital 100k-800k, weighted low (most 150k-400k).
// Dramatic but friendly reveal happens in the New Career sheet.
function rollCapital() {
  const r = Math.random();
  if (r < 0.6) return Math.round(150000 + Math.random() * 250000); // 150-400k common
  if (r < 0.85) return Math.round(100000 + Math.random() * 300000); // 100-400k
  return Math.round(400000 + Math.random() * 400000); // rare 400-800k lucky
}
export function blankCareer(name = "Career 1") {
  const cash = rollCapital();
  return {
    version: SAVE_VERSION,
    name, createdAt: Date.now(), updatedAt: Date.now(),
    month: 1, year: 1, day: 1, cash, reputation: 3.0,
    loyalty: 50, morale: 70, skill: 10,
    path: null, history: [cash],
    // playable fields (engine.js ensures these on old saves too):
    actionsLeft: 3, stock: 2, equipValue: 8000, property: 0, debt: 0,
    enquiries: 2, staff: 0, staffBy: { cooks: 0, waiters: 0, cleaners: 0, reception: 0, manager: 0 },
    pantry: { rice: 5, flour: 5, oil: 2, beef: 1, veg: 1, milk: 2, gas: 6, linen: 2, soap: 4 },
    pantryAge: {}, rooms: 0, occupancy: 0, contracts: [], card: { limit: 100000, used: 0 },
    cookStyle: "exact", recipes: ["Pilau", "Chapati"], regulars: {},
    crew: [], crewMigrated: false, applicants: [], dishes: [], branches: [], pendingStaff: null,
    badges: [], monthProfit: 0, balanceDue: 0, goal: "Earn your first KSh 10,000 profit",
    report: null, sufuriaTaps: 0, lessons: 0, hardMonths: 0, seenGuide: false,
    perk: "warm smile 😊", upgradesOwned: ["home"]
  };
}

// Load all slots: { slots:[c/null,c/null,c/null], activeSlot:0, settings:{} }
export function loadAll() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { slots: [blankCareer(), null, null], activeSlot: 0, settings: defaultSettings() };
    const data = JSON.parse(raw);
    return migrate(data);
  } catch (e) {
    console.warn("Save corrupted, starting fresh.", e);
    return { slots: [null, null, null], activeSlot: 0, settings: defaultSettings() };
  }
}

export function defaultSettings() {
  return { lang: "en", difficulty: "normal", sound: false };
}

// Migration: old version -> current. Add new fields here in future phases.
export function migrate(data) {
  if (!data || typeof data !== "object") return { slots: [null, null, null], activeSlot: 0, settings: defaultSettings() };
  data.settings = { ...defaultSettings(), ...(data.settings || {}) };
  data.slots = Array.isArray(data.slots) ? data.slots : [null, null, null];
  while (data.slots.length < 3) data.slots.push(null);
  data.slots = data.slots.slice(0, 3).map((c) => (c ? migrateCareer(c) : null));
  data.activeSlot = [0, 1, 2].includes(data.activeSlot) ? data.activeSlot : 0;
  return data;
}

function migrateCareer(c) {
  const b = blankCareer(c.name || "Career");
  const out = { ...b, ...c, version: SAVE_VERSION, updatedAt: c.updatedAt || Date.now() };
  if (!Array.isArray(out.history)) out.history = [out.cash];
  return out;
}

// Persist everything (called after every turn = autosave).
export function persist(all) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(all));
}

// Export active slot as a JSON file download.
export function exportSave(career) {
  const blob = new Blob([JSON.stringify(career, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `savanna-table-${(career?.name || "career").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}.json`;
  document.body.appendChild(a); // attached = reliable on mobile browsers
  a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// Import: reads a JSON file, validates lightly, returns a career object.
export function importSaveFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const c = migrateCareer(JSON.parse(r.result));
        if (typeof c.cash !== "number") throw new Error("bad file");
        resolve(c);
      } catch (e) { reject(e); }
    };
    r.onerror = reject;
    r.readAsText(file);
  });
}

// data/pantry.js - EVERYTHING is measured in metric units (kg, g, L, m, pcs).
// Prices in KSh per unit. Tweak freely - no code changes needed.
// perishDays = how many months stock lasts (fresh food spoils fast!).
export const SUPPLIES = [
  { id: "rice", name: "Rice", unit: "kg", price: 180, perish: 12, note: "150 g per guest" },
  { id: "flour", name: "Wheat flour", unit: "kg", price: 150, perish: 12, note: "120 g per guest" },
  { id: "oil", name: "Cooking oil", unit: "L", price: 320, perish: 12, note: "30 ml per guest" },
  { id: "beef", name: "Beef", unit: "kg", price: 650, perish: 1, note: "120 g per guest, spoils fast!" },
  { id: "veg", name: "Vegetables", unit: "kg", price: 120, perish: 1, note: "100 g per guest, spoils fast!" },
  { id: "milk", name: "Milk", unit: "L", price: 80, perish: 1, note: "hotel breakfast 1 L per room" },
  { id: "gas", name: "Cooking gas", unit: "kg", price: 250, perish: 99, note: "13 kg cylinder lasts ~2 months" },
  { id: "linen", name: "Linen & cloth", unit: "m", price: 400, perish: 99, note: "hotel: 2 m per room set" },
  { id: "soap", name: "Soap & toiletries", unit: "pcs", price: 60, perish: 99, note: "hotel: 2 pcs per room-night" }
];
// Recipe: kg/L needed per catering guest.
export const PER_GUEST = { rice: 0.15, flour: 0.12, oil: 0.03, beef: 0.12, veg: 0.10, gas: 0.02 };
// Hotel: units needed per occupied room per month (30 nights simplified).
export const PER_ROOM_MONTH = { milk: 20, flour: 8, linen: 0.5, soap: 40, gas: 1.5 };
// Rooms unlocked by ladder upgrades.
export const ROOMS_BY_UPGRADE = { home: 0, equipment: 0, van: 0, team: 0, restaurant: 0, guesthouse: 6, hotel: 20 };
// Room price per night by level (KSh), seasons multiply 0.8x-1.4x.
export const ROOM_RATE = { guesthouse: [2500, 4500], hotel: [5000, 8000] };
// Staff positions: wage/mo, what each one does.
export const POSITIONS = [
  { id: "cooks", name: "Cooks 👩🏾‍🍳", wage: 18000, desc: "+40 guests capacity each" },
  { id: "waiters", name: "Waiters 🧑🏾‍💼", wage: 12000, desc: "+satisfaction, big events need them" },
  { id: "cleaners", name: "Cleaners 🧹", wage: 10000, desc: "hotel rating + rooms ready" },
  { id: "reception", name: "Reception 🛎️", wage: 15000, desc: "+15% hotel occupancy each" },
  { id: "manager", name: "Manager 📋", wage: 35000, desc: "+1 action/month, fewer mistakes" }
];
// Supplier contracts: meet once, then auto-buy debited to credit card (+10% fee, no hassle).
export const CONTRACTS = [
  { id: "staples", name: "Staples supplier 🌾", covers: ["rice", "flour", "oil", "gas"], fee: 2000, desc: "rice, flour, oil, gas auto-delivered" },
  { id: "fresh", name: "Fresh market mama 🍅", covers: ["beef", "veg", "milk"], fee: 1500, desc: "beef, veg, milk auto-delivered" },
  { id: "hotel", name: "Hotel linen & soap 🛏️", covers: ["linen", "soap"], fee: 1500, desc: "linen (m) + soap auto-delivered" }
];

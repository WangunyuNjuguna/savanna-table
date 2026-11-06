// data/staff.js - people are messy. Brilliant drunks, lousy applicants, hard calls.
// Wages in KSh/mo. Flaws hide until after hiring (trial month reveals them!).
export const FIRST_NAMES = ["Louis", "Achieng", "Otieno", "Kamau", "Njeri", "Omondi", "Chebet", "Mwangi", "Aoko", "Kiprop", "Nyambura", "Baraka", "Zawadi", "Njoroge", "Atieno", "Kimani", "Wafula", "Moraa", "Sidi", "Kiptoo"];
export const FLAWS = [
  { id: "none", w: 55, label: "steady ✅", desc: "Shows up, does the work." },
  { id: "drinks", w: 12, label: "drinks 🍺", desc: "Brilliant but sometimes misses shifts drunk." },
  { id: "late", w: 10, label: "late 🕐", desc: "Always 30 min late, charm covers it." },
  { id: "demanding", w: 8, label: "ambitious 💼", desc: "Will demand raises and threaten to leave." },
  { id: "clumsy", w: 8, label: "clumsy 🍽️", desc: "Breaks plates, wastes food (+spoilage)." },
  { id: "gossip", w: 7, label: "gossips 🗣️", desc: "Team mood swings; loves rival kitchens." }
];
// HR dilemmas: no perfect answer. Both roads cost something.
export const STAFF_DILEMMAS = [
  {
    id: "drunk-star", title: "🍺 Your BEST cook came in drunk",
    text: "Louis (skill 5!) missed Saturday service, smelling of chang'aa. Guests noticed. The other cooks are watching what you do. The replacements out there are lousy.",
    options: [
      { label: "Fire him on the spot", desc: "Lose your star. Morale -10, discipline +rep. Hiring from lousy pool.", fire: true, morale: -10, rep: 0.08 },
      { label: "Final warning + dock pay", desc: "50%: he shapes up forever. 50%: it happens again, worse.", gamble: { odds: 0.5, winRep: 0.05, loseRep: -0.2 } },
      { label: "Cover for him quietly", desc: "Morale +5 now. But 40% chance of a bigger scandal later.", morale: 5, risk: 0.4 }
    ]
  },
  {
    id: "raise-threat", title: "💼 \"Pay me 30% more or I join Mama Njeri\"",
    text: "Your best waiter has a rival's offer in hand. She IS worth it. But every raise ripples to the whole team.",
    options: [
      { label: "Pay the raise", desc: "Wage +30%. Loyalty up, others will ask too.", raise: 0.3, morale: 8 },
      { label: "Call the bluff (60% she stays)", desc: "Save cash. 40% she walks to the rival.", gamble: { odds: 0.6, winRep: 0, loseRep: -0.1, loseStaff: true } },
      { label: "Parting gift, let her go", desc: "She leaves smiling. Rep +0.05, short-staffed a month.", leave: true, rep: 0.05, morale: -5 }
    ]
  },
  {
    id: "short-cash", title: "🧾 KSh 3,000 short in the till",
    text: "Cash is short and fingers are pointing. Evidence is thin. Handle it wrong and trust dies either way.",
    options: [
      { label: "Investigate kindly + audit", desc: "Cost KSh 2,000. 60% truth found, trust kept.", cash: -2000, gamble: { odds: 0.6, winRep: 0.05, loseRep: -0.05 } },
      { label: "Accuse openly", desc: "50% you nail it (+discipline) / 50% innocent quits, morale -15.", gamble: { odds: 0.5, winRep: 0.05, loseRep: -0.15, moraleRisk: -15 } },
      { label: "Absorb it, set new system", desc: "Lose KSh 3,000. Morale +5. Thief (if any) stays.", cash: -3000, morale: 5 }
    ]
  },
  {
    id: "training-ask", title: "🎓 \"Sponsor my catering course?\"",
    text: "Your promising cook (skill 2) begs you to pay KSh 12,000 for a certificate course. She'll be twice as good — if she doesn't leave after.",
    options: [
      { label: "Sponsor her", desc: "Cost KSh 12,000. 70%: skill +2 & loyal. 30%: she leaves with it.", cash: -12000, gamble: { odds: 0.7, skill: 2, loseStaff: true } },
      { label: "Half now, bond agreement", desc: "Cost KSh 6,000. Skill +1, she stays a year.", cash: -6000, skill: 1 },
      { label: "Decline gently", desc: "No cost. Morale -5. She understands… mostly.", morale: -5 }
    ]
  }
];
// Signature dish lab: pick base + twist. Tasting KSh 8,000. Hit = monthly royalty. Flops happen!
export const DISH_BASES = ["Pilau", "Biriyani", "Chapati", "Ugali", "Nyama choma", "Samosa", "Mokimo"];
export const DISH_TWISTS = ["passion glaze 🍈", "pili-pili honey 🌶️🍯", "coconut smoke 🥥", "mango-chili salsa 🥭", "rosemary smoke 🌿", "tamarind zing 🍋"];
// Branch types: expensive, hungry monthly, need a manager or they bleed.
export const BRANCHES = [
  { id: "kiosk", name: "Soko kiosk", cost: 400000, upkeep: 25000, income: [30000, 60000], need: "restaurant", desc: "Small counter. Modest, steady." },
  { id: "eatery", name: "Estate eatery", cost: 1200000, upkeep: 80000, income: [90000, 160000], need: "guesthouse", desc: "Needs a manager or chaos." },
  { id: "rooftop", name: "Rooftop lounge", cost: 3000000, upkeep: 180000, income: [200000, 380000], need: "hotel", desc: "Big swing. Big bills. Big glory." }
];
// Life happens: 10%/mo, even when you did everything right.
export const MISHAPS = [
  { text: "⚡ Blackout! Fridge stock spoiled.", cash: -8000 },
  { text: "🚚 Supplier no-showed. Emergency buy at 50% extra.", cash: -6000 },
  { text: "🌧️ Storm flooded the kitchen. Repairs + morale dip.", cash: -5000, morale: -5 },
  { text: "😤 A fake 1-star review stung. Regulars defended you though.", cash: 0, rep: -0.08 },
  { text: "🦟 Health scare rumour (not yours!). Fewer walk-ins.", cash: -4000, rep: -0.05 }
];

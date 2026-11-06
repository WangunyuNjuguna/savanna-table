// data/choices.js - HARD CHOICES. Every big decision has a safe road and a bold road.
// Safe = slow, almost never fails. Bold = fast, can hurt. Both shown honestly with odds.
export const DILEMMAS = [
  {
    id: "ingredients", title: "🧅 Cheap vs Quality ingredients?",
    text: "Supplier A is cheap but bland. Supplier B is pricey but delicious.",
    safe: { label: "Buy cheap (safe)", desc: "+KSh 4,000 profit now, rep -0.05", cash: 4000, rep: -0.05 },
    bold: { label: "Buy quality (bold)", desc: "Cost KSh 3,000, rep +0.15, better tips", cash: -3000, rep: 0.15 }
  },
  {
    id: "big-wedding", title: "💒 200-guest wedding — take it?",
    text: "Huge pay, but you are stretched thin. 60% shine, 40% stumble.",
    safe: { label: "Decline, take 2 small gigs", desc: "+KSh 10,000 safe", cash: 10000, rep: 0.02 },
    bold: { label: "Accept! (60% win KSh 45k / 40% lose KSh 15k)", desc: "Needs skill 15+", cash: 0, rep: 0, gamble: { win: 45000, lose: -15000, odds: 0.6, skill: 15 } }
  },
  {
    id: "save-or-grow", title: "💰 Save or Grow?",
    text: "Cash in hand feels good. But a tent unlocks rainy-season jobs…",
    safe: { label: "Save (safe)", desc: "Keep cash, morale +5, +KSh 2,000 interest", cash: 2000, morale: 5 },
    bold: { label: "Buy tent KSh 40,000 (bold)", desc: "+KSh 28,000 equipment value, rainy jobs open", cash: -40000, equip: 28000 }
  },
  {
    id: "loan-or-slow", title: "🤝 Chama loan — quick cash?",
    text: "KSh 100,000 now, repay KSh 110,000. Fast growth or slow patience?",
    safe: { label: "Grow slowly (safe)", desc: "No debt, rep +0.05 (lenders notice patience)", cash: 0, rep: 0.05 },
    bold: { label: "Take loan (bold)", desc: "+KSh 100,000 now, KSh 110,000 debt", cash: 100000, debt: 110000 }
  },
  {
    id: "staff-or-solo", title: "👨🏾‍🍳 Hire now or stay solo?",
    text: "A cook costs monthly wages but doubles what you can serve.",
    safe: { label: "Stay solo (safe)", desc: "+KSh 5,000 saved, skill +2 (you learn fast)", cash: 5000, skill: 2 },
    bold: { label: "Hire cook (bold)", desc: "KSh 12,000 now, +staff, bigger future gigs", cash: -12000, staff: 1 }
  },
  {
    id: "price-war", title: "😤 Rival undercuts you — fight?",
    text: "Mama Njeri dropped prices. Match her and bleed, or hold quality?",
    safe: { label: "Hold quality (safe)", desc: "Lose one job -KSh 5,000, rep +0.1", cash: -5000, rep: 0.1 },
    bold: { label: "Price war! (50/50)", desc: "Win KSh 20,000 or lose KSh 12,000", cash: 0, gamble: { win: 20000, lose: -12000, odds: 0.5 } }
  },
  {
    id: "festival", title: "🎪 Festival slot — pricey entry?",
    text: "KSh 15,000 entry. 70% you feast (KSh 35,000 + fame), 30% rain ruins it.",
    safe: { label: "Skip (safe)", desc: "Do a church lunch +KSh 8,000", cash: 8000, rep: 0.05 },
    bold: { label: "Enter! (70% KSh 35k)", desc: "Risk KSh 15,000", cash: 0, gamble: { win: 35000, lose: -15000, odds: 0.7 } }
  },
  {
    id: "debt-or-wait", title: "🚐 Van now on credit, or wait?",
    text: "A van ends transport chaos. Debt is scary but speed is sweet.",
    safe: { label: "Hire transport (safe)", desc: "-KSh 6,000 this month, no debt", cash: -6000, rep: 0 },
    bold: { label: "Van loan (bold)", desc: "+KSh 200,000 van value, KSh 230,000 debt", cash: 0, equip: 200000, debt: 230000 }
  }
];

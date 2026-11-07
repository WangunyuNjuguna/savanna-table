// data/mail.js - decision mails (Reigns-style). ALL numbers live here.
// Each mail: 2 choices with 3 preview lines, a helper hint, a result line,
// and what happens if she ignores it till month-end (auto-resolves, never blocks).
export const MAILS = [
  {
    id: "church-tea",
    from: "Rev. Wanjiru ⛪",
    subject: "Church tea for 30?",
    body: "Praise! Our women's guild needs tea and mandazi for 30 people this Sunday. Our budget is small, but we pay a deposit today, cash in hand.",
    note: "Cash is tight at the start; this deposit helps. Small jobs build your name.",
    left: {
      label: "Accept the job ✅",
      preview: ["💰 +KSh 6,000 deposit", "⭐ +0.05 reputation", "⚡ uses 1 energy"],
      cash: 6000, rep: 0.05, energy: 1,
      result: "Sunday went beautifully — the guild clapped! Deposit banked. 🙏"
    },
    right: {
      label: "Decline kindly 💛",
      preview: ["💰 +KSh 0", "⭐ +0.02 reputation", "⚡ no energy used"],
      cash: 0, rep: 0.02, energy: 0,
      result: "You declined kindly. Rev. Wanjiru says she will call for Easter. 💛"
    },
    skip: "You never replied, so the guild asked someone else. Even small jobs matter. 💧",
    skipRep: -0.03
  },
  {
    id: "bulk-rice",
    from: "Otis, Rice Supplier 🍚",
    subject: "20kg rice, 10% off today",
    body: "Niaje! I have an extra 20kg bag of pishori rice. Take it today for KSh 9,000 (normally 10,000+). Cash only.",
    note: "Rice never spoils and every gig needs it. If you can spare the cash, stock up.",
    left: {
      label: "Buy the bag ✅",
      preview: ["💰 −KSh 9,000", "🧺 +20kg rice in pantry", "⚡ uses 1 energy"],
      cash: -9000, energy: 1, pantry: { rice: 20 },
      result: "Smart! 20kg pishori stored. Your pantry is ready for big gigs. 🧺"
    },
    right: {
      label: "Pass for now",
      preview: ["💰 +KSh 0", "🧺 pantry unchanged", "⚡ no energy used"],
      result: "You passed. Otis shrugged — the offer walks to the next kitchen. 💧"
    },
    skip: "You never replied and Otis sold the bag elsewhere. Pole! 💧",
    skipRep: 0
  },
  {
    id: "wedding-discount",
    from: "Brian & Faith 💒",
    subject: "100-guest wedding — 15% off?",
    body: "We love your pilau! Our budget is tight: can you do our 100-guest wedding 15% cheaper? We will pay half deposit now.",
    note: "Big deposits fix cash flow. Discounts are fine if the job still profits.",
    left: {
      label: "Agree, take deposit ✅",
      preview: ["💰 +KSh 15,000 deposit", "⭐ +0.10 reputation", "⚡ uses 1 energy"],
      cash: 15000, rep: 0.1, energy: 1,
      result: "Booked! The couple is overjoyed and the deposit is banked. 💒"
    },
    right: {
      label: "Hold your price 💪",
      preview: ["💰 +KSh 0 now", "⭐ +0.03 reputation", "⚡ no energy used"],
      cash: 0, rep: 0.03, energy: 0,
      result: "They walked away — but your prices earned quiet respect. Worth it. 💛"
    },
    skip: "You never replied and they booked Mama Njeri. Big fish, gone. 💧",
    skipRep: -0.05
  },
  {
    id: "cold-food",
    from: "An angry guest 😠",
    subject: "My food arrived cold!",
    body: "I am very disappointed. My chapati was cold at Saturday's event. I expected better from Savanna Table!",
    note: "Sorry plus a small refund turns complainers into regulars. Silence turns them into reviews.",
    left: {
      label: "Apologise + refund 3k 🙏",
      preview: ["💰 −KSh 3,000 refund", "⭐ +0.10 reputation", "⚡ no energy used"],
      cash: -3000, rep: 0.1, energy: 0,
      result: "She forgave you — and brought two friends next month! Kindness pays. 💛"
    },
    right: {
      label: "Ignore it 🙈",
      preview: ["💰 +KSh 0", "⭐ −0.15 reputation", "⚡ no energy used"],
      cash: 0, rep: -0.15, energy: 0,
      result: "She posted a 1-star review. Ouch. Reviews live forever. 😞"
    },
    skip: "You never replied. The 1-star review wrote itself. 😞",
    skipRep: -0.15
  },
  {
    id: "advance-request",
    from: "Achieng, your cook 👩🏾‍🍳",
    subject: "Salary advance, please?",
    body: "Chef, my son's school fees are due Friday. Can I get KSh 5,000 from next month's pay? I have never asked before.",
    note: "Good people remember who helped them. But only give what you can spare.",
    left: {
      label: "Give the advance 💛",
      preview: ["💰 −KSh 5,000 now", "😊 +10 team morale", "⚡ no energy used"],
      cash: -5000, morale: 10, energy: 0,
      result: "Achieng nearly cried. She will run through walls for you now. 💛"
    },
    right: {
      label: "Say no kindly",
      preview: ["💰 +KSh 0", "😊 −5 team morale", "⚡ no energy used"],
      cash: 0, morale: -5, energy: 0,
      result: "She understood — but the kitchen was quieter this week. 💧"
    },
    skip: "You never answered and she borrowed elsewhere. Trust dipped a little. 💧",
    skipRep: 0
  },
  {
    id: "planner-intro",
    from: "Dee, Events Planner 📋",
    subject: "Let's work together?",
    body: "I plan 2–3 events a month and need a reliable caterer. Partner with me and I will send clients your way. I ask 10% of each job.",
    note: "Planners are pipelines. 10% of something beats 100% of nothing.",
    left: {
      label: "Partner up 🤝",
      preview: ["📋 +2 enquiries", "⭐ +0.05 reputation", "⚡ no energy used"],
      enquiries: 2, rep: 0.05, energy: 0,
      result: "Dee shook your hand. Two new enquiries landed this week! 🤝"
    },
    right: {
      label: "Not right now",
      preview: ["📋 +0 enquiries", "⭐ +0 reputation", "⚡ no energy used"],
      result: "You passed politely. Dee will ask your rival instead. 💧"
    },
    skip: "You never replied. Dee partnered with Mama Njeri. 💧",
    skipRep: 0
  }
];

// data/chains.js - choices ECHO. A decision this month comes back next month.
// Each chain hangs off a hard choice (from = dilemma id, side = safe/bold).
// effects: what lands at next month-end, with the news line.
// follow: optional small follow-up card (one primary action, skippable, auto-rests).
// ALL numbers and words live here.
export const CHAINS = [
  {
    id: "cheap-tomatoes",
    from: "ingredients",
    side: "safe",
    title: "🍅 Word travels about the cheap tomatoes",
    text: "A guest at the harambee tasted the bland stew. Nothing rude — just a quiet review.",
    effects: { cash: -1500, rep: -0.05 },
    follow: {
      title: "Make it right?",
      text: "A free plate costs little and travels far.",
      options: [
        { id: "apologise", label: "Send a free pilau", desc: "Cost KSh 2,500 · rep +0.15", primary: true, cash: -2500, rep: 0.15, result: "She told the whole church you fixed it kindly. Two Sunday lunches booked. 💛" },
        { id: "let-pass", label: "Let it pass", desc: "Keep the cash · rep −0.10", cash: 0, rep: -0.1, result: "No harm today — but the review stays up, and people read reviews. ⭐" }
      ]
    }
  },
  {
    id: "taste-travelled",
    from: "ingredients",
    side: "bold",
    title: "✨ The taste travelled",
    text: "Two guests from that job asked who cooked. One of them wants a wedding quote.",
    effects: { cash: 3000, rep: 0.1, enquiries: 2 },
    follow: {
      title: "📞 She asks for a tasting plate",
      text: "One plate now, KSh 4,000. It could become an 80-guest wedding.",
      options: [
        { id: "cook-tasting", label: "Cook the tasting", desc: "Cost KSh 4,000 · rep +0.20", primary: true, cash: -4000, rep: 0.2, enquiries: 1, result: "She booked 80 guests on the spot. Quality pays twice. 🎉" },
        { id: "decline-tasting", label: "Politely decline", desc: "Save the cash · rep −0.05", cash: 0, rep: -0.05, result: "She booked elsewhere. The lesson stays: taste sells, talk doesn't. 💛" }
      ]
    }
  },
  {
    id: "wedding-photos",
    from: "big-wedding",
    side: "bold",
    title: "📸 Wedding photos are circulating",
    text: "The plates looked good in every photo. People keep asking whose catering that was.",
    effects: { cash: 5000, rep: 0.1, enquiries: 2 },
    follow: {
      title: "Print albums for the family?",
      text: "A small album of your dishes, handed to the couple, keeps your name alive.",
      options: [
        { id: "print-albums", label: "Print the albums", desc: "Cost KSh 6,000 · rep +0.20", primary: true, cash: -6000, rep: 0.2, enquiries: 2, result: "The couple shows the album at every family function. Your phone won't stop. 📸" },
        { id: "skip-albums", label: "Save the money", desc: "Keep the cash · rep +0.05", cash: 0, rep: 0.05, result: "Nothing lost — the photos still float around on their own. 💛" }
      ]
    }
  },
  {
    id: "mama-njeri-truce",
    from: "price-war",
    side: "safe",
    title: "🤝 Mama Njeri notices your patience",
    text: "She did not expect you to hold your prices. She respects it, and she is short-handed.",
    effects: { cash: 2000, rep: 0.1, morale: 5 },
    follow: {
      title: "Share a big job with her?",
      text: "300 guests, split down the middle. Her crew, your name on the menu.",
      options: [
        { id: "share-job", label: "Shake hands", desc: "Earn KSh 9,000 · rep +0.15", primary: true, cash: 9000, rep: 0.15, morale: 5, result: "Two rivals, one kitchen, zero drama. The client asked for you both again. 🤝" },
        { id: "stay-rivals", label: "Stay rivals", desc: "Take a small job · rep −0.05", cash: 2000, rep: -0.05, result: "You kept your pride and a small job. The big one went to her. 💛" }
      ]
    }
  },
  {
    id: "rain-came",
    from: "save-or-grow",
    side: "bold",
    title: "🌧️ The rain came — and you were ready",
    text: "Two outdoor jobs moved under your tent. Nobody got wet, everybody ate.",
    effects: { cash: 12000, rep: 0.15 },
    follow: {
      title: "🔧 The tent needs a repair",
      text: "One pole bent in the wind. Fix it properly now, or patch it and hope.",
      options: [
        { id: "repair-tent", label: "Repair it properly", desc: "Cost KSh 5,000 · rep +0.10", primary: true, cash: -5000, rep: 0.1, result: "The tent stands straight for the next downpour. Word gets around. ⛺" },
        { id: "patch-tent", label: "Patch it cheaply", desc: "Cost KSh 1,500 · rep −0.05", cash: -1500, rep: -0.05, result: "It holds… for now. You keep an eye on the sky all month. 🌧️" }
      ]
    }
  },
  {
    id: "cook-following",
    from: "staff-or-solo",
    side: "bold",
    title: "👩🏾‍🍳 Your new cook has a following",
    text: "Her old customers followed her to your kitchen. The queue is longer than your pots.",
    effects: { cash: 8000, rep: 0.05, enquiries: 1 },
    follow: {
      title: "She asks for a raise",
      text: "KSh 6,000 more a month. Or she starts listening to other kitchens.",
      options: [
        { id: "give-raise", label: "Give the raise", desc: "Cost KSh 6,000 · morale +8", primary: true, cash: -6000, rep: 0.1, morale: 8, result: "She stays, and she trains the new helper for free. Good people cost, bad people cost more. 💛" },
        { id: "hold-wages", label: "Hold the wages", desc: "Keep the cash · morale −6", cash: 0, morale: -6, result: "She stays this month. Her chopping has slowed, though. 👀" }
      ]
    }
  },
  {
    id: "van-earns",
    from: "debt-or-wait",
    side: "bold",
    title: "🚐 The van paid for itself",
    text: "Three jobs this month, no boda boda receipts, no cold food on arrival.",
    effects: { cash: 9000, rep: 0.05 },
    follow: {
      title: "The van needs servicing",
      text: "KSh 4,500 for a proper service, or keep driving and hope.",
      options: [
        { id: "service-van", label: "Service the van", desc: "Cost KSh 4,500 · rep +0.05", primary: true, cash: -4500, rep: 0.05, result: "The mechanic says she will run another five years. Treat her well. 🚐" },
        { id: "delay-service", label: "Delay the service", desc: "Save the cash · rep −0.05", cash: 0, rep: -0.05, result: "She still starts. That knocking sound, though… 🔧" }
      ]
    }
  }
];
// Shown when a chain has no follow card — the echo is just news.
export const CHAIN_REST = "let it rest";

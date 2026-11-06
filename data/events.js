// data/events.js - event deck. 30 lively events now, 80+ over time.
// kind: good / bad / gamble. Effects applied by js/engine.js.
export const EVENTS = [
  { id: "lucky-referral", kind: "good", title: "Lucky referral 📞", text: "A happy guest tells a friend. +1 enquiry, +KSh 2,000 tip.", cash: 2000, rep: 0.1 },
  { id: "rain-day", kind: "bad", title: "Rain on event day 🌧️", text: "Mud! You hire a tent last-minute. -KSh 8,000.", cash: -8000, rep: 0 },
  { id: "radio-feature", kind: "good", title: "Local radio mention 📻", text: "They loved your chapati! Rep +0.2.", cash: 0, rep: 0.2 },
  { id: "vip-enquiry", kind: "good", title: "VIP enquiry 💎", text: "A 100-guest wedding wants a quote. Check Catering!", cash: 0, rep: 0.1 },
  { id: "chef-quits", kind: "bad", title: "Assistant quits 😟", text: "Pole! Morale dips. Train or hire soon.", cash: 0, rep: 0, morale: -10 },
  { id: "supplier-spike", kind: "bad", title: "Tomato prices jump 🍅", text: "Drought upcountry. Stock costs double this month.", cash: -4000, rep: 0 },
  { id: "viral-post", kind: "good", title: "Viral food photo 📸", text: "Your pilau trends! 3 new enquiries.", cash: 3000, rep: 0.2 },
  { id: "health-visit", kind: "neutral", title: "Health inspector 🧾", text: "Clean kitchen passes! Certificate +KSh 1,500 cost, rep +0.3.", cash: -1500, rep: 0.3 },
  { id: "blackout", kind: "bad", title: "Power outage 🕯️", text: "Gas saves the day. -KSh 2,500 extra gas.", cash: -2500, rep: 0 },
  { id: "kind-review", kind: "good", title: "Five-star review ⭐", text: "\"Best biryani in town!\" Loyalty up.", cash: 1000, rep: 0.2 },
  { id: "church-lunch", kind: "good", title: "Church lunch (60 pax) ⛪", text: "Deposit 50% upfront. Steady work.", cash: 8000, rep: 0.1 },
  { id: "office-tea", kind: "good", title: "Office tea tender ☕", text: "Weekly mandazi + chai. +KSh 6,000.", cash: 6000, rep: 0.1 },
  { id: "rival-undercut", kind: "bad", title: "Rival caterer 😤", text: "Mama Njeri undercuts you. Lose one job.", cash: -5000, rep: -0.1 },
  { id: "harambee", kind: "good", title: "Harambee feast 🤝", text: "200 guests, simple menu, big heart. +KSh 12,000.", cash: 12000, rep: 0.2 },
  { id: "funeral-rush", kind: "neutral", title: "Sudden funeral catering 🕊️", text: "Sad news, urgent job. Handled kindly: +KSh 9,000.", cash: 9000, rep: 0.1 },
  { id: "school-fair", kind: "good", title: "School fair 🧃", text: "Samosas sell out! Kids love you.", cash: 5000, rep: 0.1 },
  { id: "gas-leak", kind: "bad", title: "Gas fault 🔧", text: "Safety first: repair -KSh 3,500.", cash: -3500, rep: 0 },
  { id: "loyal-auntie", kind: "good", title: "Auntie Wanjiku returns 💛", text: "Your regular! Remembers your pilau. Tip + loyalty.", cash: 2500, rep: 0.15 },
  { id: "tourist-peak", kind: "good", title: "Tourist season ✈️", text: "Hotel enquiries rise. Rooms idea unlocks sooner!", cash: 4000, rep: 0.1 },
  { id: "rainy-cancellation", kind: "bad", title: "Outdoor cancellation 🌧️", text: "Client postpones. Deposit kept: +KSh 3,000.", cash: 3000, rep: -0.1 },
  { id: "cooking-class", kind: "gamble", title: "Offer cooking class? 🎲 70%", text: "Risk KSh 2,000, win KSh 8,000 + skill.", cash: 0, rep: 0, gamble: { cost: 2000, win: 8000, odds: 0.7 } },
  { id: "big-tent-bet", kind: "gamble", title: "Big wedding gamble? 🎲 50%", text: "Risk KSh 15,000, win KSh 45,000. Needs skill 20+.", cash: 0, rep: 0, gamble: { cost: 15000, win: 45000, odds: 0.5, skill: 20 } },
  { id: "supplier-credit", kind: "good", title: "Supplier trusts you 🤝", text: "Take KSh 10,000 stock on credit (pay next month).", cash: 0, rep: 0.05, credit: 10000 },
  { id: "staff-party", kind: "neutral", title: "Team lunch 🍛", text: "Treat the crew KSh 2,000. Morale +15.", cash: -2000, rep: 0, morale: 15 },
  // Hidden / rare (the fun secrets):
  { id: "night-market", kind: "hidden", title: "🌙 Secret night market", text: "A whisper: cheap mangoes at midnight. Stock +3, cost tiny.", cash: -1000, rep: 0, stock: 3 },
  { id: "mzee-recipe", kind: "hidden", title: "📜 Mzee's recipe", text: "An old chef shares secret viazi karai mix. New recipe!", cash: 0, rep: 0.2, recipe: "Viazi karai ya Mzee" },
  { id: "golden-sufuria", kind: "hidden", title: "✨ Golden sufuria", text: "Tap the pot 5 times — Mama Chef laughs and gifts KSh 5,000.", cash: 5000, rep: 0.1 },
  { id: "festival-invite", kind: "good", title: "Food festival invite 🎪", text: "Limited yearly slot! Big crowd, big taste test.", cash: 7000, rep: 0.25 },
  { id: "rival-handshake", kind: "neutral", title: "Rival handshake 🤝", text: "Mama Njeri suggests sharing a big job. Split profit, learn a lot.", cash: 10000, rep: 0.1 },
  { id: "mentor-gift", kind: "hidden", title: "🎁 Mama Chef's gift", text: "For returning after a hard month: seeds of courage + KSh 3,000.", cash: 3000, rep: 0.1 }
];
export const SEASONS = ["Wedding season 💒", "School holidays 🏫", "Tourist peak ✈️", "Christmas 🎄", "Rainy months 🌧️", "Harambee season 🤝"];
// Regulars with stories (loyalty grows when you remember favourite dish).
export const REGULARS = [
  { name: "Auntie Wanjiku", dish: "Pilau", story: "Feeds all her grandkids every Sunday." },
  { name: "Pastor Kamaa", dish: "Chapati + beans", story: "Church lunches, always pays on time." },
  { name: "Ms. Achieng", dish: "Fish + ugali", story: "Office manager, orders Friday lunch." },
  { name: "Mzee Otieno", dish: "Nyama choma", story: "Knows every spice in Kisumu." }
];

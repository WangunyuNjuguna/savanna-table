// data/economy.js - ALL money numbers live here. Edit these, not logic.
// All values in KSh. Labelled "game estimates, not tax or legal advice".
export const ECONOMY = {
  version: 1,
  // Starting capital: random 100k-800k, weighted low (most 150k-400k).
  capitalMin: 100000,
  capitalMax: 800000,
  capitalWeighted: [150000, 400000], // common range hint for reveal text
  // Income estimates (per head / per night / per cover).
  cateringPerHead: { low: 600, high: 2500 },
  roomPerNight: { low: 2500, high: 8000 },
  // Monthly fixed-ish costs (starting approximations).
  costs: {
    gas: 3500, electricity: 2500, water: 1200, transport: 6000,
    rentKibanda: 8000, rentRestaurant: 45000, wagesCook: 18000,
    wagesWaiter: 12000, wagesCleaner: 10000, wagesManager: 35000,
    permitYearly: 15000, healthCertEach: 1500, insuranceMonthly: 2500,
    marketing: 4000, mpesaFeesPct: 0.015
  },
  // Simple turnover-style tax + loan hints.
  turnoverTaxPct: 0.03,
  loans: {
    chamaMax: 200000, chamaInterestPct: 0.08,
    bankMax: 1000000, bankInterestPct: 0.16, familyOnce: 50000
  },
  // 1M is a milestone, not the end. Measured as NET WORTH (see PACING below).
  winMilestone: 1000000,
  firstProfit: 10000
};

// PACING - tunable targets. One turn = 60-90 sec. A year (12 turns) = 15-20 min.
// Skilled play hits 1M NET WORTH about year 4. Careful play year 6+. Poor play restarts.
// Net worth = cash + equipment + stock + property - debt. Lucky start saves at most 1 year.
// Growth compounds but with friction: capacity limits, weaker marketing returns, rising costs.
// No normal action may raise net worth more than 15% in one turn (rare risky events only).
// After 1M the Boutique Hotel arc begins: needs roughly 3-8M via loans, partners, phases.
export const PACING = {
  turnSeconds: [60, 90],      // target length of one monthly turn
  yearMinutes: [15, 20],      // 12 turns
  millionNetWorth: 1000000,   // the big milestone (net worth, not cash)
  skilledYearsTo1M: 4,        // skilled player target
  cautiousYearsTo1M: 6,       // cautious player target
  maxGainPerTurnPct: 0.15,    // 15% cap per turn for normal actions
  hotelArcMin: 3000000,       // hotel arc total need (low end)
  hotelArcMax: 8000000        // hotel arc total need (high end)
};

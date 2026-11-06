# 🍲 Savanna Table

A warm, classy business-story game for one special player who loves cooking and dreams of a small hotel + outside catering in Kenya. Feel-good, slow-growth, and quietly teaches real business thinking.

**▶️ Play it live:** https://site-184cc2f62b4349a4b8e753ad100097c0.freebuff.page

> All numbers are **game estimates, not tax or legal advice**. Check real prices locally.

## Play in 2 minutes

**Offline:** download this folder and open `index.html` in Chrome. No internet needed.

**GitHub Pages (this repo):** Settings → Pages → Deploy from branch → `main` → `/ (root)` → Save. Your game appears at `https://<username>.github.io/savanna-table/`.

**Netlify:** drag the folder onto `app.netlify.com/drop`.

## What she does each month

1. Review cash, net worth, reputation, skill and the metric pantry.
2. Spend 3 energy: cook a gig, find a client, train, advertise, rest, buy supplies.
3. Answer one **hard choice** (safe road vs bold road, with real odds).
4. Handle people: applicants knock, and sometimes a staffer forces an HR crisis.
5. Press **End Month** for a full P&L: wages, bills, spoilage, card interest, events, occupancy, dishes, branches.

## Systems in the game

- **Catering + hotel, blended.** Catering follows a real recipe (150 g rice, 120 g flour, 30 ml oil, 120 g beef, 100 g veg per guest). Hotel rooms consume 20 L milk, 8 kg flour, 0.5 m linen and 40 pcs soap per occupied room-month.
- **Too little / too much food.** Shortages cost reputation with a precise shopping list; overbuying fresh food spoils and shows up as real wasted shillings.
- **Manual → automated buying.** Buy by the kg/L/m first. Meet three suppliers to auto-deliver shortfalls on a credit card (+10% fee, 3%/month interest) that you pay down in Money.
- **People, not headcounts.** Named crew with skill, wage, mood and a hidden flaw revealed after the trial month. Hiring costs a signing fee; firing costs severance and morale.
- **HR crises.** Drunk star cooks, raise threats, till shortages, training requests — each with consequences, optional mentor advice, and no perfect answer.
- **Signature dishes.** Invent a dish, pay for a tasting, and find out after month-end whether it flopped, became a local favourite, or went global (royalties for a year).
- **Branches.** Kiosk → eatery → rooftop, each with monthly upkeep due even in bad months, and income halved without a manager on site.
- **Life happens.** ~10% of months bring a mishap even when every decision was right.
- **Pacing.** KSh 1,000,000 **net worth** is a milestone, not the finish: skilled play reaches it around year 4, cautious play year 6+, and the boutique-hotel arc (KSh 3–8M) follows. Normal actions can't grow net worth more than 15% in a turn.
- **Cozy, never punishing.** No game over — a Fresh Start with legacy bonuses. Easy/Normal/Hard, adaptive softening after hard months, English/Kiswahili labels, sounds off by default, `prefers-reduced-motion` respected.

## Project map (small, commented files)

- `index.html` — shell: top bar, screens host, bottom nav, settings sheet, modal
- `css/base.css` (colours/fonts), `css/layout.css` (cards/nav/scenes), `css/animations.css` (transform/opacity only), `css/print.css`
- `js/main.js` (boot, career reveal, saves UI, confetti), `js/router.js`, `js/screens.js` (5 tabs)
- `js/engine.js` (actions, end month, report), `js/pantry.js` (metric stock, rooms, card), `js/staff.js` (crew, HR, dishes, branches), `js/choices.js` (hard choices)
- `js/save.js` (3 slots, versioned, export/import), `js/store.js`, `js/minigames.js`, `js/achievements.js`, `js/art.js` (inline SVG scenes), `js/sound.js` (WebAudio), `js/i18n.js`
- `data/economy.js` (prices + `PACING`), `data/events.js`, `data/choices.js`, `data/pantry.js`, `data/staff.js`, `data/upgrades.js`, `data/text.js`
- `js/debug-simulate.js` — balance check: `node js/debug-simulate.js`

## Tweak prices (no coding fear)

Open `data/economy.js`, `data/pantry.js` or `data/staff.js` — every number is commented. Change, save, reload.

Words live in `data/text.js` (English + Kiswahili).

## Optional Firebase cloud save

Everything works fully offline. Firebase is off by default (`js/firebase-config.js` is `null`).

1. Create a project at `console.firebase.google.com` → Add Web App → copy the config.
2. Paste it into `js/firebase-config.js` as `FIREBASE_CONFIG` and set `CLOUD_ENABLED = true`.
3. Enable Auth (Email/Password) and Firestore; one small document per player.
4. Never commit real keys to a public repo — use environment variables or a private branch.

## Testers — what we need from you

Play 10–15 minutes (one in-game year) and tell us:

- Was any month confusing, or was a decision's outcome unclear?
- Too easy, too hard, or frustrating in a bad way?
- Any button that did nothing, or a screen that looked broken?
- Send your **Export Save** file and your phone model.

Karibu sana! 🌿 — Mama Chef says: pole pole, dream big.

// Original scene artwork. One asset belongs to one placement; never reuse a scene.
export const artwork = Object.freeze({
  // Preserve the approved winter artwork pixels; show only the illustration from the supplied screenshot.
  "snowball": Object.freeze({ source: require("../assets/illustrations/features/snowball-reference.jpg"), width: 704, height: 1536, crop: [58, 501, 588, 579], label: "Westley in a teal and purple winter hat, sweater and scarf, playing in snow with a teal ball" }),
  "avalanche": Object.freeze({ source: require("../assets/illustrations/features/avalanche.jpg"), width: 520, height: 520, crop: [0, 0, 520, 520], label: "Tate in a teal sweater racing ahead of an avalanche of snow and colorful balls, his long goofy pink tongue flying" }),
  "safe-to-spend-cafe": Object.freeze({ source: require("../assets/illustrations/features/safe-to-spend-cafe.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Westley and Tate \u2014 safe to spend cafe" }),
  "money-mood": Object.freeze({ source: require("../assets/illustrations/features/money-mood.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Chapo \u2014 money mood" }),
  "extra-paycheck": Object.freeze({ source: require("../assets/illustrations/features/extra-paycheck.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Chapo \u2014 extra paycheck" }),
  "manual-mode": Object.freeze({ source: require("../assets/illustrations/features/manual-mode.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Tate \u2014 manual mode" }),
  "overwhelmed": Object.freeze({ source: require("../assets/illustrations/features/overwhelmed.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Westley \u2014 overwhelmed" }),
  "add-bill": Object.freeze({ source: require("../assets/illustrations/features/add-bill.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Tate \u2014 add bill" }),
  "review-bills": Object.freeze({ source: require("../assets/illustrations/features/review-bills.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Westley \u2014 review bills" }),
  "budget": Object.freeze({ source: require("../assets/illustrations/features/budget.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Bobbie \u2014 budget" }),
  "add-debt": Object.freeze({ source: require("../assets/illustrations/features/add-debt.jpg"), width: 1448, height: 1086, crop: [0, 0, 1448, 1086], label: "Westley and Tate \u2014 add debt" }),
});

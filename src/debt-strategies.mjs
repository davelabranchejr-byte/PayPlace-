export const STRATEGY_ORDER = ["snowball", "mixed", "avalanche"];
export function normalizeStrategy(mode) { return STRATEGY_ORDER.includes(mode) ? mode : "snowball"; }
const balance = debt => Number(debt.balance) || 0;
const apr = debt => Number(debt.apr) || 0;
export function orderDebts(debts, mode, quickWinId = null) {
  const active = debts.filter(debt => balance(debt) > 0);
  const highestInterest = (a, b) => apr(b) - apr(a) || balance(a) - balance(b);
  return [...active].sort(mode === "snowball"
    ? (a, b) => balance(a) - balance(b) || apr(b) - apr(a)
    : mode === "mixed"
      ? (a, b) => Number(b.id === quickWinId) - Number(a.id === quickWinId) || highestInterest(a, b)
      : highestInterest);
}
export function selectStrategy(finance, requestedMode) {
  const mode = normalizeStrategy(requestedMode);
  if (mode === finance.payoffMode) return finance;
  return { ...finance, payoffMode: mode, mixedQuickWinId: mode === "mixed" ? orderDebts(finance.debts, "snowball")[0]?.id || null : finance.mixedQuickWinId };
}
export function initializeMixedTarget(finance) {
  return finance.payoffMode === "mixed" && !finance.mixedQuickWinId
    ? { ...finance, mixedQuickWinId: orderDebts(finance.debts, "snowball")[0]?.id || null } : finance;
}
